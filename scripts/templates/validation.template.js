module.exports = ({ pascal, camel }) => `
import { z } from "zod";

const create${pascal}Schema = z.object({
	
});
const update${pascal}Schema = z.object({
	
});

export const ${pascal}Validations = {
	create${pascal}Schema,
    update${pascal}Schema,
};

`;
