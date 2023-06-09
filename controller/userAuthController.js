const User = require("../model/userAuthModel");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const createError = require("http-errors");
const {
  signupSchema,
  loginSchema,
  sendOtpSchema,
  otpVerifySchema,
  resetPassSchema,
} = require("../helpers/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

async function refreshToken(req , res , next){
try{
const refreshToken = req.body.refreshToken;
if(!refreshToken) throw createError.BadRequest("Please Provide refreshToken");
jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET , (err , payload)=>{
  if(err) throw createError.Unauthorized()
  const userId = payload._id
  const accessToken =  jwt.sign({ _id: userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60s" });
  const refreshToken =  jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1y" });
  return res.json({accessToken, refreshToken})
})
}
catch(err){
res.json({err:err})
}
}

async function userSignup(req, res, next) {
  try {
    const Result = await signupSchema.validateAsync(req.body);
    const existUser = await User.findOne({ email: Result.email.toLowerCase() });
    if (existUser)
      throw createError.Conflict("User with this mail already exists");
    const hashedPassword = await bcrypt.hash(Result.password, 12);
    const user = new User({
      username: Result.username,
      email: Result.email,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const otpExpiry = Date.now() + 120000;
    transporter.sendMail({
      to: Result.email,
      from: "ishika2110184@akgec.ac.in",
      subject: "Verify Your Email!!",
      html: `<p>Enter ${otp} to verify your account.</p>`,
    });
    const isExist = await User.findOne({ email: Result.email });
    if (isExist) {
      await User.findOneAndUpdate(
        { email: Result.email },
        {
          otp: otp,
          otpExpiry: otpExpiry,
        },
        { new: true }
      );
    } else {
      return res.json({ err: "couldn't do" });
    }
    return res.status(201).json({ msg: "Signup Successful , Otp sent" });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

async function userLogin(req, res, next) {
  try {
    const Result = await loginSchema.validateAsync(req.body);

    const isExist = await User.findOne({ email: Result.email });
    if (!isExist) throw createError.NotFound("User doesn't exist");
    const doMatch = await bcrypt.compare(Result.password, isExist.password);
    const accessToken =  jwt.sign({ _id: isExist.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60s" });
    const refreshToken =  jwt.sign({ _id: isExist.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1y" });
    if (doMatch)
      return res
        .status(200)
        .json({ msg: "Login Successful", accessToken: accessToken , refreshToken:refreshToken });
    throw createError.Unauthorized("Invalid Credentials");
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

async function sendOtp(req, res, next) {
  try {
    const Result = await sendOtpSchema.validateAsync(req.body);
    const existUser = await User.findOne({ email: Result.email });
    if (existUser) {
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
      const otpExpiry = Date.now() + 120000;
      transporter.sendMail({
        to: Result.email,
        from: "ishika2110184@akgec.ac.in",
        subject: "Verify Your Email!!",
        html: `<p>Enter ${otp} to verify your account.</p>`,
      });
      await User.findOneAndUpdate(
        { email: Result.email },
        { otp: otp, otpExpiry: otpExpiry },
        { new: true }
      );
      return res.status(200).json({ msg: "otp sent" });
    } else {
      throw createError.NotFound("User doesn't exist");
    }
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

async function loginOtpVerify(req, res, next) {
  try {
    const Result = await otpVerifySchema.validateAsync(req.body);
    const isExist = await User.findOne({ email: Result.email });
    if (!isExist) {
      throw createError.Conflict("User doesn't exist");
    } else if (isExist.otpExpiry <= Date.now()) {
      throw createError.Conflict("OTP timed out!");
    } else {
      if (isExist.otp === Result.otp)
        return res.status(200).json({ msg: "Correct Otp" });
      else {
        throw createError.Forbidden("Incorrect Otp");
      }
    }
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

async function signupOtpVerify(req, res, next) {
  try {
    const Result = await otpVerifySchema.validateAsync(req.body);
    const isExist = await User.findOne({ email: Result.email });
    const accessToken =  jwt.sign({ _id: isExist.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60s" });
    const refreshToken =  jwt.sign({ _id: isExist.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1y" });
    if (!isExist) {
      throw createError.Conflict("User doesn't exist");
    } else if (isExist.otpExpiry <= Date.now()) {
      throw createError.Conflict("OTP timed out!");
    } else {
      if (isExist.otp === Result.otp)
        return res
          .status(200)
          .json({ msg: "Correct Otp", accessToken: accessToken , refreshToken:refreshToken});
      else {
        throw createError.Forbidden("Incorrect Otp");
      }
    }
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

async function resetPass(req, res, next) {
  try {
    const Result = await resetPassSchema.validateAsync(req.body);
    const isExist = await User.findOne({ email: Result.email });
    if (!isExist) {
      throw createError.NotFound("User doesn't exist");
    } else {
      const doMatch = await bcrypt.compare(Result.password, isExist.password);
      if (doMatch) {
        throw createError.BadRequest(
          "Password is same as the previous password"
        );
      }
      const newPass = await bcrypt.hash(Result.password, 12);
      await User.findOneAndUpdate(
        { email: Result.email },
        {
          $set: {
            password: newPass,
          },
        }
      );
      return res.status(200).json({ msg: "Password changed successfully" });
    }
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

module.exports = {
  refreshToken ,
  userSignup,
  userLogin,
  sendOtp,
  loginOtpVerify,
  signupOtpVerify,
  resetPass,
};
