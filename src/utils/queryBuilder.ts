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
class QueryBuilder<T> {
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
	filter(includeFeilds: string[] = [], staticFilter: Partial<T> = {}) {
		const queryObj = this.pick(includeFeilds);

		// if (Object.keys(queryObj).length === 0) return this;

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
			...staticFilter,
		};

		return this;
	}

	nestedFilter(nestedFilters: NestedFilter[]) {
		nestedFilters.forEach(({ key, searchOption, queryFields }) => {
			const pathSegments = key.split(".");

			const queryObj = this.pick(queryFields);

			if (Object.keys(queryObj).length === 0 && searchOption !== "search")
				return;

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
							[key]: { equals: value, mode: "insensitive" },
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
					AND: [...AndConditions, ...nestedConditions],
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
					if (dataType === "date") {
						const dateParts = value.split("-");
						const utcDate = new Date(
							Date.UTC(dateParts[0], Number(dateParts[1]) - 1, dateParts[2])
						);
						return utcDate;
					}
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
			...this.prismaQuery?.include,
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

function parseSelect(input: {
	own?: string[];
	nested?: any[];
}): Record<string, any> {
	const select: Record<string, any> = {};

	// Handle root fields (fields directly on the model)
	for (const field of input.own || []) {
		select[field] = true;
	}

	// Handle nested models
	for (const nestedItem of input.nested || []) {
		const [modelKey, fields, nestedChildren] = nestedItem;

		// Initialize the model key in select object with an empty 'select' object
		if (!select[modelKey]) {
			select[modelKey] = { select: {} };
		}

		// Add fields to the nested model's 'select' object
		if (Array.isArray(fields) && fields.length > 0) {
			fields.forEach((field) => {
				select[modelKey].select[field] = true;
			});
		}

		// If there are nested children, recurse into them and assign to the 'select' key
		if (Array.isArray(nestedChildren) && nestedChildren.length > 0) {
			select[modelKey].select = {
				...select[modelKey].select, // Keep existing fields
				...parseSelect({
					own: [], // No root fields for nested models
					nested: nestedChildren,
				}),
			};
		}
	}

	return select;
}

const fields: Fields = {
	own: ["status", "email"],
	nested: [
		[
			"user",
			["status", "subscriptionStatus"],
			[["profile", ["name", "img"], [["member", ["id", "status"]]]]],
		],
		["admin", ["name", "img"], [["notification", ["id", "status"]]]],
	],
};
type SelectField = string | { [key: string]: boolean | SelectField };

type nestedArrayType = Array<[string, string[], nestedArrayType?]>;
interface Fields {
	own?: string[]; // Fields directly on the model
	nested?: nestedArrayType;
}

const converted = {
	status: true,
	email: true,
	user: {
		select: {
			status: true,
			subscriptionStatus: true,
			profile: {
				select: {
					name: true,
					img: true,
					member: {
						select: {
							id: true,
							status: true,
						},
					},
				},
			},
		},
	},
	admin: {
		select: {
			name: true,
			img: true,
			notification: {
				select: {
					id: true,
					status: true,
				},
			},
		},
	},
};
