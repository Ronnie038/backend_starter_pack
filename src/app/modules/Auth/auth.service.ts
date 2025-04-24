import { hashPassword } from "./../../../helpars/passwordHelpers";
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

import httpStatus from "http-status";

import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import emailSender from "../../../helpars/emailSender/emailSender";
import { comparePassword } from "../../../helpars/passwordHelpers";
import { Request } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { generateEmailVerifyTemplate } from "./auth.template";

const register = async (req: Request) => {
	const payload = req?.body;

	const isUserExists = await prisma.user.findUnique({
		where: { email: payload.email },
	});

	if (isUserExists) {
		throw new ApiError(
			httpStatus.CONFLICT,
			"user already exist with this email"
		);
	}

	const hashedPassword: string = await bcrypt.hash(payload.password, 12);
	const result = prisma.$transaction(async (TX) => {
		const user = await TX.user.create({
			data: { ...payload, password: hashedPassword },
		});

		if (user.role == "INVESTOR") {
			await TX.investor.create({ data: { userId: user.id } });
		} else if (user.role === "COMPANY") {
			await TX.investor.create({ data: { userId: user.id } });
		}
		const payloadData = {
			id: user.id,
			email: user.email,
			role: user.role,
		};

		const token = jwt.sign(payloadData, config.jwt.jwt_secret as Secret, {
			algorithm: "HS256",
			expiresIn: "30m",
		});

		const verifyLink = `${config.backend_url}/api/v1/auth/verify-email?token=${token}`;

		const html = generateEmailVerifyTemplate(verifyLink);

		await emailSender(
			"Email verification link for Investor.io",
			user.email,
			html
		);

		const { password, ...result } = user;

		return result;
	});

	return result;
};
// user login
const loginUserWithEmail = async (payload: {
	email: string;
	password: string;
}) => {
	const userData = await prisma.user.findUniqueOrThrow({
		where: {
			email: payload.email,
		},
	});
	if (!userData) {
		throw new ApiError(400, "User not found");
	}

	if (!payload.password || !userData?.password) {
		throw new Error("Password is required");
	}

	const isCorrectPassword = await comparePassword(
		payload.password,
		userData.password
	);

	if (!isCorrectPassword) {
		throw new ApiError(400, "Password incorrect!");
	}

	if (userData.status === "SUPENDED")
		throw new ApiError(httpStatus.FORBIDDEN, "Your account has been suspended");

	if (!userData?.isEmailVerified) {  
		try {
			console.log("email verification called");
			const payloadData = {
				id: userData.id,
				email: userData.email,
				role: userData.role,
			};

			const token = jwt.sign(payloadData, config.jwt.jwt_secret as Secret, {
				algorithm: "HS256",
				expiresIn: "30m",
			});
			const verifyLink = `${config.backend_url}/api/v1/auth/verify-email?token=${token}`;

			const html = generateEmailVerifyTemplate(verifyLink);

			await emailSender(
				"Email verification link from Investor.io",
				userData.email,
				html
			);
		} catch (error) {
			console.log(error);
		}
	}

	const accessToken = jwtHelpers.generateToken(
		{
			id: userData.id,
			email: userData.email,
			role: userData.role,
		},
		config.jwt.jwt_secret as Secret,
		// config.jwt.expires_in as string
		config.jwt.expires_in as string
	);

	const refreshToken = jwtHelpers.generateToken(
		{
			id: userData.id,
			email: userData.email,
			role: userData.role,
		},
		config.jwt.refresh_token_secret as Secret,
		// config.jwt.refresh_token_expires_in as string
		config.jwt.refresh_token_expires_in as string
	);

	const message = userData.isEmailVerified
		? "Logged in successfull"
		: "Please check email to verify";

	return {
		refreshToken,
		accessToken,
		message,
		isEmailVerified: userData.isEmailVerified,
	};
};
const enterOtp = async (payload: {
	otp: string;
	email: string;
	keepMeLogin?: boolean;
}) => {
	const userData = await prisma.user.findFirst({
		where: {
			email: payload.email,
			otp: payload.otp,
		},
	});

	if (!userData) {
		throw new ApiError(404, "Your otp is incorrect");
	}

	if (userData.otpExpiry && userData.otpExpiry < new Date()) {
		throw new ApiError(400, "Your otp has been expired");
	}

	let accessToken;
	let refreshToken;

	accessToken = jwtHelpers.generateToken(
		{
			id: userData.id,
			email: userData.email,
			role: userData.role,
		},
		config.jwt.jwt_secret as Secret,
		config.jwt.expires_in as string
	);

	refreshToken = jwtHelpers.generateToken(
		{
			id: userData.id,
			email: userData.email,
			role: userData.role,
		},
		config.jwt.refresh_token_secret as Secret,
		config.jwt.refresh_token_expires_in as string
	);

	await prisma.user.update({
		where: {
			id: userData.id,
		},
		data: {
			otp: null,
			otpExpiry: null,
		},
	});

	const result = {
		accessToken,
		refreshToken,
	};

	return result;
};

// const loginWithGoogle = async (payload: {
// 	name:string
// 	email: string;
// 	profileImage: string;
// }) => {
// 	const userData = await prisma.user.findUnique({
// 		where: {
// 			email: payload.email,
// 		},
// 	});

// 	if (!userData) {
// 		const newUser = await prisma.user.create({
// 			data: {
// 				name:payload.name,
// 				email: payload.email,

// 			},
// 		});

// 		const accessToken = jwtHelpers.generateToken(
// 			{
// 				id: newUser.id,
// 				email: newUser.email,
// 				role: UserRole.NORMAL_USER,
// 			},
// 			config.jwt.jwt_secret as Secret,
// 			config.jwt.expires_in as string
// 		);

