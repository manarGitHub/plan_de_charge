import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  getUserTasks,
  updateTask,
  updateTaskStatus,
} from "../controllers/taskController";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.patch("/:taskId", updateTask);
router.get("/user/:userId", getUserTasks);
router.delete("/:taskId", deleteTask);


export default router;