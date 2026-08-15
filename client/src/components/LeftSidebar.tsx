
import React, { useState } from "react";
import {
  Grid3X3,
  Magnet,
  Ruler,
  AlertCircle,
  ChevronLeft,
  Plus,
  Layers,
  Sparkles,
} from "lucide-react";
import { Node, ShapeType } from "@/types/CanvasTypes";
import LayersPanel from "./LayersPanel";
import InsertPanel from "./InsertPanel";
import AIPanel from "./AIPanel";

interface LeftSidebarProps {
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  smartGuides: boolean;
  setSmartGuides: (smart: boolean) => void;
  error: string | null;
  nodes: Node[];
  selectedIds: string[];
  setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  updateNodeProperty: (id: string, property: keyof Node, value: any) => void;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  saveToHistory: (nodes: Node[]) => void;
  canEdit: boolean;
  addShape: (type: ShapeType, file?: File) => void;
}

export default function LeftSidebar({
  showGrid,
  setShowGrid,
  snapToGrid,
  setSnapToGrid,
  smartGuides,
  setSmartGuides,
  error,
  nodes,
  selectedIds,
  setSelectedIds,
  updateNodeProperty,
  setNodes,
  saveToHistory,
  canEdit,
  addShape,
}: LeftSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<"insert" | "layers" | "ai">("insert");

  return (
    <div
      className="relative flex flex-col mt-14 z-10 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? "48px" : "260px" }}
    >
      <div className="h-full bg-card/80 backdrop-blur-xl border-r border-border shadow-[2px_0_16px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between px-3 py-3 border-b border-border shrink-0">
          {!collapsed && (
            <>
              <div className="flex items-center gap-1 bg-muted rounded-xl p-0.5">
                <button
                  onClick={() => setTab("insert")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    tab === "insert"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Plus size={12} />
                  Insert
                </button>
                <button
                  onClick={() => setTab("layers")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    tab === "layers"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Layers size={12} />
                  Layers
                </button>
                <button
                  onClick={() => setTab("ai")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    tab === "ai"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles size={12} />
                  AI
                </button>
              </div>
            </>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 ${
              collapsed ? "mx-auto" : "ml-auto"
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              size={15}
              className="transition-transform duration-300"
              style={{
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>
        </div>

        <div
          className="flex flex-col gap-1 p-3 overflow-hidden transition-all duration-300 shrink-0"
          style={{
            opacity: collapsed ? 0 : 1,
            pointerEvents: collapsed ? "none" : "auto",
          }}
        >
          <label className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer group transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <Grid3X3
                size={13}
                className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
              />
              <span className="text-[13px] text-foreground font-medium whitespace-nowrap">
                Show Grid
              </span>
            </div>
            <div className="relative shrink-0">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 rounded-full bg-border peer-checked:bg-primary transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-card shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
            </div>
          </label>

          <label className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer group transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <Magnet
                size={13}
                className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
              />
              <span className="text-[13px] text-foreground font-medium whitespace-nowrap">
                Snap to Grid
              </span>
            </div>
            <div className="relative shrink-0">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 rounded-full bg-border peer-checked:bg-primary transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-card shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
            </div>
          </label>

          <label className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer group transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <Ruler
                size={13}
                className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
              />
              <span className="text-[13px] text-foreground font-medium whitespace-nowrap">
                Smart Guides
              </span>
            </div>
            <div className="relative shrink-0">
              <input
                type="checkbox"
                checked={smartGuides}
                onChange={(e) => setSmartGuides(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 rounded-full bg-border peer-checked:bg-primary transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-card shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
            </div>
          </label>
        </div>

        <div
          className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
          style={{
            opacity: collapsed ? 0 : 1,
            pointerEvents: collapsed ? "none" : "auto",
          }}
        >
          {tab === "insert" ? (
            <InsertPanel addShape={addShape} canEdit={canEdit} />
          ) : tab === "ai" ? (
            <AIPanel
              nodes={nodes}
              setNodes={setNodes}
              saveToHistory={saveToHistory}
              setSelectedIds={setSelectedIds}
              canEdit={canEdit}
            />
          ) : (
            <LayersPanel
              nodes={nodes}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              updateNodeProperty={updateNodeProperty}
              setNodes={setNodes}
              saveToHistory={saveToHistory}
              canEdit={canEdit}
              embedded
            />
          )}
        </div>

        {error && !collapsed && (
          <div className="mx-3 mb-3 p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 transition-all duration-300 shrink-0">
            <AlertCircle size={13} className="text-rose-400 mt-0.5 shrink-0" />
            <p className="text-[12px] text-rose-500 leading-relaxed">{error}</p>
          </div>
        )}

        {error && collapsed && (
          <div className="flex justify-center mt-2 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
