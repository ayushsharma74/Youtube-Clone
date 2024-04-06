import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { cloudinaryFileUploader } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken =user.generateRefreshToken()

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

    await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImg?.url || "",
        email,
        password,
        username: username
    })

    // const registeredUser = await User.findById(User._id).select(
    //     "-password -refreshToken"
    // )

    // if (!registeredUser) {
    //     throw new apiError(500,"Something went wrong during registration of user")
    // }

    return res.status(201).json(
        new apiResponse(200, "User Created Successfully")
    )


})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

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

    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken",accessToken,options)
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
            $set: {
                refreshToken: undefined
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




export {
    registerUser,
    loginUser,
    logoutUser
}