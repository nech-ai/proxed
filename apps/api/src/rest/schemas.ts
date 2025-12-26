import { z } from "@hono/zod-openapi";

const exampleProjectId = "2f5b9f7e-4b8c-4e02-9c1f-9d37a0e8d1ef";

const jsonObjectSchema = z.record(z.string(), z.unknown());

export const errorResponseSchema = z
	.object({
		error: z.string().openapi({
			description: "Machine-readable error code.",
			example: "VALIDATION_ERROR",
		}),
		message: z.string().openapi({
			description: "Human-readable error message.",
			example: "Request validation failed",
		}),
		details: jsonObjectSchema.optional().openapi({
			description: "Optional structured details for validation errors.",
			example: { field: ["Required"] },
		}),
		requestId: z.string().uuid().openapi({
			description: "Request identifier for support and tracing.",
			example: "9b6b8b32-874c-4b9b-8c4a-5a24d64e2d43",
		}),
		timestamp: z.string().datetime().openapi({
			description: "ISO timestamp when the error was produced.",
			example: "2025-12-24T12:34:56.000Z",
		}),
	})
	.openapi("ErrorResponse");

export const projectIdParamSchema = z.object({
	projectId: z
		.string()
		.uuid()
		.openapi({
			param: {
				name: "projectId",
				in: "path",
				description: "Project identifier.",
			},
			example: exampleProjectId,
		}),
});

export const proxyWildcardParamSchema = z.object({
	"*": z.string().openapi({
		param: {
			name: "*",
			in: "path",
			description:
				"Upstream provider path to proxy (example: chat/completions).",
		},
		example: "chat/completions",
	}),
});

export const proxyParamsSchema = projectIdParamSchema.merge(
	proxyWildcardParamSchema,
);

export const projectIdHeaderSchema = z.object({
	"x-project-id": z
		.string()
		.uuid()
		.openapi({
			param: {
				name: "x-project-id",
				in: "header",
				description: "Project identifier when not supplied in the URL path.",
			},
			example: exampleProjectId,
		}),
});

export const authHeaderSchema = z.object({
	authorization: z
		.string()
		.optional()
		.openapi({
			param: {
				name: "authorization",
				in: "header",
				description:
					"Bearer {partialApiKey}.{deviceTokenOrTestKey}. Preferred auth scheme.",
			},
			example: "Bearer sk-partial.eyJhbGciOi...",
		}),
	"x-ai-key": z
		.string()
		.optional()
		.openapi({
			param: {
				name: "x-ai-key",
				in: "header",
				description:
					"Partial API key for legacy device token or test-key flows.",
			},
			example: "sk-partial",
		}),
	"x-device-token": z
		.string()
		.optional()
		.openapi({
			param: {
				name: "x-device-token",
				in: "header",
				description: "Legacy base64 device token (if not using Authorization).",
			},
			example: "dG9rZW4uLi4=",
		}),
	"x-proxed-test-key": z
		.string()
		.optional()
		.openapi({
			param: {
				name: "x-proxed-test-key",
				in: "header",
				description: "Project test key (test-mode only).",
			},
			example: "test_123",
		}),
});

export const proxyRequestSchema = z.any().openapi({
	description: "Pass-through provider request payload.",
});

export const proxyResponseSchema = z.any().openapi({
	description: "Pass-through provider response payload.",
});

export const structuredTextRequestSchema = z.object({
	text: z.string().min(1).max(100000).openapi({
		description: "Text content to parse into the project schema.",
		example: "Extract line items and totals from this invoice.",
	}),
});

export const structuredVisionRequestSchema = z.object({
	image: z.string().min(1).openapi({
		description: "Image input as base64 data URI or externally hosted URL.",
		example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
	}),
});

export const structuredPdfRequestSchema = z.object({
	pdf: z
		.string()
		.min(1)
		.refine(
			(pdf) => {
				const base64Regex = /^data:application\/pdf;base64,/;
				const urlRegex = /^https?:\/\/.+\.(pdf)$/i;
				return base64Regex.test(pdf) || urlRegex.test(pdf);
			},
			{
				message: "Invalid PDF format. Must be base64 data URI or valid PDF URL",
			},
		)
		.openapi({
			description:
				"PDF input as base64 data URI (data:application/pdf;base64,...) or URL.",
			example: "https://example.com/invoice.pdf",
		}),
});

