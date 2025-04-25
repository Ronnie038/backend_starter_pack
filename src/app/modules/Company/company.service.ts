import { Request } from "express";
import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import {
	companyFilterFields,
	companyInclude,
	companyNestedFilters,
	companyRangeFilter,
	companySearchFields,
} from "./company.constant";
import config from "../../../config";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { Prisma } from "@prisma/client";

const getCompanys = async (req: Request) => {
	const queryBuilder = new QueryBuilder(req.query, prisma.company);
	const results = await queryBuilder
		.filter(companyFilterFields)
		.search(companySearchFields)
		.nestedFilter(companyNestedFilters)
		.sort()
		.paginate()
		.include(companyInclude)
		.fields()
		.filterByRange(companyRangeFilter)
		.execute();

	const meta = await queryBuilder.countTotal();
	return { data: results, meta };
};

const getCompanyById = async (id: string) => {
	return prisma.company.findUnique({ where: { id } });
};

const updateCompany = async (req: Request) => {
	const { id } = req.params;
	const data= req.body;
	const user = req.user;
	const role = user?.role;

	if (req.file?.filename) {
		data.documentUrl = `${config.backend_url}/uploads/${req.file.filename}`;
	}

	const whereClause: Prisma.CompanyWhereUniqueInput = {
		id,
		...(role === "-----" ? { userId: user.id } : {}),
	};

	const existing = await prisma.company.findUnique({ where: whereClause });
	if (!existing) {
		throw new ApiError(httpStatus.NOT_FOUND, `Company not found with this id: ${id}`);
	}

	return prisma.company.update({
		where: whereClause,
		data: {
			...data,
		},
	});
};

const deleteCompany = async (req: Request) => {
	await prisma.company.delete({ where: { id: req.params.id } });
};

export const CompanyServices = {
	getCompanys,
	getCompanyById,
	updateCompany,
	deleteCompany,
};