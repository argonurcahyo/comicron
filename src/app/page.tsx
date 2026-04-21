import { ClockArrowUp, AlertCircle, Database, PlusCircle, BookOpen } from "lucide-react";
import Image from "next/image";

import { CreateIssueForm } from "@/components/create-issue-form";
import { EditIssueModal } from "@/components/edit-issue-modal";
import { IssueSummaryPreview } from "@/components/issue-summary-preview";
import {
  comicCollectionCardClass,
  comicEmptyStateClass,
  comicInsetCardClass,
} from "@/components/ui/comic-card-styles";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

// Shadcn UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

type TitleItem = { id: string; name: string };
type EventItem = { id: string; name: string };
type PublisherItem = { id: string; name: string };
type CharacterItem = { id: string; name: string; alias: string | null };

type IssueItem = {
  id: string;
  issue_number: string;
  volume: string | null;
  summary: string | null;
  reading_status: string;
  cover_url: string | null;
  created_at: string;
  title: { id: string; name: string; publisher: string | null } | null;
  event_links: { reading_order: number; event: { id: string; name: string } | null }[] | null;
};

type IssueRow = {
  id: string;
  issue_number: string;
  volume: string | null;
  summary: string | null;
  reading_status: string;
  cover_url: string | null;
  created_at: string;
  title: IssueItem["title"] | IssueItem["title"][];
  event_links:
    | { reading_order: number; event: { id: string; name: string } | { id: string; name: string }[] | null }[]
    | null;
};

export default async function DashboardPage() {
  if (!isSupabaseConfigured) {
    return (
      <main className="container max-w-4xl py-10">
        <Alert variant="destructive" className="border-amber-500 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4 stroke-amber-600" />
          <AlertTitle className="font-bold uppercase tracking-wider">Supabase Not Configured</AlertTitle>
          <AlertDescription>
            Please set your environment variables in <code className="font-mono text-xs">.env.local</code> and restart the server.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  let titlesData, eventsData, publishersData, charactersData, issuesData, dbError = null;

  try {
    const [t, e, p, c, i] = await Promise.all([
      supabaseAdmin.from("titles").select("id,name").order("name", { ascending: true }),
      supabaseAdmin.from("events").select("id,name").order("start_date", { ascending: true }),
      supabaseAdmin.from("publishers").select("id,name").order("name", { ascending: true }),
      supabaseAdmin.from("characters").select("id,name,alias").order("name", { ascending: true }),
      supabaseAdmin.from("issues").select("id,issue_number,volume,summary,reading_status,cover_url,created_at,title:titles(id,name,publisher),event_links:event_issues(reading_order,event:events(id,name))").order("created_at", { ascending: false }).limit(24),
    ]);

    if (t.error || e.error || p.error || c.error || i.error) dbError = t.error?.message || e.error?.message || p.error?.message || c.error?.message || i.error?.message;
    titlesData = t.data; eventsData = e.data; publishersData = p.data; charactersData = c.data; issuesData = i.data;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Failed to connect to Supabase";
  }

  if (dbError) {
    return (
      <main className="container max-w-4xl py-10">
        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="font-mono text-xs opacity-80">{dbError}</p>
            <p className="mt-2 text-xs">Ensure your SQL schema is applied and the project isn&apos;t paused.</p>
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const titles = (titlesData ?? []) as TitleItem[];
  const events = (eventsData ?? []) as EventItem[];
  const publishers = (publishersData ?? []) as PublisherItem[];
  const characters = (charactersData ?? []) as CharacterItem[];
  const issueRows = (issuesData ?? []) as IssueRow[];
  const issues: IssueItem[] = issueRows.map((row) => ({
    ...row,
    title: Array.isArray(row.title) ? row.title[0] : row.title,
    event_links: (row.event_links ?? []).map((link) => ({
      reading_order: link.reading_order,
      event: Array.isArray(link.event) ? link.event[0] : link.event,
    })),
  }));

  return (
    <main className="container mx-auto flex max-w-7xl flex-col gap-8 py-8 px-4 md:px-6">
      {/* Header Section */}
      <section className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-1 space-y-2">
          <Badge variant="outline" className="border-[#d9c8a5] bg-[#fff7e8] text-[#c44536] hover:bg-[#fff7e8]">
            Library Dashboard
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">
            Track Runs, Events, and Character Callouts
          </h1>
          <p className="text-muted-foreground">
            A cleaner control room for single issues, crossover sequencing, and quick editorial notes.
          </p>
        </div>

        <Card className="lg:col-span-2 border-card-line bg-white/90 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
              <PlusCircle className="h-5 w-5 text-primary" />
              Add an Issue Fast
            </CardTitle>
            <CardDescription>Create a title on the fly, attach a cover, and place the issue inside an event order.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateIssueForm titles={titles} events={events} publishers={publishers} />
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Recent Issues Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockArrowUp className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Latest Issues</h2>
          </div>
          <span className="text-sm text-muted-foreground">{issues.length} issues on this page</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                      alt={`${issue.title?.name ?? "Unknown"} #${issue.issue_number}`}
                      className="object-cover transition-transform hover:scale-105"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={index < 4}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                      <BookOpen className="h-10 w-10 mb-2 opacity-20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">No Cover</span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="space-y-1">
                      <h3 className="font-bold leading-none text-slate-900 group-hover:text-rose-600 line-clamp-1">
                        {issue.title?.name ?? "Untitled"}
                      </h3>
                      <p className="text-xs font-medium text-muted-foreground italic">
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
                        publisherId: publishers.find((p) => p.name === issue.title?.publisher)?.id ?? "",
                        publisherName: issue.title?.publisher ?? "",
                        titleId: issue.title?.id ?? "",
                        titleName: issue.title?.name ?? "",
                        eventId: eventLink?.event?.id,
                        readingOrder: eventLink?.reading_order,
                      }}
                      titles={titles}
                      events={events}
                      publishers={publishers}
                      characters={characters}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
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
                      emptyText="Open full edit to write notes, continuity details, and @character mentions."
                      className="mt-2 max-h-24 overflow-hidden text-sm leading-6 text-slate-600 [&_p]:m-0"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {issues.length === 0 && (
          <Card className={`flex flex-col items-center justify-center p-12 text-center ${comicEmptyStateClass}`}>
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <CardTitle className="text-slate-600">No issues found</CardTitle>
            <CardDescription>Start by adding your first comic issue using the form above.</CardDescription>
          </Card>
        )}
      </section>
    </main>
  );
}