import { CreateDeviceCheckForm } from "@/components/teams/create-device-check-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Device Check | Proxed",
};

export default async function Page() {
	return <CreateDeviceCheckForm />;
}
