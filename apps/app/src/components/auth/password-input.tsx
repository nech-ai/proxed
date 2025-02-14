"use client";

import { Input } from "@proxed/ui/components/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	autoComplete?: "current-password" | "new-password";
}

export function PasswordInput({
	autoComplete = "current-password",
	...props
}: PasswordInputProps) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="relative">
			<Input
				type={showPassword ? "text" : "password"}
				className="pr-10"
				autoComplete={autoComplete}
				{...props}
			/>
			<button
				type="button"
				onClick={() => setShowPassword(!showPassword)}
				className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
			>
				{showPassword ? (
					<EyeOffIcon className="size-4" />
				) : (
					<EyeIcon className="size-4" />
				)}
			</button>
		</div>
	);
}
