import { ExecutionsChart } from "./executions-chart";

type Props = {
	type: "all";
	value: any;
	defaultValue: any;
	disabled: boolean;
};

export function Charts(props: Props) {
	switch (props.type) {
		case "all":
			return <ExecutionsChart {...props} />;
		default:
			return null;
	}
}
