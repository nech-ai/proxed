import type { LucideIcon } from "lucide-react";

export interface NavItem {
	title: string;
	url: string;
	items?: Array<{
		title: string;
		url: string;
	}>;
	icon: LucideIcon;
	isActive?: boolean;
}

export interface Project {
	name: string;
	url: string;
	icon: LucideIcon;
}
