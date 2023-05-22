const User = require("../model/loginSignup");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const createError = require("http-errors");
const {
  authSchema,
  loginSchema,
  sendOtpSchema,
  otpVerifySchema,
  resetPassSchema,
} = require("../helpers/validation");
const { signAccessToken } = require("../helpers/jwt");
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

async function userSignup(req, res, next) {
  try {
    const Result = await authSchema.validateAsync(req.body);
    const existUser = await User.findOne({ email: Result.email.toLowerCase() });
    if (existUser)
      throw createError.Conflict("User with this mail already exists");
    const hashedPassword = await bcrypt.hash(Result.password, 12);
    const user = new User({
      name: Result.name,
      email: Result.email,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    const accessToken = await signAccessToken(savedUser.id);
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
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
        { otp: otp },
        { new: true }
      );
    } else {
      return res.json({ err: "couldn't do" });
    }
    return res.json({ msg: "Signup Successful", accessToken: accessToken });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

async function userLogin(req, res, next) {
  try {
    const Result = await loginSchema.validateAsync(req.body);

    const isExist = await User.findOne({ email: Result.email });
    if (!isExist) throw createError.Conflict("User doesn't exist");
    const doMatch = await bcrypt.compare(Result.password, isExist.password);
    const accessToken = await signAccessToken(isExist.id);
    if (doMatch)
      return res.json({ msg: "Login Successful", accessToken: accessToken });
      throw createError.Conflict("Invalid Credentials");
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
      transporter.sendMail({
        to: Result.email,
        from: "ishika2110184@akgec.ac.in",
        subject: "Verify Your Email!!",
        html: `<p>Enter ${otp} to verify your account.</p>`,
      });
      await User.findOneAndUpdate(
        { email: Result.email },
        { otp: otp },
        { new: true }
      );
      return res.json({ msg: "otp sent" });
    } else {
        throw createError.Conflict("User doesn't exist");
    }
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

async function otpVerify(req, res, next) {
  try {
    const Result = await otpVerifySchema.validateAsync(req.body);
    const isExist = await User.findOne({ email: Result.email });
    if (!isExist) {
        throw createError.Conflict("User doesn't exist");
    } else if (isExist.otp === Result.otp) {
      return res.json({ msg: "Correct Otp" });
    } else {
        throw createError.Conflict("Incorrect Otp");
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
        throw createError.Conflict("User doesn't exist");
    } else {
      const doMatch = await bcrypt.compare(Result.password, isExist.password);
      if (doMatch) {
        throw createError.Conflict("Password is same as the previous password")
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
      return res.json({ msg: "Password changed successfully" });
    }
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

module.exports = {
  userSignup,
  userLogin,
  sendOtp,
  otpVerify,
  resetPass,
};
