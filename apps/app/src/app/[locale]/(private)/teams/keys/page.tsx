import { CreateProviderKeyForm } from "@/components/teams/create-provider-key-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "API Keys | Proxed",
};

export default async function Page() {
	return <CreateProviderKeyForm />;
}
