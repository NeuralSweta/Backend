import mongoose,{Schema} from "mongoose";

const videoSchema=new Schema({
    videoFile:{
        type:String, // cloudinary link
        required:true,
    },
    thumbnail:{
        type:String, // cloudinary link
        required:true,
    },
    title:{
        type:String,    

    },
    description:{
        type:String,
    },
    duration:{
        type:Number,
        required:true,
    },
    views:{
        type:Number,
        default:0,  
    },
    isPublished:{
        type:Boolean,
        default:false,  
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
} ,{timestamps:true});

export const Video=mongoose.model("Video",videoSchema)        


// mongoose.aggregate-paginate