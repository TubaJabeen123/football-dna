export const ATTRS = ["pace", "shooting", "passing", "dribbling", "defending", "physic"] as const;
export type AttrKey = typeof ATTRS[number];

export const ATTR_LABELS: Record<AttrKey, string> = {
  pace: "PAC",
  shooting: "SHO",
  passing: "PAS",
  dribbling: "DRI",
  defending: "DEF",
  physic: "PHY",
};

export const ATTR_DESCRIPTIONS: Record<AttrKey, string> = {
  pace: "How fast the player runs — getting in behind defences and tracking back",
  shooting: "How clinical in front of goal — finishing, long shots, shot power",
  passing: "Quality of distribution — short passes, through balls, vision, crossing",
  dribbling: "Ability to beat players and hold the ball — close control and agility",
  defending: "Defensive skills — tackling, interceptions, positioning, marking",
  physic: "Physical presence — strength in duels, stamina, aerial ability",
};

export const ATTRIBUTE_CATEGORIES = [
  { label: "Attacking", attrs: ["shooting", "dribbling"] as AttrKey[], icon: "⚡" },
  { label: "Technical",  attrs: ["passing",  "dribbling"] as AttrKey[], icon: "🎯" },
  { label: "Defending",  attrs: ["defending","physic"]    as AttrKey[], icon: "🛡️" },
  { label: "Physical",   attrs: ["physic",   "pace"]      as AttrKey[], icon: "💪" },
];

export const PITCH_POSITIONS: Record<string, { x: number; y: number }> = {
  GK:  { x: 50, y: 90 },
  CB:  { x: 50, y: 76 },
  LB:  { x: 18, y: 72 },
  RB:  { x: 82, y: 72 },
  CDM: { x: 50, y: 58 },
  CM:  { x: 35, y: 48 },
  CAM: { x: 65, y: 40 },
  LW:  { x: 12, y: 30 },
  RW:  { x: 88, y: 30 },
  ST:  { x: 50, y: 16 },
  LM:  { x: 15, y: 45 },
  RM:  { x: 85, y: 45 },
};

export const FORMATION_POSITIONS = [
  { role: "GK",  x: 50, y: 90 },
  { role: "CB",  x: 37, y: 76 },
  { role: "CB",  x: 63, y: 76 },
  { role: "LB",  x: 16, y: 72 },
  { role: "RB",  x: 84, y: 72 },
  { role: "CDM", x: 38, y: 58 },
  { role: "CDM", x: 62, y: 58 },
  { role: "LW",  x: 16, y: 36 },
  { role: "CAM", x: 50, y: 40 },
  { role: "RW",  x: 84, y: 36 },
  { role: "ST",  x: 50, y: 18 },
];