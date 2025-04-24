import jwt, { JwtPayload, Secret } from "jsonwebtoken";

const generateToken = (
	payload: Record<string, unknown>,
	secret: Secret,
	expiresIn: string
): string => {
	let token: string;

	token = jwt.sign(payload, secret, {
		algorithm: "HS256",
		expiresIn: expiresIn,
	});

	return token;
};

const verifyToken = (token: string, secret: Secret) => {
	return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
	generateToken,
	verifyToken,
};
