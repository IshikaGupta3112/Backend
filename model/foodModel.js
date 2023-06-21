const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
    id:{
   type:mongoose.Schema.Types.ObjectId,
   ref:"seller"
    },
    food:[{
        foodname:{
            type:String , 
            required:true
        },
        food_price:{
            type:String,
            required:true
        },
        food_desc:{
            type:String,
            required:true
        },
        food_category:{
            type:String,
            required:true 
        },
        image:{
            type:Array
           }
        }]
})

const Food = mongoose.model("food", foodSchema);

module.exports = Food;