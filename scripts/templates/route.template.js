module.exports = ({ pascal, camel }) => `import { Router } from "express";
import { ${pascal}Controller } from "./${camel}.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { upload } from "../../../helpars/fileUploader";
import { parseBodyData } from "../../middlewares/parseBodyData";
import validateRequest from "../../middlewares/validateRequest";
import { ${pascal}Validations } from "./${camel}.validation";

const router = Router();

router.route("/").get(${pascal}Controller.get${pascal}s);

router
	.route("/:id")
	.get(${pascal}Controller.get${pascal}ById)
	.put(${pascal}Controller.update${pascal})
	.delete(${pascal}Controller.delete${pascal});

export const ${pascal}Routes = router;`;
