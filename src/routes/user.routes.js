import {Router} from "express";
import {registerUser,loginUser,logoutUser,refreshAccessToken,updateUserAvatar}from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router=Router() 

router.route("/register").post(
    upload.fields([ //middleware to handle file upload, we can use upload.single("avatar") for single file upload or upload.array("avatar",maxCount) for multiple file upload, but here we are using upload.fields() to handle multiple files with different field names
     {name:"avatar",maxCount:1},
     {name:"coverImage",maxCount:1}
    ]),
    registerUser)  // register user route

   

router.route("/login").post(loginUser)  // login user route

//secure routes
router.route("/logout").post(verifyJWT,logoutUser)  // logout user route, we can use verifyJWT middleware to protect the route, so that only authenticated users can access the route
  

router.route("/refresh-token").post(refreshAccessToken) 

router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/update-cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserAvatar)

export default router