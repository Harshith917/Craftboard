
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Sparkles, Send, Loader2, X, Bot } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface PageInfo {
  id: string;
  name: string;
}

const SUGGESTIONS = [
  "Suggest 5 page ideas for this project",
  "Summarize what this project seems to be about",
  "How should I organize these pages?",
  "What pages would a starter template have?",
];

interface PagesAIAssistantProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  pages: PageInfo[];
}

export default function PagesAIAssistant({
  open,
  onClose,
  projectId,
  projectName,
  pages,
}: PagesAIAssistantProps) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMessages([]);
      setInput("");
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/ai/assist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt: trimmed,
          context: { projectId, projectName, pages: pages.map((p) => ({ id: p.id, name: p.name })) },
        }),
        signal: AbortSignal.timeout(120000),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          res.status === 502
            ? "AI service is offline. Make sure Ollama is running locally."
            : data?.message ?? "Failed to get a response. Please try again.";
        throw new Error(message);
      }
      const data = (await res.json()) as { reply?: string };
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: data.reply ?? "(no response)" },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get a response.";
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", content: message }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">Project Assistant</p>
              <p className="text-[11px] text-muted-foreground truncate">AI agent for {projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-3">
              <div className="text-center py-4">
                <Bot className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Ask me about this project</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pages.length} page{pages.length !== 1 ? "s" : ""} in this project.
                </p>
              </div>
              <div className="space-y-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={loading}
                    className="w-full text-left rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-2 text-[13px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                Thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about this project..."
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
