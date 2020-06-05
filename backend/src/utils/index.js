function hasRole(ROLES) {
  return (req, res, next) => {
    if (ROLES.indexOf(req.user.role) > -1) {
      next();
      return;
    }
    res.status(code).json({ message });
  };
}

module.exports = {
  hasRole,
};
