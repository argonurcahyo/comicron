import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { createEventAction } from "@/app/actions";
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
      <section className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_black] p-6">
        <p className="inline-block bg-pop-cyan px-2 py-1 text-xs font-display tracking-widest text-white">Event Planner</p>
        <h1 className="mt-3 font-display text-4xl text-ink-black">
          Organize Crossovers with a Clear Reading Order
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-6 text-slate-700">
          Build event timelines that cut across titles, then use the detail page to see the order at a glance.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
        <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_black]">
          <p className="text-xs font-display uppercase tracking-widest text-slate-600">Create Event</p>
          <h2 className="mt-2 font-display text-2xl text-ink-black">Add a New Crossover Arc</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
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
            className="inline-flex items-center justify-center gap-2 border-2 border-black bg-pop-yellow px-4 py-2 font-display text-sm text-black shadow-[2px_2px_0px_0px_black] transition active:translate-y-0.5 active:shadow-none md:col-span-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Event
          </button>
          </form>
        </section>

        <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_black]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-display uppercase tracking-widest text-slate-600">Event Library</p>
              <h2 className="mt-2 font-display text-2xl text-ink-black">Current Crossover Map</h2>
            </div>
            <p className="bg-black px-2 py-1 font-display text-xs text-white">{events.length} EVENTS</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_black] transition hover:-translate-y-0.5 hover:bg-pop-yellow/20"
              >
                <p className="font-display text-xl text-ink-black">{event.name}</p>
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
