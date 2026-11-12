import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadToCloudinary} from "../services/cloudinary.services.js";
import {ApiResponse} from "../utils/ApiResponse.js";


//higher order fxn which takes a function as an argument and returns a new function which is wrapped in a try catch block, so that we don't have to write try catch block in every controller function, 
const registerUser=asyncHandler(async(req,res)=>{

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
   const {fullname,username,email,password}=req.body;
   // console.log("email",email)

   //2. validation (not empty) user detail


   // if(fullName===""){
   //     throw new ApiError(400, "Full name is required")
   // }  but we cannot handle errors one by one, so make array
   if(
      [fullname,email,username,password].some((field)=>!field?.trim()==="")  // if any field is empty, throw error
   ){
      throw new ApiError(400, "All fields are required")
   }
   //some method checks if any element in the array passes the test implemented by the provided function, if yes then it returns true, else false



   // we cannot handle files directly - go to routes , import multer middleware and use it in the route to handle file upload, then we can access the file in req.file

   // we can also add validation check for wrong inputs of username, email etc

   // 3. check if user already exists in database (by username or email)
   const existedUser=await User.findOne({
      $or:[{username},{email}]
   });
     
      if(existedUser){
         throw new ApiError(409, "User already exists")
      }
      // 4. get local file paths from multer
     const avatarLocalPath= req.files?.avatar?.[0]?.path; 

     const coverImageLocalPath= req.files?.coverImage?.[0]?.path;


     //5.validate avatar
     if(!avatarLocalPath){
         throw new ApiError(400, "Avatar is required")
     }
     //6 . upload avatar to cloudinary and get the url of the image
     const avatarUpload= await uploadToCloudinary(avatarLocalPath,"avatars");
     if(!avatarUpload?.secure_url){
         throw new ApiError(500, "Error while uploading avatar to cloudinary")
     }
   //   console.log("Avatar uploaded to cloudinary",avatar.secure_url)

     //7. upload cover image to cloudinary if provided 
     let coverImage= null;
     if(coverImageLocalPath){
         coverImage= await uploadToCloudinary(coverImageLocalPath,"coverImages");
     }
     
     //8. create user object- create entry in db
     const user= await User.create({
         fullname,
         username,
         email,
         password,
         avatar:avatarUpload.secure_url,
         coverImage:coverImage?.secure_url||""
     });
     if(!user){
         throw new ApiError(500, "Error while creating user")
     }
     //9. remove password & refresh token (sensitive fields) field from response
     const createdUser= await User.findById(user._id).select("-password -refreshToken");

     if(!createdUser){
         throw new ApiError(500, "Error while fetching created user")
     }
     //10. return response
     return res.status(201).json(
      new ApiResponse(201,"User registered successfully",{fullname,username,email,avatar: avatarUpload.secure_url,
            coverImage: coverImage?.secure_url || ""}))
   })

export {registerUser}