
import { NestedFilter } from "../../../interfaces/nestedFiltering";
import { rangeFilteringPrams } from "../../../utils/queryBuilder";

// Fields for basic filtering
export const companyFilterFields = ["status", "email"];

// Fields for top-level search
export const companySearchFields = ["tile"];

// Nested filtering config
export const companyNestedFilters: NestedFilter[] = [
	{ key: "user", searchOption: "exact", queryFields: ["email"] },
	{ key: "user.profile", searchOption: "search", queryFields: ["name"] },

];

// Range-based filtering config
export const companyRangeFilter: rangeFilteringPrams[] = [
	{
		field: "createdAt",
		maxQueryKey: "maxDate",
		minQueryKey: "minDate",
		dataType: "date",
	},
	{
		field: "price",
		maxQueryKey: "maxPrice",
		minQueryKey: "minPrice",
		nestedField:'order.product',
		dataType: "date",
	},
];

// Prisma include configuration
export const companyInclude = {
	
};
