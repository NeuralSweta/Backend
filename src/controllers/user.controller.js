import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadToCloudinary} from "../services/cloudinary.services.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



// //generate access token and refresh token
// const generateAccessAndRefreshTokens=async(userId)=>{
//     //generate access token and refresh token
//     try{
//     const user= await User.findById(userId);
//     const accessToken=user.generateAccessToken(); //generate access token from user model method
//     const refreshToken=user.generateRefreshToken();
//       //save refresh token in db
//       user.refreshToken=refreshToken;
//      await user.save({validateBeforeSave:false}) 
//       return {accessToken,refreshToken}
//     }catch(error){
//         throw new ApiError(500, "Error while generating access and refresh tokens");
//     }
//     }
//     //call this function after user is created and return the tokens in response

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        // Important: wait until MongoDB saves the refresh token
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        // Print the ORIGINAL error in your terminal
        console.error("TOKEN GENERATION ORIGINAL ERROR:", error);

        throw new ApiError(
            500,
            "Error while generating access and refresh tokens"
        );
    }
};

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
   const {fullname,username,email,password}=req.body||{};
   // console.log("email",email)

   //2. validation (not empty) user detail


   // if(fullName===""){
   //     throw new ApiError(400, "Full name is required")
   // }  but we cannot handle errors one by one, so make array
   if(
      [fullname,email,username,password].some((field)=>!field||field.trim()==="")  // if any field is empty, throw error
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


      // login user controller

   const loginUser=asyncHandler(async(req,res)=>{
      //req body ->data
      // username/ email
      //find the user in db by username or email
      // password match with hashed password in db
      // if password match, generate access token and refresh token
      // save refresh token in db
      // return response with access token and refresh token
      //send cookie with refresh token to client
      const {email,username,password}=req.body;    
     if(!username && !email){
      throw new ApiError(400, "Username or email is required")
     }
     if(!password){
      throw new ApiError(400, "Password is required")
     }
     // find user in db by username or email
     const user= await User.findOne({
      $or:[{username},{email}] // $or - mongoose operator
     });
     // if user not found
     if(!user){
      throw new ApiError(404, "User not found")
     }
     // if user found, check password is correct
       const isPasswordValid=user.isPasswordMatched(password);

         if(!isPasswordValid){   throw new ApiError(401, "Invalid password")
         }
   
   //generate access token and refresh token
   const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id);
   //fetch user without sensitive fields
   const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

   const options={
      httpOnly:true, // cookies cannot be modified by client side javascript, it will be modified only on server
      secure:true  // secure true means cookies will be sent only over https, not http
   }

   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(new ApiResponse(200,"User logged in successfully",{user:loggedInUser,accessToken,refreshToken}
     ))
   })

   //logout user
   //algorithm
   // get refresh token from cookie
   // check if refresh token is valid
   // if valid, delete refresh token from db
   // send response to client
  

const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,{$unset:{refreshToken:1}},
   { new:true}
   )  // we can access the user id from the request object, which is set in the verifyJWT middleware, so that we can use it in the controller to logout the user
   // clear the cookie in controller, so that the user cannot access the protected routes after logout
const options={
   httpOnly:true, 
   secure:true,  
}
return res.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options) 
.json(new ApiResponse(200,{},"User logged out successfully"))  // send response to client  
})




//refresh access token
const refreshAccessToken=asyncHandler(async(req,res)=>{
   // get refresh token from cookie
   const incomingRefreshToken=req.cookies?.refreshToken||req.body?.refreshToken
   if(!incomingRefreshToken){
      throw new ApiError(401, "unauthorized request")
   }
// verify incoming refresh token
   try{
      const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
      // find user in db by id from decoded token
 const user=await User.findById(decodedToken?.id).select("-password")
   if(!user){
      throw new ApiError(401, "unauthorized request")
   }  
   // check if refresh token in db is same as incoming refresh token
   if(user.refreshToken!==incomingRefreshToken){
      throw new ApiError(401, "Refresh token is expired or used, please login again")
   }
   //verified refresh token is valid and not expired
   // generate new access token and refresh token and login user again without asking for credentials

   const options={
      httpOnly:true, 
      secure:true,
   }
   const {accessToken,newRefreshToken}=generateAccessAndRefreshTokens(user._id)
   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("newRefreshToken",newRefreshToken,options)
   .json(new ApiResponse(200,"Access token refreshed successfully",{user,accessToken,newRefreshToken}))
  
}
catch(err){
   console.log("Error in verifying refresh token",err)
   throw new ApiError(401, "Refresh token is expired or used, please login again")
}

})


