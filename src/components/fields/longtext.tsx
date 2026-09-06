"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

/** Lightweight editor on longtext fields only (spec §19). Stores HTML. */
export function LongText({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none dark:prose-invert rounded-md border border-hairline bg-raised px-3 py-2 text-sm leading-relaxed text-ink focus-within:border-unresolved min-h-[5rem]",
        "data-placeholder": placeholder ?? "",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return <EditorContent editor={editor} />;
}

export function RichText({ html }: { html: string | null | undefined }) {
  if (!html) return null;
  return (
    <div
      className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed text-ink [&_p]:my-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
