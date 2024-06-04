import mongoose from "mongoose";


const connectDB = async () => {
    try {
        const connectInst = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log("Database Connected at Host :",connectInst.connection.host)

    } catch (error) {
        console.error("MONGODB ERROR",error)
    }
}

export default connectDB