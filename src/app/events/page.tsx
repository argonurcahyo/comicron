import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { createEventAction } from "@/app/actions";
import {
  comicCollectionCardClass,
  comicPanelClass,
  comicSectionCardClass,
} from "@/components/ui/comic-card-styles";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

type EventItem = {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
};

export default async function EventsPage() {
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
  const { data } = await supabaseAdmin
    .from("events")
    .select("id,name,description,start_date,end_date")
    .order("start_date", { ascending: true, nullsFirst: false });

  const events = (data ?? []) as EventItem[];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className={`${comicPanelClass} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Event Planner</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">
          Organize Crossovers with a Clear Reading Order
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Build event timelines that cut across titles, then use the detail page to see the order at a glance.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
        <section className={`${comicSectionCardClass} p-5`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Create Event</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Add a New Crossover Arc</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Capture the umbrella event first, then assign issues and reading order from the dashboard.
          </p>

          <form action={createEventAction} className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Event name"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <input
            name="description"
            placeholder="Short description"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <input
            name="start_date"
            type="date"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <input
            name="end_date"
            type="date"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 md:col-span-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Event
          </button>
          </form>
        </section>

        <section className={`${comicSectionCardClass} p-5`}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Event Library</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Current Crossover Map</h2>
            </div>
            <p className="text-sm text-slate-500">{events.length} events</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className={`p-4 ${comicCollectionCardClass}`}
              >
                <p className="text-base font-bold text-slate-950">{event.name}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {event.description || "No description"}
                </p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {formatDate(event.start_date)} - {formatDate(event.end_date)}
                </p>
              </Link>
            ))}
            {events.length === 0 && <p className="text-sm text-slate-500">No events have been added yet.</p>}
          </div>
        </section>
      </section>
    </main>
  );
}
