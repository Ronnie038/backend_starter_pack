module.exports = ({ pascal, camel }) => `
import { z } from "zod";

const create${camel}Schema = z.object({
	
});
const update${camel}Schema = z.object({
	
});

export const ${pascal}Validations = {
	create${camel}Schema,
    update${camel}Schema,
};

`;
