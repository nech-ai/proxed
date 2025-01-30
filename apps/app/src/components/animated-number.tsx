"use client";

import { useUserContext } from "@/store/user/hook";
import NumberFlow from "@number-flow/react";

type Props = {
	value: number;
	locale?: string;
};

export function AnimatedNumber({ value, locale }: Props) {
	const { locale: currentLocale } = useUserContext((state) => state.data);
	const localeToUse = locale || currentLocale;

	return (
		<NumberFlow
			value={value}
			format={{ notation: "compact" }}
			willChange
			locales={localeToUse}
		/>
	);
}
