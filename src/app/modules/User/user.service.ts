import { Request } from "express";
import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import {
	userFilterFields,
	userInclude,
	userNestedFilters,
	userRangeFilter,
	userSearchFields,
} from "./user.constant";
import config from "../../../config";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { Prisma } from "@prisma/client";

const getUsers = async (req: Request) => {
	const queryBuilder = new QueryBuilder(req.query, prisma.user);
	const results = await queryBuilder
		.filter(userFilterFields)
		.search(userSearchFields)
		.nestedFilter(userNestedFilters)
		.sort()
		.paginate()
		.include(userInclude)
		.fields()
		.filterByRange(userRangeFilter)
		.execute();

	const meta = await queryBuilder.countTotal();
	return { data: results, meta };
};

const getUserById = async (id: string) => {
	return prisma.user.findUnique({ where: { id } });
};

const updateUser = async (req: Request) => {
	const { id } = req.params;
	const data= req.body;
	const user = req.user;
	const role = user?.role;

	if (req.file?.filename) {
		data.documentUrl = `${config.backend_url}/uploads/${req.file.filename}`;
	}

	const whereClause: Prisma.UserWhereUniqueInput = {
		id,
		...(role === "-----" ? { userId: user.id } : {}),
	};

	const existing = await prisma.user.findUnique({ where: whereClause });
	if (!existing) {
		throw new ApiError(httpStatus.NOT_FOUND, `User not found with this id: ${id}`);
	}

	return prisma.user.update({
		where: whereClause,
		data: {
			...data,
		},
	});
};

const deleteUser = async (req: Request) => {
	await prisma.user.delete({ where: { id: req.params.id } });
};

export const UserServices = {
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
};