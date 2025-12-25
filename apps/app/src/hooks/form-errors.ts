import type { UseFormReturn } from "react-hook-form";
import { ZodIssueCode } from "zod";
import type { ZodErrorMap, ZodIssue } from "zod";

function joinValues<T extends unknown[]>(array: T, separator = " | "): string {
	return array
		.map((val) => (typeof val === "string" ? `'${val}'` : val))
		.join(separator);
}

export function useFormErrors() {
	const zodErrorMap: ZodErrorMap = (issue) => {
		let message = issue.message ?? "Invalid input";

		switch (issue.code) {
			case ZodIssueCode.invalid_type:
				if (issue.input === undefined) {
					message = "Required";
				} else {
					message = `Expected ${issue.expected}, received ${typeof issue.input}`;
				}
				break;
			case ZodIssueCode.unrecognized_keys:
				message = `Unrecognized key(s) in object: ${joinValues(issue.keys, ", ")}`;
				break;
			case ZodIssueCode.invalid_union:
				message = "Invalid input";
				break;
			case ZodIssueCode.invalid_value:
				message = `Invalid value. Expected ${joinValues(issue.values, ", ")}`;
				break;
			case ZodIssueCode.invalid_format: {
				if (issue.format === "starts_with" && "prefix" in issue) {
					message = `Invalid input: must start with "${issue.prefix}"`;
				} else if (issue.format === "ends_with" && "suffix" in issue) {
					message = `Invalid input: must end with "${issue.suffix}"`;
				} else if (issue.format === "includes" && "includes" in issue) {
					message = `Invalid input: must include "${issue.includes}"`;
				} else if (issue.format === "regex" && "pattern" in issue) {
					message = `Invalid input: must match ${issue.pattern}`;
				} else {
					message = "Invalid input format";
				}
				break;
			}
			case ZodIssueCode.too_small: {
				const minimum =
					issue.origin === "date"
						? new Date(issue.minimum as number)
						: (issue.minimum as number);
				const type = issue.origin;
				const exact = issue.exact;
				const inclusive = issue.inclusive;

				if (type === "array" || type === "set") {
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
				} else if (type === "number" || type === "int" || type === "bigint") {
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
					issue.origin === "date"
						? new Date(issue.maximum as number)
						: (issue.maximum as number);
				const type = issue.origin;
				const exact = issue.exact;
				const inclusive = issue.inclusive;

				if (type === "array" || type === "set") {
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
				} else if (type === "number" || type === "int" || type === "bigint") {
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
			case ZodIssueCode.invalid_key:
				message = "Invalid key";
				break;
			case ZodIssueCode.invalid_element:
				message = "Invalid element";
				break;
			case ZodIssueCode.not_multiple_of:
				message = `Number must be a multiple of ${issue.divisor}`;
				break;
		}

		return { message };
	};

	const getErrorMessage = (
		error: ZodIssue,
		fallback: string,
		errorMap?: ZodErrorMap,
	) => {
		const mapped = errorMap?.(error as Parameters<ZodErrorMap>[0]);
		if (typeof mapped === "string") {
			return mapped;
		}
		if (mapped && typeof mapped === "object" && "message" in mapped) {
			return mapped.message;
		}
		return error.message ?? fallback;
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
					fieldErrors?: Record<string, ZodIssue[]>;
					formErrors?: ZodIssue[];
				};
			};

			if (errorData.zodError?.fieldErrors) {
				Object.entries(errorData.zodError.fieldErrors).forEach(
					([field, errors]) => {
						const error = ((errors ?? []) as ZodIssue[])[0];

						if (error) {
							form.setError(field, {
								message: getErrorMessage(error, defaultError, errorMap),
							});
						}
					},
				);

				return;
			}

			if (errorData.zodError?.formErrors) {
				const error = (errorData.zodError.formErrors ?? []) as ZodIssue[];
				const firstError = error[0];

				if (firstError) {
					form.setError("root", {
						message: getErrorMessage(firstError, defaultError, errorMap),
					});
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
