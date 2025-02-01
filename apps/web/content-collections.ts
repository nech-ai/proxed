import { defineCollection, defineConfig } from "@content-collections/core";
import {
	createMetaSchema,
	createDocSchema,
	transformMDX,
} from "@fumadocs/content-collections/configuration";
import { remarkImage } from "fumadocs-core/mdx-plugins";

const docs = defineCollection({
	name: "docs",
	directory: "content/docs",
	include: "**/*.mdx",
	schema: createDocSchema,
	transform: async (document, context) =>
		// @ts-expect-error
		transformMDX(document, context, {
			remarkPlugins: [
				[
					remarkImage,
					{
						publicDir: "public",
					},
				],
			],
		}),
});

const metas = defineCollection({
	name: "meta",
	directory: "content/docs",
	include: "**/meta.json",
	parser: "json",
	schema: createMetaSchema,
});

export default defineConfig({
	// @ts-expect-error
	collections: [docs, metas],
});
