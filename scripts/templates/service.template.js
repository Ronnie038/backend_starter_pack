module.exports = ({ pascal, camel, lower }) => `import { Request } from "express";
import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import {
	${camel}FilterFields,
	${camel}Include,
	${camel}NestedFilters,
	${camel}RangeFilter,
	${camel}SearchFields,
} from "./${camel}.constant";
import config from "../../../config";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { Prisma } from "@prisma/client";


const create${pascal} = async (req: Request) => {
	const payload = req.body;
	if (req.file?.filename) {
		payload.image = \`\${config.backend_url}/uploads/\${req.file.filename}\`\;
	}

	const ${camel} = await prisma.${camel}.create({ data: payload });

	return ${camel};
};

const get${pascal}s = async (req: Request) => {
	const queryBuilder = new QueryBuilder(req.query, prisma.${camel});
	const results = await queryBuilder
		.filter(${lower}FilterFields)
		.search(${lower}SearchFields)
		.nestedFilter(${lower}NestedFilters)
		.sort()
		.paginate()
		.include(${lower}Include)
		.fields()
		.filterByRange(${lower}RangeFilter)
		.execute();

	const meta = await queryBuilder.countTotal();
	return { data: results, meta };
};

const get${pascal}ById = async (id: string) => {
	return prisma.${camel}.findUnique({ where: { id } });
};

const update${pascal} = async (req: Request) => {
	const { id } = req.params;
	const data= req.body;
	const user = req.user;
	const role = user?.role;

	if (req.file?.filename) {
		data.documentUrl = \`\${config.backend_url}/uploads/\${req.file.filename}\`;
	}

	const whereClause: Prisma.${pascal}WhereUniqueInput = {
		id,
		...(role === "-----" ? { userId: user.id } : {}),
	};

	const existing = await prisma.${camel}.findUnique({ where: whereClause });
	if (!existing) {
		throw new ApiError(httpStatus.NOT_FOUND, \`${pascal} not found with this id: \${id}\`);
	}

	return prisma.${camel}.update({
		where: whereClause,
		data: {
			...data,
		},
	});
};

const delete${pascal} = async (req: Request) => {
	await prisma.${camel}.delete({ where: { id: req.params.id } });
};

export const ${pascal}Services = {
	get${pascal}s,
	get${pascal}ById,
	update${pascal},
	delete${pascal},
	create${pascal}
};`;