// 		const refreshToken = jwtHelpers.generateToken(
// 			{
// 				id: newUser.id,
// 				email: newUser.email,
// 				role: UserRole.NORMAL_USER,
// 			},
// 			config.jwt.refresh_token_secret as Secret,
// 			config.jwt.expires_in as string
// 		);

// 		return { message: "User created successfully", accessToken, refreshToken };
// 	}

// 	if (userData.provider !== Provider.GOOGLE) {
// 		throw new ApiError(400, "Please login with your email and password");
// 	}

// 	if (userData.status === UserStatus.INACTIVE) {
// 		throw new ApiError(403, "Your account is Suspended");
// 	}

// 	const accessToken = jwtHelpers.generateToken(
// 		{
// 			id: userData.id,
// 			email: userData.email,
// 			role: userData.role,
// 		},
// 		config.jwt.jwt_secret as Secret,
// 		config.jwt.expires_in as string
// 	);

// 	const refreshToken = jwtHelpers.generateToken(
// 		{
// 			id: userData.id,
// 			email: userData.email,
// 			role: userData.role,
// 		},
// 		config.jwt.refresh_token_secret as Secret,
// 		config.jwt.expires_in as string
// 	);

// 	await prisma.user.update({
// 		where: {
// 			id: userData.id,
// 		},
// 		data: {
// 			refreshToken,
// 		},
// 	});

// 	return {
// 		accessToken,
// 		refreshToken,
// 	};
// };

// get user profile
const getMyProfile = async (userToken: string) => {
	const decodedToken = jwtHelpers.verifyToken(
		userToken,
		config.jwt.jwt_secret!
	);

	const result = await prisma.$transaction(async (TransactionClient) => {
		const userProfile = await TransactionClient.user.findUnique({
			where: {
				id: decodedToken?.id,
			},
			select: {
				id: true,
				email: true,
				role: true,

				createdAt: true,
				updatedAt: true,
			},
		});

		if (!userProfile) {
			throw new ApiError(404, "User not found");
		}

		return userProfile;
	});

	return result;
};

// change password

const changePassword = async (
	userToken: string,
	newPassword: string,
	oldPassword: string
) => {
	const decodedToken = jwtHelpers.verifyToken(
		userToken,
		config.jwt.jwt_secret!
	);

	const user = await prisma.user.findUnique({
		where: { id: decodedToken?.id },
	});

	if (!user || !user?.password) {
		throw new ApiError(404, "User not found");
	}

	const isPasswordValid = await bcrypt.compare(oldPassword, user?.password);

	if (!isPasswordValid) {
		throw new ApiError(401, "Incorrect old password");
	}

	const hashedPassword = await bcrypt.hash(newPassword, 12);

	await prisma.user.update({
		where: {
			id: decodedToken.id,
		},
		data: {
			password: hashedPassword,
		},
	});
	return { message: "Password changed successfully" };
};

const forgotPassword = async (payload: { email: string }) => {
	const userData = await prisma.user.findUnique({
		where: {
			email: payload.email,
		},
	});
	if (!userData) {
		throw new ApiError(404, "User not found");
	}

	const resetPassToken = jwtHelpers.generateToken(
		{ email: userData.email, role: userData.role },
		config.jwt.reset_pass_secret as Secret,
		config.jwt.reset_pass_token_expires_in as string
	);

	const resetPassLink =
		config.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;

	await emailSender(
		"Reset Your Password",
		userData.email,
		`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; line-height: 1.6; color: #333333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #FF7600; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear User,</p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">We received a request to reset your password. Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <a href=${resetPassLink} style="display: inline-block; background-color: #FF7600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 600; transition: background-color 0.3s ease;">
                    Reset Password
                </a>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
            
            <p style="font-size: 16px; margin-bottom: 0;">Best regards,<br>Your Support Team</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d;">
            <p style="margin: 0 0 10px;">This is an automated message, please do not reply to this email.</p>
            <p style="margin: 0;">© 2023 Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
	);
	return {
		message: "Reset password link sent via your email successfully",
		resetPassLink,
	};
};

// reset password
const resetPassword = async (
	token: string,
	payload: { email: string; password: string }
) => {
	const userData = await prisma.user.findUnique({
		where: {
			email: payload.email,
		},
	});

	if (!userData) {
		throw new ApiError(404, "User not found");
	}

	const isValidToken = jwtHelpers.verifyToken(
		token,
		config.jwt.reset_pass_secret as Secret
	);

	if (!isValidToken) {
		throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
	}

	// hash password
	const password = await bcrypt.hash(payload.password, 12);

	// update into database
	await prisma.user.update({
		where: {
			email: payload.email,
		},
		data: {
			password,
		},
	});
	return { message: "Password reset successfully" };
};

const refreshToken = async (token: string) => {
	// checking if the given token is valid
	const decoded = jwt.verify(
		token,
		config.jwt.refresh_token_secret as string
	) as JwtPayload;

	const { id } = decoded;

	// checking if the user is exist
	const user = await prisma.user.findUnique({ where: { id: id } });

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, "This user is not found !");
	}

	const jwtPayload = {
		id: user.id,
		role: user.role,
		email: user.email,
	};

	const accessToken = jwt.sign(jwtPayload, config.jwt.jwt_secret as Secret, {
		algorithm: "HS256",
		expiresIn: config.jwt.expires_in,
	});

	return {
		accessToken,
	};
};

export const AuthServices = {
	loginUserWithEmail,
	enterOtp,
	register,
	getMyProfile,
	changePassword,
	forgotPassword,
	resetPassword,
	refreshToken,
};
