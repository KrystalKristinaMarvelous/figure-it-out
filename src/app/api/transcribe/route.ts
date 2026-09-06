import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Whisper transcription with vocabulary biasing from the project's Glossary,
 * People and Places (spec §8.3). No-ops gracefully when OPENAI_API_KEY is unset.
 */
export async function POST(request: Request) {
  const { rantId, path, projectId } = await request.json();
  const supabase = await createClient();

  // ownership check via RLS
  const { data: rant } = await supabase
    .from("rants")
    .select("id, project_id")
    .eq("id", rantId)
    .maybeSingle();
  if (!rant || rant.project_id !== projectId) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (!process.env.OPENAI_API_KEY) {
    await supabase.from("rants").update({ transcript_status: "failed" }).eq("id", rantId);
    return NextResponse.json({ ok: false, reason: "no_api_key" });
  }

  await supabase.from("rants").update({ transcript_status: "processing" }).eq("id", rantId);

  try {
    const { data: blob } = await supabase.storage.from("audio").download(path);
    if (!blob) throw new Error("audio missing");

    // vocabulary hint
    const { data: vocab } = await supabase
      .from("entries")
      .select("title, project_modules(module_definitions(key))")
      .eq("project_id", projectId)
      .limit(200);
    const terms = (vocab ?? [])
      .map((v) => v.title)
      .filter(Boolean)
      .slice(0, 60)
      .join(", ");

    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const file = new File([blob], "audio.webm", { type: "audio/webm" });
    const result = await client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      prompt: terms ? `Proper nouns and terms used here: ${terms}.` : undefined,
    });

    await supabase
      .from("rants")
      .update({ transcript: result.text, transcript_status: "done" })
      .eq("id", rantId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    await supabase.from("rants").update({ transcript_status: "failed" }).eq("id", rantId);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 200 });
  }
}
