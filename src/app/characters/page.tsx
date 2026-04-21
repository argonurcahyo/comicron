import Link from "next/link";
import { UserRoundPlus } from "lucide-react";

import { createCharacterAction } from "@/app/actions";
import {
  comicCollectionCardClass,
  comicPanelClass,
  comicSectionCardClass,
} from "@/components/ui/comic-card-styles";
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
          Supabase is not configured.
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
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className={`${comicPanelClass} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Character Desk</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">Build a Shared Character Reference</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Keep alias, status, affiliations, and long-form lore organized so issue notes can reference the cast cleanly.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
        <section className={`${comicSectionCardClass} p-5`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Create Character</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Add a Profile Stub</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start with the essentials here, then open the profile page for detailed lore and history.
          </p>

          <form action={createCharacterAction} className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Character name"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <input
            name="alias"
            placeholder="Alias"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <input
            name="status"
            placeholder="Status (active, missing, deceased, etc.)"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <input
            name="affiliation"
            placeholder="Affiliation"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 md:col-span-2"
          >
            <UserRoundPlus className="h-4 w-4" />
            Save Basic Profile
          </button>
          </form>
        </section>

        <section className={`${comicSectionCardClass} p-5`}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Character Directory</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Cast Index</h2>
            </div>
            <p className="text-sm text-slate-500">{characters.length} profiles</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {characters.map((character) => (
              <Link
                key={character.id}
                href={`/characters/${character.id}`}
                className={`p-4 ${comicCollectionCardClass}`}
              >
                <p className="text-base font-bold text-slate-950">{character.name}</p>
                <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                  <p>Alias: {character.alias || "-"}</p>
                  <p>Status: {character.status || "-"}</p>
                  <p>Affiliation: {character.affiliation || "-"}</p>
                </div>
              </Link>
            ))}
            {characters.length === 0 && (
              <p className="text-sm text-slate-500">No characters have been added yet.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
