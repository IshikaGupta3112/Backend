const Food = require("../model/foodModel");
const { foodSchema } = require("../helpers/validation");
const createError = require("http-errors");

async function foodList(req, res, next) {
  try {
    const Result = await foodSchema.validateAsync(req.body);
    const isExist = await Food.findOne({ id: Result.id });
    if (isExist) {
      const isFood = isExist.food;
      var i = 0;
      await isFood.map((items) => {
        if (items.foodname == Result.foodname) i = 1;
      });
      if (i == 0) {
        await Food.findOneAndUpdate(
          { id: Result.id },
          {
            $push: {
              food: {
                foodname: Result.foodname,
                food_price: Result.food_price,
                food_category: Result.food_category,
                food_desc: Result.food_desc,
              },
            },
          }
        );
        res.status(200).json({msg:"Dish Entered Successfully!"});
      } else {
      throw createError.Conflict('Food Item Already Present!');
      }
    } else {
      const food = new Food({
        id: req.body.id,
        food: [
          {
            foodname: Result.foodname,
            food_price: Result.food_price,
            food_category: Result.food_category,
            food_desc: Result.food_desc,
          },
        ],
      });
      const savedFood = await food.save();

      return res.status(200).json({msg:"Dish Entered Successfully!"});
    }
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

module.exports = {
  foodList,
};
