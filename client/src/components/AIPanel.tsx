
import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Sparkles, Loader2, Wand2, AlertCircle } from "lucide-react";
import { Node, ShapeType } from "@/types/CanvasTypes";
import {
  createDefaultNode,
  getShapeDefaults,
  getShapeLabel,
} from "@/lib/canvasUtils";

const BASE_URL = import.meta.env.VITE_API_URL;

interface ShapeDescriptor {
  type: string;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  width?: number;
  height?: number;
  cornerRadius?: number;
}

interface GenerateResult {
  title: string;
  summary: string;
  shapes: ShapeDescriptor[];
}

const SUGGESTIONS = [
  "Hero section: big title, subtitle text, and a blue button",
  "Flowchart: three rounded rectangles connected by arrows",
  "Code snippet inside a dark code block with a title",
  "Sticky notes with a quick project idea",
];

interface AIPanelProps {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  saveToHistory: (nodes: Node[]) => void;
  setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  canEdit: boolean;
}

export default function AIPanel({
  nodes,
  setNodes,
  saveToHistory,
  setSelectedIds,
  canEdit,
}: AIPanelProps) {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: trimmed }),
        signal: AbortSignal.timeout(130000),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          res.status === 502
            ? "AI service is offline. Make sure Ollama is running locally."
            : data?.message ?? "Failed to generate. Please try again.";
        throw new Error(message);
      }
      setResult((await res.json()) as GenerateResult);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result || !canEdit) return;
    const maxZ = nodes.length > 0 ? Math.max(...nodes.map((n) => n.zIndex)) : 0;
    const GAP = 24;
    const MAX_COL_WIDTH = 640;
    let cursorX = 0;
    let cursorY = 0;

    const estimateTextSize = (text: string, fontSize: number) => {
      const lines = text.split("\n");
      const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
      const width = Math.min(620, Math.max(40, Math.ceil(longest * fontSize * 0.58)));
      const height = Math.ceil(lines.length * fontSize * 1.35);
      return { width, height };
    };

    const generated = result.shapes.map((s, i) => {
      const type = s.type as ShapeType;
      const d = getShapeDefaults(type);
      let width = s.width ?? d.width;
      let height = s.height ?? d.height;
      if (type === "text") {
        const est = estimateTextSize(s.text ?? "", s.fontSize ?? d.fontSize);
        width = Math.max(width, est.width);
        height = Math.max(height, est.height);
      }
      if (cursorX > 0 && cursorX + width > MAX_COL_WIDTH) {
        cursorX = 0;
        cursorY += height + GAP;
      }
      const node = createDefaultNode(type, cursorX, cursorY, maxZ + i + 1, {
        width,
        height,
        ...(s.text != null ? { text: s.text } : {}),
        ...(s.fontSize != null ? { fontSize: s.fontSize } : {}),
        ...(s.fontWeight === "bold" || s.fontWeight === "normal"
          ? { fontWeight: s.fontWeight }
          : {}),
        ...(s.fill != null ? { fill: s.fill } : {}),
        ...(s.stroke != null ? { stroke: s.stroke } : {}),
        ...(s.strokeWidth != null ? { strokeWidth: s.strokeWidth } : {}),
        ...(s.cornerRadius != null ? { cornerRadius: s.cornerRadius } : {}),
        name: `${getShapeLabel(type)} ${i + 1}`,
        radius:
          type === "circle" ? Math.max(width, height) / 2 : d.radius,
      });
      cursorX += width + GAP;
      return node;
    });

    if (generated.length === 0) {
      setError("The AI returned no usable shapes. Try rephrasing.");
      return;
    }

    const next = [...nodes, ...generated];
    setNodes(next);
    saveToHistory(next);
    setSelectedIds(generated.map((n) => n.id));
    toast.success(
      `Added ${generated.length} ${generated.length === 1 ? "shape" : "shapes"}`,
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-[12px] font-semibold text-foreground">
            AI Assistant
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Describe a design and generate shapes for the canvas.
        </p>
      </div>

      <div className="px-3 flex flex-col gap-2 flex-1 overflow-y-auto pb-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              handleGenerate();
            }
          }}
          placeholder="e.g. A dashboard card with a heading, stat number, and a progress bar"
          rows={4}
          disabled={loading}
          className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
        />

        <button
          onClick={handleGenerate}
          disabled={!canEdit || loading || !prompt.trim()}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Wand2 size={13} />
              Generate design
            </>
          )}
        </button>

        {!canEdit && (
          <p className="text-[11px] text-muted-foreground">
            You need editor access to generate shapes.
          </p>
        )}

        <div className="mt-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Try an idea
          </p>
          <div className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(s)}
                disabled={loading}
                className="text-left rounded-lg border border-border bg-card px-2.5 py-2 text-[11px] leading-snug text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-100 p-2.5">
            <AlertCircle size={13} className="text-rose-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-rose-500 leading-relaxed">{error}</p>
          </div>
        )}

        {result && !error && (
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[12px] font-semibold text-foreground">
              {result.title}
            </p>
            {result.summary && (
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {result.summary}
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {result.shapes.length}{" "}
              {result.shapes.length === 1 ? "shape" : "shapes"} ready to add
            </p>
            <button
              onClick={handleApply}
              disabled={!canEdit}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-[12px] font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={13} />
              Add to canvas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
