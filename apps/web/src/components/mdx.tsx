import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { highlight } from "sugar-high";
import { cn } from "@proxed/ui/lib/utils";
import type { ReactNode } from "react";

interface TableData {
	headers: string[];
	rows: string[][];
}

interface TableProps {
	data: TableData;
	className?: string;
}

function Table({ data, className }: TableProps) {
	return (
		<table className={cn("w-full border-collapse", className)}>
			<thead>
				<tr>
					{data.headers.map((header) => (
						<th key={header} className="text-left p-2 border-b border-border">
							{header}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.rows.map((row, rowIndex) => (
					<tr key={`row-${rowIndex}`}>
						{row.map((cell, cellIndex) => (
							<td
								key={`${cell}-${cellIndex}`}
								className="p-2 border-b border-border"
							>
								{cell}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

interface CustomLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	href: string;
	className?: string;
}

function CustomLink({ href, className, ...props }: CustomLinkProps) {
	const linkClass = cn(
		"text-primary hover:text-primary/80 underline-offset-4 transition-colors",
		className,
	);

	if (href.startsWith("/")) {
		return (
			<Link href={href} className={linkClass} {...props}>
				<span>{props.children}</span>
			</Link>
		);
	}

	if (href.startsWith("#")) {
		return <a href={href} className={linkClass} {...props} />;
	}

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={linkClass}
			{...props}
		/>
	);
}

interface RoundedImageProps extends React.ComponentProps<typeof Image> {
	alt: string;
	className?: string;
}

function RoundedImage({ className, ...props }: RoundedImageProps) {
	return (
		<Image className={cn("rounded-lg overflow-hidden", className)} {...props} />
	);
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
	children: string;
	className?: string;
}

function Code({ children, className, ...props }: CodeProps) {
	const codeHTML = highlight(children);
	return (
		<code
			className={cn("font-mono text-sm", className)}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Code is sanitized by sugar-high
			dangerouslySetInnerHTML={{ __html: codeHTML }}
			{...props}
		/>
	);
}

function slugify(str: string): string {
	return str
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/&/g, "-and-")
		.replace(/[^\w-]+/g, "")
		.replace(/--+/g, "-");
}

interface HeadingProps {
	children: React.ReactNode;
	className?: string;
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
	const Heading = ({ children, className }: HeadingProps) => {
		const slug = slugify(children as string);
		const Tag = `h${level}` as const;

		return (
			<Tag
				id={slug}
				className={cn("group flex whitespace-pre-wrap", className)}
			>
				<a
					href={`#${slug}`}
					className="absolute -ml-10 mt-1 flex items-center opacity-0 border-0 group-hover:opacity-100"
					aria-label={`Link to ${children}`}
				>
					<div className="w-6 h-6 text-gray-400 ring-1 ring-gray-400/30 rounded-md flex items-center justify-center hover:text-gray-700 hover:ring-gray-700/30 dark:text-gray-300 dark:ring-gray-700/30 dark:hover:text-gray-200 dark:hover:ring-gray-700">
						#
					</div>
				</a>
				{children}
			</Tag>
		);
	};

	Heading.displayName = `Heading${level}`;
	return Heading;
}

interface IframeProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
	src: string;
	className?: string;
}

function Iframe({ src, className, ...props }: IframeProps) {
	return (
		<iframe
			src={src}
			className={cn("w-full rounded-lg border border-border", className)}
			{...props}
		/>
	);
}

function Note({
	type = "info",
	className,
	children,
}: {
	type?: "info" | "warning" | "success" | "error";
	className?: string;
	children: ReactNode;
}) {
	const variant =
		type === "warning"
			? "border-amber-500/30 bg-amber-500/10 text-amber-200"
			: type === "success"
				? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
				: type === "error"
					? "border-red-500/30 bg-red-500/10 text-red-200"
					: "border-blue-500/30 bg-blue-500/10 text-blue-200";

	return (
		<div className={cn("rounded-md border p-3 text-sm", variant, className)}>
			{children}
		</div>
	);
}

const components = {
	h1: createHeading(1),
	h2: createHeading(2),
	h3: createHeading(3),
	h4: createHeading(4),
	h5: createHeading(5),
	h6: createHeading(6),
	Image: RoundedImage,
	a: CustomLink,
	code: Code,
	Table,
	iframe: Iframe,
	Note,
} as const;

interface CustomMDXProps {
	source: string;
	components?: Partial<typeof components>;
	className?: string;
}

export function CustomMDX({
	source,
	components: customComponents,
	className,
}: CustomMDXProps) {
	return (
		<div className={cn("mdx", className)}>
			<MDXRemote
				source={source}
				components={{ ...components, ...(customComponents || {}) }}
			/>
		</div>
	);
}
