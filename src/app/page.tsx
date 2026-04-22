import type { Metadata } from "next";
import { AlertCircle, Database, PlusCircle, BookOpen, Newspaper } from "lucide-react";
import { CreateIssueForm } from "@/components/create-issue-form";
import { IssueCard } from "@/components/issue-card";
import {
  comicEmptyStateClass,
} from "@/components/ui/comic-card-styles";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

// Shadcn UI components
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

type IssueRow = Omit<IssueItem, "title" | "event_links"> & {
  title: IssueItem["title"] | IssueItem["title"][];
  event_links:
    | {
        reading_order: number;
        event: { id: string; name: string } | { id: string; name: string }[] | null;
      }[]
    | null;
};

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track recent issues, reading status, and crossover activity from the Comicron dashboard.",
};

export default async function DashboardPage() {
  if (!isSupabaseConfigured) {
    return (
      <main className="container max-w-4xl py-10">
        <Alert variant="destructive" className="border-4 border-black bg-pop-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
          <AlertCircle className="h-6 w-6" />
          <AlertTitle className="font-display text-xl uppercase tracking-tight">System Failure!</AlertTitle>
          <AlertDescription className="font-medium">
            Supabase is not configured. Check your <code className="bg-black text-white px-1">.env.local</code>.
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
        <Alert variant="destructive" className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Database className="h-5 w-5" />
          <AlertTitle className="font-display">Database Error</AlertTitle>
          <AlertDescription className="mt-2 font-mono text-xs">{dbError}</AlertDescription>
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
    <main className="container mx-auto flex max-w-7xl flex-col gap-10 py-10 px-4 md:px-6">
      
      {/* Hero Section */}
      <section className="grid gap-8 lg:grid-cols-3 lg:items-center">
        <div className="lg:col-span-1 space-y-4">
          <div className="inline-block bg-pop-cyan text-white border-2 border-black px-3 py-1 -rotate-2 shadow-[3px_3px_0px_0px_black]">
            <span className="font-display text-xs uppercase tracking-widest">Control Center</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.9] text-ink-black uppercase">
            Track <span className="text-primary italic">The Run.</span>
          </h1>
          <p className="text-lg font-medium text-slate-600 leading-snug">
            Sequencing crossover events and logging character beats since issue #1.
          </p>
        </div>

        <Card className="lg:col-span-2 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="bg-pop-yellow border-b-4 border-black px-4 py-2 flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            <span className="font-display text-sm uppercase tracking-tight">Direct Edition: Add New Entry</span>
          </div>
          <CardContent className="pt-6">
            <CreateIssueForm titles={titles} events={events} publishers={publishers} />
          </CardContent>
        </Card>
      </section>

      <Separator className="h-1 bg-black" />

      {/* Issues Grid */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl uppercase">Latest Dispatch</h2>
          </div>
          <Badge className="bg-black text-white rounded-none font-display">
            {issues.length} ISSUES
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {issues.map((issue, index) => {
            const eventLink = issue.event_links?.[0];

            return (
              <IssueCard
                key={issue.id} 
                issue={issue}
                titleName={issue.title?.name ?? "Untitled"}
                eventLink={eventLink}
                modalIssue={{
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
                emptyText="Click edit to add continuity notes..."
                priority={index < 4}
              />
            );
          })}
        </div>

        {issues.length === 0 && (
          <Card className={cn("flex flex-col items-center justify-center p-16 text-center border-4 border-dashed border-slate-300", comicEmptyStateClass)}>
            <div className="rounded-full bg-slate-100 p-6 mb-4 animate-bounce">
              <BookOpen className="h-12 w-12 text-slate-400" />
            </div>
            <CardTitle className="font-display text-2xl text-slate-400">The Vault is Empty!</CardTitle>
            <CardDescription className="font-medium">No issues detected in the sector. Use the form above to add one.</CardDescription>
          </Card>
        )}
      </section>
    </main>
  );
}