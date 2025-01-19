import { DataTable } from "./data-table";
import { Cookies } from "@/utils/constants";
import { getProjects } from "@proxed/supabase/cached-queries";
import { cookies } from "next/headers";
import { columns } from "./columns";
import { NoResults } from "./empty-states";

const pageSize = 50;
const maxItems = 100000;

type Props = {
  filter: any;
  page: number;
  sort: any;
  query: string | null;
};

export async function Table({ filter, page, sort, query }: Props) {
  const hasFilters = Object.values(filter).some((value) => value !== null);
  const cookieStore = await cookies();
  const initialColumnVisibility = JSON.parse(
    cookieStore.get(Cookies.ProjectsColumns)?.value || "[]",
  );

  const projects = await getProjects({
    to: hasFilters ? maxItems : page > 0 ? pageSize : pageSize - 1,
    from: 0,
    filter,
    sort,
    searchQuery: query ?? undefined,
  });

  const { data, meta } = projects ?? {};

  async function loadMore({ from, to }: { from: number; to: number }) {
    "use server";

    return getProjects({
      to,
      from: from + 1,
      filter,
      sort,
      searchQuery: query ?? undefined,
    });
  }

  if (!data?.length) {
    if (query?.length) {
      return <NoResults hasFilters />;
    }

    return <NoResults hasFilters={hasFilters} />;
  }

  const hasNextPage = Boolean(
    meta?.count && meta.count / (page + 1) > pageSize,
  );

  return (
    <DataTable
      initialColumnVisibility={initialColumnVisibility}
      columns={columns}
      // @ts-expect-error
      data={data}
      pageSize={pageSize}
      // @ts-expect-error
      loadMore={loadMore}
      hasNextPage={hasNextPage}
      // @ts-expect-error
      meta={meta}
      hasFilters={hasFilters}
      page={page}
      // @ts-expect-error
      query={query}
    />
  );
}
