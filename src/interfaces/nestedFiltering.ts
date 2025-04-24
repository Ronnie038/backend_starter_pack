export type TSearchOption = "exact" | "partial" | "enum" | "search" | undefined;
export type NestedFilter = {
	key: string;
	searchOption?: TSearchOption;
	queryFields: string[];
};
