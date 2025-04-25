import { Router } from "express";
import { CompanyController } from "./company.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { upload } from "../../../helpars/fileUploader";
import { parseBodyData } from "../../middlewares/parseBodyData";
import validateRequest from "../../middlewares/validateRequest";
import { CompanyValidations } from "./company.validation";

const router = Router();

router.route("/").get(CompanyController.getCompanys);

router
	.route("/:id")
	.get(CompanyController.getCompanyById)
	.put(CompanyController.updateCompany)
	.delete(CompanyController.deleteCompany);

export const CompanyRoutes = router;