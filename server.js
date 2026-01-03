import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./mongodb/database.js";
import authRouter from "./routes/authRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import userRouter from "./routes/userRoutes.js";
dotenv.config();
const app = express();
connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://bazaarwale.netlify.app",
];
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
app.use('/api/user/auth', userRouter)

app.get('/abcd',(req,res)=>{
   console.log(req)

   console.log(res)

   res.send('Hello World')
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
