// Query Builder in Prisma
export type TSearchOption = "exact" | "partial" | "enum" | "search" | undefined;
export type NestedFilter = {
	key: string;
	searchOption?: TSearchOption;
	queryFields: string[];
};

export interface rangeFilteringPrams {
	field: string;
	nestedField?: string;
	maxQueryKey: string;
	minQueryKey: string;
	dataType: "string" | "number" | "date";
}

interface ApplyCondition {
	field: string;
	nestedField?: string;
	condition: Record<string, any>;
}
class QueryBuilder {
	private model: any;
	private query: Record<string, unknown>;
	private prismaQuery: Record<string, any> = {}; // Define as any for flexibility
	private buildNestedCondition(
		path: string[],
		value: Record<string, any>,
		index = 0,
		condition: Record<string, any> = {}
	) {
		const key = path[index];
		condition[key] =
			index === path.length - 1
				? value
				: this.buildNestedCondition(path, value, index + 1, {});
		return condition;
	}
	private pick(keys: string[]) {
		const finalObj: Record<string, any> = {};

		for (const key of keys) {
			if (this.query && Object.hasOwnProperty.call(this.query, key)) {
				finalObj[key] = this.query[key];
			}
		}
		return finalObj;
	}
	// Helper method to build and apply conditions
	private applyCondition({ nestedField, condition }: ApplyCondition) {
		const pathSegments = nestedField?.split(".");

		const existingOrCondition = this.prismaQuery?.where?.OR || [];
		const finalCondition = pathSegments
			? this.buildNestedCondition(pathSegments, condition)
			: condition;

		this.prismaQuery.where = {
			...this.prismaQuery.where,
			OR: [...existingOrCondition, finalCondition],
		};
	}
	constructor(query: Record<string, unknown>, model: any) {
		this.model = model; // Prisma model instance
		this.query = query; // Query params
	}
	// Search
	search(searchableFields: string[]) {
		const searchTerm = this.query.searchTerm as string;

		if (searchTerm) {
			this.prismaQuery.where = {
				...this.prismaQuery.where,
				OR: searchableFields.map((field) => ({
					[field]: { contains: searchTerm, mode: "insensitive" },
				})),
			};
		}
		return this;
	}

	// Filter
	filter(includeFeilds: string[] = []) {
		const queryObj = this.pick(includeFeilds);

		if (Object.keys(queryObj).length === 0) return this;

		const formattedFilters: Record<string, any> = {};
		for (const [key, value] of Object.entries(queryObj)) {
			if (typeof value === "string" && value.includes("[")) {
				const [field, operator] = key.split("[");
				const op = operator.slice(0, -1); // Remove the closing ']'
				formattedFilters[field] = { [op]: parseFloat(value as string) };
			} else {
				formattedFilters[key] = value;
			}
		}

		this.prismaQuery.where = {
			...this.prismaQuery.where,
			...formattedFilters,
		};

		return this;
	}

	nestedFilter(nestedFilters: NestedFilter[]) {
		nestedFilters.forEach(({ key, searchOption, queryFields }) => {
			const pathSegments = key.split(".");

			const queryObj = this.pick(queryFields);

			if (Object.keys(queryObj).length === 0) return;

			const orConditions = this.prismaQuery?.where?.OR || [];
			const AndConditions = this.prismaQuery?.where?.AND || [];

			if (searchOption == "search") {
				if (this.query.searchTerm) {
					const nestedCondition = queryFields.map((field) => {
						const condition = {
							[field]: {
								contains: this.query.searchTerm,
								mode: "insensitive",
							},
						};
						return this.buildNestedCondition(pathSegments, condition);
					});

					this.prismaQuery.where = {
						...this.prismaQuery?.where,
						OR: [...orConditions, ...nestedCondition],
					};
				}
			} else if (searchOption === "partial") {
				const partialConditions = Object.entries(queryObj).map(
					([key, value]) => {
						const condition = {
							[key]: { contains: value, mode: "insensitive" },
						};
						return this.buildNestedCondition(pathSegments, condition);
					}
				);

				this.prismaQuery.where = {
					...this.prismaQuery.where,
					OR: [...orConditions, ...partialConditions],
				};
			} else {
				// Handle object query fields

				const nestedConditions = Object.entries(queryObj).map(
					([field, value]) => {
						let condition: Record<string, any> = {};

						switch (searchOption) {
							case "enum":
								condition = { [field]: { equals: value } };
								break;
							case "exact":
								condition = { [field]: { equals: value, mode: "insensitive" } };
								break;
							default:
								condition = {
									[field]: { contains: value, mode: "insensitive" },
								};
						}

						return this.buildNestedCondition(pathSegments, condition);
					}
				);
				this.prismaQuery.where = {
					...this.prismaQuery?.where,
					AND: [...AndConditions, nestedConditions],
				};
			}
		});

		return this;
	}

