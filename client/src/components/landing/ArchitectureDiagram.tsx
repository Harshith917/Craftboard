const CX = 481.5;

const SPINE = "#D9DDE5";
const BORDER = "#E5E7EB";
const TEXT = "#0F172A";
const MUTED = "#64748B";

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

type Section = { label: string; y: number; w: number; pill: string };
type Card = {
  x: number;
  y: number;
  badge: string;
  badgeColor: string;
  badgeBorder: string;
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  desc: [string, string];
};

const SECTIONS: Section[] = [
  { label: "PRESENTATION", y: 92, w: 150, pill: "#BFDBFE" },
  { label: "AUTHENTICATION", y: 294, w: 156, pill: "#FBCFE8" },
  { label: "APPLICATION", y: 496, w: 144, pill: "#FBE3C8" },
  { label: "DATA", y: 698, w: 86, pill: "#BAE6FD" },
];

const CI_STEPS = [
  { label: "lint", x: 225.5 },
  { label: "test", x: 331.5 },
  { label: "build", x: 437.5 },
  { label: "image", x: 543.5 },
  { label: "deploy", x: 649.5 },
];

const CARDS: Card[] = [
  // PRESENTATION
  {
    x: 261.5, y: 140, badge: "UI", badgeColor: "#111827", badgeBorder: "#D6DCE5",
    icon: "globe", iconColor: "#111827",
    title: "Client", subtitle: "React 19 + Vite",
    desc: ["React 19 · Vite SPA · SWR", "client-side routing · code-split"],
  },
  {
    x: 491.5, y: 140, badge: "RENDER", badgeColor: "#0D9488", badgeBorder: "#B7E8DF",
    icon: "pen", iconColor: "#0D9488",
    title: "Canvas", subtitle: "Konva Canvas",
    desc: ["Shape rendering · transformer", "zoom · pan · grid & snap-to-grid"],
  },
  // AUTHENTICATION
  {
    x: 376.5, y: 342, badge: "AUTH", badgeColor: "#E11D48", badgeBorder: "#FBCFE8",
    icon: "shield", iconColor: "#E11D48",
    title: "Auth", subtitle: "Clerk Auth",
    desc: ["Sign-up · sign-in · sessions", "protected routes & middleware"],
  },
  // APPLICATION
  {
    x: 151.5, y: 544, badge: "API", badgeColor: "#DC2626", badgeBorder: "#FECACA",
    icon: "server", iconColor: "#DC2626",
    title: "Backend", subtitle: "Express 5 API",
    desc: ["REST routes · middleware", "guards · services · validation"],
  },
  {
    x: 376.5, y: 544, badge: "SYNC", badgeColor: "#8B5CF6", badgeBorder: "#DDD6FE",
    icon: "signal", iconColor: "#8B5CF6",
    title: "Realtime", subtitle: "Liveblocks",
    desc: ["Storage sync · presence", "conflict resolution · rooms"],
  },
  {
    x: 601.5, y: 544, badge: "EVENTS", badgeColor: "#1E293B", badgeBorder: "#CBD5E1",
    icon: "wifi", iconColor: "#1E293B",
    title: "Socket", subtitle: "Socket.IO",
    desc: ["Cursor positions · requests", "notifications · live events"],
  },
  // DATA
  {
    x: 261.5, y: 746, badge: "DATA", badgeColor: "#6366F1", badgeBorder: "#C7D2FE",
    icon: "layers", iconColor: "#6366F1",
    title: "ORM", subtitle: "Prisma ORM",
    desc: ["Type-safe client · migrations", "relation queries · pagination"],
  },
  {
    x: 491.5, y: 746, badge: "STORAGE", badgeColor: "#3B82F6", badgeBorder: "#BFDBFE",
    icon: "db", iconColor: "#3B82F6",
    title: "DB", subtitle: "PostgreSQL 16",
    desc: ["Relational storage · indexing", "transactions · backups"],
  },
];

// Spine arrows between the four layers, plus the dashed observability link.
const ARROWS = [
  { cy: 272, label: "auth flow" },
  { cy: 474, label: "JWT" },
  { cy: 676, label: "SQL" },
];

