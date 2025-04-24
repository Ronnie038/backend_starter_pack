
import { NestedFilter } from "../../../interfaces/nestedFiltering";
import { rangeFilteringPrams } from "../../../utils/queryBuilder";

// Fields for basic filtering
export const userFilterFields = ["", ""];

// Fields for top-level search
export const userSearchFields = [""];

// Nested filtering config
export const userNestedFilters: NestedFilter[] = [
	{ key: "", searchOption: "search", queryFields: [""] },

];

// Range-based filtering config
export const userRangeFilter: rangeFilteringPrams[] = [
	{
		field: "createdAt",
		maxQueryKey: "maxDate",
		minQueryKey: "minDate",
		dataType: "date",
	},
];

// Prisma include configuration
export const userInclude = {
	
};
