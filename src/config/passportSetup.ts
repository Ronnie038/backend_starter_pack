import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import prisma from "../shared/prisma";
import { User, UserRole } from "@prisma/client";
import { hashPassword } from "../helpars/passwordHelpers";

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			callbackURL: "/api/v1/auth/google/callback",
			scope: ["profile", "email"],
		},
		async (
			accessToken: string,
			refreshToken: string,
			profile: Profile,
			done
		) => {
			try {
				const email = profile.emails?.[0]?.value;
				if (!email) {
					return done(new Error("No email found"), false);
				}

				let user = await prisma.user.findUnique({
					where: { email },
				});

				if (!user) {
					const newUser = await prisma.user.create({
						data: {
							fullName: profile.displayName,
							email,
							password: await hashPassword("password"),
							role: UserRole.USER,
							avatar: profile.photos?.[0]?.value || "",
							googleId: profile.id,
						},
					});

					user = newUser;
				}

				return done(null, user);
			} catch (error) {
				console.error("Error in Google strategy:", error);
				return done(error, false);
			}
		}
	)
);

// Define the type for user serialization
passport.serializeUser((user: any, done) => {
	done(null, user.id); // Store only user ID in session
});

passport.deserializeUser(async (id: string, done) => {
	try {
		const user = await prisma.user.findUnique({ where: { id } });

		if (user) done(null, { id: user.id, role: user.role, email: user.email });
		else done(null, null);
	} catch (error) {
		done(error, null);
	}
});

export { passport };
