"use client";

import { useUserContext } from "@/store/user/hook";
import { formatAmount } from "@/utils/format";

type Props = {
	amount: number;
	maximumFractionDigits?: number;
	minimumFractionDigits?: number;
	locale?: string;
};

export function FormatAmount({
	amount,
	maximumFractionDigits,
	minimumFractionDigits,
	locale,
}: Props) {
	const { data } = useUserContext((state) => state);

	return formatAmount({
		locale: locale || data?.locale,
		amount: amount,
		maximumFractionDigits,
		minimumFractionDigits,
	});
}
