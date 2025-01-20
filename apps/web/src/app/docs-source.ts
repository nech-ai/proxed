import { createMDXSource } from "@fumadocs/content-collections";
import { allDocs, allDocsMetas } from "content-collections";
import { loader } from "fumadocs-core/source";
import { Home } from "lucide-react";
import { createElement } from "react";

export const docsSource = loader({
	baseUrl: "/docs",
	source: createMDXSource(allDocs, allDocsMetas),
	icon(icon) {
		if (!icon) {
			return;
		}

		const icons = {
			Home,
		};

		if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
	},
});
