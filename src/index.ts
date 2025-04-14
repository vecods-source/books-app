import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import { connectDB } from './config/db';
import { ErrorCheck } from "./middlewares/errorHandler";
import  Prisma  from "../src/prisma";


dotenv.config();

// async function initalFunc(){
//   const all = await Prisma.user.deleteMany();
//   console.log(all);
// }
// initalFunc();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/api/auth",authRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");}
);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  ErrorCheck(err, req, res, next);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});