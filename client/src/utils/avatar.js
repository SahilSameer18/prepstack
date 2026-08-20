/**
 * Centralized DiceBear Avatar generator & preset constants.
 */
export const getDiceBearAvatar = (seed) => {
  const safeSeed = seed && typeof seed === 'string' && seed.trim().length > 0 ? seed.trim() : 'prepstack';
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(safeSeed)}`;
};

export const PRESET_AVATARS = [
  { id: 'cyber', label: 'Cyber', seed: 'CyberBot' },
  { id: 'nova', label: 'Nova', seed: 'Nova' },
  { id: 'pulse', label: 'Pulse', seed: 'Pulse' },
  { id: 'byte', label: 'Byte', seed: 'Byte' },
  { id: 'apex', label: 'Apex', seed: 'Apex' },
];


