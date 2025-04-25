module.exports = ({ pascal, camel }) => `import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ${pascal}Services } from "./${camel}.service";

const create${pascal} = catchAsync(async (req, res) => {
	const result = await ${pascal}Services.create${pascal}(req);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "${pascal} created successfully",
		data: result,
	
	});
});
const get${pascal}s = catchAsync(async (req, res) => {
	const result = await ${pascal}Services.get${pascal}s(req);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "${pascal}s retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

const get${pascal}ById = catchAsync(async (req, res) => {
	const result = await ${pascal}Services.get${pascal}ById(req.params.id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "${pascal} retrieved successfully",
		data: result,
	});
});

const update${pascal} = catchAsync(async (req, res) => {
	const result = await ${pascal}Services.update${pascal}(req);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "${pascal} updated successfully",
		data: result,
	});
});

const delete${pascal} = catchAsync(async (req, res) => {
	await ${pascal}Services.delete${pascal}(req);
	sendResponse(res, {
		statusCode: httpStatus.NO_CONTENT,
		success: true,
		message: "${pascal} deleted successfully",
		data: null,
	});
});

export const ${pascal}Controllers = {
	get${pascal}s,
	get${pascal}ById,
	update${pascal},
	delete${pascal},
	create${pascal},
};`;
