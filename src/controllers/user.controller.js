import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { cloudinaryFileUploader } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req,res) => {
    const {email,username,fullname,password} = req.body


    // validation
    if (
        [username,email,fullname,password].some((field) => {
            field?.trim() === ""
        })
        ) {
            
            throw new apiError(400,"All fields are required")
        }

        const isAlreadyExist = User.findOne({
            $or: [{ username }, { email }]
        })

        if (isAlreadyExist) {
            throw new apiError(409,"username already exists")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImgLocalPath = req.files?.coverImg[0]?.path;

        if (!avatarLocalPath) {
            throw new apiError(400,"Avatar File Not Found")
        }

        const avatar = await cloudinaryFileUploader(avatarLocalPath)
        const coverImage = await cloudinaryFileUploader(coverImgLocalPath)

        if (!avatar) {
            throw new apiError(400,"avatar file is required")
        }

        await User.create({
            fullname,
            avatar: avatar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            username:username.toLowerCase()
        })

        const registeredUser = await User.findById(User._id).select(
            "-password -refreshToken"
        )

        if (!registeredUser) {
            throw new apiError(500,"Something went wrong during registration of user")
        }

        return res.status(201).json(
            new apiResponse(200,registerUser,"User Created Successfully")
        )


})

export {registerUser}