function Glyph({ name }: { name: string }) {
  const s = "#ffffff";
  return (
    <g fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {name === "globe" && (
        <g>
          <circle cx="12" cy="12" r="7.5" />
          <ellipse cx="12" cy="12" rx="3.2" ry="7.5" strokeWidth="1.6" />
          <path d="M4.5 12h15" strokeWidth="1.6" />
        </g>
      )}
      {name === "pen" && <path d="M15 5l4 4L8.5 19.5l-4 .5.5-4z" />}
      {name === "shield" && (
        <g>
          <path d="M12 3.5l6.2 2.1v5.4c0 4.3-2.8 7.2-6.2 9-3.4-1.8-6.2-4.7-6.2-9V5.6z" />
          <path d="M9 12l2.2 2.2L15.5 9.7" />
        </g>
      )}
      {name === "server" && (
        <g>
          <rect x="4" y="4.5" width="16" height="6.5" rx="2" />
          <rect x="4" y="13" width="16" height="6.5" rx="2" />
          <circle cx="8" cy="7.7" r="1.1" fill={s} />
          <circle cx="8" cy="16.2" r="1.1" fill={s} />
        </g>
      )}
      {name === "signal" && (
        <g>
          <path d="M6.5 9.6a7.5 7.5 0 0 1 11 0" />
          <path d="M9.4 12.8a4.2 4.2 0 0 1 5.2 0" />
          <circle cx="12" cy="17" r="1.4" fill={s} />
        </g>
      )}
      {name === "wifi" && (
        <g>
          <path d="M4.5 9.2a9.8 9.8 0 0 1 15 0" />
          <path d="M8 12.6a5.6 5.6 0 0 1 8 0" />
          <circle cx="12" cy="17.2" r="1.4" fill={s} />
        </g>
      )}
      {name === "layers" && (
        <g>
          <path d="M12 4l8 4-8 4-8-4z" />
          <path d="M4 12l8 4 8-4" />
          <path d="M4 16l8 4 8-4" />
        </g>
      )}
      {name === "db" && (
        <g>
          <ellipse cx="12" cy="5.5" rx="7.2" ry="2.6" />
          <path d="M4.8 5.5v11c0 1.4 3.2 2.6 7.2 2.6s7.2-1.2 7.2-2.6v-11" />
          <path d="M4.8 11c0 1.4 3.2 2.6 7.2 2.6s7.2-1.2 7.2-2.6" />
        </g>
      )}
      {name === "pulse" && <path d="M2.5 12h4l3-6 4.5 10 2.5-4H21" />}
    </g>
  );
}

function SectionLabel({ section }: { section: Section }) {
  const x = CX - section.w / 2;
  return (
    <g>
      <rect x={x} y={section.y} width={section.w} height={24} rx={12} fill="#FCFCFD" stroke={section.pill} strokeWidth="1" />
      <text x={CX} y={section.y + 16} textAnchor="middle" fontFamily={SERIF} fontSize="11" letterSpacing="2.5" fill="#1E293B">
        {section.label}
      </text>
    </g>
  );
}

function ArchitectureCard({ card }: { card: Card }) {
  const badgeWidth = card.badge.length * 5.6 + 16;
  return (
    <g>
      <rect
        x={card.x}
        y={card.y}
        width="210"
        height="104"
        rx="14"
        fill="#ffffff"
        stroke={BORDER}
        strokeWidth="1"
      />
      <rect x={card.x + 16} y={card.y + 16} width="34" height="34" rx="9" fill={card.iconColor} />
      <g transform={`translate(${card.x + 21},${card.y + 21})`}>
        <Glyph name={card.icon} />
      </g>
      <text x={card.x + 62} y={card.y + 31} fontSize="13.5" fontWeight="600" fill={TEXT}>
        {card.title}
      </text>
      <text x={card.x + 62} y={card.y + 47} fontSize="11" fill={MUTED}>
        {card.subtitle}
      </text>
      <text x={card.x + 16} y={card.y + 74} fontSize="10.5" fontFamily={MONO} fill={MUTED}>
        {card.desc[0]}
      </text>
      <text x={card.x + 16} y={card.y + 88} fontSize="10.5" fontFamily={MONO} fill={MUTED}>
        {card.desc[1]}
      </text>
      <rect
        x={card.x + 210 - badgeWidth - 10}
        y={card.y - 8}
        width={badgeWidth}
        height="16"
        rx="8"
        fill="#ffffff"
        stroke={card.badgeBorder}
        strokeWidth="1"
      />
      <text
        x={card.x + 210 - 10 - badgeWidth / 2}
        y={card.y + 4}
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="600"
        letterSpacing="1"
        fill={card.badgeColor}
      >
        {card.badge}
      </text>
    </g>
  );
}

