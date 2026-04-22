import { notFound } from "next/navigation";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

type EventDetail = {
  id: string;
  name: string;
  description: string | null;
};

type EventIssue = {
  reading_order: number;
  issue: {
    id: string;
    issue_number: string;
    reading_status: string;
    cover_url: string | null;
    title: {
      name: string;
    };
  } | null;
};

export default async function EventTimelinePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
          Supabase is not configured.
        </section>
      </main>
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { eventId } = await params;

  const { data: eventData } = await supabaseAdmin
    .from("events")
    .select("id,name,description")
    .eq("id", eventId)
    .maybeSingle();

  const event = eventData as EventDetail | null;

  if (!event) {
    notFound();
  }

  const { data: timelineData } = await supabaseAdmin
    .from("event_issues")
    .select(
      "reading_order, issue:issues(id,issue_number,reading_status,cover_url,title:titles(name))",
    )
    .eq("event_id", eventId)
    .order("reading_order", { ascending: true });

  const timeline: EventIssue[] = (timelineData ?? []).flatMap((row) => {
    const issueNode = Array.isArray(row.issue) ? row.issue[0] : row.issue;

    if (!issueNode) {
      return [];
    }

    const titleNode = Array.isArray(issueNode.title) ? issueNode.title[0] : issueNode.title;

    return [
      {
        reading_order: Number(row.reading_order ?? 0),
        issue: {
          id: String(issueNode.id),
          issue_number: String(issueNode.issue_number),
          reading_status: String(issueNode.reading_status),
          cover_url: issueNode.cover_url ? String(issueNode.cover_url) : null,
          title: {
            name: titleNode?.name ? String(titleNode.name) : "Unknown Title",
          },
        },
      },
    ];
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_black]">
        <p className="inline-block bg-pop-cyan px-2 py-1 text-xs font-display tracking-widest text-white">Event Timeline</p>
        <h1 className="mt-3 font-display text-4xl text-ink-black">{event.name}</h1>
        <p className="mt-2 max-w-3xl text-base leading-6 text-slate-700">
          {event.description || "No description yet."}
        </p>
      </section>

      <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_black]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-display uppercase tracking-widest text-slate-600">Reading Timeline</p>
            <h2 className="mt-2 font-display text-2xl text-ink-black">Ordered Issue Sequence</h2>
          </div>
          <p className="bg-black px-2 py-1 font-display text-xs text-white">{timeline.length} ENTRIES</p>
        </div>
        <div className="mt-4 space-y-3">
          {timeline.map((entry) => {
            if (!entry.issue) {
              return null;
            }

            return (
              <article
                key={`${entry.issue.id}-${entry.reading_order}`}
                className="grid grid-cols-[auto_1fr] gap-3 border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_black]"
              >
                <p className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe3ae] text-sm font-black text-slate-950">
                  {entry.reading_order}
                </p>
                <div>
                  <p className="font-display text-xl text-ink-black">
                    {entry.issue.title.name} #{entry.issue.issue_number}
                  </p>
                  <p className="mt-1 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                    Status: {entry.issue.reading_status}
                  </p>
                </div>
              </article>
            );
          })}
          {timeline.length === 0 && (
            <p className="text-sm text-slate-500">
              No issues are linked to this event yet. Add them from the dashboard.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
