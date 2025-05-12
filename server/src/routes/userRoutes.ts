import { Router } from "express";

import { getUser, getUsers, createUser, updateUser } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.get("/:cognitoId", getUser);
router.put("/:cognitoId", updateUser);


export default router;