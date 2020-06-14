const moment = require("moment");
const { assign, get, isInteger, toNumber } = require("lodash");
const {
  Record,
  CREATE_RECORD_VALIDATION,
  UPDATE_RECORD_VALIDATION,
} = require("./record.model");
const ObjectId = require("mongodb").ObjectID;
const { ROLES } = require("../../constants");

const read = (req, res, next) => {
  res.json(req.record);
};

const list = async (req, res, next) => {
  try {
    const { page, limit, user = [], name } = req.query;

    let where = {};
    if (req.user.role < ROLES.ADMIN) {
      where = { user: ObjectId(req.user._id) };
    }

    if (user.length && req.user.role === ROLES.ADMIN) {
      where["user"] = { $in: user.map((a) => ObjectId(a)) };
    }

    let symbolString = name ? name : "";
    where["name"] = { $regex: ".*" + symbolString + ".*" };

    if (
      !isInteger(toNumber(page)) ||
      !isInteger(toNumber(limit)) ||
      toNumber(page) <= 0
    ) {
      return res
        .status(422)
        .send({ message: "Page and rows per page must be positive integer." });
    }

    const records = await Record.find(where)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("user", "-password -passwordConfirm");

    const count = await Record.countDocuments(where);

    res.json({ records, count });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    if (req.user.role < ROLES.ADMIN) {
      req.body.user = req.user._id;
    }

    const { error } = CREATE_RECORD_VALIDATION(req.body);
    if (error)
      return res.status(400).send({
        message: get(error, "details.0.message", "Something went wrong."),
      });

    const record = new Record(req.body);

    const newRecord = await record.save();
    res.status(201).json(newRecord);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    if (req.user.role < ROLES.ADMIN) {
      req.body.user = req.user._id;
    }
    const { error } = UPDATE_RECORD_VALIDATION(req.body);
    if (error)
      return res.status(400).send({
        message: get(error, "details.0.message", "Something went wrong."),
      });
    req.body.date = moment(req.body.date).locale("en");
    assign(req.record, req.body);

    const updatedRecord = await await req.record.save();
    res.json(updatedRecord);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  await req.record.remove();
  res.json({ id: req.record._id });
};

const getRecordByID = async (req, res, next, id) => {
  try {
    const record = await Record.findById(id);

    if (!record) {
      return res.status(404).send({ message: "Not found." });
    }
    if (
      req.user.role !== ROLES.ADMIN &&
      req.user._id !== record.user.toString()
    ) {
      return res.status(403).send({ message: "Permission denied." });
    }

    req.record = record;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  update,
  read,
  list,
  remove,
  getRecordByID,
};
