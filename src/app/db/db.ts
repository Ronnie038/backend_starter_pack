import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import prisma from "../../shared/prisma";

export const initiateSuperAdmin = async () => {
	const payload = {
		name: "Admin",
		phone: "12345678",
		email: "admin@admin.com",
		password: "12345678",
		role: UserRole.ADMIN,
	};

	const existingSuperAdmin = await prisma.user.findUnique({
		where: { email: payload.email },
	});

	if (existingSuperAdmin) {
		return;
	}

	await prisma.$transaction(async (TX: Prisma.TransactionClient) => {
		const hashedPassword: string = await bcrypt.hash(payload.password, 12);

		await TX.user.create({
			data: {
				...payload,
				password: hashedPassword,
			},
		});
	});
};
