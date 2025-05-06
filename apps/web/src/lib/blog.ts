import fs from "node:fs";
import path from "node:path";
import imageSize from "image-size";

interface Metadata {
	title: string;
	publishedAt: string;
	summary: string;
	image?: string;
	imageWidth?: number;
	imageHeight?: number;
	tag: string;
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
			tag: rawMetadataPartial.tag || "general",
			image: rawMetadataPartial.image,
			imageWidth: rawMetadataPartial.imageWidth,
			imageHeight: rawMetadataPartial.imageHeight,
		};

		if (metadata.image) {
			try {
				const imageFilePath = path.join(
					process.cwd(),
					"public",
					metadata.image,
				);
				if (fs.existsSync(imageFilePath)) {
					const imageBuffer = fs.readFileSync(imageFilePath);
					const dimensions = imageSize(imageBuffer);
					if (dimensions?.width && dimensions?.height) {
						metadata.imageWidth = dimensions.width;
						metadata.imageHeight = dimensions.height;
					} else {
						console.warn(
							`[Blog] Could not retrieve dimensions for image "${slug}": ${imageFilePath}.`,
						);
						metadata.image = undefined;
					}
				} else {
					console.warn(
						`[Blog] Image not found for post "${slug}": ${imageFilePath}.`,
					);
					metadata.image = undefined;
				}
			} catch (e) {
				console.error(
					`[Blog] Error processing image for post "${slug}" (image: ${metadata.image}):`,
					e,
				);
				metadata.image = undefined;
			}
		}

		if (!metadata.image) {
			metadata.imageWidth = undefined;
			metadata.imageHeight = undefined;
		}

		return {
			metadata,
			slug,
			content,
		};
	});
}

export function getBlogPosts() {
	return getMDXData(path.join(process.cwd(), "src", "app", "updates", "posts"));
}
