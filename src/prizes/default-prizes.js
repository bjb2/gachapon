// Default 8 prizes seeded on first load. Chassis-independent: each carries
// its own rarity and ball style. SVG bodies are fetched once from
// ./src/data/default-svgs/*.svg so prizes are self-contained after seeding.
const DEFS = [
  { id: 'tanuki',  name: 'Tanuki Tobikichi', rarity: 'common', ballStyle: { type: 'capsule', color1: '#FFD166', color2: '#C49000', glow: null }, flavor: 'A raccoon dog who collects lost coins and swears each one is lucky. Has never been proven wrong.' },
  { id: 'neko',    name: 'Neko Nana',        rarity: 'common', ballStyle: { type: 'capsule', color1: '#FFE6F4', color2: '#FF6B9D', glow: null }, flavor: 'A sleepy cat who has been "almost awake" for three years. Incredibly soft. Smells like vanilla.' },
  { id: 'shiba',   name: 'Shiba Shin',       rarity: 'common', ballStyle: { type: 'plain',   color1: '#F7B731',                    glow: null }, flavor: 'Much wow. Very investible. Still waiting for the bone market to recover. Remains optimistic.' },
  { id: 'usagi',   name: 'Usagi Umi',        rarity: 'rare',   ballStyle: { type: 'capsule', color1: '#EAE6FF', color2: '#A29BFE', glow: null }, flavor: 'A lavender rabbit with strong opinions about hot spring etiquette. Will correct you, gently but firmly.' },
  { id: 'kappa',   name: 'Kappa Kenji',      rarity: 'rare',   ballStyle: { type: 'capsule', color1: '#C0FBF7', color2: '#4ECDC4', glow: null }, flavor: 'A water sprite who reviews ramen shops anonymously. Always 5 stars. Takes bowing extremely seriously.' },
  { id: 'kitsune', name: 'Kitsune Kira',     rarity: 'rare',   ballStyle: { type: 'capsule', color1: '#C8EEFF', color2: '#74B9FF', glow: null }, flavor: 'A nine-tailed fox who DJs on weekends as "Foxy Freq." Impeccable taste. Refuses to play requests.' },
  { id: 'oni',     name: 'Oni Osamu',        rarity: 'ultra',  ballStyle: { type: 'capsule', color1: '#FFFBE8', color2: '#FFD700', glow: 'rgba(255,200,0,0.65)' }, flavor: 'Technically a demon. Actually the most wholesome entity in any realm. Brings snacks to every battle.' },
  { id: 'ryuu',    name: 'Ryuu Rei',         rarity: 'ultra',  ballStyle: { type: 'capsule', color1: '#FFE4AA', color2: '#FF8E3C', glow: 'rgba(255,142,60,0.6)' }, flavor: 'A baby dragon who hoards sticker collections, not gold. Has 3,000+. Trades duplicates fairly.' },
];

export async function loadDefaultPrizes() {
  const out = [];
  for (const d of DEFS) {
    let svgText = '';
    try {
      const resp = await fetch(`./src/data/default-svgs/${d.id}.svg`);
      if (resp.ok) svgText = await resp.text();
    } catch (e) {
      console.warn(`[default-prizes] failed to load ${d.id}.svg`, e);
    }
    out.push({
      id: d.id,
      name: d.name,
      rarity: d.rarity,
      ballStyle: d.ballStyle,
      flavor: d.flavor,
      art: { kind: 'svg', source: 'inline', value: svgText },
    });
  }
  return out;
}
