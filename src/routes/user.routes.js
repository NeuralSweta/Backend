import {Router} from "express";
import {registerUser} from "../controllers/user.controller.js"
import {upload} from "../middleware/multer.middleware.js"

const router=Router() 

router.route("/register").post(
    upload.fields([ //middleware to handle file upload, we can use upload.single("avatar") for single file upload or upload.array("avatar",maxCount) for multiple file upload, but here we are using upload.fields() to handle multiple files with different field names
     {name:"avatar",maxCount:1},
     {name:"coverImage",maxCount:1}
    ]),
    registerUser)  // register user route

    if(fullName==""){
        
    }

// router.route("/login").post(loginrUser)  // login user route

export default router