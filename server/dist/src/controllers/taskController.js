"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.getUserTasks = exports.updateTaskStatus = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.query;
    try {
        const tasks = yield prisma.task.findMany({
            where: {
                projectId: Number(projectId),
            },
            include: {
                author: true,
                assignee: true,
                comments: true,
                attachments: true,
                devis: true,
            },
        });
        res.json(tasks);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving tasks: ${error.message}` });
    }
});
exports.getTasks = getTasks;
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, status, priority, tags, startDate, dueDate, workingDays, projectId, authorUserId, assignedUserId, devisId, } = req.body;
    try {
        const data = {
            title,
            projectId,
        };
        if (description)
            data.description = description;
        if (status)
            data.status = status;
        if (priority)
            data.priority = priority;
        if (tags)
            data.tags = tags;
        if (workingDays !== undefined && workingDays !== null)
            data.workingDays = workingDays;
        if (startDate)
            data.startDate = new Date(startDate);
        if (dueDate)
            data.dueDate = new Date(dueDate);
        if (authorUserId)
            data.authorUserId = authorUserId;
        if (assignedUserId)
            data.assignedUserId = assignedUserId;
        if (devisId)
            data.devisId = devisId;
        const newTask = yield prisma.task.create({ data });
        res.status(201).json(newTask);
    }
    catch (error) {
        console.error("Task creation error:", error);
        res
            .status(500)
            .json({ message: `Error creating a task: ${error.message}` });
    }
});
exports.createTask = createTask;
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const { title, description, status, priority, tags, workingDays, startDate, dueDate, assignedUserId, devisId, } = req.body;
    try {
        // Prepare the update data
        const data = {};
        if (title)
            data.title = title;
        if (description)
            data.description = description;
        if (status)
            data.status = status;
        if (priority)
            data.priority = priority;
        if (tags)
            data.tags = tags;
        if (workingDays !== undefined && workingDays !== null)
            data.workingDays = workingDays;
        if (startDate)
            data.startDate = new Date(startDate);
        if (dueDate)
            data.dueDate = new Date(dueDate);
        if (assignedUserId)
            data.assignedUserId = assignedUserId;
        if (devisId)
            data.devisId = devisId;
        // Update the task in the database
        const updatedTask = yield prisma.task.update({
            where: {
                id: Number(taskId),
            },
            data,
        });
        // Send the updated task back in the response
        res.json(updatedTask);
    }
    catch (error) {
        console.error("Task update error:", error);
        res.status(500).json({ message: `Error updating task: ${error.message}` });
    }
});
exports.updateTask = updateTask;
const updateTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const { status } = req.body;
    try {
        const updatedTask = yield prisma.task.update({
            where: {
                id: Number(taskId),
            },
            data: {
                status: status,
            },
        });
        res.json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ message: `Error updating task: ${error.message}` });
    }
});
exports.updateTaskStatus = updateTaskStatus;
const getUserTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const tasks = yield prisma.task.findMany({
            where: {
                OR: [
                    { authorUserId: Number(userId) },
                    { assignedUserId: Number(userId) },
                ],
            },
            include: {
                author: true,
                assignee: true,
            },
        });
        res.json(tasks);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving user's tasks: ${error.message}` });
    }
});
exports.getUserTasks = getUserTasks;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    try {
        // Delete the task from the database
        const deletedTask = yield prisma.task.delete({
            where: {
                id: Number(taskId),
            },
        });
        // Send the deleted task data (or just a success message)
        res.json({ message: `Task with ID ${taskId} deleted successfully`, task: deletedTask });
    }
    catch (error) {
        console.error("Task deletion error:", error);
        res.status(500).json({ message: `Error deleting task: ${error.message}` });
    }
});
exports.deleteTask = deleteTask;
