import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CompanyServices } from "./company.service";

const getCompanys = catchAsync(async (req, res) => {
	const result = await CompanyServices.getCompanys(req);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Companys retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getCompanyById = catchAsync(async (req, res) => {
	const result = await CompanyServices.getCompanyById(req.params.id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Company retrieved successfully",
		data: result,
	});
});

const updateCompany = catchAsync(async (req, res) => {
	const result = await CompanyServices.updateCompany(req);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Company updated successfully",
		data: result,
	});
});

const deleteCompany = catchAsync(async (req, res) => {
	await CompanyServices.deleteCompany(req);
	sendResponse(res, {
		statusCode: httpStatus.NO_CONTENT,
		success: true,
		message: "Company deleted successfully",
		data: null,
	});
});

export const CompanyController = {
	getCompanys,
	getCompanyById,
	updateCompany,
	deleteCompany,
};