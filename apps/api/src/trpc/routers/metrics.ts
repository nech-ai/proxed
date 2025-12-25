import { UTCDate } from "@date-fns/utc";
import { subYears } from "date-fns";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, teamProcedure } from "../init";

function getPercentageIncrease(a: number, b: number) {
	return a > 0 && b > 0 ? Math.abs(((a - b) / b) * 100).toFixed(2) : 0;
}

type ExecutionMetricRow = {
	date: string;
	execution_count: number | null;
};

type TokenMetricRow = {
	date: string;
	total_tokens: number | null;
};

export const metricsRouter = createTRPCRouter({
	executions: teamProcedure
		.input(
			z.object({
				from: z.string(),
				to: z.string(),
				type: z.enum(["all"]).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const fromDate = new UTCDate(input.from);
			const toDate = new UTCDate(input.to);
			const type = input.type ?? "all";

			const [prevData, currentData] = await Promise.all([
				ctx.db.execute<ExecutionMetricRow>(sql`
					select * from get_executions_${sql.raw(type)}(
						${ctx.teamId},
						${subYears(fromDate, 1).toISOString().slice(0, 10)},
						${subYears(toDate, 1).toISOString().slice(0, 10)}
					)
				`),
				ctx.db.execute<ExecutionMetricRow>(sql`
					select * from get_executions_${sql.raw(type)}(
						${ctx.teamId},
						${fromDate.toISOString().slice(0, 10)},
						${toDate.toISOString().slice(0, 10)}
					)
				`),
			]);

			const prevTotal = prevData?.reduce(
				(acc, item) => acc + (item.execution_count || 0),
				0,
			);
			const currentTotal = currentData?.reduce(
				(acc, item) => acc + (item.execution_count || 0),
				0,
			);

			return {
				summary: {
					currentTotal: currentTotal || 0,
					prevTotal: prevTotal || 0,
				},
				meta: {
					type,
				},
				result: currentData?.map((record, index) => {
					const prev = prevData?.at(index);

					return {
						date: record.date,
						precentage: {
							value: getPercentageIncrease(
								Math.abs(prev?.execution_count || 0),
								Math.abs(record.execution_count || 0),
							),
							status:
								(record.execution_count || 0) > (prev?.execution_count || 0)
									? "positive"
									: "negative",
						},
						current: {
							date: record.date,
							value: record.execution_count || 0,
						},
						previous: {
							date: prev?.date,
							value: prev?.execution_count || 0,
						},
					};
				}),
			};
		}),

	tokens: teamProcedure
		.input(
			z.object({
				from: z.string(),
				to: z.string(),
				type: z.enum(["tokens"]).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const fromDate = new UTCDate(input.from);
			const toDate = new UTCDate(input.to);
			const type = input.type ?? "tokens";

			const [prevData, currentData] = await Promise.all([
				ctx.db.execute<TokenMetricRow>(sql`
					select * from get_tokens_all(
						${ctx.teamId},
						${subYears(fromDate, 1).toISOString().slice(0, 10)},
						${subYears(toDate, 1).toISOString().slice(0, 10)}
					)
				`),
				ctx.db.execute<TokenMetricRow>(sql`
					select * from get_tokens_all(
						${ctx.teamId},
						${fromDate.toISOString().slice(0, 10)},
						${toDate.toISOString().slice(0, 10)}
					)
				`),
			]);

			const prevTotal = prevData?.reduce(
				(acc, item) => acc + (item.total_tokens || 0),
				0,
			);
			const currentTotal = currentData?.reduce(
				(acc, item) => acc + (item.total_tokens || 0),
				0,
			);

			return {
				summary: {
					currentTotal: currentTotal || 0,
					prevTotal: prevTotal || 0,
				},
				meta: {
					type,
				},
				result: currentData?.map((record, index) => {
					const prev = prevData?.at(index);

					return {
						date: record.date,
						precentage: {
							value: getPercentageIncrease(
								Math.abs(prev?.total_tokens || 0),
								Math.abs(record.total_tokens || 0),
							),
							status:
								(record.total_tokens || 0) > (prev?.total_tokens || 0)
									? "positive"
									: "negative",
						},
						current: {
							date: record.date,
							value: record.total_tokens || 0,
						},
						previous: {
							date: prev?.date,
							value: prev?.total_tokens || 0,
						},
					};
				}),
			};
		}),
});
