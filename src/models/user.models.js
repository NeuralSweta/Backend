// mongodb generate a unique id when store a user in bson data
// BSON (Binary JSON) is a binary serialization format created by MongoDB to extend JSON with more data types and improve performance in database operations like storage, indexing, and decoding in MongoDB. 

// we will use 3rd party service  like AWS S3, Cloudinary, Firebase Storage, etc. to upload image, video , audio , and paste link in our database.

 
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=new Schema({
    username:{
        type:String,    
        required:true,
        lowercase:true,
        trim:true,
        index:true // easy for searching
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
    },
    avatar:{
        type:String, // cloudinary link
        required:true,
    },
    coverImage:{
        type:String, // cloudinary link
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video" 
        }
    ],
    password:{
        type:String,
        required:true,minlength:6
    },
    refreshToken:{
        type:String,
    },
} ,{timestamps:true});

// password hashing middleware
userSchema.pre("save",async function(){ // don't use arrow fxn , as we want to use this keyword, which is not available in arrow fxn
    if(!this.isModified("password")){ // if password is not modified, then we don't need to hash it again
        return;
    }
    this.password= await bcrypt.hash(this.password,10)})

userSchema.methods.isPasswordMatched=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

//generate access token
userSchema.methods.generateAccessToken=function(){
    //jwt.sign(payload,secretOrPrivateKey,options) - returns a JWT token
    return jwt.sign({
        id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,

    },process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}

//generate refresh token
userSchema.methods.generateRefreshToken=function(){
    // refresh token has less information than access token, because it is stored in database and it is used to generate new access token when access token expires
    return jwt.sign({id:this._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
}

export const User=mongoose.model("User",userSchema)