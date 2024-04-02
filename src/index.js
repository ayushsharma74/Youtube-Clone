import dotenv from 'dotenv'
dotenv.config({
    path: "./env"
})
import connectDB from "./db/dbConfig.js";
import { app } from './app.js';

connectDB()
.then(() => {
    app.listen(8000,() => {
        console.log("test server");
    })
})
