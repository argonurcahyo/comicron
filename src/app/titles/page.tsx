import type { Metadata } from "next";
import Link from "next/link";

import { IssueCard } from "@/components/issue-card";
import { TitleFilterCombobox } from "@/components/title-filter-combobox";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

type SearchParams = {
  title?: string;
  volume?: string;
};

type TitleItem = {
  id: string;
  name: string;
  publisher: string | null;
};

type PublisherItem = {
  id: string;
  name: string;
};

type EventItem = {
  id: string;
  name: string;
};

type CharacterItem = {
  id: string;
  name: string;
  alias: string | null;
  status: string | null;
  affiliation: string | null;
  lore_markdown: string | null;
  avatar_url: string | null;
};

type IssueMeta = {
  title_id: string;
  volume: string | null;
};

type IssueItem = {
  id: string;
  issue_number: string;
  volume: string | null;
  summary: string | null;
  reading_status: string;
  cover_url: string | null;
  event_links:
    | {
        reading_order: number;
        event: {
          id: string;
          name: string;
        } | null;
      }[]
    | null;
};

const NO_VOLUME = "__none";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = (searchParams ? await searchParams : {}) as SearchParams;

  if (!isSupabaseConfigured || !params.title) {
    return {
      title: "Titles",
      description: "Browse comic runs by title and volume.",
    };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin.from("titles").select("name").eq("id", params.title).maybeSingle();
  const titleName = data?.name ? String(data.name) : null;

  if (!titleName) {
    return {
      title: "Titles",
      description: "Browse comic runs by title and volume.",
    };
  }

  return {
    title: params.volume ? `${titleName} Vol. ${params.volume}` : titleName,
    description: `Browse issues for ${titleName}${params.volume ? ` volume ${params.volume}` : ""}.`,
  };
}

