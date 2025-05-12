import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
/* ROUTE IMPORTS */
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import devisRoutes from "./routes/devisRoutes";
import searchRoutes from "./routes/searchRoutes";
import userRoutes from "./routes/userRoutes";
import teamRoutes from "./routes/teamRoutes";
import availabilityRoutes from "./routes/availabilityRoutes";
import productionRateRoutes from "./routes/productionRateRoutes";
import managerRoutes from "./routes/managerRoutes";
import { authMiddleware } from "./middleware/authMiddleware";

/* CONFIGURATIONS */
dotenv.config();
//here add logic to verify if super admin exist . if so continue else create one (credentials ; .env)
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/devis", devisRoutes);
app.use("/search", searchRoutes);
app.use("/teams", teamRoutes);
app.use('/availabilities', availabilityRoutes);
app.use("/production-rates", productionRateRoutes);
app.use("/users",userRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);


/* SERVER */
const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on part ${port}`);
});