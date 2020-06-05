const express = require("express");
const router = express.Router();
const { ROLES } = require("../../constants");
const userController = require("./user.controller");
const permissions = require("../../utils");

router.use(permissions.hasRole([ROLES.ADMIN, ROLES.MANAGER]));

router.route("/").get(userController.list).post(userController.create);

router
  .route("/:id")
  .get(userController.read)
  .put(userController.update)
  .delete(userController.remove);

router.param("id", userController.getUserByID);

module.exports = router;
