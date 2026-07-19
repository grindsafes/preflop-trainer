import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { Range, Drill, Folder, AppData, LineTree, LineDrill } from "./types";
import { loadFromStorage, saveToStorage, STORAGE_KEY } from "./utils";
import { LEGACY_ACTIONS } from "./constants";

interface TrainerContextType {
  ranges: Range[];
  drills: Drill[];
  rangeFolders: Folder[];
  drillFolders: Folder[];
  lineTrees: LineTree[];
  lineFolders: Folder[];
  lineDrills: LineDrill[];
  lineDrillFolders: Folder[];

  saveRange: (range: Range) => void;
  deleteRange: (id: string) => void;
  duplicateRange: (id: string) => void;
  moveRange: (id: string, folderId: string | null) => void;

  saveDrill: (drill: Drill) => void;
  deleteDrill: (id: string) => void;
  moveDrill: (id: string, folderId: string | null) => void;

  newRangeFolder: (parentId: string | null) => void;
  renameRangeFolder: (id: string, name: string) => void;
  deleteRangeFolder: (id: string) => void;
  moveRangeFolder: (folderId: string, newParentId: string | null) => void;

  newDrillFolder: (parentId: string | null) => void;
  renameDrillFolder: (id: string, name: string) => void;
  deleteDrillFolder: (id: string) => void;
  moveDrillFolder: (folderId: string, newParentId: string | null) => void;

  saveLineTree: (tree: LineTree) => void;
  deleteLineTree: (id: string) => void;
  renameLineTree: (id: string, name: string) => void;
  moveLineTree: (id: string, folderId: string | null) => void;

  newLineFolder: (parentId: string | null) => void;
  renameLineFolder: (id: string, name: string) => void;
  deleteLineFolder: (id: string) => void;
  moveLineFolder: (folderId: string, newParentId: string | null) => void;

  saveLineDrill: (drill: LineDrill) => void;
  deleteLineDrill: (id: string) => void;
  moveLineDrill: (id: string, folderId: string | null) => void;

  newLineDrillFolder: (parentId: string | null) => void;
  renameLineDrillFolder: (id: string, name: string) => void;
  deleteLineDrillFolder: (id: string) => void;
  moveLineDrillFolder: (folderId: string, newParentId: string | null) => void;

