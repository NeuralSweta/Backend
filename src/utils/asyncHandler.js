// promise based async handler for express routes
const asynHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch((err)=>next(err))
}




// const asyncHandler = ()=>{}
// const asyncHandler = (fn) => ()=>{}
// const asyncHandler = async(fn) => ()=>{}

    // try catch block 
// const asyncHandler = (fn) => async(req,res,next)=>{
//   try{
//     await fn(req,res,next)
//   }
//   catch(err){
//     res.status(err.code||500).json({
//         success: false,
//         message:err.message})
//   }
// }