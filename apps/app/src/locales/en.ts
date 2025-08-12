export default {
	chart_type: {
		all: "All",
		tokens: "Tokens",
	},
	notifications: {
		"execution-error": {
			title: "Execution Error",
			description: "An error occurred while executing a task.",
		},
		"high-consumption": {
			title: "High Consumption",
			description: "Your project is experiencing a high rate of API calls.",
		},
	},
} as const;
