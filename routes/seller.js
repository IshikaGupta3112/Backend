const express = require("express");

const router = express.Router();

const {
  refreshToken,
  sellerSignup,
  sellerLogin,
  sendOtp,
  loginOtpVerify,
  signupOtpVerify,
  resetPass,
} = require("../controller/sellerAuthContoller");
const {restaurantRegister , upload} = require("../controller/restaurantController");
const {foodList} = require('../controller/foodController');
router.post("/signup", sellerSignup);
router.post("/login", sellerLogin);
router.post("/sendOtp", sendOtp);
router.post("/login/otpVerify", loginOtpVerify);
router.post("/signup/otpVerify", signupOtpVerify);
router.patch("/resetPass", resetPass);
router.post("/refreshToken", refreshToken);
router.post("/restaurantRegister", upload.array('imgpath', 12) ,restaurantRegister);
router.post("/foodList" ,foodList);

module.exports = router;
