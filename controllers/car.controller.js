const mongoose = require("mongoose");
const Car = require("../models/Car");
const { sendResponse, AppError } = require("../helpers/utils.js");
const carController = {};

carController.createCar = async (req, res, next) => {
  const requiredField = [
    "make",
    "model",
    "release_date",
    "transmission_type",
    "size",
    "style",
    "price",
  ];
  try {
    if (!req.body) throw new AppError(400, "Bad Request", "Create Car Error");

    requiredField.forEach((field) => {
      if (!Object.keys(req.body).includes(field))
        throw new AppError(
          400,
          "Bad Request Missing field",
          "Create Car missing field"
        );
    });

    const created = await Car.create(req.body);
    created.isDelete = false;

    sendResponse(res, 200, true, { car: created }, null, "Create Car Success");
  } catch (err) {
    next(err);
  }
};

carController.getCars = async (req, res, next) => {
  const { page, limit } = req.query;
  try {
    const carDb = await Car.find();

    let pageInt = parseInt(page) || 1;
    let limitInt = parseInt(limit) || 10;
    let offset = limitInt * (pageInt - 1);
    let displayCar = carDb.slice(offset, offset + limitInt);
    let total = parseInt(carDb.length / limitInt);

    sendResponse(
      res,
      200,
      true,
      { cars: displayCar, page, total },
      null,
      `Get cars list page:${pageInt} success`
    );
  } catch (err) {
    next(err);
  }
};

carController.editCar = async (req, res, next) => {
  const updatedValue = req.body;
  const { id } = req.params;
  try {
    if (!id) throw new AppError(400, "Bad request Car ID not valid");

    if (!mongoose.isValidObjectId(id))
      throw new AppError(400, "Object ID Not valid");

    if (!req.body || !Object.keys(updatedValue).length > 0)
      throw new AppError(400, "Car updated field not found");

    let updatedCar = await Car.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );

    sendResponse(
      res,
      200,
      true,
      { car: updatedCar },
      null,
      `Update Car Successfully`
    );
  } catch (err) {
    next(err);
  }
};

carController.deleteCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      throw new AppError(400, "Bad Request", "Create Car Error");

    const deletedCar = await Car.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, runValidators: true }
    );

    if (deletedCar === null)
      throw new AppError(400, "Bad Request Car not found", "Car not found");

    sendResponse(
      res,
      200,
      true,
      { car: deletedCar },
      null,
      `Update Car Successfully`
    );
  } catch (err) {
    next(err);
  }
};

module.exports = carController;
