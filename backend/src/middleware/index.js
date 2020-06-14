const jwt = require("jsonwebtoken");
const { User } = require("../modules/users/user.model");

module.exports = async (req, res, next) => {
  const header = req.headers["x-access-token"] || req.headers["authorization"];
  if (!header)
    return res
      .status(401)
      .send({ message: "Access denied. No token provided." });

  const token = header.split(" ");
  if (!token[1])
    return res
      .status(401)
      .send({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token[1], "secret");
    console.log("decoded", decoded);
    const { _id, role } = decoded;

    const user = await User.find({ _id: _id, role: role });
    if (!user) {
      res.status(400).send({ message: "Invalid token." });
    }
    req.user = user;
    console.log(user);
    next();
  } catch (err) {
    res.status(400).send({ message: "Invalid token." });
  }
};
