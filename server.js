import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./mongodb/database.js";
import authRouter from "./routes/authRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import userRouter from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://bazaarwale.netlify.app",
];

const serverStats = {
  startTime: Date.now(),
  logs: [],
  maxLogs: 100,
};

const LOGS_FILE_PATH = path.join(__dirname, "public", "logs.json");

/** Load existing logs from file on server start */
async function loadLogs() {
  try {
    const data = await fs.readFile(LOGS_FILE_PATH, "utf-8");
    const savedData = JSON.parse(data);
    serverStats.logs = savedData.logs || [];
    // Always reset startTime on server restart (don't persist uptime)
    serverStats.startTime = Date.now();
    console.log(`✅ Loaded ${serverStats.logs.length} logs from file`);
  } catch (error) {
    console.log("📝 Starting with fresh logs");
    await saveLogs();
  }
}

/** Save logs to file */
async function saveLogs() {
  try {
    const data = {
      logs: serverStats.logs,
      startTime: serverStats.startTime,
      lastUpdated: new Date().toISOString(),
    };
    await fs.writeFile(LOGS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving logs:", error.message);
  }
}

loadLogs();

app.use(cors({ credentials: true, origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/** Request logging middleware */
app.use((req, res, next) => {
  // Only skip monitoring endpoints and actual static filesf
  const skipPaths = ['/api/logs', '/api/logs/clear', '/logs.json', '/', '/monitor', '/monitor/auth'];
  const isStaticFile = req.url.match(/\.(html|css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i);

  if (skipPaths.includes(req.url) || skipPaths.includes(req.path) || isStaticFile) {
    return next();
  }

  const startTime = Date.now();
  const originalSend = res.send;
  let responseBody;

  res.send = function (data) {
    const responseTime = Date.now() - startTime;

    try {
      responseBody = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      responseBody = data;
    }

    const logEntry = {
      timestamp: new Date().toLocaleString(),
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip || req.connection.remoteAddress,
      request: {
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
          'authorization': req.headers['authorization'],
          'accept': req.headers['accept'],
          'host': req.headers['host'],
        },
        body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
        cookies: req.cookies && Object.keys(req.cookies).length > 0 ? req.cookies : undefined,
      },
      response: {
        body: responseBody,
        cookies: res.getHeader('set-cookie') || undefined,
      },
    };

    serverStats.logs.push(logEntry);
    if (serverStats.logs.length > serverStats.maxLogs) {
      serverStats.logs.shift();
    }

    saveLogs().catch(err => console.error("Error saving logs:", err.message));

    return originalSend.call(this, data);
  };

  next();
});

app.use(express.static(path.join(__dirname, "public")));

/** Server monitoring API endpoints */
app.get("/api/logs", (req, res) => {
  res.json({
    logs: serverStats.logs,
    serverStartTime: serverStats.startTime,
    totalRequests: serverStats.logs.length,
  });
});

app.post("/api/logs/clear", async (req, res) => {
  serverStats.logs = [];
  await saveLogs();
  res.json({ success: true, message: "Logs cleared" });
});

app.post("/api/server/stop", (req, res) => {
  res.json({ success: true, message: "Server shutting down..." });
  console.log("🛑 Server stop requested from monitor");

  setTimeout(() => {
    // Check if running under PM2
    if (process.env.pm_id) {
      console.log("Running under PM2, executing pm2 stop...");
      import('child_process').then(({ exec }) => {
        exec('npx pm2 stop bazaarwale-backend', (error, stdout, stderr) => {
          if (error) {
            console.error(`PM2 stop error: ${error}`);
            process.exit(0); // Fallback
          }
        });
      });
    } else {
      process.exit(0);
    }
  }, 1000);
});

/** Root route - API health check */


/** API Routes - Define BEFORE the monitor route */
app.use("/api/user/auth", authRouter);
app.use("/api/user/contact", contactRouter);
app.use("/api/user/profile", userRouter);
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working"
  });
});
/** Monitor Authentication - Always prompt for password, no sessions */
const blockFrontendAccess = (req, res, next) => {
  const origin = req.headers.origin;

  // Block frontend apps
  if (origin && allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: "Access denied"
    });
  }

  next();
};

/** Monitor Routes - Always show login page, no session persistence */
app.get("/monitor", blockFrontendAccess, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "monitor-login.html"));
});

app.post("/monitor/auth", blockFrontendAccess, (req, res) => {
  const { username, password } = req.body;

  // Validate credentials against env variables
  const validUsername = process.env.SERVER_MONITOR_USERNAME;
  const validPassword = process.env.SERVER_MONITOR_PASS;

  if (!validUsername || !validPassword) {
    return res.status(500).json({
      success: false,
      message: "Server configuration error"
    });
  }

  if (username === validUsername && password === validPassword) {
    // Return the monitor HTML directly
    return res.sendFile(path.join(__dirname, "public", "server.html"));
  }

  return res.status(401).json({
    success: false,
    message: "Invalid username or password"
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

