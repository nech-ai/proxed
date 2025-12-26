import type {
	AppRouter,
	RouterInputs,
	RouterOutputs,
} from "@proxed/api/trpc/routers/_app";

export type { RouterInputs, RouterOutputs };

type Override<T, U> = Omit<T, keyof U> & U;

export type AppRouterClient = Override<
	AppRouter,
	{
		_def: Override<
			AppRouter["_def"],
			{
				_config: Override<
					AppRouter["_def"]["_config"],
					{
						$types: Override<
							AppRouter["_def"]["_config"]["$types"],
							{
								transformer: true;
							}
						>;
					}
				>;
			}
		>;
	}
>;
