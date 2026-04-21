import { BookPlus, ClockArrowUp } from "lucide-react";
import Image from "next/image";

import { createIssueAction } from "@/app/actions";
import { NoteEditor } from "@/components/note-editor";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

type TitleItem = {
  id: string;
  name: string;
};

type EventItem = {
  id: string;
  name: string;
};

type IssueItem = {
  id: string;
  issue_number: string;
  summary: string | null;
  reading_status: string;
  cover_url: string | null;
  created_at: string;
  title: {
    name: string;
  } | null;
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

export default async function DashboardPage() {
  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
          <h1 className="text-xl font-black uppercase tracking-tight">Supabase Belum Terkonfigurasi</h1>
          <p className="mt-2 text-sm">
            Isi environment variable di .env.local lalu jalankan ulang aplikasi.
          </p>
        </section>
      </main>
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  const [{ data: titlesData }, { data: eventsData }, { data: issuesData }] = await Promise.all([
    supabaseAdmin.from("titles").select("id,name").order("name", { ascending: true }),
    supabaseAdmin.from("events").select("id,name").order("start_date", { ascending: true }),
    supabaseAdmin
      .from("issues")
      .select(
        "id,issue_number,summary,reading_status,cover_url,created_at,title:titles(name),event_links:event_issues(reading_order,event:events(id,name))",
      )
      .order("created_at", { ascending: false })
      .limit(24),
  ]);

  const titles = (titlesData ?? []) as TitleItem[];
  const events = (eventsData ?? []) as EventItem[];
  const issues: IssueItem[] = (issuesData ?? []).map((row) => {
    const titleNode = Array.isArray(row.title) ? row.title[0] : row.title;
    const eventLinksNode = Array.isArray(row.event_links) ? row.event_links : [];

    return {
      id: String(row.id),
      issue_number: String(row.issue_number),
      summary: row.summary ? String(row.summary) : null,
      reading_status: String(row.reading_status),
      cover_url: row.cover_url ? String(row.cover_url) : null,
      created_at: String(row.created_at),
      title: titleNode?.name
        ? {
            name: String(titleNode.name),
          }
        : null,
      event_links: eventLinksNode
        .map((link) => {
          const eventNode = Array.isArray(link.event) ? link.event[0] : link.event;

          if (!eventNode?.id || !eventNode?.name) {
            return null;
          }

          return {
            reading_order: Number(link.reading_order ?? 0),
            event: {
              id: String(eventNode.id),
              name: String(eventNode.name),
            },
          };
        })
        .filter(Boolean) as IssueItem["event_links"],
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="grid gap-4 rounded-2xl border border-card-line bg-card p-5 shadow-sm lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
            Dashboard Input Manual
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl">
            Comic Book Tracker
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Tambahkan issue, upload cover ke Supabase Storage, dan langsung masukkan ke urutan event crossover.
          </p>
        </div>

        <form action={createIssueAction} className="grid gap-3">
          <select name="title_id" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">Pilih title yang sudah ada</option>
            {titles.map((title) => (
              <option key={title.id} value={title.id}>
                {title.name}
              </option>
            ))}
          </select>
          <input
            name="new_title_name"
            placeholder="Atau buat title baru (contoh: Superior Spider-Man)"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="issue_number"
              required
              placeholder="Nomor issue (contoh: 15)"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              name="reading_status"
              defaultValue="planned"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="planned">Planned</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select name="event_id" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
              <option value="">Tanpa event crossover</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
            <input
              name="reading_order"
              type="number"
              min={1}
              placeholder="Urutan baca (opsional)"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <input
            name="cover_file"
            type="file"
            accept="image/*"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <textarea
            name="summary"
            rows={3}
            placeholder="Catatan awal issue..."
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <BookPlus className="h-4 w-4" />
            Tambah Issue
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-card-line bg-card p-5 shadow-sm">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          <ClockArrowUp className="h-4 w-4" />
          Recent Issues
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {issues.map((issue) => {
            const eventLink = issue.event_links?.[0];

            return (
              <article key={issue.id} className="space-y-3 rounded-xl border border-slate-300 bg-white p-4">
                {issue.cover_url ? (
                  <Image
                    src={issue.cover_url}
                    alt={`${issue.title?.name ?? "Unknown"} #${issue.issue_number}`}
                    className="h-44 w-full rounded-lg object-cover"
                    width={420}
                    height={280}
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs uppercase tracking-[0.15em] text-slate-400">
                    No Cover
                  </div>
                )}

                <div>
                  <p className="text-base font-bold text-slate-900">
                    {issue.title?.name ?? "Untitled"} #{issue.issue_number}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Status: {issue.reading_status}
                  </p>
                  {eventLink?.event && (
                    <p className="mt-1 text-xs text-rose-700">
                      Event: {eventLink.event.name} (#{eventLink.reading_order})
                    </p>
                  )}
                </div>

                <NoteEditor issueId={issue.id} initialSummary={issue.summary ?? ""} />
              </article>
            );
          })}
          {issues.length === 0 && (
            <p className="text-sm text-slate-500">Belum ada issue. Tambahkan dari form di atas.</p>
          )}
        </div>
      </section>
    </main>
  );
}
