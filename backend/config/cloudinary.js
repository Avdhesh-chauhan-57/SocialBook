import { v2 as cloudinary } from 'cloudinary';

export const uploadToCloudinary = (buffer) => {
    console.log("Cloudinary env:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY ? "key ok" : "key MISSING");
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "my_project", resource_type: "auto" },
            (error, result) => error ? reject(error) : resolve(result)
        );
        stream.end(buffer);
    });
};