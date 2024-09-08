import cloudinary from 'cloudinary'
import dotenv from 'dotenv'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
dotenv.config()
cloudinary.v2.config({
    cloud_name: process.env.cloud_name, 
    api_key: process.env.api_key, 
    api_secret: process.env.api_secret

})


const storage = new CloudinaryStorage({
    cloudinary:cloudinary.v2,
    params:{
        folder:'product',
        allowed_formats:['jpg', 'png', 'jpeg', 'webp', 'gif']
    }
})



const upload = multer({storage})

export { cloudinary, upload }

