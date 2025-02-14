import { Logo } from "@/components/layout/logo";
import { Footer } from "@/components/layout/footer";

interface AuthPageLayoutProps {
	children: React.ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
	return (
		<div className="flex min-h-screen flex-col">
			<div className="flex w-full flex-1 items-center justify-center px-4">
				<div className="flex w-full max-w-sm flex-col items-center">
					<div className="relative mb-12 h-24 w-56">
						<Logo className="h-full w-full" withLabel={true} />
					</div>
					{children}
				</div>
			</div>
			<Footer />
		</div>
	);
}
