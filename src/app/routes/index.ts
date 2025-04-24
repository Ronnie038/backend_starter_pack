import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.routes";
import { InvestorRoutes } from "../modules/Investor/investor.route";

const router = express.Router();

const moduleRoutes = [
	{
		path: "/auth",
		route: AuthRoutes,
	},
	{
		path: "/investor",
		route: InvestorRoutes,
	},
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
