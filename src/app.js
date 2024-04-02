import express, { json, urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

app.use(cors())
app.use(urlencoded({extended:true}))
app.use(json({limit: '20kb'}))
app.use(express.static("public"))
app.use(cookieParser)

export {app}