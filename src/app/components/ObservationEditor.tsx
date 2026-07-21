import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Strikethrough } from "lucide-react";
import { useEffect } from "react";

interface ObservationEditorProps {
  value: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

function MenuBar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  const buttons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive("bold"), label: "Bold" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive("italic"), label: "Italic" },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive("strike"), label: "Strike" },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive("bulletList"), label: "Bullet list" },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive("orderedList"), label: "Ordered list" },
  ];

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 rounded-t-md">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={btn.action}
          className={`p-1 rounded transition-colors ${
            btn.isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
          title={btn.label}
        >
          <btn.icon size={14} />
        </button>
      ))}
    </div>
  );
}

export default function ObservationEditor({ value, onChange, placeholder, editable = true }: ObservationEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "Add notes or observations here..." }),
    ],
    content: value || "",
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && !editable) {
      editor.setEditable(false);
    }
  }, [editor, editable]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={`border border-border rounded-md overflow-hidden ${!editable ? "" : ""}`}>
      {editable && <MenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className={`prose prose-sm max-w-none dark:prose-invert [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror_p]:m-0 [&_.ProseMirror_ul]:my-1 [&_.ProseMirror_ol]:my-1 [&_.ProseMirror_li]:my-0.5 [&_.ProseMirror_.ProseMirror-gapcursor]:after:hidden ${
          editable ? "" : "[&_.ProseMirror]:min-h-0 [&_.ProseMirror]:cursor-default"
        }`}
      />
    </div>
  );
}
