import { z } from "zod";
import type { JsonSchema, ZodToJsonResult, JsonToZodResult } from "./types";

function isZodType(schema: unknown): schema is z.ZodTypeAny {
  return schema instanceof z.ZodType;
}

export function zodToJson(schema: z.ZodTypeAny): ZodToJsonResult {
  try {
    if (!isZodType(schema)) {
      return {
        success: false,
        error: "Invalid Zod schema",
      };
    }

    // Detect optional/nullable
    const isOptional = schema.isOptional?.();
    const isNullable = schema.isNullable?.();
    let defaultValue: unknown;

    // Unwrap optional/nullable/default to get core schema
    let unwrappedSchema = schema;
    while (true) {
      const def = (unwrappedSchema as any)._def;
      if (
        unwrappedSchema instanceof z.ZodOptional ||
        unwrappedSchema instanceof z.ZodNullable
      ) {
        unwrappedSchema = def.innerType;
      } else if (def.typeName === "ZodDefault") {
        defaultValue = def.defaultValue();
        unwrappedSchema = def.innerType;
      } else {
        break;
      }
    }

    const description = (unwrappedSchema as any)._def.description;
    const typeName = (unwrappedSchema as any)._def.typeName;

    let result: JsonSchema;

    switch (typeName) {
      case "ZodString": {
        const checks = (unwrappedSchema as any)._def.checks || [];
        result = {
          type: "string",
          description,
          optional: isOptional,
          nullable: isNullable,
        };

        for (const check of checks) {
          switch (check.kind) {
            case "min":
              (result as any).minLength = check.value;
              break;
            case "max":
              (result as any).maxLength = check.value;
              break;
            case "email":
              (result as any).email = true;
              break;
            case "url":
              (result as any).url = true;
              break;
            case "uuid":
              (result as any).uuid = true;
              break;
            case "regex":
              (result as any).regex = check.regex.source;
              break;
          }
        }
        break;
      }

      case "ZodNumber": {
        const checks = (unwrappedSchema as any)._def.checks || [];
        result = {
          type: "number",
          description,
          optional: isOptional,
          nullable: isNullable,
        };

        for (const check of checks) {
          switch (check.kind) {
            case "min":
              (result as any).min = check.value;
              break;
            case "max":
              (result as any).max = check.value;
              break;
            case "int":
              (result as any).int = true;
              break;
          }
        }
        break;
      }

      case "ZodBoolean": {
        result = {
          type: "boolean",
          description,
          optional: isOptional,
          nullable: isNullable,
        };
        break;
      }

      case "ZodArray": {
        const itemSchema = zodToJson((unwrappedSchema as any)._def.type);
        if (!itemSchema.success) {
          return itemSchema;
        }
        result = {
          type: "array",
          description,
          optional: isOptional,
          nullable: isNullable,
          itemType: itemSchema.data!,
        };
        break;
      }

      case "ZodObject": {
        const shape = (unwrappedSchema as any)._def.shape();
        const fields: Record<string, JsonSchema> = {};

        for (const [key, value] of Object.entries(shape)) {
          const fieldSchema = zodToJson(value);
          if (!fieldSchema.success) {
            return fieldSchema;
          }
          fields[key] = fieldSchema.data!;
        }

        result = {
          type: "object",
          description,
          optional: isOptional,
          nullable: isNullable,
          fields,
        };
        break;
      }

      case "ZodUnion": {
        const options = (unwrappedSchema as any)._def.options;
        const variants: JsonSchema[] = [];

        for (const option of options) {
          const variantSchema = zodToJson(option);
          if (!variantSchema.success) {
            return variantSchema;
          }
          variants.push(variantSchema.data!);
        }

        result = {
          type: "union",
          description,
          optional: isOptional,
          nullable: isNullable,
          variants,
        };
        break;
      }

      case "ZodIntersection": {
        const left = zodToJson((unwrappedSchema as any)._def.left);
        const right = zodToJson((unwrappedSchema as any)._def.right);

        if (!left.success) return left;
        if (!right.success) return right;

        result = {
          type: "intersection",
          description,
          optional: isOptional,
          nullable: isNullable,
          allOf: [left.data!, right.data!],
        };
        break;
      }

      case "ZodEnum": {
        result = {
          type: "enum",
          description,
          optional: isOptional,
          nullable: isNullable,
          values: (unwrappedSchema as any)._def.values,
        };
        break;
      }

      case "ZodLiteral": {
        result = {
          type: "literal",
          description,
          optional: isOptional,
          nullable: isNullable,
          value: (unwrappedSchema as any)._def.value,
        };
        break;
      }

      case "ZodDate": {
        result = {
          type: "date",
          description,
          optional: isOptional,
          nullable: isNullable,
        };
        break;
      }

      default:
        result = {
          type: "any",
          description: `Unhandled Zod type: ${typeName}`,
          optional: isOptional,
          nullable: isNullable,
        };
    }

    if (defaultValue !== undefined) {
      (result as any).defaultValue = defaultValue;
    }

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function jsonToZod(def: JsonSchema): JsonToZodResult {
  try {
    let schema: z.ZodTypeAny;

    switch (def.type) {
      case "string": {
        schema = z.string();
        if (def.minLength !== undefined)
          schema = (schema as z.ZodString).min(def.minLength);
        if (def.maxLength !== undefined)
          schema = (schema as z.ZodString).max(def.maxLength);
        break;
      }

      case "number": {
        schema = z.number();
        if (def.min !== undefined)
          schema = (schema as z.ZodNumber).min(def.min);
        if (def.max !== undefined)
          schema = (schema as z.ZodNumber).max(def.max);
        if (def.int) schema = (schema as z.ZodNumber).int();
        break;
      }

      case "boolean": {
        schema = z.boolean();
        break;
      }

      case "array": {
        const itemSchema = jsonToZod(def.itemType);
        if (!itemSchema.success) return itemSchema;
        schema = z.array(itemSchema.data);
        if (def.minLength !== undefined)
          schema = (schema as z.ZodArray<any>).min(def.minLength);
        if (def.maxLength !== undefined)
          schema = (schema as z.ZodArray<any>).max(def.maxLength);
        break;
      }

      case "object": {
        const shape: Record<string, z.ZodTypeAny> = {};

        for (const [key, value] of Object.entries(def.fields)) {
          const fieldSchema = jsonToZod(value);
          if (!fieldSchema.success) {
            return fieldSchema;
          }
          shape[key] = fieldSchema.data!;
        }

        schema = z.object(shape);
        break;
      }

      case "union": {
        const variants = def.variants.map((v) => jsonToZod(v));
        const failed = variants.find((v) => !v.success);
        if (failed) return failed;

        schema = z.union(
          variants.map((v) => v.data!) as [
            z.ZodTypeAny,
            z.ZodTypeAny,
            ...z.ZodTypeAny[],
          ],
        );
        break;
      }

      case "intersection": {
        const schemas = def.allOf.map((s) => jsonToZod(s));
        const failed = schemas.find((s) => !s.success);
        if (failed) return failed;

        const [first, ...rest] = schemas.map((s) => s.data!);
        schema = rest.reduce((acc, cur) => z.intersection(acc, cur), first);
        break;
      }

      case "enum": {
        schema = z.enum(def.values as [string, ...string[]]);
        break;
      }

      case "literal": {
        schema = z.literal(def.value);
        break;
      }

      case "date": {
        schema = z.date();
        break;
      }

      default:
        schema = z.any();
    }

    if (def.description) {
      schema = schema.describe(def.description);
    }

    if (def.optional) {
      schema = schema.optional();
    }

    if (def.nullable) {
      schema = schema.nullable();
    }

    if (def.defaultValue !== undefined) {
      schema = schema.default(def.defaultValue);
    }

    return { success: true, data: schema };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
