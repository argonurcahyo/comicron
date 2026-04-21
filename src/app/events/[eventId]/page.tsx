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
          Supabase belum dikonfigurasi.
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
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
          {event.name}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{event.description || "Tanpa deskripsi."}</p>
      </section>

      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
          Timeline baca
        </h2>
        <div className="mt-4 space-y-3">
          {timeline.map((entry) => {
            if (!entry.issue) {
              return null;
            }

            return (
              <article
                key={`${entry.issue.id}-${entry.reading_order}`}
                className="grid grid-cols-[auto_1fr] gap-3 rounded-xl border border-slate-300 bg-slate-50 p-3"
              >
                <p className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
                  {entry.reading_order}
                </p>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {entry.issue.title.name} #{entry.issue.issue_number}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Status: {entry.issue.reading_status}
                  </p>
                </div>
              </article>
            );
          })}
          {timeline.length === 0 && (
            <p className="text-sm text-slate-500">
              Belum ada issue untuk event ini. Tambahkan melalui dashboard.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
