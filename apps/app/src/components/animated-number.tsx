"use client";

import NumberFlow from "@number-flow/react";

type Props = {
	value: number;
};

export function AnimatedNumber({ value }: Props) {
	return (
		<NumberFlow
			value={value}
			format={{
				style: "currency",
				currency: "USD",
				minimumFractionDigits: 4,
				maximumFractionDigits: 4,
			}}
			willChange
		/>
	);
}
