const Joi = require("joi");
const mongoose = require("mongoose");
Joi.objectId = require("joi-objectid")(Joi);

const RecordSchema = new mongoose.Schema(
  {
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
      min: [-12, "Difference must be more than -12"],
      max: [12, "Difference should be less than 12"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { versionKey: false }
);

const Record = mongoose.model("Record", RecordSchema);

const CREATE_RECORD_VALIDATION = (record) => {
  return Joi.validate(record, {
    difference: Joi.number().required().min(-12).max(12).default(0),
    name: Joi.string().required().min(1).max(50).default(""),
    city: Joi.string().required().min(1).max(250).default(""),
    user: Joi.objectId().required(),
  });
};

const UPDATE_RECORD_VALIDATION = (record) => {
  return Joi.validate(record, {
    difference: Joi.number().optional().min(-12).max(12),
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
