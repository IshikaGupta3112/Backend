const express = require('express');

const router = express.Router();

const {userSignup , userLogin ,sendOtp , otpVerify , resetPass} = require('../controller/user')

router.post("/signup" , userSignup);
router.post("/login" , userLogin);
router.post("/sendOtp" , sendOtp);
router.post("/otpVerify" , otpVerify);
router.post("/resetPass" , resetPass);

module.exports = router;