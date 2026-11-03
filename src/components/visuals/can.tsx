import { cn } from "@/lib/utils";

type CanProps = {
  label: string;
  sublabel?: string;
  color: string;
  className?: string;
};

/**
 * Illustrated can used as product artwork until real photography is uploaded.
 * Pure SVG so it stays crisp, tiny and animatable.
 */
export function Can({ label, sublabel, color, className }: CanProps) {
  const id = label.replace(/\W+/g, "-").toLowerCase();
  return (
    <svg
      viewBox="0 0 200 300"
      className={cn("h-auto w-full drop-shadow-[0_30px_40px_rgba(42,26,16,0.35)]", className)}
      role="img"
      aria-label={`${label} can`}
    >
      <defs>
        <linearGradient id={`body-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.75" />
          <stop offset="0.35" stopColor={color} />
          <stop offset="0.6" stopColor={color} />
          <stop offset="1" stopColor="#1a0f08" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`metal-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#8d8a84" />
          <stop offset="0.3" stopColor="#f1eee8" />
          <stop offset="0.65" stopColor="#bdb8af" />
          <stop offset="1" stopColor="#5f5b55" />
        </linearGradient>
        <linearGradient id={`shine-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* body */}
      <rect x="20" y="34" width="160" height="236" rx="10" fill={`url(#body-${id})`} />
      {/* rims */}
      <rect x="16" y="22" width="168" height="20" rx="8" fill={`url(#metal-${id})`} />
      <rect x="16" y="262" width="168" height="18" rx="8" fill={`url(#metal-${id})`} />
      <ellipse cx="100" cy="24" rx="84" ry="10" fill="#d9d5cd" />
      <ellipse cx="100" cy="24" rx="70" ry="6" fill="#bfbab1" />

      {/* label band */}
      <rect x="20" y="96" width="160" height="112" fill="#fbf7ef" opacity="0.94" />
      <text
        x="100"
        y="76"
        textAnchor="middle"
        fontFamily="var(--font-fraunces), Georgia, serif"
        fontSize="15"
        fontWeight="700"
        letterSpacing="3"
        fill="#fbf7ef"
      >
        BEING NUTTY
      </text>
      <text
        x="100"
        y={sublabel ? 148 : 158}
        textAnchor="middle"
        fontFamily="var(--font-fraunces), Georgia, serif"
        fontSize={label.length > 10 ? 22 : 28}
        fontWeight="800"
        fill="#2a1a10"
        {...(label.length > 10 ? { textLength: 140, lengthAdjust: "spacingAndGlyphs" } : {})}
      >
        {label}
      </text>
      {sublabel ? (
        <text
          x="100"
          y="176"
          textAnchor="middle"
          fontFamily="var(--font-instrument), system-ui, sans-serif"
          fontSize="12"
          letterSpacing="2"
          fill="#6b3e1f"
        >
          {sublabel.toUpperCase()}
        </text>
      ) : null}
      <rect x="20" y="96" width="160" height="3" fill={color} />
      <rect x="20" y="205" width="160" height="3" fill={color} />

      {/* highlight */}
      <rect x="44" y="34" width="26" height="236" fill={`url(#shine-${id})`} />
    </svg>
  );
}
