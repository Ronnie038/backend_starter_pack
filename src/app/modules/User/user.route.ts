import { Router } from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { upload } from "../../../helpars/fileUploader";
import { parseBodyData } from "../../middlewares/parseBodyData";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidations } from "./user.validation";

const router = Router();

router.route("/").get(UserController.getUsers);

router
	.route("/:id")
	.get(UserController.getUserById)
	.put(UserController.updateUser)
	.delete(UserController.deleteUser);

export const UserRoutes = router;