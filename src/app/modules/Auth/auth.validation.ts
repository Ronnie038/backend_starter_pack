import { UserRole } from "@prisma/client";
import { z } from "zod";

const userRegisterSchema = z
	.object({
		name: z.string(),
		email: z.string().email(),
		phone: z.string(),
		password: z.string(),
		role: z.enum(["INVESTOR", "COMPANY"]),
	})
	.strict();
const changePasswordValidationSchema = z.object({
	oldPassword: z.string().min(8),
	newPassword: z.string().min(8),
});

const refreshTokenValidationSchema = z.object({
	cookies: z.object({
		refreshToken: z.string({
			required_error: "Refresh token is required!",
		}),
	}),
});

export const AuthValidation = {
	changePasswordValidationSchema,
	userRegisterSchema,
	refreshTokenValidationSchema,
};
