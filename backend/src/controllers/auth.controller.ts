const authDotenv = require("dotenv");
authDotenv.config();

const login = async (req: any, res: any) => {
  const { password } = req.body;
  const masterPassword = process.env.APP_PASSWORD;

  if (!masterPassword) {
    return res.status(500).json({ error: "App password not configured" });
  }

  if (password === masterPassword) {
    req.session.authenticated = true;
    return res.json({ success: true });
  }

  res.status(401).json({ error: "Invalid password" });
};

const logout = (req: any, res: any) => {
  req.session.destroy((err: any) => {
    if (err) return res.status(500).json({ error: "Could not log out" });
    res.json({ success: true });
  });
};

const checkAuth = (req: any, res: any) => {
  res.json({ authenticated: (req.session && req.session.authenticated) || false });
};

module.exports = { login, logout, checkAuth };
