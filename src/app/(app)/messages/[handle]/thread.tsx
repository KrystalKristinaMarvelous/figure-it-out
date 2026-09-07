"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import type { MessageRow } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markThreadRead } from "@/lib/actions";
import { Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { shortDate } from "@/lib/format";

export function Thread({
  me,
  otherId,
  otherName,
  initialMessages,
}: {
  me: string;
  otherId: string;
  otherName: string;
  initialMessages: MessageRow[];
}) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);

  const scroll = () => bottom.current?.scrollIntoView({ block: "end" });

  useEffect(() => {
    scroll();
  }, []);

  useEffect(() => {
    markThreadRead(otherId).catch(() => {});
    const supabase = createClient();
    let live = true;
    const poll = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${me},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${me})`,
        )
        .order("created_at");
      if (!live || !data) return;
      setMessages((prev) => (data.length !== prev.length ? (data as MessageRow[]) : prev));
    };
    const id = setInterval(poll, 5000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, [me, otherId]);

  useEffect(() => {
    scroll();
  }, [messages.length]);

  function submit() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    const optimistic: MessageRow = {
      id: `tmp-${Date.now()}`,
      sender_id: me,
      recipient_id: otherId,
      body,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    start(() => sendMessage(otherId, body).then(() => {}));
  }

  let lastDay = "";

  return (
    <>
      <div className="scrollbar-thin flex-1 space-y-1.5 overflow-y-auto py-5">
        {messages.length === 0 && (
          <p className="voice py-10 text-center text-[13px] text-muted">
            Say hi to {otherName}.
          </p>
        )}
        {messages.map((m) => {
          const day = m.created_at.slice(0, 10);
          const showDay = day !== lastDay;
          lastDay = day;
          const mine = m.sender_id === me;
          return (
            <div key={m.id}>
              {showDay && (
                <p className="mono py-2 text-center text-[10px] uppercase tracking-[0.06em] text-faint">
                  {shortDate(m.created_at)}
                </p>
              )}
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[78%] whitespace-pre-wrap rounded-[var(--radius)] px-3 py-2 text-[13px] leading-snug ${
                    mine
                      ? "bg-accent text-white"
                      : "bg-sunken text-ink"
                  }`}
                >
                  {m.body}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-hairline-2 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message ${otherName}`}
          rows={1}
          className="min-h-[2.5rem] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button type="submit" variant="primary" size="md" disabled={pending || !draft.trim()}>
          <Send size={14} />
        </Button>
      </form>
    </>
  );
}
