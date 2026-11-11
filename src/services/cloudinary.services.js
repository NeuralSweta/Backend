// take file from local and upload it to cloudinary and return the url of the uploaded file
import {v2 as cloudinary} from "cloudinary";
import fs from "fs"; //fs-file system module is used to read the file from local and delete the file from local after uploading it to cloudinary
// fs- unlink- to delete the file from local after uploading it to cloudinary

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary=async(filePath,folderName)=>{
    try{
        const result=await cloudinary.uploader.upload(filePath,{folder:folderName},{resource_type:"auto"}) //    resource_type:"auto" is used to upload any type of file, like image, video, pdf etc.

        // Delete the file from local after uploading it to cloudinary
        fs.unlinkSync(filePath);

        return result;
    } catch (error) {
        console.log("Error in uploading file to cloudinary",error);
        throw error;
    }
};

cloudinary.uploader.upload("path/to/file", {folder:"folder_name"}, (error, result) => {
    if(error){
        console.log("Error in uploading file to cloudinary",error);
        throw error;
    }
    console.log("File uploaded to cloudinary",result);
});