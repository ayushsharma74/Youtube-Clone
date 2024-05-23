import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryFileUploader } from "../utils/cloudinary.js";

const uploadVideo  = asyncHandler(async (req,res) => {
    const videoPath = req.files?.video[0]?.path
    const thumbnailPath = req.files?.thumbnail[0]?.path

    const {title,description} = req.body
    const {_id} = req.user

    if (!videoPath) {
        throw new apiError(400,"Please Provide The Video To Upload")
    }

    const videoURL = await cloudinaryFileUploader(videoPath)
    const thumbnailURL = await cloudinaryFileUploader(thumbnailPath)

    console.log(videoURL);
    console.log(thumbnailURL);

    if (!videoURL) {
        throw new apiError(500,"error occured while uploading the video")
    }
    if (!thumbnailURL) {
        throw new apiError(500,"error occured while uploading the thumbnail")
    }

    const uploadedVideo = await Video.create({
        videoFile: videoURL.url,
        thumbnail: thumbnailURL.url,
        title,
        description,
        duration: videoURL.duration,
        owner: _id
    })

    if (!uploadedVideo) {
        throw new apiError(500,"Error occured while uploading the video info to database")
    }

    return res.status(201).json(new apiResponse(201,uploadedVideo,"Video Uploaded Successfully"))
})

export {
    uploadVideo
}