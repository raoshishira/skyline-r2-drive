const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/auth.routes").default || require("./routes/auth.routes");
const r2Routes = require("./routes/r2.routes").default || require("./routes/r2.routes");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "1gb" }));
app.use(express.urlencoded({ limit: "1gb", extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || "local-r2-drive-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use("/api/auth", authRoutes);
app.use("/api/r2", r2Routes);

app.get("/api/health", (req: any, res: any) => {
  res.json({ status: "ok" });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Backend Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


