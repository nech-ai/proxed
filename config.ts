export const config = {
	i18n: {
		locales: {
			en: {
				currency: "USD",
				label: "English",
			},
		},
		defaultLocale: "en",
		defaultCurrency: "USD",
		localeCookieName: "NEXT_LOCALE",
	},
	auth: {
		redirectAfterLogout: "/",
	},
	teams: {
		avatarColors: [
			"#FFFFFF",
			"#D9D9D9",
			"#B3B3B3",
			"#8C8C8C",
			"#666666",
			"#404040",
			"#000000",
		],
	},
	mailing: {
		provider: "resend",
		from: "ProxedAI <hello@mail.proxed.ai>",
	},
} as const satisfies Config;

export type Config = {
	i18n: {
		locales: { [locale: string]: { currency: string; label: string } };
		defaultLocale: string;
		defaultCurrency: string;
		localeCookieName: string;
	};
	auth: {
		redirectAfterLogout: string;
	};
	teams: { avatarColors: string[] };
	mailing: {
		provider: "console" | "resend";
		from: string;
	};
};

export type Locale = keyof (typeof config)["i18n"]["locales"];
