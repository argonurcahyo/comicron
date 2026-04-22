"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canonicalizeSummaryMentions } from "@/lib/character-mentions";
import { coversBucket, getSupabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export type CreateIssueFormState = {
  error: string | null;
  success: boolean;
};

async function syncCharactersFromSummary(markdown: string): Promise<string> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: charactersData, error: charactersError } = await supabaseAdmin
    .from("characters")
    .select("id,name,alias");

  if (charactersError) {
    throw new Error(charactersError.message);
  }

  const existingCharacters = ((charactersData ?? []) as Record<string, unknown>[]).map((character) => ({
    id: String(character.id ?? ""),
    name: String(character.name ?? ""),
    alias: character.alias ? String(character.alias) : null,
  }));
  const { markdown: canonicalMarkdown, unresolvedMentions } = canonicalizeSummaryMentions(
    markdown,
    existingCharacters,
  );

  if (unresolvedMentions.length === 0) {
    return canonicalMarkdown;
  }

  const { error } = await supabaseAdmin.from("characters").upsert(
    unresolvedMentions.map((mention) => ({ name: mention.name })),
    { onConflict: "name" },
  );

  if (error) {
    throw new Error(error.message);
  }

  return canonicalMarkdown;
}

async function resolvePublisherName(
  selectedPublisherId: string,
  newPublisherName: string,
): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();

  if (selectedPublisherId) {
    const { data, error } = await supabaseAdmin
      .from("publishers")
      .select("name")
      .eq("id", selectedPublisherId)
      .single();

    if (error || !data?.name) {
      throw new Error(error?.message ?? "Publisher could not be found.");
    }

    return String(data.name);
  }

  if (newPublisherName) {
    const { data, error } = await supabaseAdmin
      .from("publishers")
      .upsert({ name: newPublisherName }, { onConflict: "name" })
      .select("name")
      .single();

    if (error || !data?.name) {
      throw new Error(error?.message ?? "Failed to create publisher.");
    }

    return String(data.name);
  }

  return null;
}

async function resolveEventId(selectedEventId: string, newEventName: string): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();

  if (selectedEventId) {
    const { data, error } = await supabaseAdmin.from("events").select("id").eq("id", selectedEventId).single();

    if (error || !data?.id) {
      throw new Error(error?.message ?? "Event could not be found.");
    }

    return String(data.id);
  }

  if (newEventName) {
    const { data, error } = await supabaseAdmin
      .from("events")
      .upsert({ name: newEventName }, { onConflict: "name" })
      .select("id")
      .single();

    if (error || !data?.id) {
      throw new Error(error?.message ?? "Failed to create event.");
    }

    return String(data.id);
  }

  return null;
}

async function getNextEventReadingOrder(eventId: string): Promise<number> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("event_issues")
    .select("reading_order")
    .eq("event_id", eventId)
    .order("reading_order", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const highest = data?.[0]?.reading_order;
  return typeof highest === "number" ? highest + 1 : 1;
}

async function syncIssueEventLink(issueId: string, eventId: string | null): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: existingLinks, error: existingLinksError } = await supabaseAdmin
    .from("event_issues")
    .select("event_id,reading_order")
    .eq("issue_id", issueId);

  if (existingLinksError) {
    throw new Error(existingLinksError.message);
  }

  const currentLink = existingLinks?.[0];

  if (!eventId) {
    if ((existingLinks?.length ?? 0) > 0) {
      const { error } = await supabaseAdmin.from("event_issues").delete().eq("issue_id", issueId);
      if (error) {
        throw new Error(error.message);
      }
    }
    return;
  }

  if (currentLink?.event_id === eventId) {
    return;
  }

  if ((existingLinks?.length ?? 0) > 0) {
    const { error } = await supabaseAdmin.from("event_issues").delete().eq("issue_id", issueId);
    if (error) {
      throw new Error(error.message);
    }
  }

  const readingOrder = await getNextEventReadingOrder(eventId);
  const { error } = await supabaseAdmin.from("event_issues").insert({
    event_id: eventId,
    issue_id: issueId,
    reading_order: readingOrder,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createIssueAction(formData: FormData): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const selectedTitleId = String(formData.get("title_id") ?? "").trim();
  const newTitleName = String(formData.get("new_title_name") ?? "").trim();
  const selectedPublisherId = String(formData.get("publisher_id") ?? "").trim();
  const newPublisherName = String(formData.get("new_publisher_name") ?? "").trim();
  const volume = String(formData.get("volume") ?? "").trim();
  const issueNumber = String(formData.get("issue_number") ?? "").trim();
  const rawSummary = String(formData.get("summary") ?? "").trim();
  const readingStatus = String(formData.get("reading_status") ?? "planned").trim();
  const selectedEventId = String(formData.get("event_id") ?? "").trim();
  const newEventName = String(formData.get("new_event_name") ?? "").trim();
  const coverFile = formData.get("cover_file");

  if (!issueNumber) {
    return;
  }

  let titleId = selectedTitleId;

  if (!titleId && newTitleName) {
    const publisher = await resolvePublisherName(selectedPublisherId, newPublisherName);
    if (!publisher) {
      throw new Error("A publisher is required when creating a new title.");
    }

    const { data: titleRow, error: titleError } = await supabaseAdmin
      .from("titles")
      .upsert({ name: newTitleName, publisher }, { onConflict: "name" })
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

  const eventId = await resolveEventId(selectedEventId, newEventName);

  const summary = await syncCharactersFromSummary(rawSummary);

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
      throw new Error(`Cover upload failed: ${uploadError.message}`);
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
      volume: volume || null,
      issue_number: issueNumber,
      summary,
      reading_status: readingStatus,
      cover_url: coverUrl,
    })
    .select("id")
    .single();

  if (issueError || !issueRow) {
    throw new Error(issueError?.message ?? "Issue insert failed after cover upload.");
  }

  await syncIssueEventLink(issueRow.id, eventId);

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/titles");
  revalidatePath("/characters");
}

