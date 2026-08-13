import { HttpError, UnprocessableEntityException } from '../lib/errors';

type ShapeDescriptor = {
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
};

export interface GenerateResult {
  title: string;
  summary: string;
  shapes: ShapeDescriptor[];
}

const ALLOWED_TYPES = new Set([
  'rect',
  'roundedRect',
  'circle',
  'ellipse',
  'triangle',
  'diamond',
  'pentagon',
  'hexagon',
  'star',
  'line',
  'arrow',
  'polyline',
  'text',
  'frame',
  'stickyNote',
  'codeBlock',
  'divider',
]);

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export class AIService {
  private url = process.env.OLLAMA_URL ?? 'http://localhost:11434';
  private model = process.env.OLLAMA_MODEL ?? 'qwen2.5:1.5b';

  async getStatus() {
    let models: string[] = [];
    let available = false;
    try {
      const res = await fetch(`${this.url}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = (await res.json()) as { models?: Array<{ name: string }> };
        models = (data.models ?? []).map((m) => m.name);
        available = true;
      }
    } catch {
      // Ollama is not running; report as unavailable.
    }
    return { available, url: this.url, model: this.model, models };
  }

  private systemPrompt() {
    return [
      'You are a design assistant that builds clean, poster-style layouts for a canvas editor.',
      'The user gives you a design idea. Create a polished vertical composition (like a landing-page hero) using the supported shapes below.',
      `Supported shape types: ${[...ALLOWED_TYPES].join(', ')}.`,
      'Design rules:',
      '- Build a vertical stack: elements flow top to bottom, roughly centered.',
      '- Use clear visual hierarchy: one large heading (fontSize 32-56), a shorter subtitle (fontSize 16-22), then a button or 2-3 cards.',
      '- Keep element widths between 120 and 600. Buttons and cards should be 180-320 wide.',
      '- Use a coherent 2-3 color palette: one dark text color, one accent color, and white/light fills.',
      '- Buttons: use "roundedRect" with the accent color as fill and 2-4 words of text.',
      '- Text nodes: short, punchy copy. Set "text", "fontSize", and "fill". No width/height needed.',
      '- Prefer "roundedRect", "rect", "text", and "divider". Avoid "line", "polyline", and "ellipse" unless clearly needed.',
      '- At most 12 shapes.',
      'Return ONLY valid JSON with exactly this structure (no extra fields):',
      '{"title":"short title","summary":"one line describing the design","shapes":[{"type":"text","text":"Heading","fontSize":40,"fill":"#111827"},{"type":"roundedRect","width":200,"height":52,"fill":"#2563eb","text":"Get Started"}]}',
      'Rules:',
      '- "type" must be one of the supported types.',
      '- "title" and "summary" are required.',
      '- Use plain hex colors like "#2563eb".',
      '- Output nothing outside the JSON object.',
    ].join('\n');
  }

  async generateShapes(prompt: string): Promise<GenerateResult> {
    const content = await this.chat(
      [
        { role: 'system', content: this.systemPrompt() },
        { role: 'user', content: prompt },
      ],
      { json: true },
    );

    const parsed = this.parseJson(content);
    if (!parsed) {
      throw new UnprocessableEntityException(
        'The model returned invalid JSON',
      );
    }

    const rawShapes: unknown = parsed.shapes;
    const shapes = (Array.isArray(rawShapes) ? rawShapes : [])
      .map((s) => this.sanitizeShape(s))
      .filter((s): s is ShapeDescriptor => s !== null)
      .slice(0, 12);

    return {
      title: String(parsed.title ?? 'AI Generated').slice(0, 120),
      summary: String(parsed.summary ?? '').slice(0, 500),
      shapes,
    };
  }

  async assist(
    prompt: string,
    context: {
      projectId?: string;
      projectName?: string;
      pages?: Array<{ id: string; name: string }>;
    } = {},
  ): Promise<{ reply: string }> {
    const projectName = context.projectName || 'Untitled project';
    const pages = Array.isArray(context.pages) ? context.pages : [];
    const pageList = pages.length
      ? pages.map((p, i) => `  ${i + 1}. ${p.name}`).join('\n')
      : '  (no pages yet)';

    const system = [
      'You are the AI assistant inside CanvaColab, a collaborative canvas design app.',
      'Users manage projects, and each project contains pages (design canvases).',
      'Help the user plan, organize, and understand their project.',
      `Project name: ${projectName}`,
      `Current pages in this project:\n${pageList}`,
      'Guidelines:',
      '- Be concise and practical. Use short bullet points when helpful.',
      '- When the user asks for page ideas, suggest concrete, well-named pages relevant to their project.',
      '- When asked to summarize, base it only on the context provided.',
      '- Do not invent facts about the project that are not in the context.',
      '- Respond in plain text without markdown code fences.',
    ].join('\n');

    const content = await this.chat([
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ]);

    return { reply: content.slice(0, 4000) || '(no response)' };
  }

  private async chat(
    messages: Array<{ role: string; content: string }>,
    options?: { json?: boolean },
  ): Promise<string> {
    let response: Response;
    try {
      const body: Record<string, unknown> = {
        model: this.model,
        messages,
        stream: false,
        options: { temperature: 0.5 },
      };
      if (options?.json) body.format = 'json';
      response = await fetch(`${this.url}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new HttpError(
        502,
        `Ollama is not reachable at ${this.url} (${detail})`,
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new HttpError(
        502,
        `Ollama request failed (${response.status}): ${body.slice(0, 300)}`,
      );
    }

    const data = (await response.json()) as { message?: { content?: string } };
    return data?.message?.content ?? '';
  }

  private parseJson(content: string): any | null {
    if (!content) return null;
    const trimmed = content.trim();
    try {
      return JSON.parse(trimmed);
    } catch {
      // fall through to embedded-object extraction
    }
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }

  private sanitizeShape(raw: unknown): ShapeDescriptor | null {
    if (!raw || typeof raw !== 'object') return null;
    const record = raw as Record<string, any>;
    const type = String(record.type ?? '');
    if (!ALLOWED_TYPES.has(type)) return null;

    const shape: ShapeDescriptor = { type };
    if (record.text != null) shape.text = String(record.text).slice(0, 500);
    if (record.fontSize != null) {
      shape.fontSize = clamp(record.fontSize, 8, 200, 16);
    }
    if (record.fontWeight === 'bold' || record.fontWeight === 'normal') {
      shape.fontWeight = record.fontWeight;
    }
    if (record.fill != null) shape.fill = String(record.fill).slice(0, 64);
    if (record.stroke != null) shape.stroke = String(record.stroke).slice(0, 64);
    if (record.strokeWidth != null) {
      shape.strokeWidth = clamp(record.strokeWidth, 0, 20, 2);
    }
    if (record.width != null) shape.width = clamp(record.width, 4, 2000, 120);
    if (record.height != null) {
      shape.height = clamp(record.height, 4, 2000, 80);
    }
    if (record.cornerRadius != null) {
      shape.cornerRadius = clamp(record.cornerRadius, 0, 200, 0);
    }
    return shape;
  }
}
