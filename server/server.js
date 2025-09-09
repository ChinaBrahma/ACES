import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";


dotenv.config();
const app = express();


app.use(express.json());
app.use(cookieParser()); 


// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL_DEVELOPMENT, 
//     origin: process.env.FRONTEND_URL_PRODUCTION, 
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);


import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import saveResumeRoutes from "./routes/saveResumeRoutes.js";

app.use("/api/", authRoutes);         // Authentication
app.use("/api/upload", uploadRoutes); // Upload resume to check ATS score
app.use("/api/resume", saveResumeRoutes); // CRUD Resume to DB

const PORT = process.env.PORT || 5001;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`🚀 Server listening on port 0.0.0.0:${PORT}`);
  connectDB();
});
