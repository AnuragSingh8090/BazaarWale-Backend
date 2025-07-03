import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./mongodb/database.js";
import authRouter from "./routes/authRoutes.js";
import contactRouter from "./routes/contactRoutes.js";

dotenv.config();
const app = express();
connectDB();

const allowedOrigins = ["http://localhost:5173"];
// Middleware
app.use(cors({ credentials: true, origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("API is Running");
});
app.use("/api/auth", authRouter);
app.use("/api", contactRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
