import Image from "next/image";
import { PostCopyURL } from "./post-copy-url";

const getAuthor = (id: string) =>
	({
		alex: {
			name: "Alex Vakhitov",
			src: "https://pbs.twimg.com/profile_images/1771528956103016448/WcMTWAZp_400x400.jpg",
			tagline: "Founder & CEO, Proxed.AI",
		},
	})[id];

type Props = {
	author: string;
};

export function PostAuthor({ author }: Props) {
	const authorData = getAuthor(author);

	if (!authorData) return null;

	return (
		<div className="flex items-center pt-6 mt-6 border-t border-gray-800 w-full">
			<div className="flex items-center space-x-3">
				<Image
					src={authorData.src}
					width={32}
					height={32}
					alt={authorData.name}
					className="rounded-full overflow-hidden"
					quality={90}
				/>
				<div className="flex flex-col">
					<span className="font-medium text-sm">{authorData.name}</span>
					<span className="text-xs text-gray-400">{authorData.tagline}</span>
				</div>
			</div>
			<div className="ml-auto">
				<PostCopyURL />
			</div>
		</div>
	);
}
