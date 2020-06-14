const { pick, assign, get } = require("lodash");
const bcrypt = require("bcrypt");
const {
  User,
  CREATE_USER_VALIDATION,
  UPDATE_USER_VALIDATION,
} = require("../users/user.model");
const { Record } = require("../records/record.model");
const ROLES = require("../../constants");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Email is empty." });
    } else if (password.length < 8) {
      return res
        .status(400)
        .send({ message: "Password should be at least 8 letters." });
    }

    const user = await User.findOne({ email: req.body.email })
      .select("_id password email firstName lastName role")
      .exec();
    if (!user) {
      return res.status(404).send({
        message: `Not found. Please check your email and password again. They do not match.`,
      });
    }

    if (bcrypt.compareSync(req.body.password, user.password)) {
      const token = user.getAuthToken();
      res.json({
        info: pick(user, ["_id", "firstName", "lastName", "email", "role"]),
        token,
      });
    } else {
      res.status(401).send({
        message: "Invalid credential. Email and password does not match.",
      });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal server error." });
    next(error);
  }
};

const signUp = async (req, res, next) => {
  try {
    const { error } = CREATE_USER_VALIDATION(req.body);
    if (error)
      return res.status(400).send({
        message: get(error, "details.0.message", "Something went wrong."),
      });

    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(409).send({ message: "User already registered." });

    user = new User(
      pick(req.body, [
        "firstName",
        "lastName",
        "email",
        "password",
        "passwordConfirm",
      ])
    );
    const newUser = await user.save();
    res.status(201).send({
      user: pick(newUser, ["firstName", "lastName", "email", "_id"]),
    });
  } catch (error) {
    res.status(500).send({ message: "Internal server error." });
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { error } = UPDATE_USER_VALIDATION(req.body);
    if (error)
      return res.status(400).send({
        message: get(error, "details.0.message", "Something went wrong."),
      });

    const user = await User.findOne({ _id: req.user._id });
    assign(user, req.body, { role: get(req.user, "role", 0) });
    const updatedUser = await user.save();
    const token = updatedUser.getAuthToken();
    res.json({
      info: pick(updatedUser, [
        "_id",
        "firstName",
        "lastName",
        "email",
        "role",
      ]),
      token,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    await Record.remove({ user: user._id });
    await user.remove();
    res.status(204).json({ id: user._id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  signUp,
  updateProfile,
  deleteProfile,
};
