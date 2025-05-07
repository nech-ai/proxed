import fs from "node:fs";
import path from "node:path";

interface Metadata {
	title: string;
	publishedAt: string;
	summary: string;
}

function parseFrontmatter(fileContent: string) {
	const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
	const match = frontmatterRegex.exec(fileContent);
	const frontMatterBlock = match?.[1];
	const content = fileContent.replace(frontmatterRegex, "").trim();
	const frontMatterLines = frontMatterBlock?.trim().split("\n") || [];
	const metadata: Partial<Metadata> = {};

	for (const line of frontMatterLines) {
		const [key, ...valueArr] = line.split(": ");
		const SPREAD_OPERATOR = "...";
		if (key && !key.includes(SPREAD_OPERATOR)) {
			let value = valueArr.join(": ").trim();
			value = value.replace(/^['"](.*)['"]$/, "$1");
			(metadata as any)[key.trim()] = value;
		}
	}
	return { metadata: metadata as Partial<Metadata>, content };
}

function getMDXFiles(dir: string) {
	return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
	const rawContent = fs.readFileSync(filePath, "utf-8");
	return parseFrontmatter(rawContent);
}

function getMDXData(dir: string) {
	const mdxFiles = getMDXFiles(dir);
	return mdxFiles.map((file) => {
		const filePath = path.join(dir, file);
		const { metadata: rawMetadataPartial, content } = readMDXFile(filePath);
		const slug = path.basename(file, path.extname(file));

		const metadata: Metadata = {
			title: rawMetadataPartial.title || "Untitled Post",
			publishedAt: rawMetadataPartial.publishedAt || new Date().toISOString(),
			summary: rawMetadataPartial.summary || "",
		};

		return {
			metadata,
			slug,
			content,
		};
	});
}

export function getChangelogChanges() {
	return getMDXData(
		path.join(process.cwd(), "src", "app", "changelog", "changes"),
	);
}
