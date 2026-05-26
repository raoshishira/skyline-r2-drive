const fs = require("fs");
const path = require("path");

const DEFAULT_PASSWORDS = ["your-secure-local-password", "password123"];

const login = async (req: any, res: any) => {
  const { password } = req.body;
  const masterPassword = process.env.APP_PASSWORD;

  if (!masterPassword || DEFAULT_PASSWORDS.includes(masterPassword)) {
    // If it's a default password, we still allow login, 
    // but the frontend should have ideally redirected to setup.
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
  const masterPassword = process.env.APP_PASSWORD;
  const needsSetup = !masterPassword || DEFAULT_PASSWORDS.includes(masterPassword);
  
  res.json({ 
    authenticated: (req.session && req.session.authenticated) || false,
    needsSetup 
  });
};

const setupPassword = async (req: any, res: any) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const envPath = path.join(__dirname, "../../../.env");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  const envVars = require("dotenv").parse(envContent);
  envVars.APP_PASSWORD = password;

  const newContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  fs.writeFileSync(envPath, newContent);
  require("dotenv").config({ path: envPath, override: true });

  // Automatically log them in after setup
  req.session.authenticated = true;
  res.json({ success: true });
};

module.exports = { login, logout, checkAuth, setupPassword };
