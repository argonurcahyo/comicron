"use client";

import { Save, SaveOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SaveState = "idle" | "saving" | "saved" | "error";

type NoteEditorProps = {
  issueId: string;
  initialSummary: string;
};

export function NoteEditor({ issueId, initialSummary }: NoteEditorProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveState("saving");

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/issues/${issueId}/notes`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ summary }),
        });

        if (!response.ok) {
          setSaveState("error");
          return;
        }

        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [summary, issueId]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
        <span>Catatan Ringkas</span>
        <span className="flex items-center gap-1">
          {saveState === "saving" || saveState === "saved" ? (
            <Save className="h-3.5 w-3.5" />
          ) : (
            <SaveOff className="h-3.5 w-3.5" />
          )}
          {saveState === "saving" && "Menyimpan..."}
          {saveState === "saved" && "Tersimpan"}
          {saveState === "error" && "Gagal"}
          {saveState === "idle" && "Belum diubah"}
        </span>
      </div>
      <textarea
        name="summary"
        rows={4}
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-rose-500"
        placeholder="Tambahkan ringkasan kecil issue ini..."
      />
    </div>
  );
}
