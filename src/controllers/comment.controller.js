import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

const addComment = asyncHandler(async (req,res) => {
    const {videoId , content} = req.body
    const {_id} = req.user

    if (!content) {
        throw new apiError(400,"Please Enter Your Comment")
    }

    const newComment = await Comment.create({
        content,
        owner: _id,
        video: videoId
    })

    if (!newComment) {
        throw new apiError(500,"Error Occured While Adding Comment")
    }

    return res.status(201).json(new apiResponse(201,newComment,"Comment Added"))
})

const updateComment = asyncHandler(async (req,res) => {
    const {commentId , content} = req.body
    
    const updatedComment = await Comment.findByIdAndUpdate(commentId,{
        content: content
    })

    if (!updatedComment) {
        throw new apiError(500,"Error Occured While Updating Comment")
    }

    return res.json(new apiResponse(200,updatedComment,"Comment Updated"))
})

const deleteComment = asyncHandler(async (req,res) => {
    const {commentId} = req.body

    await Comment.findByIdAndDelete(commentId)

    return res.json(new apiResponse(200,updatedComment,"Comment Deleted"))

})

export {
    addComment,
    updateComment,
    deleteComment
}
