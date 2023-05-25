const express = require("express");

const router = express.Router();

const {
  userSignup,
  userLogin,
  sendOtp,
  loginOtpVerify,
  signupOtpVerify,
  resetPass,
} = require("../controller/user");

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/sendOtp", sendOtp);
router.post("/login/otpVerify", loginOtpVerify);
router.post("/signup/otpVerify", signupOtpVerify);
router.patch("/resetPass", resetPass);

module.exports = router;
