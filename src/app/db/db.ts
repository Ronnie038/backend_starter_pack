import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
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

	await prisma.$transaction(async (TransactionClient) => {
		const hashedPassword: string = await bcrypt.hash(payload.password, 12);

		await TransactionClient.user.create({
			data: {
				...payload,
				password: hashedPassword,
			},
		});
	});
};
