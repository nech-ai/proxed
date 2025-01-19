import type { UseFormReturn } from "react-hook-form";
import { ZodIssueCode, ZodParsedType, defaultErrorMap } from "zod";
import type { ZodErrorMap, ZodIssueOptionalMessage } from "zod";

const jsonStringifyReplacer = (_: string, value: unknown): unknown => {
	if (typeof value === "bigint") {
		return value.toString();
	}
	return value;
};

function joinValues<T extends unknown[]>(array: T, separator = " | "): string {
	return array
		.map((val) => (typeof val === "string" ? `'${val}'` : val))
		.join(separator);
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
	if (typeof value !== "object" || value === null) return false;

	for (const key in value) {
		if (!Object.prototype.hasOwnProperty.call(value, key)) return false;
	}

	return true;
};

export function useFormErrors() {
	const zodErrorMap: ZodErrorMap = (issue, ctx) => {
		let message: string;
		message = defaultErrorMap(issue, ctx).message;

		switch (issue.code) {
			case ZodIssueCode.invalid_type:
				if (issue.received === ZodParsedType.undefined) {
					message = "Required";
				} else {
					message = `Expected ${issue.expected}, received ${issue.received}`;
				}
				break;
			case ZodIssueCode.invalid_literal:
				message = `Invalid literal value, expected ${JSON.stringify(issue.expected, jsonStringifyReplacer)}`;
				break;
			case ZodIssueCode.unrecognized_keys:
				message = `Unrecognized key(s) in object: ${joinValues(issue.keys, ", ")}`;
				break;
			case ZodIssueCode.invalid_union:
				message = "Invalid input";
				break;
			case ZodIssueCode.invalid_union_discriminator:
				message = `Invalid discriminator value. Expected ${joinValues(issue.options)}`;
				break;
			case ZodIssueCode.invalid_enum_value:
				message = `Invalid enum value. Expected ${joinValues(issue.options)}, received '${issue.received}'`;
				break;
			case ZodIssueCode.invalid_arguments:
				message = "Invalid function arguments";
				break;
			case ZodIssueCode.invalid_return_type:
				message = "Invalid function return type";
				break;
			case ZodIssueCode.invalid_date:
				message = "Invalid date";
				break;
			case ZodIssueCode.invalid_string:
				if (typeof issue.validation === "object") {
					if ("startsWith" in issue.validation) {
						message = `Invalid input: must start with "${issue.validation.startsWith}"`;
					} else if ("endsWith" in issue.validation) {
						message = `Invalid input: must end with "${issue.validation.endsWith}"`;
					}
				} else {
					message = "Invalid input";
				}
				break;
			case ZodIssueCode.too_small: {
				const minimum =
					issue.type === "date"
						? new Date(issue.minimum as number)
						: (issue.minimum as number);
				const type = issue.type;
				const exact = issue.exact;
				const inclusive = issue.inclusive;

				if (type === "array") {
					if (exact) {
						message = `Array must contain exactly ${minimum} element(s)`;
					} else {
						message = inclusive
							? `Array must contain at least ${minimum} element(s)`
							: `Array must contain more than ${minimum} element(s)`;
					}
				} else if (type === "string") {
					if (exact) {
						message = `String must contain exactly ${minimum} character(s)`;
					} else {
						message = inclusive
							? `String must contain at least ${minimum} character(s)`
							: `String must contain over ${minimum} character(s)`;
					}
				} else if (type === "number") {
					if (exact) {
						message = `Number must be exactly ${minimum}`;
					} else {
						message = inclusive
							? `Number must be greater than or equal to ${minimum}`
							: `Number must be greater than ${minimum}`;
					}
				} else if (type === "date") {
					if (exact) {
						message = `Date must be exactly ${minimum}`;
					} else {
						message = inclusive
							? `Date must be greater than or equal to ${minimum}`
							: `Date must be greater than ${minimum}`;
					}
				}
				break;
			}
			case ZodIssueCode.too_big: {
				const maximum =
					issue.type === "date"
						? new Date(issue.maximum as number)
						: (issue.maximum as number);
				const type = issue.type;
				const exact = issue.exact;
				const inclusive = issue.inclusive;

				if (type === "array") {
					if (exact) {
						message = `Array must contain exactly ${maximum} element(s)`;
					} else {
						message = inclusive
							? `Array must contain at most ${maximum} element(s)`
							: `Array must contain less than ${maximum} element(s)`;
					}
				} else if (type === "string") {
					if (exact) {
						message = `String must contain exactly ${maximum} character(s)`;
					} else {
						message = inclusive
							? `String must contain at most ${maximum} character(s)`
							: `String must contain under ${maximum} character(s)`;
					}
				} else if (type === "number") {
					if (exact) {
						message = `Number must be exactly ${maximum}`;
					} else {
						message = inclusive
							? `Number must be less than or equal to ${maximum}`
							: `Number must be less than ${maximum}`;
					}
				} else if (type === "date") {
					if (exact) {
						message = `Date must be exactly ${maximum}`;
					} else {
						message = inclusive
							? `Date must be smaller than or equal to ${maximum}`
							: `Date must be smaller than ${maximum}`;
					}
				}
				break;
			}
			case ZodIssueCode.custom: {
				const customErrors: Record<string, string> = {
					email_already_exists: "This email is already in use.",
					email_not_verified: "Please verify your email address first.",
					lowercase_character_required:
						"Please use at least one lowercase character.",
					number_required: "Please use at least one number.",
					special_character_required:
						"Please use at least one special character.",
					uppercase_character_required:
						"Please use at least one uppercase character.",
				};

				if (issue.params?.i18n && typeof issue.params.i18n === "string") {
					message = customErrors[issue.params.i18n] || "Invalid input";
				} else {
					message = "Invalid input";
				}
				break;
			}
			case ZodIssueCode.invalid_intersection_types:
				message = "Intersection results could not be merged";
				break;
			case ZodIssueCode.not_multiple_of:
				message = "Number must be a multiple of {multipleOf}";
				break;
			case ZodIssueCode.not_finite:
				message = "Number must be finite";
				break;
			default:
				message = ctx.defaultError;
		}

		return { message };
	};

	function setApiErrorsToForm<Form extends UseFormReturn<any, any>>(
		e: unknown,
		form: Form,
		{
			defaultError,
			errorMap = zodErrorMap,
		}: {
			defaultError: string;
			errorMap?: ZodErrorMap;
		},
	) {
		if (
			e instanceof Error &&
			"data" in e &&
			typeof e.data === "object" &&
			e.data !== null
		) {
			const errorData = e.data as {
				zodError?: {
					fieldErrors?: Record<string, ZodIssueOptionalMessage[]>;
					formErrors?: ZodIssueOptionalMessage[];
				};
			};

			if (errorData.zodError?.fieldErrors) {
				Object.entries(errorData.zodError.fieldErrors).forEach(
					([field, errors]) => {
						const error = ((errors ?? []) as ZodIssueOptionalMessage[])[0];

						if (error) {
							form.setError(
								field,
								errorMap?.(error, {
									data: {},
									defaultError: "",
								}) ?? error,
							);
						}
					},
				);

				return;
			}

			if (errorData.zodError?.formErrors) {
				const error = (errorData.zodError.formErrors ??
					[]) as ZodIssueOptionalMessage[];
				const firstError = error[0];

				if (firstError) {
					form.setError(
						"root",
						errorMap?.(firstError, {
							data: {},
							defaultError: "",
						}) ?? firstError,
					);
				}

				return;
			}
		}

		form.setError("root", {
			message: defaultError,
		});
	}

	return {
		zodErrorMap,
		setApiErrorsToForm,
	};
}
