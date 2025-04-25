import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import config from "../../../config";
import { passport } from "../../../config/passportSetup";
import { UserRole } from "@prisma/client";

const router = express.Router();

// user register
router.post(
	"/register",
	validateRequest(AuthValidation.userRegisterSchema),
	AuthController.register
);
// user login route
router.post("/login", AuthController.loginUserWithEmail);

router.post("/otp-enter", AuthController.enterOtp);

// user logout route
router.post("/logout", AuthController.logoutUser);

router.get(
	"/get-me",
	auth(UserRole.ADMIN, UserRole.ADMIN, UserRole.INVESTOR, UserRole.COMPANY),
	AuthController.getMyProfile
);

router.put(
	"/change-password",
	auth(UserRole.ADMIN, UserRole.ADMIN, UserRole.INVESTOR, UserRole.COMPANY),
	validateRequest(AuthValidation.changePasswordValidationSchema),
	AuthController.changePassword
);

router.post("/forgot-password", AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

router.get("/verify-email", AuthController.verifyEmail);
router.post(
	"/refresh-token",
	validateRequest(AuthValidation.refreshTokenValidationSchema),
	AuthController.refreshToken
);

// Google Login Routes
router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${config.frontend_url}/login`,
		successRedirect: `${config.frontend_url}/`,
	})
);
export const AuthRoutes = router;
