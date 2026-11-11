import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadToCloudinary} from "../services/cloudinary.services.js";
import {ApiResponse} from "../utils/ApiResponse.js";

//higher order fxn which takes a function as an argument and returns a new function which is wrapped in a try catch block, so that we don't have to write try catch block in every controller function, 
const registerUser=asyncHandler(async(req,res,next)=>{

   //get user detail from frontend/postman
   //validation (not empty) user detail
   // check if user already exists in database (by username or email)
   //check for images & avatar, if provided upload to cloudinary and get the url of the image and save it in database
   //check avatar uploaded on cloudinary or not 
   //create user object- create entry in db
   //remove password & refresh token field from response
   //check for user creation
   //return reponse


   //1. data will come from req.body (JSON data,form data) and req.file (image data), from URL
   const {username,email,password,avatar}=req.body;
   console.log("email",email)

   //2. validation (not empty) user detail


   // if(fullName===""){
   //     throw new ApiError(400, "Full name is required")
   // }  but we cannot handle errors one by one, so make array
   if(
      [fullName, email,username,password].some((field)=>field?.trim()==="")  // if any field is empty, throw error
   ){
      throw new ApiError(400, "All fields are required")
   }
   //some method checks if any element in the array passes the test implemented by the provided function, if yes then it returns true, else false



   // we cannot handle files directly - go to routes , import multer middleware and use it in the route to handle file upload, then we can access the file in req.file

   // we can also add validation check for wrong inputs of username, email etc

   // 3. check if user already exists in database (by username or email)
   const existedUser=User.findOne({
      $or:[{username},{email}]
   })
     
      if(existedUser){
         throw new ApiError(409, "User already exists")
      }
     const avatarLocalPath= req.files?.avatar[0]?.path; 

     const coverImageLocalPath= req.files?.coverImage[0]?.path;

     if(!avatarLocalPath){
         throw new ApiError(400, "Avatar is required")
     }
     return res.status(201).json(
      new ApiResponse(200,"User registered successfully",{username,email,avatarLocalPath,coverImageLocalPath}))
   })

export {registerUser}