import { NextResponse } from "next/server";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ issueId: string }> },
) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 500 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { issueId } = await params;
    const body = (await request.json()) as { summary?: string };

    const { error } = await supabaseAdmin
      .from("issues")
      .update({ summary: body.summary ?? "" })
      .eq("id", issueId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
