import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: [

        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type: String,
        required: [ true,"Please enter your password"]
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true})

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,8)
        next()
    }

    next()
})

userSchema.methods.passwordCheck = async function(password){
    return await bcrypt.compare(password,this.password)
}

export const User = mongoose.model("User", userSchema)