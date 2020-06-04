const Joi = require("joi");
const mongoose = require("mongoose");
Joi.objectId = require("joi-objectid")(Joi);

const RecordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  city: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 250,
  },
  difference: {
    type: Number,
    default: 1,
    min: [-24, "DifferenceToGMT must be more than -24"],
    max: [24, "DifferenceToGMT should be less than 24"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Record = mongoose.model("Record", RecordSchema);

const CREATE_RECORD_VALIDATION = (record) => {
  return Joi.validate(record, {
    difference: Joi.number().required().min(-24).max(24).default(0),
    name: Joi.string().required().min(1).max(50).default(""),
    city: Joi.string().required().min(1).max(250).default(""),
    user: Joi.objectId().required(),
  });
};

const UPDATE_RECORD_VALIDATION = (record) => {
  return Joi.validate(record, {
    difference: Joi.number().optional(),
    name: Joi.string().optional(),
    city: Joi.string().optional(),
    user: Joi.objectId().required(),
  });
};

module.exports = {
  Record,
  CREATE_RECORD_VALIDATION: CREATE_RECORD_VALIDATION,
  UPDATE_RECORD_VALIDATION: UPDATE_RECORD_VALIDATION,
};
