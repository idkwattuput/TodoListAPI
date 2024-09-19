import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./middleware/log";
import authRouter from "./routes/auth-route";
import todoRouter from "./routes/todo-route";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(cookieParser());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/todos", todoRouter);
//
// Handling non-existent routes
app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server has started at port ${PORT}`);
});