export const structuredResponseSchema = jsonObjectSchema.openapi({
	description:
		"Structured response generated from the project schema configuration.",
});

export const imageGenerationRequestSchema = z
	.object({
		prompt: z.string().min(1).openapi({
			description: "Text prompt describing the image to generate.",
			example: "A neon-lit city skyline at night.",
		}),
		model: z.string().optional().openapi({
			description:
				"Optional override model. Defaults to project or provider default.",
			example: "gpt-image-1",
		}),
		size: z
			.string()
			.regex(/^\d+x\d+$/)
			.optional()
			.openapi({
				description: "Image size in WxH (mutually exclusive with aspectRatio).",
				example: "1024x1024",
			}),
		aspectRatio: z
			.string()
			.regex(/^\d+:\d+$/)
			.optional()
			.openapi({
				description: "Aspect ratio (mutually exclusive with size).",
				example: "16:9",
			}),
		n: z.number().int().min(1).max(20).optional().openapi({
			description: "Number of images to generate.",
			example: 2,
		}),
		seed: z.number().int().optional().openapi({
			description: "Optional seed for deterministic generation.",
			example: 42,
		}),
		maxImagesPerCall: z.number().int().min(1).max(10).optional().openapi({
			description:
				"Provider-specific cap for images per call (when supported).",
			example: 4,
		}),
		providerOptions: z
			.object({
				openai: jsonObjectSchema.optional(),
				google: jsonObjectSchema.optional(),
			})
			.optional()
			.openapi({
				description: "Provider-specific options forwarded to the image API.",
			}),
		headers: z.record(z.string(), z.string()).optional().openapi({
			description: "Optional headers forwarded to the provider.",
		}),
	})
	.refine((data) => !(data.size && data.aspectRatio), {
		message: "Specify either size or aspectRatio, not both",
		path: ["size"],
	});

export const imageGenerationResponseSchema = z
	.object({
		images: z.array(
			z.object({
				base64: z.string().openapi({
					description: "Base64-encoded image payload.",
				}),
				mediaType: z.string().openapi({
					description: "MIME type for the image.",
					example: "image/png",
				}),
			}),
		),
		warnings: z.array(z.any()).optional().openapi({
			description: "Optional provider warnings.",
		}),
		providerMetadata: z.record(z.string(), z.any()).optional().openapi({
			description: "Provider-specific metadata.",
		}),
	})
	.openapi("ImageGenerationResponse");

export const geoInfoResponseSchema = z
	.object({
		ip: z.string().nullable(),
		country: z.string().nullable(),
		countryCode: z.string().nullable(),
		region: z.string().nullable(),
		regionCode: z.string().nullable(),
		city: z.string().nullable(),
		latitude: z.number().nullable(),
		longitude: z.number().nullable(),
		timezone: z.string().nullable(),
		locale: z.string().nullable(),
		continent: z.string().nullable(),
		postalCode: z.string().nullable(),
	})
	.openapi("GeoInfoResponse");

export const metricsResponseSchema = z
	.object({
		requests: z.record(z.string(), z.any()),
		errors: z.record(z.string(), z.any()),
		latency: z.record(z.string(), z.any()),
	})
	.openapi("MetricsResponse");

export const healthStatusSchema = z
	.object({
		status: z.enum(["healthy", "degraded", "unhealthy"]),
		timestamp: z.string(),
		uptime: z.number(),
		checks: z
			.object({
				database: z.enum(["ok", "error"]).optional(),
				redis: z.enum(["ok", "error"]).optional(),
			})
			.optional(),
		version: z.string(),
		environment: z.string().optional(),
		metrics: z.record(z.string(), z.any()).optional(),
		circuitBreakers: z.record(z.string(), z.any()).optional(),
	})
	.openapi("HealthStatus");
