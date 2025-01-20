import { defineCollection, defineConfig } from "@content-collections/core";
import {
	createDocSchema,
	createMetaSchema,
	transformMDX,
} from "@fumadocs/content-collections/configuration";
import { remarkImage } from "fumadocs-core/mdx-plugins";

const docs = defineCollection({
	name: "docs",
	directory: "content/docs",
	include: "**/*.mdx",
	schema: createDocSchema,
	transform: async (document, context) =>
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

const docsMeta = defineCollection({
	name: "docsMeta",
	directory: "content/docs",
	include: "**/meta.json",
	parser: "json",
	schema: createMetaSchema,
});

export default defineConfig({
	collections: [docs, docsMeta],
});
