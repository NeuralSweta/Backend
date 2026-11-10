import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express()

app.use(cors({
        origin: process.env.CORS_ORIGIN
    }))  // configuration of cors 

app.use(express.json({limit: "16kb"}))  // to parse the incoming request body as json, so that we can access the data in the request body
// body parser is used to parse the incoming request body, so that we can access the data in the request body, we don't need to use BODY PARSER package, because express has built in body parser, so we can use express.json() to parse the incoming request body as json.

// Another package is Malter, which is used to parse the incoming request body as file , so that we can access the data in request body.

// taking data from URL
app.use(express.urlencoded({extended:true,limit: "16kb"})) // entended means object inside object

app.use(express.static("public"))  // to serve the static files from public folder, so that we can access the static files from public folder, like images, css, js etc.

// cookie- parser is used so that from our server, we can  access the cookies in user browser , and set the cookies , 
// we want to perform CRUD operations on cookies
// some secure ways to store cookies on user browser, which can only be read and remove by server

app.use(cookieParser())

export {app}