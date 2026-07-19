import { useState } from "react";
import type { LineDrill, LineTree } from "../types";

interface LineDrillEditorProps {
  initial?: LineDrill;
  lineTrees: LineTree[];
  onSave: (drill: LineDrill) => void;
  onCancel: () => void;
}

export function LineDrillEditor({ initial, lineTrees, onSave, onCancel }: LineDrillEditorProps) {
  const [name, setName] = useState(initial?.name ?? "New Line Drill");
  const [lineTreeId, setLineTreeId] = useState(initial?.lineTreeId ?? "");
  const [heroPosition, setHeroPosition] = useState<string>(initial?.heroPosition ?? "BU");
  const [description, setDescription] = useState(initial?.description ?? "");

  const selectedTree = lineTrees.find((t) => t.id === lineTreeId);

  function save() {
    if (!name.trim() || !lineTreeId) return;
    onSave({
      id: initial?.id ?? `line-drill-${Date.now()}`,
      name: name.trim(),
      lineTreeId,
      heroPosition,
      description: description.trim(),
      folderId: initial?.folderId ?? null,
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Drill name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-secondary text-foreground text-sm font-medium px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="e.g. BU vs BB 3-bet pot"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Line Tree</label>
        <select
          value={lineTreeId}
          onChange={(e) => setLineTreeId(e.target.value)}
          className="bg-secondary text-foreground text-sm px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select a line tree...</option>
          {lineTrees.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {selectedTree && (
          <p className="text-xs text-muted-foreground">
            {(() => {
              try {
                const nodes = JSON.parse(selectedTree.nodes || "[]");
                const edges = JSON.parse(selectedTree.edges || "[]");
                return `${nodes.length} nodes · ${edges.length} connections`;
              } catch {
                return "Unable to parse tree";
              }
            })()}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hero Position</label>
        <div className="flex items-center gap-1 bg-secondary rounded-full p-0.5 w-fit">
          {["BU", "BB"].map((pos) => (
            <button
              key={pos}
              onClick={() => setHeroPosition(pos)}
              className={`text-xs px-4 py-1.5 rounded-full transition-colors ${
                heroPosition === pos
                  ? "bg-background text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Hero's position is fixed by the drill and cannot be changed during training.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-secondary text-foreground text-sm px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          rows={3}
          placeholder="e.g. Practice common 3-bet pot scenarios as the aggressor"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={save}
          disabled={!lineTreeId}
          className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {initial ? "Update Drill" : "Save Drill"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-full border border-border text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
