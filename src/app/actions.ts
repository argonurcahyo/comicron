"use server";

import { revalidatePath } from "next/cache";

import { coversBucket, getSupabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export async function createIssueAction(formData: FormData): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const selectedTitleId = String(formData.get("title_id") ?? "").trim();
  const newTitleName = String(formData.get("new_title_name") ?? "").trim();
  const issueNumber = String(formData.get("issue_number") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const readingStatus = String(formData.get("reading_status") ?? "planned").trim();
  const eventId = String(formData.get("event_id") ?? "").trim();
  const readingOrderRaw = String(formData.get("reading_order") ?? "").trim();
  const coverFile = formData.get("cover_file");

  if (!issueNumber) {
    return;
  }

  let titleId = selectedTitleId;

  if (!titleId && newTitleName) {
    const { data: titleRow, error: titleError } = await supabaseAdmin
      .from("titles")
      .upsert({ name: newTitleName }, { onConflict: "name" })
      .select("id")
      .single();

    if (titleError || !titleRow) {
      throw new Error(titleError?.message ?? "Failed to create title.");
    }

    titleId = titleRow.id;
  }

  if (!titleId) {
    return;
  }

  let coverUrl: string | null = null;

  if (coverFile instanceof File && coverFile.size > 0) {
    const extension = coverFile.name.split(".").pop() ?? "jpg";
    const key = `${slugify(newTitleName || selectedTitleId || "issue")}-${Date.now()}.${extension}`;
    const storagePath = `issues/${key}`;
    const bytes = await coverFile.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(coversBucket)
      .upload(storagePath, bytes, {
        contentType: coverFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(coversBucket).getPublicUrl(storagePath);

    coverUrl = publicUrl;
  }

  const { data: issueRow, error: issueError } = await supabaseAdmin
    .from("issues")
    .insert({
      title_id: titleId,
      issue_number: issueNumber,
      summary,
      reading_status: readingStatus,
      cover_url: coverUrl,
    })
    .select("id")
    .single();

  if (issueError || !issueRow) {
    throw new Error(issueError?.message ?? "Failed to create issue.");
  }

  const readingOrder = Number(readingOrderRaw);

  if (eventId && Number.isInteger(readingOrder)) {
    const { error: eventIssueError } = await supabaseAdmin.from("event_issues").upsert(
      {
        event_id: eventId,
        issue_id: issueRow.id,
        reading_order: readingOrder,
      },
      { onConflict: "event_id,issue_id" },
    );

    if (eventIssueError) {
      throw new Error(eventIssueError.message);
    }
  }

  revalidatePath("/");
  revalidatePath("/events");
}

export async function createCharacterAction(formData: FormData): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const alias = String(formData.get("alias") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();
  const affiliation = String(formData.get("affiliation") ?? "").trim();

  if (!name) {
    return;
  }

  const { error } = await supabaseAdmin.from("characters").upsert(
    {
      name,
      alias,
      status,
      affiliation,
    },
    { onConflict: "name" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/characters");
}

export async function updateCharacterProfileAction(formData: FormData): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const characterId = String(formData.get("character_id") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();
  const affiliation = String(formData.get("affiliation") ?? "").trim();
  const loreMarkdown = String(formData.get("lore_markdown") ?? "").trim();

  if (!characterId) {
    return;
  }

  const { error } = await supabaseAdmin
    .from("characters")
    .update({
      status,
      affiliation,
      lore_markdown: loreMarkdown,
    })
    .eq("id", characterId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/characters");
  revalidatePath(`/characters/${characterId}`);
}

export async function createEventAction(formData: FormData): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();

  if (!name) {
    return;
  }

  const { error } = await supabaseAdmin.from("events").upsert(
    {
      name,
      description,
      start_date: startDate || null,
      end_date: endDate || null,
    },
    { onConflict: "name" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/events");
  revalidatePath("/");
}
