import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { cloudinaryFileUploader } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req,res) => {


    // if (!req.files || !req.files.avatar) {
    //     throw new apiError(400, "Cover image and avatar files are required");
    // }

    // console.log(req.files)
    // console.log(req.files.coverImage[0])

    const {email,username,fullname,password} = req.body
    
    // console.log(req.files.coverImage[0])
    // validation
    if (
        [username,email,fullname,password].some((field) => {
            field?.trim() == ""
        })
        ) {
            
            throw new apiError(400,"All fields are required")
        }

        const isAlreadyExist = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (isAlreadyExist) {
            throw new apiError(409,"username already exists")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;
        let coverImgLocalPath;

        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImgLocalPath = req.files.coverImage[0].path;
        }
        console.log(coverImgLocalPath);
        console.log(avatarLocalPath);

        if (!avatarLocalPath) {
            throw new apiError(400,"Avatar File Not Found")
        }

        const avatar = await cloudinaryFileUploader(avatarLocalPath)
        const coverImg = await cloudinaryFileUploader(coverImgLocalPath)

        if (!avatar) {
            throw new apiError(400,"avatar file is required")
        }

        const newUser = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImg?.url || "",
            email,
            password,
            username:username.toLowerCase()
        })

        const registeredUser = await User.findById(newUser._id).select(
            "-password -refreshToken"
        )

        if (!registeredUser) {
            throw new apiError(500,"Something went wrong during registration of user")
        }

        return res.status(201).json(
            new apiResponse(200,registeredUser,"User Created Successfully")
        )


})

export {registerUser}