export async function createIssueActionWithState(
  _prevState: CreateIssueFormState,
  formData: FormData,
): Promise<CreateIssueFormState> {
  try {
    await createIssueAction(formData);
    return { error: null, success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong while saving the issue.",
      success: false,
    };
  }
}

export async function createCharacterAction(formData: FormData): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const alias = String(formData.get("alias") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();
  const affiliation = String(formData.get("affiliation") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  if (!name) {
    return;
  }

  const { error } = await supabaseAdmin.from("characters").upsert(
    {
      name,
      alias: alias || null,
      status,
      affiliation: affiliation || null,
      avatar_url: avatarUrl || null,
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
  const name = String(formData.get("name") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();
  const alias = String(formData.get("alias") ?? "").trim();
  const affiliation = String(formData.get("affiliation") ?? "").trim();
  const loreMarkdown = String(formData.get("lore_markdown") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  if (!characterId || !name) {
    return;
  }

  const { error } = await supabaseAdmin
    .from("characters")
    .update({
      name,
      status,
      alias: alias || null,
      affiliation: affiliation || null,
      lore_markdown: loreMarkdown,
      avatar_url: avatarUrl || null,
    })
    .eq("id", characterId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/characters");
  revalidatePath(`/characters/${characterId}`);
  revalidatePath("/");
}

export async function deleteCharacterAction(formData: FormData): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const characterId = String(formData.get("character_id") ?? "").trim();

  if (!characterId) {
    return;
  }

  const { error } = await supabaseAdmin.from("characters").delete().eq("id", characterId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/characters");
  revalidatePath("/");
  revalidatePath("/titles");
  redirect("/characters");
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

export async function updateIssueAction(formData: FormData): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const issueId = String(formData.get("issue_id") ?? "").trim();
  const selectedTitleId = String(formData.get("title_id") ?? "").trim();
  const newTitleName = String(formData.get("new_title_name") ?? "").trim();
  const selectedPublisherId = String(formData.get("publisher_id") ?? "").trim();
  const newPublisherName = String(formData.get("new_publisher_name") ?? "").trim();
  const volume = String(formData.get("volume") ?? "").trim();
  const issueNumber = String(formData.get("issue_number") ?? "").trim();
  const rawSummary = String(formData.get("summary") ?? "").trim();
  const readingStatus = String(formData.get("reading_status") ?? "planned").trim();
  const selectedEventId = String(formData.get("event_id") ?? "").trim();
  const newEventName = String(formData.get("new_event_name") ?? "").trim();
  const coverFile = formData.get("cover_file");

  if (!issueId || !issueNumber) return;

  let titleId = selectedTitleId;

  if (!titleId && newTitleName) {
    const publisher = await resolvePublisherName(selectedPublisherId, newPublisherName);
    if (!publisher) {
      throw new Error("A publisher is required when creating a new title.");
    }

    const { data: titleRow, error: titleError } = await supabaseAdmin
      .from("titles")
      .upsert({ name: newTitleName, publisher }, { onConflict: "name" })
      .select("id")
      .single();

    if (titleError || !titleRow) {
      throw new Error(titleError?.message ?? "Failed to create title.");
    }

    titleId = titleRow.id;
  }

  if (!titleId) return;

  const eventId = await resolveEventId(selectedEventId, newEventName);

  const summary = await syncCharactersFromSummary(rawSummary);

  let coverUrl: string | undefined;

  if (coverFile instanceof File && coverFile.size > 0) {
    const extension = coverFile.name.split(".").pop() ?? "jpg";
    const key = `${slugify(newTitleName || selectedTitleId || issueId || "issue")}-${Date.now()}.${extension}`;
    const storagePath = `issues/${key}`;
    const bytes = await coverFile.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(coversBucket)
      .upload(storagePath, bytes, {
        contentType: coverFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Cover upload failed: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(coversBucket).getPublicUrl(storagePath);

    coverUrl = publicUrl;
  }

  const { error: updateError } = await supabaseAdmin
    .from("issues")
    .update({
      title_id: titleId,
      volume: volume || null,
      issue_number: issueNumber,
      summary,
      reading_status: readingStatus,
      ...(coverUrl ? { cover_url: coverUrl } : {}),
    })
    .eq("id", issueId);

  if (updateError) throw new Error(updateError.message);

  await syncIssueEventLink(issueId, eventId);

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/titles");
  revalidatePath("/characters");
}

export async function deleteIssueAction(formData: FormData): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const issueId = String(formData.get("issue_id") ?? "").trim();

  if (!issueId) return;

  const { error } = await supabaseAdmin.from("issues").delete().eq("id", issueId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/titles");
}
