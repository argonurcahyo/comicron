import { notFound } from "next/navigation";

import { updateCharacterProfileAction } from "@/app/actions";
import { MarkdownEditor } from "@/components/markdown-editor";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

type CharacterDetail = {
  id: string;
  name: string;
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
          Supabase belum dikonfigurasi.
        </section>
      </main>
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { characterId } = await params;

  const { data } = await supabaseAdmin
    .from("characters")
    .select("id,name,status,affiliation,lore_markdown")
    .eq("id", characterId)
    .maybeSingle();

  const character = data as CharacterDetail | null;

  if (!character) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
          {character.name}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Lengkapi status dan lore untuk membangun profil karakter versi Anda.
        </p>

        <form action={updateCharacterProfileAction} className="mt-4 space-y-4">
          <input type="hidden" name="character_id" value={character.id} />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Status
              <input
                name="status"
                defaultValue={character.status ?? ""}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Afiliasi
              <input
                name="affiliation"
                defaultValue={character.affiliation ?? ""}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <MarkdownEditor
            name="lore_markdown"
            initialValue={character.lore_markdown ?? ""}
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Update Profil
          </button>
        </form>
      </section>
    </main>
  );
}
