import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js";        

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try{
    const token=  req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new ApiError(401,"Unauthorized request")}

    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?.id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(401,"Invalid access token, user not found")
    }

    // now it is confirm there is a valid user, so we can attach the user to the request object, so that we can access the user in the next middleware or controller
    req.user=user;
    next();
}
catch(err){
    console.log("Error in verifying JWT",err);
    throw new ApiError(401,"Invalid access token")  
}
})
//middleware is used in routes to protect the routes, so that only authenticated users can access the routes, and we can use req.user in the controller to get the user details