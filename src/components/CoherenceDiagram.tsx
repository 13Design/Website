/**
 * The pitch, drawn: generated output arrives misaligned and inconsistent, then
 * resolves into something deliberate. Pure SVG + CSS — no assets, no library.
 *
 * Every block sits at its RESOLVED position in the markup; the `snap` keyframe
 * offsets each one by its own --dx/--dy/--dr and brings it back. One keyframe
 * drives the whole thing, and the honest state is the one in the DOM.
 */

type Block = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Scattered offset it animates from. */
  dx: number;
  dy: number;
  dr: number;
  delay: number;
  accent?: boolean;
  /** Slightly brighter fill for foreground blocks. */
  fg?: boolean;
};

const BLOCKS: Block[] = [
  // top bar
  { x: 20, y: 20, w: 320, h: 14, dx: -9, dy: -7, dr: -1.4, delay: 0 },
  // sidebar
  { x: 20, y: 46, w: 64, h: 174, dx: -14, dy: 10, dr: 1.6, delay: 0.35 },
  // headline rows
  { x: 96, y: 46, w: 244, h: 12, dx: 16, dy: -9, dr: 1.1, delay: 0.1 },
  { x: 96, y: 66, w: 190, h: 12, dx: 22, dy: -4, dr: -1.8, delay: 0.5 },
  // cards
  { x: 96, y: 90, w: 118, h: 62, dx: -11, dy: 13, dr: -2.2, delay: 0.25, fg: true },
  { x: 222, y: 90, w: 118, h: 62, dx: 15, dy: 9, dr: 2.4, delay: 0.6, fg: true },
  // body rows
  { x: 96, y: 164, w: 244, h: 10, dx: 9, dy: 11, dr: 1.3, delay: 0.15 },
  { x: 96, y: 182, w: 200, h: 10, dx: 18, dy: 6, dr: -1.1, delay: 0.45 },
  // the one decision that matters
  { x: 96, y: 204, w: 88, h: 16, dx: -13, dy: 14, dr: 2.8, delay: 0.7, accent: true },
];

export default function CoherenceDiagram({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 240"
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label="An interface diagram: misaligned, inconsistent blocks resolving into a deliberate, aligned layout."
    >
      {/* grid the layout resolves onto */}
      <g stroke="#242428" strokeWidth="1" opacity="0.5">
        {[46, 90, 164, 204].map((y) => (
          <line key={y} x1="20" y1={y} x2="340" y2={y} strokeDasharray="2 5" />
        ))}
        <line x1="96" y1="20" x2="96" y2="220" strokeDasharray="2 5" />
      </g>

      {BLOCKS.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx={b.h > 40 ? 6 : 3}
          className="svg-part animate-snap"
          fill={b.accent ? '#e8744c' : b.fg ? '#2e2e34' : '#1c1c20'}
          stroke={b.accent ? 'none' : '#2e2e34'}
          strokeWidth="1"
          style={
            {
              '--dx': `${b.dx}px`,
              '--dy': `${b.dy}px`,
              '--dr': `${b.dr}deg`,
              animationDelay: `${b.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  );
}
