import Link from "next/link";
import { UserRoundPlus } from "lucide-react";

import { createCharacterAction } from "@/app/actions";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

type CharacterItem = {
  id: string;
  name: string;
  alias: string | null;
  status: string | null;
  affiliation: string | null;
};

export default async function CharactersPage() {
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
    .from("characters")
    .select("id,name,alias,status,affiliation")
    .order("name", { ascending: true });

  const characters = (data ?? []) as CharacterItem[];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
          Character Profiles
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Tambahkan karakter dan simpan lore custom dalam format Markdown.
        </p>

        <form action={createCharacterAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Nama karakter"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="alias"
            placeholder="Alias"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="status"
            placeholder="Status (active, missing, dead, dll.)"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="affiliation"
            placeholder="Afiliasi"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 md:col-span-2"
          >
            <UserRoundPlus className="h-4 w-4" />
            Simpan Profil Dasar
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
          Daftar karakter
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <Link
              key={character.id}
              href={`/characters/${character.id}`}
              className="rounded-xl border border-slate-300 bg-slate-50 p-4 transition hover:border-rose-500"
            >
              <p className="text-base font-bold text-slate-900">{character.name}</p>
              <p className="text-xs text-slate-600">Alias: {character.alias || "-"}</p>
              <p className="text-xs text-slate-600">Status: {character.status || "-"}</p>
              <p className="text-xs text-slate-600">Afiliasi: {character.affiliation || "-"}</p>
            </Link>
          ))}
          {characters.length === 0 && (
            <p className="text-sm text-slate-500">Belum ada karakter.</p>
          )}
        </div>
      </section>
    </main>
  );
}