//change current password
const changeCurrentPassword=asyncHandler(async(req,res)=>{
   // get user id from req.user
   // get old password and new password from req.body
   const {oldPassword,newPassword}=req.body||{};
   if(!oldPassword || !newPassword){
      throw new ApiError(400, "Old password and new password are required")
   }
   // find user in db by id from req.user
   const user=await User.findById(req.user._id).select("-password");
   if(!user){
      throw new ApiError(400, "User not found")
   }
   // check if old password is correct
   const isPasswordMatched=await user.isPasswordMatched(oldPassword);
   if(!isPasswordMatched){
      throw new ApiError(400, "Old password is incorrect")
   }
   // update password
   user.password=newPassword;
   await user.save({validateBeforeSave:false});
   return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})



//get current user profile
const getCurrentUserProfile=asyncHandler(async(req,res)=>{
   // get user id from req.user
   // find user in db by id from req.user
   const user=await User.findById(req.user._id).select("-password -refreshToken");
   if(!user){
      throw new ApiError(400, "User not found")
   }
   return res.status(200).json(new ApiResponse(200, {user}, "User profile fetched successfully"))
})


//update account details
const updateAccountDetails=asyncHandler(async(req,res)=>{
   
   const {fullName,email,username}=req.body||{};
   if(!fullName || !email || !username){
      throw new ApiError(400, "Full name, email and username are required")
   }
   const user=await User.findByIdAndUpdate(req.user?._id,{$set:{fullName,email,username}}, {new: true}).select("-password -refreshToken");
   if(!user){
      throw new ApiError(400, "User not found")
   }

   return res.status(200).json(new ApiResponse(200, {user}, "Account details updated successfully"))
})


//update user avatar 
const updateUserAvatar=asyncHandler(async(req,res)=>{
   const avatarLocalPath=req.file?.path;
   if(!avatarLocalPath){

      throw new ApiError(400, "Avatar is required")
   }
   const avatarUpload= await uploadToCloudinary(avatarLocalPath,"avatars");
   if(!avatarUpload?.secure_url){
      throw new ApiError(500, "Error while uploading avatar to cloudinary")
   }
   //update user avatar in db
   const updatedUser=
   await User.findByIdAndUpdate(req.user?._id,{$set:{avatar:avatarUpload.secure_url}}, {
    returnDocument: "after",
    runValidators: true
}).select("-password -refreshToken");
   if(!updatedUser){
      throw new ApiError(400, "User not found")
   }
   return res.status(200).json(new ApiResponse(200, {updatedUser}, "Avatar updated successfully"))
})

//update user cover image
const updateUserCoverImage=asyncHandler(async(req,res)=>{
   const coverImageLocalPath=req.file?.path;
   if(!coverImageLocalPath){
      throw new ApiError(400, "Cover image is required")
   }
   const coverImageUpload= await uploadToCloudinary(coverImageLocalPath,"coverImages");
   if(!coverImageUpload?.secure_url){
      throw new ApiError(500, "Error while uploading cover image to cloudinary")
   }
   //update user cover image in db
   const updatedUser=
   await User.findByIdAndUpdate(req.user?._id,{$set:{coverImage:coverImageUpload.secure_url}}, {
    returnDocument: "after",
    runValidators: true
}).select("-password -refreshToken");
   if(!updatedUser){
      throw new ApiError(400, "User not found")
   }
   return res.status(200).json(new ApiResponse(200, {updatedUser}, "Cover image updated successfully"))
})

export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUserProfile,updateAccountDetails,updateUserAvatar,updateUserCoverImage}