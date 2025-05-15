"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
/* ROUTE IMPORTS */
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const devisRoutes_1 = __importDefault(require("./routes/devisRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const availabilityRoutes_1 = __importDefault(require("./routes/availabilityRoutes"));
const productionRateRoutes_1 = __importDefault(require("./routes/productionRateRoutes"));
const managerRoutes_1 = __importDefault(require("./routes/managerRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const manageUsersRoutes_1 = __importDefault(require("./routes/manageUsersRoutes"));
/* CONFIGURATIONS */
dotenv_1.default.config();
//here add logic to verify if super admin exist . if so continue else create one (credentials ; .env)
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
/* ROUTES */
app.get("/", (req, res) => {
    res.send("This is home route");
});
app.use("/projects", projectRoutes_1.default);
app.use("/tasks", taskRoutes_1.default);
app.use("/devis", devisRoutes_1.default);
app.use("/search", searchRoutes_1.default);
app.use("/teams", teamRoutes_1.default);
app.use('/availabilities', availabilityRoutes_1.default);
app.use("/production-rates", productionRateRoutes_1.default);
app.use("/users", userRoutes_1.default);
app.use("/managers", (0, authMiddleware_1.authMiddleware)(["manager"]), managerRoutes_1.default);
app.use("/manageUsers", manageUsersRoutes_1.default);
/* SERVER */
const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on part ${port}`);
});
