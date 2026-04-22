import type { Metadata } from "next";

import { createCharacterAction } from "@/app/actions";
import { CharacterCastIndex } from "@/components/character-cast-index";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

type CharacterItem = {
  id: string;
  name: string;
  alias: string | null;
  status: string | null;
  affiliation: string | null;
  lore_markdown: string | null;
  avatar_url: string | null;
};

export const metadata: Metadata = {
  title: "Characters",
  description: "Manage character profiles, aliases, and continuity notes.",
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
    .select("id,name,alias,status,affiliation,lore_markdown,avatar_url")
    .order("name", { ascending: true });

  const characters = (data ?? []) as CharacterItem[];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_black]">
        <p className="inline-block bg-pop-cyan px-2 py-1 text-xs font-display tracking-widest text-white">Character Desk</p>
        <h1 className="mt-3 font-display text-4xl text-ink-black">Build a Shared Character Reference</h1>
        <p className="mt-2 max-w-3xl text-base leading-6 text-slate-700">
          Keep alias, status, affiliations, and long-form lore organized so issue notes can reference the cast cleanly.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.55fr)] xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.7fr)]">
        <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_black]">
          <p className="text-xs font-display uppercase tracking-widest text-slate-600">Create Character</p>
          <h2 className="mt-2 font-display text-2xl text-ink-black">Add a Profile Stub</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Start with the essentials here, then open profile detail for lore and history edits.
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
          <input
            name="avatar_url"
            type="url"
            placeholder="Avatar URL (https://...)"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2"
          />
          <FormSubmitButton
            idleLabel="Save Basic Profile"
            pendingLabel="Saving Profile..."
            className="md:col-span-2"
          />
          </form>
        </section>

        <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_black] min-w-0">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-display uppercase tracking-widest text-slate-600">Character Directory</p>
              <h2 className="mt-2 font-display text-2xl text-ink-black">Cast Index</h2>
            </div>
            <p className="bg-black px-2 py-1 font-display text-xs text-white">{characters.length} PROFILES</p>
          </div>
          <CharacterCastIndex characters={characters} />
        </section>
      </section>
    </main>
  );
}
