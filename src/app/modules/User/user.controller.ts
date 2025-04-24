import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserServices } from "./user.service";

const getUsers = catchAsync(async (req, res) => {
	const result = await UserServices.getUsers(req);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Users retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getUserById = catchAsync(async (req, res) => {
	const result = await UserServices.getUserById(req.params.id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User retrieved successfully",
		data: result,
	});
});

const updateUser = catchAsync(async (req, res) => {
	const result = await UserServices.updateUser(req);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User updated successfully",
		data: result,
	});
});

const deleteUser = catchAsync(async (req, res) => {
	await UserServices.deleteUser(req);
	sendResponse(res, {
		statusCode: httpStatus.NO_CONTENT,
		success: true,
		message: "User deleted successfully",
		data: null,
	});
});

export const UserController = {
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
};