  importRef: React.RefObject<HTMLInputElement | null>;
  exportData: () => void;
  importData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TrainerContext = createContext<TrainerContextType | null>(null);

export function useTrainerContext() {
  const ctx = useContext(TrainerContext);
  if (!ctx) throw new Error("useTrainerContext must be used within TrainerProvider");
  return ctx;
}

export function TrainerProvider({ children }: { children: ReactNode }) {
  const saved = useRef(loadFromStorage()).current;
  const [ranges, setRanges] = useState<Range[]>(
    () => (saved.ranges ?? []).map((r) => ({ ...r, folderId: r.folderId ?? null, actions: r.actions ?? LEGACY_ACTIONS }))
  );
  const [drills, setDrills] = useState<Drill[]>(
    () => (saved.drills ?? []).map((d) => ({ ...d, folderId: d.folderId ?? null, betSizes: d.betSizes ?? {} }))
  );
  const [rangeFolders, setRangeFolders] = useState<Folder[]>(saved.rangeFolders ?? []);
  const [drillFolders, setDrillFolders] = useState<Folder[]>(saved.drillFolders ?? []);
  const [lineTrees, setLineTrees] = useState<LineTree[]>(
    () => (saved.lineTrees ?? []).map((t) => ({ ...t, folderId: t.folderId ?? null }))
  );
  const [lineFolders, setLineFolders] = useState<Folder[]>(saved.lineFolders ?? []);
  const [lineDrills, setLineDrills] = useState<LineDrill[]>(
    () => (saved.lineDrills ?? []).map((d) => ({ ...d, folderId: d.folderId ?? null, description: d.description ?? "" }))
  );
  const [lineDrillFolders, setLineDrillFolders] = useState<Folder[]>(saved.lineDrillFolders ?? []);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveToStorage({ ranges, drills, rangeFolders, drillFolders, lineTrees, lineFolders, lineDrills, lineDrillFolders }); }, [ranges, drills, rangeFolders, drillFolders, lineTrees, lineFolders, lineDrills, lineDrillFolders]);

  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      if (e.newValue === e.oldValue) return;
      const data = loadFromStorage();
      if (data.ranges && Array.isArray(data.ranges)) {
        setRanges(data.ranges.map((r) => ({ ...r, folderId: r.folderId ?? null, actions: r.actions ?? LEGACY_ACTIONS })));
      }
      if (data.drills && Array.isArray(data.drills)) {
        setDrills(data.drills.map((d) => ({ ...d, folderId: d.folderId ?? null, betSizes: d.betSizes ?? {} })));
      }
      if (data.rangeFolders && Array.isArray(data.rangeFolders)) setRangeFolders(data.rangeFolders);
      if (data.drillFolders && Array.isArray(data.drillFolders)) setDrillFolders(data.drillFolders);
      if (data.lineTrees && Array.isArray(data.lineTrees)) setLineTrees(data.lineTrees.map((t) => ({ ...t, folderId: t.folderId ?? null })));
      if (data.lineFolders && Array.isArray(data.lineFolders)) setLineFolders(data.lineFolders);
      if (data.lineDrills && Array.isArray(data.lineDrills)) setLineDrills(data.lineDrills.map((d) => ({ ...d, folderId: d.folderId ?? null, description: d.description ?? "" })));
      if (data.lineDrillFolders && Array.isArray(data.lineDrillFolders)) setLineDrillFolders(data.lineDrillFolders);
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const saveRange = useCallback((range: Range) => {
    setRanges((prev) => {
      const idx = prev.findIndex((r) => r.id === range.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = range; return next; }
      return [...prev, range];
    });
  }, []);

  const deleteRange = useCallback((id: string) => {
    setRanges((p) => p.filter((r) => r.id !== id));
  }, []);

  const duplicateRange = useCallback((id: string) => {
    setRanges((prev) => {
      const source = prev.find((r) => r.id === id);
      if (!source) return prev;
      return [...prev, { ...source, id: `range-${Date.now()}`, name: `${source.name} (copy)` }];
    });
  }, []);

  const moveRange = useCallback((id: string, folderId: string | null) => {
    setRanges((prev) => prev.map((r) => r.id === id ? { ...r, folderId } : r));
  }, []);

  const saveDrill = useCallback((drill: Drill) => {
    setDrills((prev) => {
      const idx = prev.findIndex((d) => d.id === drill.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = drill; return next; }
      return [...prev, drill];
    });
  }, []);

  const deleteDrill = useCallback((id: string) => {
    setDrills((p) => p.filter((d) => d.id !== id));
  }, []);

  const moveDrill = useCallback((id: string, folderId: string | null) => {
    setDrills((prev) => prev.map((d) => d.id === id ? { ...d, folderId } : d));
  }, []);

  const moveRangeFolder = useCallback((id: string, newParentId: string | null) => {
    setRangeFolders((prev) => prev.map((f) => f.id === id ? { ...f, parentId: newParentId } : f));
  }, []);

  const moveDrillFolder = useCallback((id: string, newParentId: string | null) => {
    setDrillFolders((prev) => prev.map((f) => f.id === id ? { ...f, parentId: newParentId } : f));
  }, []);

  const newRangeFolder = useCallback((parentId: string | null) => {
    const id = `rfolder-${Date.now()}`;
    setRangeFolders((prev) => [...prev, { id, name: "New Folder", parentId }]);
  }, []);

  const renameRangeFolder = useCallback((id: string, name: string) => {
    setRangeFolders((prev) => prev.map((f) => f.id === id ? { ...f, name } : f));
  }, []);

  const deleteRangeFolder = useCallback((id: string) => {
    setRangeFolders((prev) => {
      const idsToDelete = new Set<string>();
      function collectIds(fid: string) {
        idsToDelete.add(fid);
        prev.filter((f) => f.parentId === fid).forEach((f) => collectIds(f.id));
      }
      collectIds(id);
      return prev.filter((f) => !idsToDelete.has(f.id));
    });
    setRanges((prev) => prev.map((r) => {
      const folderIds = new Set<string>();
      (function collectIds(fid: string) {
        folderIds.add(fid);
        rangeFolders.filter((f) => f.parentId === fid).forEach((f) => collectIds(f.id));
      })(id);
      return folderIds.has(r.folderId ?? "") ? { ...r, folderId: null } : r;
    }));
  }, [rangeFolders]);

  const newDrillFolder = useCallback((parentId: string | null) => {
    const id = `dfolder-${Date.now()}`;
    setDrillFolders((prev) => [...prev, { id, name: "New Folder", parentId }]);
  }, []);

  const renameDrillFolder = useCallback((id: string, name: string) => {
    setDrillFolders((prev) => prev.map((f) => f.id === id ? { ...f, name } : f));
  }, []);

  const saveLineTree = useCallback((tree: LineTree) => {
    setLineTrees((prev) => {
      const idx = prev.findIndex((t) => t.id === tree.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = tree; return next; }
      return [...prev, tree];
    });
  }, []);

  const deleteLineTree = useCallback((id: string) => {
    setLineTrees((p) => p.filter((t) => t.id !== id));
  }, []);

  const renameLineTree = useCallback((id: string, name: string) => {
    setLineTrees((prev) => prev.map((t) => t.id === id ? { ...t, name } : t));
  }, []);

  const moveLineTree = useCallback((id: string, folderId: string | null) => {
    setLineTrees((prev) => prev.map((t) => t.id === id ? { ...t, folderId } : t));
  }, []);

  const newLineFolder = useCallback((parentId: string | null) => {
    const id = `lfolder-${Date.now()}`;
    setLineFolders((prev) => [...prev, { id, name: "New Folder", parentId }]);
  }, []);

  const renameLineFolder = useCallback((id: string, name: string) => {
    setLineFolders((prev) => prev.map((f) => f.id === id ? { ...f, name } : f));
  }, []);

  const moveLineFolder = useCallback((id: string, newParentId: string | null) => {
    setLineFolders((prev) => prev.map((f) => f.id === id ? { ...f, parentId: newParentId } : f));
  }, []);

  const saveLineDrill = useCallback((drill: LineDrill) => {
    setLineDrills((prev) => {
      const idx = prev.findIndex((d) => d.id === drill.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = drill; return next; }
      return [...prev, drill];
    });
  }, []);

  const deleteLineDrill = useCallback((id: string) => {
    setLineDrills((p) => p.filter((d) => d.id !== id));
  }, []);

  const moveLineDrill = useCallback((id: string, folderId: string | null) => {
    setLineDrills((prev) => prev.map((d) => d.id === id ? { ...d, folderId } : d));
  }, []);

  const newLineDrillFolder = useCallback((parentId: string | null) => {
    const id = `ldfolder-${Date.now()}`;
    setLineDrillFolders((prev) => [...prev, { id, name: "New Folder", parentId }]);
  }, []);

  const renameLineDrillFolder = useCallback((id: string, name: string) => {
    setLineDrillFolders((prev) => prev.map((f) => f.id === id ? { ...f, name } : f));
  }, []);

  const moveLineDrillFolder = useCallback((id: string, newParentId: string | null) => {
    setLineDrillFolders((prev) => prev.map((f) => f.id === id ? { ...f, parentId: newParentId } : f));
  }, []);

  const deleteLineDrillFolder = useCallback((id: string) => {
    setLineDrillFolders((prev) => {
      const idsToDelete = new Set<string>();
      function collectIds(fid: string) {
        idsToDelete.add(fid);
        prev.filter((f) => f.parentId === fid).forEach((f) => collectIds(f.id));
      }
      collectIds(id);
      return prev.filter((f) => !idsToDelete.has(f.id));
    });
    setLineDrills((prev) => prev.map((d) => {
      const folderIds = new Set<string>();
      (function collectIds(fid: string) {
        folderIds.add(fid);
        lineDrillFolders.filter((f) => f.parentId === fid).forEach((f) => collectIds(f.id));
      })(id);
      return folderIds.has(d.folderId ?? "") ? { ...d, folderId: null } : d;
    }));
  }, [lineDrillFolders]);

  const deleteLineFolder = useCallback((id: string) => {
    setLineFolders((prev) => {
      const idsToDelete = new Set<string>();
      function collectIds(fid: string) {
        idsToDelete.add(fid);
        prev.filter((f) => f.parentId === fid).forEach((f) => collectIds(f.id));
      }
      collectIds(id);
      return prev.filter((f) => !idsToDelete.has(f.id));
    });
    setLineTrees((prev) => prev.map((t) => {
      const folderIds = new Set<string>();
      (function collectIds(fid: string) {
        folderIds.add(fid);
        lineFolders.filter((f) => f.parentId === fid).forEach((f) => collectIds(f.id));
      })(id);
      return folderIds.has(t.folderId ?? "") ? { ...t, folderId: null } : t;
    }));
  }, [lineFolders]);

  const deleteDrillFolder = useCallback((id: string) => {
    setDrillFolders((prev) => {
      const idsToDelete = new Set<string>();
      function collectIds(fid: string) {
        idsToDelete.add(fid);
        prev.filter((f) => f.parentId === fid).forEach((f) => collectIds(f.id));
      }
      collectIds(id);
      return prev.filter((f) => !idsToDelete.has(f.id));
    });
    setDrills((prev) => prev.map((d) => {
      const folderIds = new Set<string>();
      (function collectIds(fid: string) {
        folderIds.add(fid);
        drillFolders.filter((f) => f.parentId === fid).forEach((f) => collectIds(f.id));
      })(id);
      return folderIds.has(d.folderId ?? "") ? { ...d, folderId: null } : d;
    }));
  }, [drillFolders]);

  function exportData() {
    const data: AppData = { ranges, drills, rangeFolders, drillFolders, lineTrees, lineFolders, lineDrills, lineDrillFolders };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `poker-ranges-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Partial<AppData>;
        if (data.ranges && Array.isArray(data.ranges)) setRanges(data.ranges.map((r) => ({ ...r, folderId: r.folderId ?? null, actions: r.actions ?? LEGACY_ACTIONS })));
        if (data.drills && Array.isArray(data.drills)) setDrills(data.drills.map((d) => ({ ...d, folderId: d.folderId ?? null })));
        if (data.rangeFolders && Array.isArray(data.rangeFolders)) setRangeFolders(data.rangeFolders);
        if (data.drillFolders && Array.isArray(data.drillFolders)) setDrillFolders(data.drillFolders);
        if (data.lineTrees && Array.isArray(data.lineTrees)) setLineTrees(data.lineTrees.map((t) => ({ ...t, folderId: t.folderId ?? null })));
        if (data.lineFolders && Array.isArray(data.lineFolders)) setLineFolders(data.lineFolders);
        if (data.lineDrills && Array.isArray(data.lineDrills)) setLineDrills(data.lineDrills.map((d) => ({ ...d, folderId: d.folderId ?? null, description: d.description ?? "" })));
        if (data.lineDrillFolders && Array.isArray(data.lineDrillFolders)) setLineDrillFolders(data.lineDrillFolders);
      } catch { alert("Invalid file format."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <TrainerContext.Provider
      value={{
        ranges, drills, rangeFolders, drillFolders, lineTrees, lineFolders, lineDrills, lineDrillFolders,
        saveRange, deleteRange, duplicateRange, moveRange,
        saveDrill, deleteDrill, moveDrill,
        newRangeFolder, renameRangeFolder, deleteRangeFolder, moveRangeFolder,
        newDrillFolder, renameDrillFolder, deleteDrillFolder, moveDrillFolder,
        saveLineTree, deleteLineTree, renameLineTree, moveLineTree,
        newLineFolder, renameLineFolder, deleteLineFolder, moveLineFolder,
        saveLineDrill, deleteLineDrill, moveLineDrill,
        newLineDrillFolder, renameLineDrillFolder, deleteLineDrillFolder, moveLineDrillFolder,
        importRef, exportData, importData,
      }}
    >
      {children}
    </TrainerContext.Provider>
  );
}
