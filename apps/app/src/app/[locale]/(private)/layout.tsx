import { AuthPageLayout } from "@/components/auth/auth-page-layout";

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AuthPageLayout>{children}</AuthPageLayout>;
}
