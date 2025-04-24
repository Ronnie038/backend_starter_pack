import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";
import {
	emailVerifiedFailedTemplate,
	emailVerifiedSuccessTemplate,
} from "./auth.template";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import config from "../../../config";
import prisma from "../../../shared/prisma";

const register = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthServices.register(req);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Please check your email to verify",
		data: result,
	});
});

const loginUserWithEmail = catchAsync(async (req: Request, res: Response) => {
	const { refreshToken, accessToken, isEmailVerified, message } =
		await AuthServices.loginUserWithEmail(req.body);

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: config.env !== "development",
		sameSite: "lax",
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: message,
		data: { accessToken: accessToken, isEmailVerified },
	});
});

const refreshToken = catchAsync(async (req, res) => {
	const { refreshToken } = req.cookies;
	const result = await AuthServices.refreshToken(refreshToken);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Access token is retrieved succesfully!",
		data: result,
	});
});

const verifyEmail = catchAsync(async (req, res) => {
	const { token } = req.query;

	const templateError = emailVerifiedFailedTemplate();
	// If no token provided
	if (!token) {
		return res.status(400).send(templateError);
	}

	let decodedToken;
	try {
		decodedToken = jwtHelpers.verifyToken(
			token as string,
			config.jwt.jwt_secret as string
		);
	} catch (error) {
		return res.status(400).send(templateError);
	}

	// If token is invalid or decoding failed
	if (!decodedToken || !decodedToken.email) {
		return res.status(400).send(templateError);
	}

	// Update user verification status
	await prisma.user.update({
		where: { email: decodedToken.email },
		data: { isEmailVerified: true },
	});

	// Success Email Template

	// Send success template
	return res.status(200).send(emailVerifiedSuccessTemplate());
});

const enterOtp = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthServices.enterOtp(req.body);

	// res.cookie("token", result.accessToken, { httpOnly: true });
	// res.cookie("token", result.accessToken, {
	//   secure: config.env === "production",
	//   httpOnly: true,
	//   sameSite: "none",
	//   maxAge: 1000 * 60 * 60 * 24 * 365,
	// });

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged in successfully",
		data: result,
	});
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
	// Clear the token cookie
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User Successfully logged out",
		data: null,
	});
});

// get user profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
	const userToken = req.headers.authorization;

	const result = await AuthServices.getMyProfile(userToken as string);
	sendResponse(res, {
		success: true,
		statusCode: 201,
		message: "User profile retrieved successfully",
		data: result,
	});
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
	const userToken = req.headers.authorization;
	const { oldPassword, newPassword } = req.body;

	const result = await AuthServices.changePassword(
		userToken as string,
		newPassword,
		oldPassword
	);
	sendResponse(res, {
		success: true,
		statusCode: 201,
		message: "Password changed successfully",
		data: result,
	});
});

// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
	const data = await AuthServices.forgotPassword(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Check your email!",
		data: data,
	});
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
	const token = req.headers.authorization || "";

	await AuthServices.resetPassword(token, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Password Reset!",
		data: null,
	});
});

export const AuthController = {
	loginUserWithEmail,
	enterOtp,
	logoutUser,
	getMyProfile,
	changePassword,
	forgotPassword,
	resetPassword,
	register,
	verifyEmail,
	refreshToken,
};
