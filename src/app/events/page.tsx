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
          Supabase belum dikonfigurasi.
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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
          Crossover Events
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Kelola event besar dan susun urutan baca lintas judul.
        </p>

        <form action={createEventAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Nama event"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="description"
            placeholder="Deskripsi singkat"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="start_date"
            type="date"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="end_date"
            type="date"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black md:col-span-2"
          >
            <PlusCircle className="h-4 w-4" />
            Tambahkan Event
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
          Event terdaftar
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="rounded-xl border border-slate-300 bg-slate-50 p-4 transition hover:border-rose-500"
            >
              <p className="text-base font-bold text-slate-900">{event.name}</p>
              <p className="text-xs text-slate-600">{event.description || "Tanpa deskripsi"}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {formatDate(event.start_date)} - {formatDate(event.end_date)}
              </p>
            </Link>
          ))}
          {events.length === 0 && <p className="text-sm text-slate-500">Belum ada event.</p>}
        </div>
      </section>
    </main>
  );
}
