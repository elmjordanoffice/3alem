"use client";
import * as React from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useNumbers } from "@/components/providers";

export interface AnswerValue {
  /** ProseMirror JSON, kept for faithful re-rendering. */
  doc: unknown;
  /** Plain text, used for scoring and evidence quotes. */
  text: string;
}

interface AnswerEditorProps {
  id?: string;
  label: string;
  placeholder?: string;
  initialValue?: AnswerValue | null;
  onChange?: (value: AnswerValue) => void;
  /** Reported to the parent for integrity context; never blocks pasting. */
  onPaste?: (charCount: number) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}

/**
 * The rich-text answer editor. Deliberately small: bold, italic and lists are
 * enough to structure an answer, and length is never rewarded.
 */
export function AnswerEditor({
  id,
  label,
  placeholder,
  initialValue,
  onChange,
  onPaste,
  disabled,
  invalid,
  describedBy,
  className,
}: AnswerEditorProps) {
  const t = useTranslations("components.editor");
  const n = useNumbers();
  const onChangeRef = React.useRef(onChange);
  const onPasteRef = React.useRef(onPaste);
  React.useEffect(() => {
    onChangeRef.current = onChange;
    onPasteRef.current = onPaste;
  });

  // Options that don't change while the editor is mounted: the first document,
  // and attributes that only change with their inputs. Re-creating them on
  // every keystroke made Tiptap reapply options after each render.
  const [initialDoc] = React.useState(() => initialValue?.doc);
  const attributes = React.useMemo(
    () => ({
      ...(id ? { id } : {}),
      role: "textbox",
      "aria-multiline": "true",
      "aria-label": label,
      ...(describedBy ? { "aria-describedby": describedBy } : {}),
      ...(invalid ? { "aria-invalid": "true" } : {}),
      dir: "auto",
      class: "text-base sm:text-[15px]",
    }),
    [id, label, describedBy, invalid],
  );

  // Tiptap compares extensions by identity and reapplies options when they
  // differ. Recreating them on every render made it reapply options after each
  // keystroke, which could flush pending input into a new transaction, update
  // state, re-render, and loop (React error 185 under fast typing).
  const placeholderText = placeholder ?? t("placeholder");
  const extensions = React.useMemo(
    () => [
      StarterKit.configure({ heading: false, codeBlock: false, blockquote: false, horizontalRule: false, link: false }),
      Placeholder.configure({ placeholder: placeholderText }),
    ],
    [placeholderText],
  );
  const editorProps = React.useMemo(
    () => ({
      attributes,
      handlePaste: (_view: unknown, event: ClipboardEvent) => {
        const text = event.clipboardData?.getData("text/plain") ?? "";
        if (text.length > 0) onPasteRef.current?.(text.length);
        return false;
      },
    }),
    [attributes],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions,
    content: (initialDoc as object) ?? "",
    editorProps,
    // The editor draws the text itself; the React copy only drives autosave and
    // the submit button, so it updates as a transition. A burst of keystrokes
    // can then never stack synchronous updates into a render loop.
    onUpdate: ({ editor }) => {
      const value = { doc: editor.getJSON(), text: editor.getText() };
      React.startTransition(() => onChangeRef.current?.(value));
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      bullet: editor?.isActive("bulletList") ?? false,
      ordered: editor?.isActive("orderedList") ?? false,
      words: editor ? editor.getText().trim().split(/\s+/).filter(Boolean).length : 0,
    }),
  });

  React.useEffect(() => {
    // Locking the editor during submission is not an edit: don't emit an update.
    if (editor && editor.isEditable === disabled) editor.setEditable(!disabled, false);
  }, [editor, disabled]);

  const tools = [
    { key: "bold", icon: Bold, active: state?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { key: "italic", icon: Italic, active: state?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { key: "bulletList", icon: List, active: state?.bullet, run: () => editor?.chain().focus().toggleBulletList().run() },
    { key: "orderedList", icon: ListOrdered, active: state?.ordered, run: () => editor?.chain().focus().toggleOrderedList().run() },
  ] as const;

  return (
    <div
      className={cn(
        "answer-editor overflow-hidden rounded-control border border-border-strong bg-surface transition-colors duration-150 focus-within:border-accent focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-focus",
        invalid && "border-critical",
        disabled && "bg-surface-subtle opacity-70",
        className,
      )}
    >
      <div role="toolbar" aria-label={t("toolbar")} className="flex items-center gap-0.5 border-b border-border px-1.5 py-1">
        {tools.map(({ key, icon: Icon, active, run }) => (
          <button
            key={key}
            type="button"
            onClick={run}
            disabled={disabled}
            aria-pressed={Boolean(active)}
            aria-label={t(key)}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-[6px] text-secondary transition-colors hover:bg-surface-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50",
              active && "bg-accent-subtle text-accent-text hover:bg-accent-subtle",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        ))}
        <span className="ms-auto pe-1.5 text-xs text-tertiary tabular" aria-live="off">
          {t("words", { count: state?.words ?? 0, formatted: n.number(state?.words ?? 0) })}
        </span>
      </div>
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="min-h-36 px-3.5 py-3 text-tertiary">{placeholder ?? t("placeholder")}</div>
      )}
    </div>
  );
}
