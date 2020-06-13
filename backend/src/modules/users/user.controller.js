const { isInteger, toNumber, pick, get } = require("lodash");
const {
  User,
  CREATE_USER_VALIDATION,
  UPDATE_USER_VALIDATION,
} = require("./user.model");
const { Record } = require("../records/record.model");
const { ROLES } = require("../../constants");

function read(req, res, next) {
  res.json(req.userModel);
}

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    let findRole = 0;
    if (req.user.role == ROLES.ADMIN) {
      findRole = 2;
    }

    const where = { _id: { $ne: req.user._id }, role: { $lte: findRole } };

    if (!isInteger(toNumber(page)) || !isInteger(toNumber(limit))) {
      return res
        .status(422)
        .send({ message: "Page and rows per page must be positive integer." });
    }

    const users = await User.find(where)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-password -passwordConfirm")
      .sort("-role");
    const count = await User.countDocuments(where);

    res.json({ users, count });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { error } = CREATE_USER_VALIDATION(req.body);
    if (error)
      return res.status(400).send({
        message: get(error, "details.0.message", "Something went wrong."),
      });

    let exist = await User.findOne({ email: req.body.email });
    if (exist)
      return res.status(409).send({ message: "User already registered." });

    if (req.user.role === ROLES.MANAGER && req.body.role === ROLES.ADMIN) {
      return res.status(403).send({
        message: `Permission denied. Managers cannot create admin.`,
      });
    }

    const user = new User(req.body);
    const newUser = await user.save();
    res.json(pick(newUser, ["firstName", "lastName", "email", "_id", "role"]));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { error } = UPDATE_USER_VALIDATION(req.body);
    if (error)
      return res.status(400).send({
        message: get(error, "details.0.message", "Something went wrong."),
      });

    let exist = await User.findOne({
      email: req.body.email,
      _id: { $ne: req.userModel._id },
    });
    if (exist)
      return res.status(409).send({ message: "User already registered." });

    if (req.user.role === ROLES.MANAGER && req.body.role === ROLES.ADMIN) {
      return res.status(403).send({ message: "Permission denied." });
    }

    Object.assign(req.userModel, req.body);

    const updatedUser = await req.userModel.save();
    res.json(
      pick(updatedUser, ["firstName", "lastName", "email", "_id", "role"])
    );
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  await Record.remove({ user: req.userModel._id });
  await req.userModel.remove();
  res.json({ id: req.userModel._id });
};

const getUserByID = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({ message: "Not found." });
    }

    if (user.role > req.user.role) {
      return res.status(403).send({ message: "Permission denied." });
    }

    req.userModel = user;
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
  getUserByID,
};
