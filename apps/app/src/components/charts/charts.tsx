import { ExecutionsChart } from "./executions-chart";
import { TokensChart } from "./tokens-chart";

type Props = {
	type: "all" | "tokens";
	value: any;
	defaultValue: any;
	disabled: boolean;
};

export function Charts(props: Props) {
	switch (props.type) {
		case "all":
			return <ExecutionsChart {...props} />;
		case "tokens":
			return <TokensChart {...props} />;
		default:
			return null;
	}
}
