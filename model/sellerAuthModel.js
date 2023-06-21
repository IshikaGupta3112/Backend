const mongoose = require("mongoose");

const sellerAuthSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: String,
  },
  restaurant: {
    restaurantName: {
      type: String,
    },
    address: {
      type: String,
    },
    phone_no: {
      type: String,
    },
    openingTime: {
      type: String,
    },
    closingTime: {
      type: String,
    },
    pincode:{
      type:String
    },
    imgpath:{
     type:Array
    }
  },
});

const Seller = mongoose.model("seller", sellerAuthSchema);

module.exports = Seller;
