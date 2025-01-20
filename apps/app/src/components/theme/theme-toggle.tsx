"use client";

import { Button } from "@proxed/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@proxed/ui/components/dropdown-menu";
import { MoonIcon, SunIcon } from "lucide-react";
import { useState } from "react";

export function ThemeToggle() {
	const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

	const toggleColorScheme = (scheme: "light" | "dark") => {
		setColorScheme(scheme);
		document.body.classList.toggle("dark", scheme === "dark");
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon">
					<SunIcon className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
					<MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle color scheme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => toggleColorScheme("light")}>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => toggleColorScheme("dark")}>
					Dark
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
