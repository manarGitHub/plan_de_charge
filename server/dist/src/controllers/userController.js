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
exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany();
        res.json(users);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving users: ${error.message}` });
    }
});
exports.getUsers = getUsers;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const user = yield prisma.user.findUnique({
            where: { cognitoId },
        });
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: "user not found" });
        }
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving user: ${error.message}` });
    }
});
exports.getUser = getUser;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId, username, email, phoneNumber, profilePictureUrl, teamId, } = req.body;
        const user = yield prisma.user.create({
            data: {
                cognitoId,
                username,
                email,
                phoneNumber,
                profilePictureUrl: profilePictureUrl || 'i1.jpg',
                teamId: teamId ? Number(teamId) : null,
            },
        });
        res.status(201).json(user);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error creating user: ${error.message}` });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const { username, email, phoneNumber, profile, profilePictureUrl, teamId } = req.body;
        const updateUser = yield prisma.user.update({
            where: { cognitoId },
            data: {
                username,
                email,
                phoneNumber,
                profile,
                profilePictureUrl,
                teamId
            },
        });
        res.json(updateUser);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error updating user: ${error.message}` });
    }
});
exports.updateUser = updateUser;
