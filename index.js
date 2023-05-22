const express = require('express');
const createError = require('http-errors');
require('dotenv').config()

const app = express();
const {connectToMongoDB} = require('./helpers/connection');
const userRoute=require('./routes/user')
const {verifyAccessToken } = require('./helpers/jwt')

const PORT = process.env.PORT || 3000;


connectToMongoDB('mongodb://localhost:27017/auth').then(()=>{console.log('MongoDb Connected')}).catch((err)=>{console.log(err)});

app.use(express.json());

app.get("/" ,verifyAccessToken , async(req , res , next)=>{
    console.log(req.headers['authorization'])
    res.send("hello");
}) 

app.use('/user' , userRoute);

app.use(async(req , res , next)=>{
    // const err = new Error("Not Found")
    // err.status = 404
    // next(err);
    next(createError.NotFound("this route is not found"))
})

app.use(async(err , req ,res ,next)=>{
res.status(err.status||500)
res.send({
    error:{
        status:err.status || 500,
        message:err.message,
    },
})
})


app.listen(PORT , ()=>console.log("Server Started on port" , PORT));