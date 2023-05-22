const Joi = require('@hapi/joi');

const authSchema =Joi.object({
    name:Joi.string().required(),
    email:Joi.string().email().lowercase().required(),
    password:Joi.string().min(2).max(8).required()
})

const loginSchema =Joi.object({
    email:Joi.string().email().lowercase().required(),
    password:Joi.string().required()
})

const sendOtpSchema =Joi.object({
    email:Joi.string().email().lowercase().required()
})

const otpVerifySchema =Joi.object({
    email:Joi.string().email().lowercase().required(),
    otp:Joi.required()
})

const resetPassSchema =Joi.object({
    email:Joi.string().email().lowercase().required(),
    password:Joi.string().required()
})
module.exports ={
    authSchema , 
    loginSchema , 
    sendOtpSchema,
    otpVerifySchema,
    resetPassSchema
}