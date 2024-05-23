import { Video } from "../models/video.model";
import { apiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { cloudinaryFileUploader } from "../utils/cloudinary";

const uploadVideo  = asyncHandler(async (req,res) => {
    const videoPath = req.files?.video[0]?.path
    const thumbnailPath = req.files?.thumbnail[0]?.path

    const {title,description} = req.body
    const {_id} = req.user

    if (!path) {
        throw new apiError(400,"Please Provide The Video To Upload")
    }

    const videoURL = cloudinaryFileUploader(videoPath)
    const thumbnailURL = cloudinaryFileUploader(thumbnailPath)

    if (!videoURL) {
        throw new apiError(500,"error occured while uploading the video")
    }
    if (!thumbnailURL) {
        throw new apiError(500,"error occured while uploading the thumbnail")
    }

    const uploadedVideo = await Video.create({
        videoFile: videoURL,
        thumbnail: thumbnailURL,
        title,
        description,
        duration: videoURL.duration,
        isPublished,
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