module.exports = ({ pascal, camel }) => `import { Router } from "express";
import { ${pascal}Controllers } from "./${camel}.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { upload } from "../../../helpars/fileUploader";
import { parseBodyData } from "../../middlewares/parseBodyData";
import validateRequest from "../../middlewares/validateRequest";
import { ${pascal}Validations } from "./${camel}.validation";

const router = Router();

router.route("/")
 	.post(
		auth("-----"),
		upload.single("image"),
		parseBodyData,
		validateRequest(${pascal}Validations.create${pascal}Schema),
		${pascal}Controllers.create${pascal}
	)
  .get(${pascal}Controllers.get${pascal}s);

router
	.route("/:id")
	.get(${pascal}Controllers.get${pascal}ById)
	.put(
		auth("-----"),
		upload.single("image"),
		parseBodyData,
		validateRequest(${pascal}Validations.update${pascal}Schema),
	    ${pascal}Controllers.update${pascal})
	.delete(${pascal}Controllers.delete${pascal});

export const ${pascal}Routes = router;`;
