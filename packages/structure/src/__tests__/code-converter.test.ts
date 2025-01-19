import { describe, expect, it } from "vitest";
import { zodCodeToJson, jsonToZodCode } from "../code-converter";
import { jsonToZod } from "../generator";

describe("code converters", () => {
  it("converts simple schema to code", () => {
    const json = {
      type: "object" as const,
      fields: {
        name: { type: "string" as const },
        age: { type: "number" as const, int: true },
      },
    };

    const result = jsonToZodCode(json);
    expect(result.success).toBe(true);
    expect(result.data).toContain("z.object({");
    expect(result.data).toContain("name: z.string()");
    expect(result.data).toContain("age: z.number().int()");
  });

  it("converts code to json schema", () => {
    const code = `
import { z } from "zod";
export const mySchema = z.object({
  name: z.string(),
  age: z.number().int()
});`;

    const result = zodCodeToJson(code);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      type: "object",
      optional: false,
      nullable: false,
      fields: {
        name: {
          type: "string",
          optional: false,
          nullable: false,
        },
        age: {
          int: true,
          type: "number",
          optional: false,
          nullable: false,
        },
      },
    });
  });

  it("handles round-trip conversion", () => {
    const originalCode = `
      import { z } from "zod";
      export const mySchema = z.object({
        name: z.string().min(2).max(50).describe("User's name"),
        age: z.number().int().min(0).max(120).describe("User's age"),
        email: z.string().email().optional(),
        tags: z.array(z.string()).default([]),
      });
    `;

    // Code -> JSON
    const jsonResult = zodCodeToJson(originalCode);
    expect(jsonResult.success).toBe(true);

    // JSON -> Schema
    const schemaResult = jsonToZod(jsonResult.data!);
    expect(schemaResult.success).toBe(true);

    // Test the schema from JSON
    const testData = {
      name: "Test",
      age: 25,
      tags: ["a", "b"],
    };
    const parsed = schemaResult.data!.safeParse(testData);
    expect(parsed.success).toBe(true);

    // JSON -> Code
    const codeResult = jsonToZodCode(jsonResult.data!);
    expect(codeResult.success).toBe(true);

    // Verify the generated code string contains expected parts
    expect(codeResult.data).toContain("z.string().min(2).max(50)");
    expect(codeResult.data).toContain(".min(0).max(120)");
    expect(codeResult.data).toContain("z.string().email().optional()");
    expect(codeResult.data).toContain("z.array(z.string())");
  });

  it("handles string constraints", () => {
    const code = `
import { z } from "zod";
export const mySchema = z.string().min(3).max(10).email();`;

    const result = zodCodeToJson(code);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      type: "string",
      minLength: 3,
      maxLength: 10,
      email: true,
    });
  });

  it("handles nested objects", () => {
    const code = `
import { z } from "zod";
export const mySchema = z.object({
  user: z.object({
    name: z.string(),
    settings: z.object({
      theme: z.enum(["light", "dark"])
    })
  })
});`;

    const result = zodCodeToJson(code);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      type: "object",
      fields: {
        user: {
          type: "object",
          fields: {
            name: { type: "string" },
            settings: {
              type: "object",
              fields: {
                theme: {
                  type: "enum",
                  values: ["light", "dark"],
                },
              },
            },
          },
        },
      },
    });
  });

  it("handles invalid code gracefully", () => {
    const result = zodCodeToJson("invalid code");
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
