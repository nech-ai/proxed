"use client";

import { Icons } from "@/components/icons";
import { Section } from "@/components/section";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@proxed/ui/components/avatar";
import { Button } from "@proxed/ui/components/button";
import { Ripple } from "@/components/ui/ripple";

const contributors = [
	{
		name: "Alex Vakhitov",
		avatar:
			"https://avatars.githubusercontent.com/u/1969767?s=400&u=ce371828bd3b59f5a3137cb81a82760ca3f3d583&v=4",
	},
];

export function Community() {
	return (
		<Section id="community" title="Community">
			<div className="border-t overflow-hidden relative">
				<Ripple />
				<div className="p-6 text-center py-12">
					<p className="text-muted-foreground mb-6 text-balance max-w-prose mx-auto font-medium">
						Join our open-source family on GitHub. We value every contributor -
						your pull request might shape the future of proxed.ai!
					</p>
					<div className="flex justify-center -space-x-6 mb-8">
						{contributors.map((contributor, index) => (
							<div key={index}>
								<Avatar className="size-12 relative border-2 border-background bg-muted">
									<AvatarImage
										src={contributor.avatar}
										alt={contributor.name}
										className="object-cover"
									/>
									<AvatarFallback className="text-lg font-semibold">
										{contributor.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
							</div>
						))}
					</div>
					<div className="flex justify-center">
						<Button variant="secondary" className="flex items-center gap-2">
							<Icons.github className="h-5 w-5" />
							Become a contributor
						</Button>
					</div>
				</div>
			</div>
		</Section>
	);
}