export default async function TitlesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (searchParams ? await searchParams : {}) as SearchParams;

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
          <h1 className="text-xl font-black uppercase tracking-tight">Supabase Not Configured</h1>
          <p className="mt-2 text-sm">Add your environment variables in .env.local and restart the app.</p>
        </section>
      </main>
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  const [
    { data: titlesData, error: titlesError },
    { data: issueMetaData, error: issueMetaError },
    { data: eventsData, error: eventsError },
    { data: publishersData, error: publishersError },
    { data: charactersData, error: charactersError },
  ] = await Promise.all([
    supabaseAdmin.from("titles").select("id,name,publisher").order("name", { ascending: true }),
    supabaseAdmin.from("issues").select("title_id,volume"),
    supabaseAdmin.from("events").select("id,name").order("start_date", { ascending: true }),
    supabaseAdmin.from("publishers").select("id,name").order("name", { ascending: true }),
    supabaseAdmin.from("characters").select("id,name,alias,status,affiliation,lore_markdown,avatar_url").order("name", { ascending: true }),
  ]);

  if (titlesError || issueMetaError || eventsError || publishersError || charactersError) {
    const message =
      titlesError?.message ??
      issueMetaError?.message ??
      eventsError?.message ??
      publishersError?.message ??
      charactersError?.message ??
      "Could not load titles.";

    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-900">
          <h1 className="text-xl font-black uppercase tracking-tight">Database Error</h1>
          <p className="mt-2 text-sm font-mono">{message}</p>
        </section>
      </main>
    );
  }

  const titles = ((titlesData ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? "Untitled"),
    publisher: row.publisher ? String(row.publisher) : null,
  })) as TitleItem[];

  const events = ((eventsData ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
  })) as EventItem[];

  const publishers = ((publishersData ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
  })) as PublisherItem[];

  const characters = ((charactersData ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    alias: row.alias ? String(row.alias) : null,
    status: row.status ? String(row.status) : null,
    affiliation: row.affiliation ? String(row.affiliation) : null,
    lore_markdown: row.lore_markdown ? String(row.lore_markdown) : null,
    avatar_url: row.avatar_url ? String(row.avatar_url) : null,
  })) as CharacterItem[];

  const issueMetaRows = (issueMetaData ?? []) as IssueMeta[];
  const countsByTitle = new Map<string, number>();
  const volumesByTitle = new Map<string, string[]>();

  for (const meta of issueMetaRows) {
    countsByTitle.set(meta.title_id, (countsByTitle.get(meta.title_id) ?? 0) + 1);

    const bucket = volumesByTitle.get(meta.title_id) ?? [];
    const volumeKey = meta.volume ?? NO_VOLUME;
    if (!bucket.includes(volumeKey)) {
      bucket.push(volumeKey);
      volumesByTitle.set(meta.title_id, bucket);
    }
  }

  const selectedTitleId =
    params.title && titles.some((title) => title.id === params.title) ? params.title : titles[0]?.id;
  const selectedTitle = titles.find((title) => title.id === selectedTitleId) ?? null;
  const volumes = selectedTitleId
    ? [...(volumesByTitle.get(selectedTitleId) ?? [])].sort((left, right) => {
        if (left === NO_VOLUME) {
          return 1;
        }

        if (right === NO_VOLUME) {
          return -1;
        }

        const leftNumber = Number(left);
        const rightNumber = Number(right);

        if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
          return leftNumber - rightNumber;
        }

        return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
      })
    : [];
  const selectedVolume = params.volume && volumes.includes(params.volume) ? params.volume : volumes[0];

  let issues: IssueItem[] = [];
  if (selectedTitleId && selectedVolume) {
    let query = supabaseAdmin
      .from("issues")
      .select("id,issue_number,volume,summary,reading_status,cover_url,event_links:event_issues(reading_order,event:events(id,name))")
      .eq("title_id", selectedTitleId)
      .order("issue_number", { ascending: true });

    query = selectedVolume === NO_VOLUME ? query.is("volume", null) : query.eq("volume", selectedVolume);

    const { data, error } = await query;
    if (!error) {
      const issueRows = (data ?? []) as Record<string, unknown>[];
      issues = issueRows.map((row) => {
        const eventLinksNode = Array.isArray(row.event_links) ? row.event_links : [];

        return {
          id: String(row.id),
          issue_number: String(row.issue_number),
          volume: row.volume ? String(row.volume) : null,
          summary: row.summary ? String(row.summary) : null,
          reading_status: String(row.reading_status),
          cover_url: row.cover_url ? String(row.cover_url) : null,
          event_links: eventLinksNode
            .map((link: Record<string, unknown>) => {
              const eventNode = Array.isArray(link.event) ? link.event[0] : link.event;
              if (!eventNode || typeof eventNode !== "object") {
                return null;
              }

              const node = eventNode as Record<string, unknown>;
              if (!node.id || !node.name) {
                return null;
              }

              return {
                reading_order: Number(link.reading_order ?? 0),
                event: {
                  id: String(node.id),
                  name: String(node.name),
                },
              };
            })
            .filter(Boolean) as IssueItem["event_links"],
        };
      });
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_black]">
        <p className="inline-block bg-pop-cyan px-2 py-1 text-xs font-display tracking-widest text-white">Title Explorer</p>
        <h1 className="mt-3 font-display text-4xl text-ink-black">Browse a Run by Title and Volume</h1>
        <p className="mt-2 max-w-3xl text-base leading-6 text-slate-700">
          Use the selectors below to narrow the library, then handle issue edits and notes from the wider card view.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_black]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-display uppercase tracking-widest text-slate-600">Title Filter</p>
              <h2 className="mt-2 font-display text-2xl text-ink-black">Jump to a Series</h2>
            </div>
            <p className="bg-black px-2 py-1 font-display text-xs text-white">{titles.length} TITLES</p>
          </div>

          <div className="mt-4">
            <TitleFilterCombobox
              key={selectedTitleId ?? "default-title-filter"}
              selectedTitleId={selectedTitleId}
              titles={titles.map((title) => ({
                id: title.id,
                name: title.name,
                publisher: title.publisher,
                issueCount: countsByTitle.get(title.id) ?? 0,
              }))}
            />
          </div>

          {selectedTitle ? (
            <div className="mt-4 grid gap-3 border-2 border-black bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <p className="text-[10px] font-display uppercase tracking-[0.18em] text-slate-500">Current Selection</p>
                <p className="mt-1 font-display text-2xl leading-tight text-ink-black">{selectedTitle.name}</p>
                <p className="mt-1 text-sm text-slate-600">{selectedTitle.publisher ?? "Publisher not set"}</p>
              </div>
              <div className="flex flex-wrap items-end gap-2 md:justify-end">
                <p className="border-2 border-black bg-white px-3 py-2 font-display text-xs text-ink-black shadow-[2px_2px_0px_0px_black]">
                  {countsByTitle.get(selectedTitle.id) ?? 0} ISSUES
                </p>
                <p className="border-2 border-black bg-pop-cyan px-3 py-2 font-display text-xs text-white shadow-[2px_2px_0px_0px_black]">
                  {volumes.length} VOLUMES
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_black]">
          <p className="text-xs font-display uppercase tracking-widest text-slate-600">Volumes</p>
          {!selectedTitle ? (
            <p className="mt-3 text-sm text-slate-500">No title selected yet.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {volumes.length === 0 && <li className="text-sm text-slate-500">No volumes added yet.</li>}
              {volumes.map((volume) => {
                const active = volume === selectedVolume;
                const label = volume === NO_VOLUME ? "None" : volume;

                return (
                  <li key={volume}>
                    <Link
                      href={{ pathname: "/titles", query: { title: selectedTitle.id, volume } }}
                      className={`block min-w-12 border-2 border-black px-3 py-2 text-center font-display text-sm ${
                        active ? "bg-pop-yellow text-ink-black" : "bg-white text-slate-700 hover:bg-pop-yellow/20"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_black]">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="text-xs font-display uppercase tracking-widest text-slate-600">Issues</p>
          {selectedTitle && (
            <p className="bg-black px-2 py-1 font-display text-xs text-white">
              {selectedTitle.name} - {selectedVolume === NO_VOLUME ? "No Volume" : selectedVolume}
            </p>
          )}
        </div>

        {!selectedTitle ? (
          <p className="mt-4 text-sm text-slate-500">Choose a title to inspect the issues in that run.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {issues.map((issue, index) => {
              const eventLink = issue.event_links?.[0];

              return (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  titleName={selectedTitle.name}
                  eventLink={eventLink}
                  modalIssue={{
                    id: issue.id,
                    issue_number: issue.issue_number,
                    volume: issue.volume,
                    summary: issue.summary,
                    reading_status: issue.reading_status,
                    cover_url: issue.cover_url,
                    publisherId:
                      publishers.find((publisher) => publisher.name === (selectedTitle.publisher ?? ""))?.id ?? "",
                    publisherName: selectedTitle.publisher ?? "",
                    titleId: selectedTitle.id,
                    titleName: selectedTitle.name,
                    eventId: eventLink?.event?.id,
                    readingOrder: eventLink?.reading_order,
                  }}
                  titles={titles.map((title) => ({ id: title.id, name: title.name }))}
                  events={events}
                  publishers={publishers}
                  characters={characters}
                  emptyText="Open full edit to add notes and @character mentions."
                  priority={index < 3}
                />
              );
            })}
            {issues.length === 0 && <p className="text-sm text-slate-500">No issues exist for this volume yet.</p>}
          </div>
        )}
      </section>
    </main>
  );
}
