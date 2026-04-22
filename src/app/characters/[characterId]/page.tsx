import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { deleteCharacterAction, updateCharacterProfileAction } from "@/app/actions";
import { MarkdownEditor } from "@/components/markdown-editor";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

type CharacterDetail = {
  id: string;
  name: string;
  alias: string | null;
  status: string | null;
  affiliation: string | null;
  lore_markdown: string | null;
  avatar_url: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ characterId: string }>;
}): Promise<Metadata> {
  if (!isSupabaseConfigured) {
    return {
      title: "Character Profile",
      description: "View and edit a character profile.",
    };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { characterId } = await params;
  const { data } = await supabaseAdmin
    .from("characters")
    .select("name,alias,affiliation")
    .eq("id", characterId)
    .maybeSingle();

  const label = data?.alias ? String(data.alias) : data?.name ? String(data.name) : "Character Profile";

  return {
    title: label,
    description: data?.affiliation
      ? `${label} profile and continuity notes for ${String(data.affiliation)}.`
      : `Profile and continuity notes for ${label}.`,
  };
}

export default async function CharacterProfilePage({
  params,
}: {
  params: Promise<{ characterId: string }>;
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
  const { characterId } = await params;

  const { data } = await supabaseAdmin
    .from("characters")
    .select("id,name,alias,status,affiliation,lore_markdown,avatar_url")
    .eq("id", characterId)
    .maybeSingle();

  const character = data as CharacterDetail | null;

  if (!character) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_black]">
        <p className="inline-block bg-pop-cyan px-2 py-1 text-xs font-display tracking-widest text-white">Character Profile</p>
        <h1 className="mt-3 font-display text-4xl text-ink-black">{character.name}</h1>
        <p className="mt-2 max-w-3xl text-base leading-6 text-slate-700">
          Update status, affiliation, and long-form lore for this character profile.
        </p>
      </section>

      <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_black]">
        <form action={updateCharacterProfileAction} className="space-y-5">
          <input type="hidden" name="character_id" value={character.id} />

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm text-slate-700 sm:col-span-3">
              Name
              <input
                name="name"
                required
                defaultValue={character.name}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Alias
              <input
                name="alias"
                defaultValue={character.alias ?? ""}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Status
              <input
                name="status"
                defaultValue={character.status ?? ""}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Affiliation
              <input
                name="affiliation"
                defaultValue={character.affiliation ?? ""}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700 sm:col-span-3">
              Avatar URL
              <input
                name="avatar_url"
                type="url"
                defaultValue={character.avatar_url ?? ""}
                placeholder="https://..."
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>

          <MarkdownEditor
            name="lore_markdown"
            initialValue={character.lore_markdown ?? ""}
          />

          <div className="flex flex-wrap items-center gap-3">
            <FormSubmitButton idleLabel="Update Profile" pendingLabel="Updating Profile..." />
          </div>
        </form>

        <form action={deleteCharacterAction} className="mt-4 border-t-2 border-black pt-4">
          <input type="hidden" name="character_id" value={character.id} />
          <FormSubmitButton
            idleLabel="Delete Character"
            pendingLabel="Deleting..."
            className="bg-pop-red text-white"
          />
        </form>
      </section>
    </main>
  );
}
