const Joi = require('@hapi/joi');

const signupSchema =Joi.object({
    username:Joi.string().required(),
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

const restaurantSchema = Joi.object({
restaurantName:Joi.string().required(),
openingTime:Joi.string().required(),
closingTime:Joi.string().required(),
address:Joi.string().required(),
phone_no:Joi.string().required(),
pincode:Joi.string().required(),
id:Joi.string().required()
})

const foodSchema= Joi.object({
    foodname:Joi.string().required(),
    food_price:Joi.string().required(),
    food_category:Joi.string().required(),
    food_desc:Joi.string().required(),
    id:Joi.string().required()   
})

module.exports ={
    signupSchema , 
    loginSchema , 
    sendOtpSchema,
    otpVerifySchema,
    resetPassSchema,
    restaurantSchema,
    foodSchema
}