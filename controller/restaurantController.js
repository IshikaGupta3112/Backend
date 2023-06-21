const Seller = require("../model/sellerAuthModel");
const createError = require("http-errors");
const {restaurantSchema} = require("../helpers/validation");
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "./uploads")
      console.log(req.files)
  },
  filename: (req, file, cb) =>{
      req.file = file;
      cb(null, `${Date.now()} - ${file.originalname}`)
  }
})

const upload = multer({
  storage: storage
})

async function restaurantRegister(req, res, next) {
    try {
      const Result = await restaurantSchema.validateAsync(req.body);
      const isExist = await Seller.findOne({_id: Result.id });
      if (!isExist) {
        throw createError.NotFound("Seller Not Found");
      } else {
        const isSeller = await Seller.findOne({_id: Result.id})
       if(isSeller.restaurant.restaurantName) throw createError.Conflict("Restaurant already added!!")
        await Seller.findOneAndUpdate( 
          { _id: Result.id },
          {
            $set: {restaurant:{
              restaurantName:Result.restaurantName,
              phone_no:Result.phone_no , 
              openingTime:Result.openingTime ,
              closingTime:Result.closingTime,
              address:Result.address ,
              pincode:Result.pincode,
              imgpath:req.file
            }
        },
          }
        );

        return res.status(200).json({ msg: "Restaurant Registered Successfully!" });
      }
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  }
  
  module.exports = {
    restaurantRegister,
    upload
  };