import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs';
import * as dotenv from "dotenv";

dotenv.config();
async function uploadToCloudinary(locaFilePath) {
    // locaFilePath :
    // path of image which was just uploaded to "uploads" folder
    var mainFolderName = "main"
    var filePathOnCloudinary = mainFolderName + "/images" + locaFilePath
    // filePathOnCloudinary :
    
   


    return cloudinary.uploader.upload(locaFilePath)
    .then((result) => {
      // Image has been successfully uploaded on cloudinary
      // So we dont need local image file anymore
      // Remove file from local uploads folder 
      fs.unlinkSync(locaFilePath);
      
      return {
        message: "Success",
        url:result.url
      };
    }).catch((error) => {
      // Remove file from local uploads folder 
      fs.unlinkSync(locaFilePath)
      return {message: error,};
    });
  }

  export default uploadToCloudinary;  