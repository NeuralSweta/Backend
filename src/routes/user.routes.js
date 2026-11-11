import Router from "express";
import {registerUser} from "../controllers/user.controller.js"

const router=Router() 

router.route("/register").post(registerUser)  // register user route

// router.route("/login").post(loginrUser)  // login user route

export default router