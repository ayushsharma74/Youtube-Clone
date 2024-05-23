import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { cloudinaryFileUploader } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        console.log(user);
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        console.log(accessToken,refreshToken);

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new apiError(500,"Access token and refresh token cant genrate")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { email, username, fullname, password } = req.body

    // console.log(req.files.coverImage[0])
    // validation
    console.log(req.files)
    // res.json(req.files)
    if (
        [username, email, fullname, password].some((field) => {
            field?.trim() == ""
        })
    ) {

        throw new apiError(400, "All fields are required")
    }

    const isAlreadyExist = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (isAlreadyExist) {
        throw new apiError(409, "username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImgLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImgLocalPath = req.files.coverImage[0].path;
    }

    console.log(coverImgLocalPath);

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar File Not Found")
    }
    console.log(avatarLocalPath);

    const avatar = await cloudinaryFileUploader(avatarLocalPath)
    const coverImg = await cloudinaryFileUploader(coverImgLocalPath)

    if (!avatar) {
        throw new apiError(400, "avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImg?.url || "",
        email,
        password,
        username: username
    })

    const registeredUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!registeredUser) {
        throw new apiError(500,"Something went wrong during registration of user")
    }

    return res.status(201).json(
        new apiResponse(200, "User Created Successfully")
    )


})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    // console.log(username,email,password)
    // validation
    if (!username && !email) {
        throw new apiError(300, "username or email is required")
    }

    const user = await User.findOne({
        $or: [
            {
                username
            },
            {
                email
            }
        ]
    })
    if (!user) {
        throw new apiError(404, "User not found")
    }

    const isPasswordCorrect = await user.passwordCheck(password)

    if (!isPasswordCorrect) {
        throw new apiError(401, "incorrect password")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(200,{
            user: accessToken,refreshToken,loggedInUser
        },"User logged in suceessfully")
    )
})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"user logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new apiError(404,"refresh token not found")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new apiError(404,"refresh token invalid")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(404,"refresh token is expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure: true
        }
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(new apiResponse(200,{accessToken,newRefreshToken},"Access token refreshed"))
    } catch (error) {
        throw new apiError(401,error?.message || "invalid refresh token")
    }
})

const getUserChannelProfile = asyncHandler(async (req,res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new apiError(404,"username not found")
    }

    const channel =  await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        $if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                createdAt: 1
            }
        }
    ])

    if(!channel?.length){
        throw new apiError(400,"channel does not exist")
    }

    return res
    .status(200)
    .json(
            new apiResponse(200,channel[0],"user/channel fetched successfully")
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUserChannelProfile
}