	//raw filter
	rawFilter(filters: Record<string, any>) {
		// Ensure that the filters are merged correctly with the existing where conditions
		this.prismaQuery.where = {
			...this.prismaQuery.where,
			...filters,
		};
		console.log(this.prismaQuery.where);
		return this;
	}

	// // Less Than Filter
	// lessThanFilter(comparisons: ComparisonFilterParams[]) {
	// 	comparisons.forEach((comparison) => {
	// 		const { field, queryKey, nestedField } = comparison;
	// 		const queryObj = this.pick([queryKey]);
	// 		const values = Object.values(queryObj);

	// 		if (values.length === 0) return this;

	// 		const condition = { [field]: { lte: values[0] } }; // Use 'lt' for less than

	// 		this.applyCondition({ field, nestedField, condition });
	// 	});

	// 	return this;
	// }

	// Greater Than Filter
	// greaterThanFilter(comparisons: ComparisonFilterParams[]) {
	// 	comparisons.forEach((comparison) => {
	// 		const { field, queryKey, nestedField } = comparison;
	// 		const queryObj = this.pick([queryKey]);
	// 		const values = Object.values(queryObj);

	// 		if (values.length === 0) return this;

	// 		const condition = { [field]: { gte: values[0] } }; // Use 'gt' for greater than

	// 		this.applyCondition({ field, nestedField, condition });
	// 	});

	// 	return this;
	// }

	// Range (Between) Filter
	filterByRange(betweenFilters: rangeFilteringPrams[]) {
		betweenFilters.forEach(
			({ field, maxQueryKey, minQueryKey, nestedField, dataType }) => {
				const queryObj = this.pick([maxQueryKey, minQueryKey]);
				let maxValue = queryObj[maxQueryKey];
				let minValue = queryObj[minQueryKey];

				if (!maxValue && !minValue) return;

				// Helper function to cast values based on data type
				const castValue = (value: any) => {
					if (dataType === "date") return new Date(value);
					if (dataType === "number") return Number(value);
					return value;
				};

				if (maxValue) maxValue = castValue(maxValue);
				if (minValue) minValue = castValue(minValue);

				const condition: Record<string, any> = {
					[field]: {
						...(minValue !== undefined ? { gte: minValue } : {}),
						...(maxValue !== undefined ? { lte: maxValue } : {}),
					},
				};

				this.applyCondition({ field, nestedField, condition });
			}
		);

		return this;
	}

	// Sorting
	sort() {
		const sort = (this.query.sort as string)?.split(",") || ["-createdAt"];
		const orderBy = sort.map((field) => {
			if (field.startsWith("-")) {
				return { [field.slice(1)]: "desc" };
			}
			return { [field]: "asc" };
		});

		this.prismaQuery.orderBy = orderBy;
		return this;
	}

	// Pagination
	paginate() {
		const page = Number(this.query.page) || 1;
		const limit = Number(this.query.limit) || 10;
		const skip = (page - 1) * limit;

		this.prismaQuery.skip = skip;
		this.prismaQuery.take = limit;

		return this;
	}

	// Fields Selection
	fields() {
		const fields = (this.query.fields as string)?.split(",") || [];
		if (fields.length > 0) {
			this.prismaQuery.select = fields.reduce(
				(acc: Record<string, boolean>, field) => {
					acc[field] = true;
					return acc;
				},
				{}
			);
		}
		return this;
	}

	// *Include Related Models/
	include(includableFields: Record<string, boolean | object>) {
		this.prismaQuery.include = {
			...this.prismaQuery.include,
			...includableFields,
		};
		return this;
	}

	getAllQueries() {
		return this.prismaQuery;
	}

	// *Execute Query/
	async execute() {
		return this.model.findMany(this.prismaQuery);
	}

	// Count Total
	async countTotal() {
		const total = await this.model.count({ where: this.prismaQuery.where });
		const page = Number(this.query.page) || 1;
		const limit = Number(this.query.limit) || 10;
		const totalPage = Math.ceil(total / limit);

		return {
			page,
			limit,
			total,
			totalPage,
		};
	}
}

export default QueryBuilder;
