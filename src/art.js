/* ---------- Icons (Lucide-style, 24px grid, stroke) ---------- */
const ICONS = {
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  chat:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  right:'<path d="m9 18 6-6-6-6"/>',
  left:'<path d="m15 18-6-6 6-6"/>',
  arrow:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  truck:'<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  card:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  badge:'<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  star:'<path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z"/>',
  laptop:'<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
  tv:'<rect width="20" height="15" x="2" y="7" rx="2"/><path d="m17 2-5 5-5-5"/>',
  printer:'<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  smartphone:'<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  gamepad:'<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><path d="M17.32 5H6.68a4 4 0 0 0-3.98 3.59C2.6 9.42 2 14.46 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.41-1.41A2 2 0 0 1 9.83 16h4.34a2 2 0 0 1 1.41.59L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.55-.6-6.58-.69-7.26A4 4 0 0 0 17.32 5z"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  speaker:'<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M12 6h.01"/><circle cx="12" cy="14" r="4"/><path d="M12 14h.01"/>',
  monitor:'<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
  volume:'<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.41 7.59A1.4 1.4 0 0 1 5.42 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.42a1.4 1.4 0 0 1 .99.41l3.39 3.39a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.36 18.36a9 9 0 0 0 0-12.73"/>',
  wifi:'<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.86a10 10 0 0 1 14 0"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/>',
  cpu:'<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
  receipt:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  sliders:'<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  play:'<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" fill="currentColor"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  cable:'<path d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1"/><path d="M19 15V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V9"/><path d="M21 21v-2h-4"/><path d="M3 5h4V3"/><path d="M7 5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1V3"/>',
  plug:'<path d="M12 22v-5M9 8V2M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8M16 17H8M10 9H8"/>',
  remote:'<rect x="7" y="2" width="10" height="20" rx="3.5"/><circle cx="12" cy="7.5" r="1.8"/><path d="M10.5 13h3M10.5 16h3M10.5 19h3"/>',
  stand:'<path d="M3 20h18"/><path d="M8 20l2-6h4l2 6"/><rect x="4" y="3" width="16" height="11" rx="1.5"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  expand:'<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  zoom:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>',
  calc:'<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>',
  tag:'<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1" fill="currentColor"/>',
  router:'<rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6.01 18H6M10.01 18H10M15 10v4"/><path d="M17.84 7.17a4 4 0 0 0-5.66 0"/><path d="M20.66 4.34a8 8 0 0 0-11.31 0"/>',
  box:'<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  rotate:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  bolt:'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  bluetooth:'<path d="m7 7 10 10-5 5V2l5 5L7 17"/>',
  scan:'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/>',
  ruler:'<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
  bell:'<path d="M10.27 21a2 2 0 0 0 3.46 0"/><path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33"/>',
  plus:'<path d="M5 12h14M12 5v14"/>'
};
function ic(name, size = 20, sw = 1.8) {
  return `<svg class="i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/* ---------- Product illustrations (placeholders, no brand marks) ---------- */
const ART = (() => {
  let n = 0;
  const id = p => `${p}${++n}`;
  const shadow = (d, cx, cy, rx, ry = 11, o = .22) => {
    const g = id('sh');
    d.push(`<radialGradient id="${g}"><stop offset="0" stop-color="#0B0B0F" stop-opacity="${o}"/><stop offset="1" stop-color="#0B0B0F" stop-opacity="0"/></radialGradient>`);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${g})"/>`;
  };
  const lin = (d, a, b, vertical = true) => {
    const g = id('lg');
    d.push(`<linearGradient id="${g}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`);
    return `url(#${g})`;
  };
  const screen = (d, x, y, w, h, hue, r = 2) => {
    const a = id('sa'), b = id('sb'), c = id('sc'), cl = id('cl');
    d.push(`<linearGradient id="${a}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},68%,40%)"/><stop offset=".55" stop-color="hsl(${hue + 25},72%,17%)"/><stop offset="1" stop-color="hsl(${hue + 50},60%,7%)"/></linearGradient>`);
    d.push(`<radialGradient id="${b}"><stop offset="0" stop-color="hsl(${hue - 25},95%,70%)" stop-opacity=".85"/><stop offset="1" stop-color="hsl(${hue - 25},95%,70%)" stop-opacity="0"/></radialGradient>`);
    d.push(`<radialGradient id="${c}"><stop offset="0" stop-color="hsl(${hue + 60},90%,62%)" stop-opacity=".7"/><stop offset="1" stop-color="hsl(${hue + 60},90%,62%)" stop-opacity="0"/></radialGradient>`);
    d.push(`<clipPath id="${cl}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`);
    return `<g clip-path="url(#${cl})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${a})"/><circle cx="${x + w * .72}" cy="${y + h * .3}" r="${h * .78}" fill="url(#${b})"/><circle cx="${x + w * .16}" cy="${y + h * .98}" r="${h * .62}" fill="url(#${c})"/><path d="M${x} ${y}H${x + w * .44}L${x + w * .2} ${y + h}H${x}Z" fill="#fff" opacity=".06"/></g>`;
  };
  const tv = (d, x, y, w, h, hue) => {
    const leg = (sx, dir) => `<path d="M${sx} ${y + h - 3}l${dir * 17} ${h * .15}h${-dir * 8}l${-dir * 15} ${-h * .15}z" fill="#2a2b31"/>`;
    return leg(x + w * .2, -1) + leg(x + w * .8, 1) +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#0c0d10"/>` + screen(d, x + 5, y + 5, w - 10, h - 14, hue) +
      `<rect x="${x}" y="${y + h - 9}" width="${w}" height="9" rx="3" fill="#18191e"/>`;
  };
  const bar = (d, x, y, w, h) => {
    const p = id('dt'), r = h / 2.6;
    d.push(`<pattern id="${p}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.05" fill="#454751"/></pattern>`);
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${lin(d, '#383a42', '#0f1013')}"/>` +
      `<rect x="${x + r * .7}" y="${y + h * .22}" width="${w - r * 1.4}" height="${h * .56}" rx="${h * .24}" fill="url(#${p})"/>` +
      `<rect x="${x + r}" y="${y + 1.5}" width="${w - 2 * r}" height="1.6" rx=".8" fill="#fff" opacity=".2"/>` +
      `<circle cx="${x + w - r * 1.3}" cy="${y + h / 2}" r="2" fill="#fff" opacity=".75"/>`;
  };
  const laptop = (d, hue, o) => {
    const base = o.base || 'silver';
    const c = { silver: ['#eceef2', '#c3c7cf', '#a9aeb8', '#3b3d45'], dark: ['#3d3f47', '#202227', '#15161a', '#0e0f12'], green: ['#dfe8e0', '#b9cabd', '#9aae9f', '#50614f'] }[base];
    const kc = o.glow ? `hsl(${hue},95%,58%)` : c[3];
    let kb = '';
    [234, 239.5, 245, 250.5].forEach(yy => { const t = (yy - 229) / 27, a = 96 - 16 * t, b = 304 + 16 * t; kb += `<line x1="${a + 5}" y1="${yy}" x2="${b - 5}" y2="${yy}" stroke="${kc}" stroke-width="3.8" stroke-dasharray="8.6 2.3" opacity="${o.glow ? .9 : .55}"/>`; });
    return shadow(d, 200, 276, 176, 10) +
      `<rect x="100" y="72" width="200" height="152" rx="10" fill="${base === 'silver' ? '#1b1c21' : '#141519'}"/>` + screen(d, 107, 79, 186, 136, hue, 3) +
      `<circle cx="200" cy="75.6" r="1.3" fill="#3a3c44"/>` +
      `<path d="M66 224H334L372 262Q374 268 366 268H34Q26 268 28 262Z" fill="${lin(d, c[0], c[1])}"/>` +
      `<rect x="94" y="221" width="212" height="5" rx="2.5" fill="${c[2]}"/>` +
      `<path d="M96 229H304L320 256H80Z" fill="${c[2]}" opacity=".32"/>` + kb +
      `<path d="M178 258.5H222L225 263.5H175Z" fill="${c[2]}" opacity=".6"/>` +
      `<rect x="28" y="264" width="344" height="5" rx="2.5" fill="${c[2]}"/>`;
  };
  const kinds = {
    tv: (d, o) => shadow(d, 200, 304, 150, 10) + tv(d, 46, 92, 308, 190, o.h),
    combo: (d, o) => shadow(d, 200, 314, 168, 12) + tv(d, 60, 58, 280, 172, o.h) + bar(d, 70, 258, 260, 36),
    soundbar: d => shadow(d, 200, 250, 176, 10, .28) + bar(d, 26, 186, 348, 54),
    'soundbar-zoom': d => `<g transform="translate(-486 -246) scale(2.4)">${bar(d, 26, 160, 348, 54)}</g>`,
    laptop: (d, o) => laptop(d, o.h, o),
    aio: (d, o) => shadow(d, 200, 328, 112, 8) +
      `<path d="M184 258h32l14 58h-60z" fill="${lin(d, '#d9dce2', '#aeb3bc')}"/><rect x="126" y="312" width="148" height="11" rx="5.5" fill="#c3c7cf"/>` +
      `<rect x="42" y="50" width="316" height="212" rx="9" fill="#101115"/>` + screen(d, 48, 56, 304, 180, o.h) +
      `<path d="M42 236H358V253Q358 262 349 262H51Q42 262 42 253Z" fill="${lin(d, '#eef0f3', '#c9cdd4')}"/>`,
    tablet: (d, o) => shadow(d, 200, 318, 160, 10) +
      (o.folio ? `<rect x="74" y="110" width="280" height="192" rx="20" fill="#56606e"/>` : '') +
      `<rect x="56" y="94" width="280" height="192" rx="20" fill="#17181c"/>` + screen(d, 66, 104, 260, 172, o.h, 9) +
      (o.kb ? `<path d="M48 294H344L356 322H36Z" fill="#2a2d34"/><line x1="70" y1="303" x2="330" y2="303" stroke="#454852" stroke-width="4" stroke-dasharray="9 2.5"/><line x1="64" y1="311" x2="336" y2="311" stroke="#454852" stroke-width="4" stroke-dasharray="9 2.5"/>` : '') +
      `<g transform="rotate(-62 334 250)"><rect x="262" y="246" width="152" height="9" rx="4.5" fill="#e7e9ed"/><rect x="262" y="246" width="20" height="9" rx="4.5" fill="#c3c7cf"/></g>`,
    printer: d => shadow(d, 200, 298, 156, 10) +
      `<path d="M120 146 142 94H258L280 146Z" fill="#f5f6f8" stroke="#d6d9df"/>` +
      `<rect x="60" y="138" width="280" height="152" rx="16" fill="${lin(d, '#3b3d45', '#1d1e23')}"/>` +
      `<rect x="60" y="138" width="280" height="28" rx="13" fill="#4a4c55"/><rect x="68" y="164" width="264" height="2" fill="#000" opacity=".35"/>` +
      `<rect x="92" y="182" width="64" height="20" rx="4" fill="#121317"/><rect x="97" y="186" width="24" height="12" rx="2" fill="#7fb8f0" opacity=".75"/><circle cx="136" cy="192" r="3.2" fill="#3a3c44"/><circle cx="147" cy="192" r="3.2" fill="#3a3c44"/>` +
      `<rect x="102" y="232" width="178" height="12" rx="6" fill="#0d0e11"/><path d="M110 242H272L284 264H98Z" fill="#eceef1"/>` +
      `<rect x="288" y="186" width="40" height="48" rx="7" fill="#121317"/>` +
      ['#1aa3d4', '#d4337a', '#efbe2c', '#6b6e78'].map((col, i) => `<rect x="${292.5 + i * 8.8}" y="${196 + i * 3}" width="6" height="${32 - i * 3}" rx="2" fill="${col}"/>`).join(''),
    laser: d => shadow(d, 200, 298, 128, 10) +
      `<rect x="90" y="100" width="220" height="190" rx="14" fill="${lin(d, '#fbfbfc', '#dadde3')}"/>` +
      `<path d="M114 110H286L276 142H124Z" fill="#c9cdd4"/><path d="M134 116H266L260 134H140Z" fill="#fff"/>` +
      `<rect x="222" y="154" width="70" height="32" rx="6" fill="#22242a"/><rect x="228" y="160" width="32" height="20" rx="2" fill="#8fb7d9"/><circle cx="273" cy="165" r="3.5" fill="#4a4d56"/><circle cx="283" cy="175" r="3.5" fill="#4a4d56"/>` +
      `<rect x="102" y="200" width="196" height="1.6" fill="#b7bcc5"/>` +
      `<rect x="102" y="246" width="196" height="32" rx="6" fill="#e4e7ec" stroke="#c9cdd4"/><rect x="176" y="257" width="48" height="7" rx="3.5" fill="#b7bcc5"/>`,
    monitor: (d, o) => shadow(d, 200, 332, 122, 9) +
      `<path d="M191 244h18l7 62h-32z" fill="#24262c"/><path d="M200 300 110 328h22L200 312l68 16h22Z" fill="#1b1c21"/>` +
      `<rect x="32" y="50" width="336" height="200" rx="6" fill="#0c0d10"/>` + screen(d, 36, 54, 328, 186, o.h) +
      `<rect x="32" y="240" width="336" height="10" rx="3" fill="#15161a"/><rect x="180" y="244" width="40" height="2" rx="1" fill="hsl(${o.h},90%,60%)"/>`,
    projector: (d, o) => {
      const bm = id('bm'), le = id('le');
      d.push(`<linearGradient id="${bm}" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="hsl(${o.h},95%,78%)" stop-opacity=".6"/><stop offset="1" stop-color="hsl(${o.h},95%,78%)" stop-opacity="0"/></linearGradient>`);
      d.push(`<radialGradient id="${le}" cx=".4" cy=".35"><stop offset="0" stop-color="hsl(${o.h + 180},60%,55%)"/><stop offset=".6" stop-color="#1b2140"/><stop offset="1" stop-color="#07080b"/></radialGradient>`);
      let v = ''; for (let i = 0; i < 6; i++) v += `<rect x="${246 + i * 10}" y="214" width="4.5" height="42" rx="2.25" fill="#c6cad2"/>`;
      return `<path d="M146 212 8 140V300L146 244Z" fill="url(#${bm})"/>` + shadow(d, 212, 294, 132, 9) +
        `<rect x="94" y="174" width="236" height="112" rx="26" fill="${lin(d, '#fbfbfc', '#d8dbe1')}"/><rect x="112" y="179" width="200" height="12" rx="6" fill="#e9ebef"/>` + v +
        `<circle cx="150" cy="228" r="37" fill="#191a1f"/><circle cx="150" cy="228" r="27" fill="url(#${le})"/><circle cx="141" cy="219" r="6" fill="#fff" opacity=".35"/>`;
    },
    mouse: (d, o) => {
      const rg = id('rg');
      d.push(`<linearGradient id="${rg}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="hsl(${o.h},95%,60%)"/><stop offset="1" stop-color="hsl(${o.h + 70},95%,62%)"/></linearGradient>`);
      return shadow(d, 200, 324, 74, 10) +
        `<path d="M200 82C247 82 264 130 264 196C264 272 241 320 200 320C159 320 136 272 136 196C136 130 153 82 200 82Z" fill="${lin(d, '#3a3c44', '#111216')}"/>` +
        `<path d="M200 84V170" stroke="#08090b" stroke-width="2"/><path d="M139 178Q200 194 261 178" stroke="#08090b" stroke-width="1.6" fill="none"/>` +
        `<rect x="193.5" y="110" width="13" height="32" rx="6.5" fill="#34363e"/><rect x="197" y="116" width="6" height="20" rx="3" fill="hsl(${o.h},92%,60%)"/>` +
        `<path d="M166 262Q200 286 234 262" stroke="url(#${rg})" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    },
    mic: (d, o) => {
      const gr = id('gr');
      d.push(`<pattern id="${gr}" width="4" height="4.2" patternUnits="userSpaceOnUse"><rect width="4" height="1.7" fill="#50535d"/></pattern>`);
      return shadow(d, 200, 330, 84, 9) +
        `<ellipse cx="200" cy="318" rx="74" ry="14" fill="#141519"/><ellipse cx="200" cy="313" rx="74" ry="14" fill="#2b2d34"/>` +
        `<rect x="193" y="226" width="14" height="88" rx="4" fill="#23252b"/>` +
        `<path d="M154 150V206Q154 236 200 236Q246 236 246 206V150" stroke="#2b2d34" stroke-width="9" fill="none"/>` +
        `<rect x="163" y="62" width="74" height="160" rx="37" fill="${lin(d, '#2f3138', '#15161a')}"/><rect x="171" y="70" width="58" height="96" rx="29" fill="url(#${gr})"/>` +
        `<rect x="161" y="170" width="78" height="10" rx="4" fill="hsl(${o.h},92%,58%)"/><circle cx="200" cy="200" r="6" fill="#3a3c44"/>`;
    },
    phone: (d, o) => shadow(d, 200, 332, 72, 8) +
      `<rect x="136" y="54" width="128" height="270" rx="27" fill="#16171b"/><rect x="138.5" y="56.5" width="123" height="265" rx="25" fill="none" stroke="#3b3d45" stroke-width="1.5"/>` +
      screen(d, 144, 62, 112, 254, o.h, 20) + `<rect x="182" y="70" width="36" height="10" rx="5" fill="#0b0b0e"/>`,
    gamepad: (d, o) => shadow(d, 200, 306, 144, 10) +
      `<path d="M128 150H272C312 150 334 176 342 226C350 276 334 304 306 304C284 304 272 290 258 272H142C128 290 116 304 94 304C66 304 50 276 58 226C66 176 88 150 128 150Z" fill="${lin(d, '#3b3d45', '#15161a')}"/>` +
      `<path d="M112 204h12v12h12v12h-12v12h-12v-12h-12v-12h12z" fill="#0d0e11"/>` +
      [[282, 204], [298, 220], [266, 220], [282, 236]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${i === 0 ? `hsl(${o.h},92%,58%)` : '#0d0e11'}"/>`).join('') +
      `<circle cx="162" cy="252" r="17" fill="#0d0e11"/><circle cx="162" cy="252" r="11" fill="#2b2d34"/><circle cx="238" cy="252" r="17" fill="#0d0e11"/><circle cx="238" cy="252" r="11" fill="#2b2d34"/>` +
      `<rect x="184" y="164" width="32" height="4" rx="2" fill="hsl(${o.h},92%,60%)"/>`
  };
  return function art(kind, o = {}, label = '') {
    const d = [];
    const body = (kinds[kind] || kinds.tv)(d, Object.assign({ h: 225 }, o));
    const a11y = label ? `role="img" aria-label="${label.replace(/"/g, '&quot;')}"` : 'aria-hidden="true"';
    return `<svg class="art" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" ${a11y}><defs>${d.join('')}</defs>${body}</svg>`;
  };
})();

/* Manufacturer-style infographic placeholder */
function infoArt(o) {
  return `<div class="info-art" role="img" aria-label="${o.title}"><span class="ic">${ic(o.icon, 28)}</span><span class="k">Infografía</span><strong>${o.title}</strong><ul>${o.lines.map(l => `<li>${l}</li>`).join('')}</ul></div>`;
}
