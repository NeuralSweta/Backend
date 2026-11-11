import {asyncHandler} from "../utils/asyncHandler.js";

//higher order fxn which takes a function as an argument and returns a new function which is wrapped in a try catch block, so that we don't have to write try catch block in every controller function, 
const registerUser=asyncHandler(async(req,res,next)=>{
   res.status(200).json({
    success:true,
    message:"User registered successfully"
   })
})

export {registerUser}