export default function ArchitectureDiagram() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
      <svg
        viewBox="0 0 963 1010"
        className="h-auto w-full min-w-[860px] bg-[#FCFCFD]"
        role="img"
        aria-label="Craftboard architecture: CI/CD, presentation, authentication, application, data, and observability layers"
      >
        {/* CI/CD label + steps */}
        <text x={CX} y={30} textAnchor="middle" fontFamily={SERIF} fontSize="11" letterSpacing="2.5" fill="#1E293B">
          CI / CD · GITHUB ACTIONS
        </text>
        {CI_STEPS.map((step, i) => (
          <g key={step.label}>
            <rect x={step.x} y={44} width="88" height="24" rx="12" fill="#ffffff" stroke={BORDER} strokeWidth="1" />
            <text x={step.x + 44} y={60} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#334155">
              {step.label}
            </text>
            {i < CI_STEPS.length - 1 && (
              <path
                d={`M${step.x + 88 + 2} 56 L${step.x + 88 + 16} 56`}
                fill="none"
                stroke={SPINE}
                strokeWidth="1.4"
                markerEnd="url(#ah)"
              />
            )}
          </g>
        ))}

        {/* spine */}
        <line x1={CX} y1="96" x2={CX} y2="852" stroke={SPINE} strokeWidth="1" />
        <line x1={CX} y1="852" x2={CX} y2="908" stroke={SPINE} strokeWidth="1" strokeDasharray="5 4" />

        {/* layer arrows on the spine */}
        {ARROWS.map((arrow) => (
          <g key={arrow.cy}>
            <path d={`M${CX} ${arrow.cy - 4} L${CX + 4.5} ${arrow.cy + 2} H${CX - 4.5} Z`} fill={SPINE} />
            <text x={CX + 10} y={arrow.cy + 4} fontFamily={MONO} fontSize="9" fill={MUTED}>
              {arrow.label}
            </text>
          </g>
        ))}

        {SECTIONS.map((section) => (
          <SectionLabel key={section.label} section={section} />
        ))}

        {CARDS.map((card) => (
          <ArchitectureCard key={card.title} card={card} />
        ))}

        {/* Observability strip */}
        <g>
          <rect x="231.5" y="920" width="500" height="46" rx="14" fill="#ffffff" stroke={BORDER} strokeWidth="1" />
          <rect x="247.5" y="934" width="28" height="28" rx="8" fill="#64748B" />
          <g transform="translate(252.5,939)">
            <Glyph name="pulse" />
          </g>
          <text x="287" y="944" fontSize="13" fontWeight="600" fill={TEXT}>
            Observability
          </text>
          <text x="287" y="958" fontSize="9.5" fontFamily={MONO} fill={MUTED}>
            /health DB probe · helmet headers · rate limiting · auto-migrations
          </text>
          <text x={CX + 12} y={886} fontFamily={MONO} fontSize="9" fill={MUTED}>
            telemetry
          </text>
        </g>

        {/* legend */}
        <g>
          <line x1="150" y1="988" x2="188" y2="988" stroke="#5566A0" strokeWidth="1.5" markerEnd="url(#ah)" />
          <text x="198" y="992" fontFamily={MONO} fontSize="9.5" fill={MUTED}>request / data flow</text>
          <line x1="480" y1="988" x2="518" y2="988" stroke="#64748B" strokeWidth="1.5" strokeDasharray="5 4" markerEnd="url(#ah)" />
          <text x="528" y="992" fontFamily={MONO} fontSize="9.5" fill={MUTED}>telemetry / background flow</text>
        </g>
      </svg>
    </div>
  );
}
