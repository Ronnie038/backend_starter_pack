module.exports = ({ pascal, camel }) => `
import { NestedFilter } from "../../../interfaces/nestedFiltering";
import { rangeFilteringPrams } from "../../../utils/queryBuilder";

// Fields for basic filtering
export const ${camel}FilterFields = [];

// Fields for top-level search
export const ${camel}SearchFields = [];

// Nested filtering config
export const ${camel}NestedFilters: NestedFilter[] = [
	// { key: "user", searchOption: "search", queryFields: ["name"] },

];

// Range-based filtering config
export const ${camel}RangeFilter: rangeFilteringPrams[] = [
	{
		field: "createdAt",
		maxQueryKey: "maxDate",
		minQueryKey: "minDate",
		dataType: "date",
	},
];

// Prisma include configuration
export const ${camel}Include = {
	
};
`;
