/** A-Linx panelized construction — SVG pattern library for city blocks */
export default function SteelCityDefs() {
  return (
    <defs>
      {/* Phase 1: light-gauge steel stud frame */}
      <pattern id="city-steel-frame" width="1" height="1" patternContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill="#2a3238" />
        <rect x="0" y="0.04" width="1" height="0.05" fill="#8a9aa8" />
        <rect x="0" y="0.46" width="1" height="0.04" fill="#6e7d8a" />
        <rect x="0" y="0.9" width="1" height="0.05" fill="#8a9aa8" />
        <rect x="0.1" y="0" width="0.045" height="1" fill="#b8c4d0" />
        <rect x="0.3" y="0" width="0.035" height="1" fill="#9aa8b4" />
        <rect x="0.5" y="0" width="0.045" height="1" fill="#b8c4d0" />
        <rect x="0.7" y="0" width="0.035" height="1" fill="#9aa8b4" />
        <rect x="0.88" y="0" width="0.045" height="1" fill="#b8c4d0" />
      </pattern>

      {/* Phase 2: lime-green WRB sheathing with fasteners */}
      <pattern id="city-sheathing" width="1" height="1" patternContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill="#7a9e4a" />
        <rect width="1" height="1" fill="url(#sheathing-shade)" />
        <circle cx="0.18" cy="0.22" r="0.025" fill="rgba(20,40,10,0.45)" />
        <circle cx="0.5" cy="0.22" r="0.025" fill="rgba(20,40,10,0.45)" />
        <circle cx="0.82" cy="0.22" r="0.025" fill="rgba(20,40,10,0.45)" />
        <circle cx="0.18" cy="0.55" r="0.025" fill="rgba(20,40,10,0.45)" />
        <circle cx="0.5" cy="0.55" r="0.025" fill="rgba(20,40,10,0.45)" />
        <circle cx="0.82" cy="0.55" r="0.025" fill="rgba(20,40,10,0.45)" />
        <circle cx="0.18" cy="0.82" r="0.025" fill="rgba(20,40,10,0.45)" />
        <circle cx="0.5" cy="0.82" r="0.025" fill="rgba(20,40,10,0.45)" />
        <circle cx="0.82" cy="0.82" r="0.025" fill="rgba(20,40,10,0.45)" />
        <rect width="1" height="1" fill="none" stroke="rgba(50,80,30,0.35)" strokeWidth="0.02" />
      </pattern>
      <linearGradient id="sheathing-shade" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
      </linearGradient>

      {/* Finished: dark charcoal panel / brick */}
      <pattern id="city-charcoal" width="1" height="1" patternContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill="#353a40" />
        <rect x="0.03" y="0.07" width="0.44" height="0.1" fill="#424850" stroke="rgba(0,0,0,0.25)" strokeWidth="0.01" />
        <rect x="0.52" y="0.07" width="0.44" height="0.1" fill="#3a3f46" stroke="rgba(0,0,0,0.25)" strokeWidth="0.01" />
        <rect x="0.27" y="0.2" width="0.44" height="0.1" fill="#40464e" stroke="rgba(0,0,0,0.25)" strokeWidth="0.01" />
        <rect x="0.03" y="0.33" width="0.44" height="0.1" fill="#3e444c" stroke="rgba(0,0,0,0.25)" strokeWidth="0.01" />
        <rect x="0.52" y="0.33" width="0.44" height="0.1" fill="#424850" stroke="rgba(0,0,0,0.25)" strokeWidth="0.01" />
        <rect x="0.27" y="0.46" width="0.44" height="0.1" fill="#3a3f46" stroke="rgba(0,0,0,0.25)" strokeWidth="0.01" />
        <rect x="0.03" y="0.59" width="0.44" height="0.1" fill="#40464e" stroke="rgba(0,0,0,0.25)" strokeWidth="0.01" />
        <rect x="0.52" y="0.59" width="0.44" height="0.1" fill="#3e444c" stroke="rgba(0,0,0,0.25)" strokeWidth="0.01" />
        <rect x="0.27" y="0.72" width="0.44" height="0.1" fill="#424850" stroke="rgba(0,0,0,0.25)" strokeWidth="0.01" />
        <rect x="0.03" y="0.85" width="0.44" height="0.1" fill="#3a3f46" stroke="rgba(0,0,0,0.25)" strokeWidth="0.01" />
        <rect x="0.52" y="0.85" width="0.44" height="0.1" fill="#40464e" stroke="rgba(0,0,0,0.25)" strokeWidth="0.01" />
      </pattern>

      {/* Finished: light stone / precast spandrel */}
      <pattern id="city-stone" width="1" height="1" patternContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill="#c8bfb0" />
        <line x1="0" y1="0.33" x2="1" y2="0.33" stroke="rgba(140,130,115,0.4)" strokeWidth="0.025" />
        <line x1="0" y1="0.66" x2="1" y2="0.66" stroke="rgba(140,130,115,0.35)" strokeWidth="0.02" />
        <rect x="0.04" y="0.06" width="0.92" height="0.22" fill="rgba(255,255,255,0.07)" />
        <rect x="0.04" y="0.38" width="0.92" height="0.24" fill="rgba(0,0,0,0.03)" />
        <rect width="1" height="1" fill="none" stroke="rgba(160,150,135,0.45)" strokeWidth="0.025" />
      </pattern>

      {/* Floor-to-ceiling glazed unit */}
      <pattern id="city-window" width="1" height="1" patternContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill="#1a2028" />
        <rect x="0.08" y="0.06" width="0.84" height="0.88" fill="rgba(100,140,175,0.42)" />
        <rect x="0.08" y="0.06" width="0.84" height="0.88" fill="none" stroke="#2a3038" strokeWidth="0.03" />
        <line x1="0.5" y1="0.06" x2="0.5" y2="0.94" stroke="#2a3038" strokeWidth="0.02" />
        <rect x="0.1" y="0.08" width="0.3" height="0.2" fill="rgba(255,255,255,0.1)" />
      </pattern>

      {/* Lit interior — warm glow through glass */}
      <pattern id="city-window-lit" width="1" height="1" patternContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill="#1a2028" />
        <rect x="0.08" y="0.06" width="0.84" height="0.88" fill="rgba(235,195,110,0.72)" />
        <rect x="0.08" y="0.06" width="0.84" height="0.88" fill="none" stroke="#2a3038" strokeWidth="0.03" />
        <line x1="0.5" y1="0.06" x2="0.5" y2="0.94" stroke="#2a3038" strokeWidth="0.02" />
        <rect x="0.12" y="0.1" width="0.35" height="0.15" fill="rgba(255,240,200,0.35)" />
      </pattern>

      {/* Balcony slab + glass guardrail */}
      <pattern id="city-balcony" width="1" height="1" patternContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill="#3a3f46" />
        <rect x="0" y="0.55" width="1" height="0.12" fill="#505860" />
        <rect x="0.06" y="0.18" width="0.88" height="0.36" fill="rgba(120,170,210,0.35)" />
        <line x1="0.06" y1="0.2" x2="0.94" y2="0.2" stroke="rgba(200,220,240,0.7)" strokeWidth="0.025" />
        <line x1="0.06" y1="0.52" x2="0.94" y2="0.52" stroke="#606870" strokeWidth="0.02" />
      </pattern>

      {/* Ground-floor storefront glazing */}
      <pattern id="city-storefront" width="1" height="1" patternContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill="#222830" />
        <rect x="0.05" y="0.04" width="0.42" height="0.92" fill="rgba(90,130,165,0.5)" stroke="#1a2028" strokeWidth="0.025" />
        <rect x="0.53" y="0.04" width="0.42" height="0.92" fill="rgba(75,115,150,0.55)" stroke="#1a2028" strokeWidth="0.025" />
        <rect x="0" y="0.92" width="1" height="0.06" fill="#3a4048" />
      </pattern>

      {/* Concrete foundation / slab */}
      <pattern id="city-foundation" width="1" height="1" patternContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill="#5a6068" />
        <rect x="0.04" y="0.1" width="0.92" height="0.08" fill="rgba(255,255,255,0.07)" />
        <rect x="0.04" y="0.5" width="0.92" height="0.06" fill="rgba(0,0,0,0.08)" />
        <rect x="0.04" y="0.78" width="0.92" height="0.05" fill="rgba(255,255,255,0.05)" />
      </pattern>

      {/* Flat roof + pergola overhang slats */}
      <pattern id="city-roof" width="1" height="1" patternContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill="#2a3038" />
        <rect x="0" y="0" width="1" height="0.18" fill="#1e242c" />
        <rect x="0.04" y="0.02" width="0.07" height="0.14" fill="#3a424c" />
        <rect x="0.18" y="0.02" width="0.07" height="0.14" fill="#3a424c" />
        <rect x="0.32" y="0.02" width="0.07" height="0.14" fill="#3a424c" />
        <rect x="0.46" y="0.02" width="0.07" height="0.14" fill="#3a424c" />
        <rect x="0.6" y="0.02" width="0.07" height="0.14" fill="#3a424c" />
        <rect x="0.74" y="0.02" width="0.07" height="0.14" fill="#3a424c" />
        <rect x="0.88" y="0.02" width="0.07" height="0.14" fill="#3a424c" />
        <rect x="0" y="0.18" width="1" height="0.82" fill="#323840" />
      </pattern>
    </defs>
  );
}

export function materialFill(material: string): string {
  return `url(#city-${material})`;
}
