import Image from "next/image";
import { PostCopyURL } from "./post-copy-url";
import { cn } from "@proxed/ui/utils";

interface Author {
	name: string;
	src: string;
	tagline: string;
}

const AUTHORS: Record<string, Author> = {
	alex: {
		name: "Alex Vakhitov",
		src: "https://pbs.twimg.com/profile_images/1771528956103016448/WcMTWAZp_400x400.jpg",
		tagline: "Founder & CEO, proxed.ai",
	},
} as const;

interface AuthorAvatarProps {
	src: string;
	name: string;
	className?: string;
}

function AuthorAvatar({ src, name, className }: AuthorAvatarProps) {
	return (
		<Image
			src={src}
			width={32}
			height={32}
			alt={name}
			className={cn("overflow-hidden", className)}
			quality={90}
		/>
	);
}

interface AuthorInfoProps {
	name: string;
	tagline: string;
	className?: string;
}

function AuthorInfo({ name, tagline, className }: AuthorInfoProps) {
	return (
		<div className={cn("flex flex-col", className)}>
			<span className="font-medium text-sm">{name}</span>
			<span className="text-xs text-gray-400">{tagline}</span>
		</div>
	);
}

interface PostAuthorProps {
	author: keyof typeof AUTHORS;
	className?: string;
}

export function PostAuthor({ author, className }: PostAuthorProps) {
	const authorData = AUTHORS[author];
	if (!authorData) return null;

	return (
		<div
			className={cn(
				"flex items-center pt-6 mt-6 border-t border-gray-800 w-full",
				className,
			)}
		>
			<div className="flex items-center space-x-3">
				<AuthorAvatar src={authorData.src} name={authorData.name} />
				<AuthorInfo name={authorData.name} tagline={authorData.tagline} />
			</div>
			<div className="ml-auto">
				<PostCopyURL />
			</div>
		</div>
	);
}
