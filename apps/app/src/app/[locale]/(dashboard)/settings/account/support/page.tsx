import { PageHeader } from "@/components/layout/page-header";
import { SupportForm } from "@/components/settings/account/support/support-form";

export async function generateMetadata() {
	return {
		title: "Support | Proxed",
	};
}

export default async function AccountSupportPage() {
	return (
		<div className="grid grid-cols-1 gap-6">
			<SupportForm />
		</div>
	);
}
