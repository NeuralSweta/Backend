 // require("dotenv").config({path:'./env'}) // we want to load the environment variables when the appplication starts so we are using this package to load the environment variables from .env file,   this decreases the code consistenncy 

 // require above, import below, so use import 

 import dotenv from "dotenv"

 import mongoose from "mongoose";
 import {DB_NAME} from "./constants.js"
 import connectDB from "./db/index.js";
 import {app} from "./app.js"


 dotenv.config({path:'./.env'})

// connectDB()
// // db has asynchronous method, so it returns a promise, so we can use then and catch to handle the promise

// .then(()=>{
//     const PORT=process.env.PORT||5000;
//     app.listen(PORT,()=>{
//         console.log(`Server is running on port ${PORT}`)
//     })  
// })
// .catch((err)=>{
//     console.log("MongoDB connection failed",err);
//     throw err
// })





// /*import express from "express";
// const app=express()

// ;(async()=>{
//     try{
//        await mongoose.connect(`${process.env.mongodb_URI}${DB_NAME}`)
//        app.on("error",(err)=>{
//         console.log("Error in connecting to database",err);
//         throw err
//        })
       
//        app.listen(process.env.PORT,()=>{
//         console.log(`Server is running on port ${process.env.PORT}`)
//        })
//     }
//     catch(err){
//         console.log(err)
//         throw err
//     }
// })()
//     */

console.log("1. Index.js started");
console.log("2. PORT:", process.env.PORT || 5000);

connectDB()
  .then(() => {
    console.log("3. MongoDB promise resolved");

    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
      console.log("4. Express is listening on:", PORT);
    });

    server.on("error", (error) => {
      console.error("HTTP SERVER ERROR:", error);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });