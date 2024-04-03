import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
          
cloudinary.config({ 
  cloud_name: 'ayushsharma', 
  api_key: '838424447111743', 
  api_secret: 'bqWfv0IO24aqAQE9RlgU4cGb7nI' 
});

export const cloudinaryFileUploader = async (localFilePath) => {
    try {
        if(!localFilePath) return error("File Path Don't exist")

        const res = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto",
            })

            console.log("File Uploaded Successfully !!!!!! url is", res.url)
            return res
    } catch (error) {
        fs.unlinkSync(localFilePath)
    }
}


// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });