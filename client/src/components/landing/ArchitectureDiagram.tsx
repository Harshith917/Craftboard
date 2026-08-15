const NODES = [
  { x: 40, y: 40, w: 1120, h: 170, color: "#a3a3a3", label: "«node» External Cloud Services" },
  { x: 40, y: 260, w: 1120, h: 200, color: "#737373", label: "«device» Client — Browser" },
  { x: 40, y: 510, w: 1120, h: 210, color: "#525252", label: "«node» Application Server" },
  { x: 40, y: 770, w: 1120, h: 100, color: "#404040", label: "«database» Data Stores" },
];

type UmlBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  glyph: string;
  stereo: string;
  name: string;
  sub: string;
};

const BOXES: UmlBox[] = [
  { x: 90, y: 105, w: 300, h: 80, color: "#a3a3a3", glyph: "LB", stereo: "«external»", name: "Liveblocks Cloud", sub: "rooms · CRDT · presence" },
  { x: 420, y: 105, w: 300, h: 80, color: "#a3a3a3", glyph: "CK", stereo: "«external»", name: "Clerk Cloud", sub: "Authn · sessions" },
  { x: 750, y: 105, w: 300, h: 80, color: "#a3a3a3", glyph: "OL", stereo: "«service»", name: "Ollama", sub: "LLM · :11434" },

  { x: 90, y: 320, w: 300, h: 110, color: "#737373", glyph: "SPA", stereo: "«SPA»", name: "React 19 + Vite", sub: "SWR · Axios · Router" },
  { x: 420, y: 320, w: 300, h: 110, color: "#737373", glyph: "SDK", stereo: "«library»", name: "Clerk SDK", sub: "@clerk/clerk-react" },
  { x: 750, y: 320, w: 300, h: 110, color: "#737373", glyph: "CV", stereo: "«component»", name: "Konva Canvas", sub: "editor · zoom · pan" },

  { x: 90, y: 575, w: 300, h: 120, color: "#525252", glyph: "API", stereo: "«component»", name: "Express 5 API", sub: "projects · pages · members · AI" },
  { x: 420, y: 575, w: 300, h: 120, color: "#525252", glyph: "AU", stereo: "«middleware»", name: "Auth Guard", sub: "Clerk JWT · role guards" },
  { x: 750, y: 575, w: 160, h: 120, color: "#525252", glyph: "SO", stereo: "«component»", name: "Socket.IO", sub: "live events" },
  { x: 935, y: 575, w: 195, h: 120, color: "#525252", glyph: "AI", stereo: "«service»", name: "AI Service", sub: "Ollama client" },

  { x: 90, y: 800, w: 300, h: 60, color: "#404040", glyph: "PR", stereo: "«component»", name: "Prisma ORM", sub: "type-safe queries" },
  { x: 420, y: 800, w: 300, h: 60, color: "#404040", glyph: "DB", stereo: "«database»", name: "PostgreSQL", sub: "relational storage" },
];

const LINES = [
  { d: "M240 430 L240 575", label: "REST · JSON", color: "#525252", side: 250 },
  { d: "M240 695 L240 800", label: "Prisma Client", color: "#404040", side: 250 },
  { d: "M390 830 L420 830", label: "SQL", color: "#404040", side: 405 },
  { d: "M240 320 L240 185", label: "WSS · CRDT", color: "#737373", side: 250 },
  { d: "M570 320 L570 185", label: "OAuth · JWT", color: "#737373", side: 580 },
  { d: "M390 635 L420 635", label: "JWT", color: "#737373", side: 405 },
  { d: "M1050 375 L830 575", label: "WSS · events", color: "#737373", side: 950 },
  { d: "M1130 635 L1168 635 L1168 250 L900 250 L900 185", label: "HTTP · :11434", color: "#a3a3a3", side: 1030 },
];

function Pill({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  const width = text.length * 5.8 + 16;
  return (
    <g>
      <rect x={x - width / 2} y={y - 10} width={width} height={20} rx={10} fill="#ffffff" stroke="#a3a3a3" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="9.5" fontWeight="600" fill={color}>
        {text}
      </text>
    </g>
  );
}

function BoxGlyph({ box }: { box: UmlBox }) {
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx="12"
        fill="#ffffff"
        stroke="#a3a3a3"
        strokeWidth="1.4"
        filter="url(#shadow)"
      />
      <rect x={box.x + 14} y={box.y + 14} width="32" height="32" rx="8" fill={box.color} fillOpacity="0.12" />
      <text
        x={box.x + 30}
        y={box.y + 35}
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fill={box.color}
      >
        {box.glyph}
      </text>
      <text x={box.x + 56} y={box.y + 27} fontSize="9" fontWeight="600" fill={box.color} style={{ textTransform: "uppercase" }}>
        {box.stereo}
      </text>
      <text x={box.x + 56} y={box.y + 42} fontSize="12.5" fontWeight="600" fill="#0a0a0a">
        {box.name}
      </text>
      <text x={box.x + 56} y={box.y + 58} fontSize="9.5" fill="#737373">
        {box.sub}
      </text>
    </g>
  );
}

export default function ArchitectureDiagram() {
  return (
    <div className="rounded-2xl border border-border bg-app p-3 sm:p-5">
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 1200 900"
          className="h-auto w-full min-w-[900px]"
          role="img"
          aria-label="Craftboard UML deployment architecture diagram"
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000000" floodOpacity="0.12" />
            </filter>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6.5"
              markerHeight="6.5"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
            </marker>
          </defs>

          {/* Deployment nodes */}
          {NODES.map((n) => (
            <g key={n.label}>
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="14" fill={n.color} fillOpacity="0.05" stroke={n.color} strokeOpacity="0.45" strokeWidth="1.4" />
              <rect x={n.x} y={n.y} width={n.w} height={30} rx="14" fill={n.color} fillOpacity="0.08" />
              <circle cx={n.x + 20} cy={n.y + 15} r={4} fill={n.color} />
              <text x={n.x + 32} y={n.y + 19} fontSize="11" fontWeight="700" letterSpacing="0.5" fill={n.color}>
                {n.label}
              </text>
            </g>
          ))}

          {/* Dependencies */}
          {LINES.map((l) => (
            <g key={l.d}>
              <path d={l.d} fill="none" stroke={l.color} strokeWidth="1.8" strokeDasharray="6 5" markerEnd="url(#arrow)" />
              <Pill x={l.side} y={l.d.includes("L835") ? 470 : labelY(l)} text={l.label} color={l.color} />
            </g>
          ))}

          {/* Multiplicity on the main REST link */}
          <text x={250} y={452} fontSize="9.5" fontWeight="600" fill="#525252">1</text>
          <text x={250} y={540} fontSize="9.5" fontWeight="600" fill="#525252">1..*</text>

          {/* Components */}
          {BOXES.map((b) => (
            <BoxGlyph key={b.name} box={b} />
          ))}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-2">
          <svg width="34" height="14" viewBox="0 0 34 14" className="text-neutral-400">
            <rect x="1" y="1" width="32" height="12" rx="3" fill="#ffffff" stroke="#737373" strokeWidth="1.2" />
          </svg>
          Deployment node («node» · «device» · «database»)
        </span>
        <span className="flex items-center gap-2">
          <svg width="34" height="14" viewBox="0 0 34 14" className="text-neutral-400">
            <rect x="1" y="1" width="32" height="12" rx="3" fill="#ffffff" stroke="#737373" strokeWidth="1.2" />
          </svg>
          Component / service (stereotyped)
        </span>
        <span className="flex items-center gap-2">
          <svg width="34" height="12" viewBox="0 0 34 12" className="text-neutral-500">
            <line x1="0" y1="6" x2="28" y2="6" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#legend-a)" />
          </svg>
          Dependency (uses / connects)
        </span>
      </div>

      <svg width="0" height="0" className="absolute">
        <defs>
          <marker id="legend-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function labelY(line: { d: string }) {
  const d = line.d;
  if (d === "M240 430 L240 575") return 500;
  if (d === "M240 695 L240 800") return 750;
  if (d === "M390 830 L420 830") return 822;
  if (d === "M240 320 L240 185") return 260;
  if (d === "M570 320 L570 185") return 260;
  if (d === "M390 635 L420 635") return 627;
  if (d.startsWith("M1050 375")) return 468;
  return 240;
}
