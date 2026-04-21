import { notFound } from "next/navigation";

import { updateCharacterProfileAction } from "@/app/actions";
import { MarkdownEditor } from "@/components/markdown-editor";
import { comicPanelClass } from "@/components/ui/comic-card-styles";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

type CharacterDetail = {
  id: string;
  name: string;
  alias: string | null;
  status: string | null;
  affiliation: string | null;
  lore_markdown: string | null;
};

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
    .select("id,name,alias,status,affiliation,lore_markdown")
    .eq("id", characterId)
    .maybeSingle();

  const character = data as CharacterDetail | null;

  if (!character) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className={`${comicPanelClass} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Character Profile</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">{character.name}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Update status, affiliation, and long-form lore for this character profile.
        </p>
      </section>

      <section className={`${comicPanelClass} p-5`}>
        <form action={updateCharacterProfileAction} className="space-y-5">
          <input type="hidden" name="character_id" value={character.id} />

          <div className="grid gap-3 sm:grid-cols-3">
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
          </div>

          <MarkdownEditor
            name="lore_markdown"
            initialValue={character.lore_markdown ?? ""}
          />

          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Update Profile
          </button>
        </form>
      </section>
    </main>
  );
}
