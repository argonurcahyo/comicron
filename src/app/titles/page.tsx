import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";

import { EditIssueModal } from "@/components/edit-issue-modal";
import { IssueSummaryPreview } from "@/components/issue-summary-preview";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  comicCollectionCardClass,
  comicInsetCardClass,
  comicPanelClass,
  comicSectionCardClass,
} from "@/components/ui/comic-card-styles";
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
    supabaseAdmin.from("characters").select("id,name,alias").order("name", { ascending: true }),
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

  const selectedTitleId = params.title && titles.some((title) => title.id === params.title) ? params.title : titles[0]?.id;
  const selectedTitle = titles.find((title) => title.id === selectedTitleId) ?? null;
  const volumes = selectedTitleId ? (volumesByTitle.get(selectedTitleId) ?? []) : [];
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
      <section className={`${comicPanelClass} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Title Explorer</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">Browse a Run by Title and Volume</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Use the selectors below to narrow the library, then handle issue edits and notes from the wider card view.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr]">
        <div className={`${comicSectionCardClass} p-4`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">All Titles</p>
          <ul className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {titles.map((title) => {
              const active = title.id === selectedTitleId;
              return (
                <li key={title.id}>
                  <Link
                    href={{ pathname: "/titles", query: { title: title.id } }}
                    className={`block rounded-2xl border px-3 py-3 ${
                      active
                        ? "border-primary bg-[#fff4e6] text-slate-950"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-semibold">{title.name}</p>
                    <p className="text-xs text-slate-500">{title.publisher ?? "Publisher not set"}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                      {countsByTitle.get(title.id) ?? 0} issues
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={`${comicSectionCardClass} p-4`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Volumes</p>
          {!selectedTitle ? (
            <p className="mt-3 text-sm text-slate-500">No title selected yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {volumes.length === 0 && <li className="text-sm text-slate-500">No volumes added yet.</li>}
              {volumes.map((volume) => {
                const active = volume === selectedVolume;
                const label = volume === NO_VOLUME ? "No Volume" : volume;

                return (
                  <li key={volume}>
                    <Link
                      href={{ pathname: "/titles", query: { title: selectedTitle.id, volume } }}
                      className={`block rounded-xl border px-3 py-2.5 text-sm ${
                        active
                          ? "border-primary bg-[#fff4e6] text-slate-950"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
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

      <section className={`${comicPanelClass} p-5`}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Issues</p>
          {selectedTitle && (
            <p className="text-sm font-semibold text-slate-700">
              {selectedTitle.name} · {selectedVolume === NO_VOLUME ? "No Volume" : selectedVolume}
            </p>
          )}
        </div>

        {!selectedTitle ? (
          <p className="mt-4 text-sm text-slate-500">Choose a title to inspect the issues in that run.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {issues.map((issue, index) => {
              const eventLink = issue.event_links?.[0];
              const statusColor =
                issue.reading_status === "completed"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : issue.reading_status === "reading"
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : issue.reading_status === "dropped"
                      ? "bg-rose-100 text-rose-700 border-rose-200"
                      : "bg-slate-100 text-slate-700 border-slate-200";

              return (
                <Card key={issue.id} className={`flex h-full flex-col overflow-hidden ${comicCollectionCardClass}`}>
                  <div className="relative aspect-2/3 w-full bg-slate-100">
                    {issue.cover_url ? (
                      <Image
                        src={issue.cover_url}
                        alt={`${selectedTitle.name} #${issue.issue_number}`}
                        className="object-cover transition-transform hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        priority={index < 3}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                        <BookOpen className="mb-2 h-10 w-10 opacity-20" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">No Cover</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="flex flex-1 flex-col p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className="line-clamp-1 font-bold leading-none text-slate-900">{selectedTitle.name}</h3>
                        <p className="text-xs font-medium italic text-slate-500">
                          {issue.volume ? `Vol. ${issue.volume} ` : ""}#{issue.issue_number}
                        </p>
                      </div>
                      <EditIssueModal
                        issue={{
                          id: issue.id,
                          issue_number: issue.issue_number,
                          volume: issue.volume,
                          summary: issue.summary,
                          reading_status: issue.reading_status,
                          cover_url: issue.cover_url,
                          publisherId:
                            publishers.find((publisher) => publisher.name === (selectedTitle.publisher ?? ""))?.id ??
                            "",
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
                      />
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className={`text-[10px] uppercase font-bold tracking-tight ${statusColor}`}>
                        {issue.reading_status}
                      </Badge>
                      {eventLink?.event && (
                        <Badge variant="outline" className="text-[10px] border-rose-200 text-rose-700">
                          {eventLink.event.name.split(":")[0]} #{eventLink.reading_order}
                        </Badge>
                      )}
                    </div>

                    <div className={`mt-auto p-3 ${comicInsetCardClass}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Issue Notes</p>
                      <IssueSummaryPreview
                        summary={issue.summary}
                        characters={characters}
                        emptyText="Open full edit to add notes and @character mentions."
                        className="mt-2 max-h-24 overflow-hidden text-sm leading-6 text-slate-600 [&_p]:m-0"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {issues.length === 0 && <p className="text-sm text-slate-500">No issues exist for this volume yet.</p>}
          </div>
        )}
      </section>
    </main>
  );
}
