const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

module.exports = { isAuthenticated };
