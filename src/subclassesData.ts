import type { Character, DndClass } from './types';

type SubclassSpellEntry = {
  level: number;
  spellIds: string[];
};

type SubclassSpellTable = Partial<
  Record<DndClass, Record<string, SubclassSpellEntry[]>>
>;

export const subclassOptions: Record<DndClass, string[]> = {
  Bard: ['Dance', 'Glamour', 'Lore', 'Valor'],
  Cleric: ['Life', 'Light', 'Trickery', 'War'],
  Druid: [
    'Land - Arid',
    'Land - Polar',
    'Land - Temperate',
    'Land - Tropical',
    'Moon',
    'Sea',
    'Stars',
  ],
  Paladin: ['Devotion', 'Glory', 'Ancients', 'Vengeance'],
  Ranger: ['Beast Master', 'Fey Wanderer', 'Gloom Stalker', 'Hunter'],
  Sorcerer: [
    'Aberrant Sorcery',
    'Clockwork Sorcery',
    'Draconic Sorcery',
    'Wild Magic',
  ],
  Warlock: ['Archfey', 'Celestial', 'Fiend', 'Great Old One'],
  Wizard: ['Abjurer', 'Diviner', 'Evoker', 'Illusionist'],
};

export function getDefaultSubclass(className: DndClass) {
  return subclassOptions[className]?.[0] ?? '';
}

export function getSubclassOptions(className: DndClass) {
  return subclassOptions[className] ?? [];
}

export function getCharacterSubclass(character: Character) {
  const options = getSubclassOptions(character.className);

  if (character.subclass && options.includes(character.subclass)) {
    return character.subclass;
  }

  return getDefaultSubclass(character.className);
}

export const subclassSpellLists: SubclassSpellTable = {
  Bard: {
    Dance: [],
    Glamour: [
      {
        level: 3,
        spellIds: ['charm-person', 'mirror-image'],
      },
      {
        level: 6,
        spellIds: ['command'],
      },
    ],
    Lore: [],
    Valor: [],
  },

  Cleric: {
    Life: [
      {
        level: 3,
        spellIds: ['aid', 'bless', 'cure-wounds', 'lesser-restoration'],
      },
      {
        level: 5,
        spellIds: ['mass-healing-word', 'revivify'],
      },
      {
        level: 7,
        spellIds: ['aura-of-life', 'death-ward'],
      },
      {
        level: 9,
        spellIds: ['greater-restoration', 'mass-cure-wounds'],
      },
    ],

    Light: [
      {
        level: 3,
        spellIds: [
          'burning-hands',
          'faerie-fire',
          'scorching-ray',
          'see-invisibility',
        ],
      },
      {
        level: 5,
        spellIds: ['daylight', 'fireball'],
      },
      {
        level: 7,
        spellIds: ['arcane-eye', 'wall-of-fire'],
      },
      {
        level: 9,
        spellIds: ['flame-strike', 'scrying'],
      },
    ],

    Trickery: [
      {
        level: 3,
        spellIds: [
          'charm-person',
          'disguise-self',
          'invisibility',
          'pass-without-trace',
        ],
      },
      {
        level: 5,
        spellIds: ['hypnotic-pattern', 'nondetection'],
      },
      {
        level: 7,
        spellIds: ['confusion', 'dimension-door'],
      },
      {
        level: 9,
        spellIds: ['dominate-person', 'modify-memory'],
      },
    ],

    War: [
      {
        level: 3,
        spellIds: [
          'guiding-bolt',
          'magic-weapon',
          'shield-of-faith',
          'spiritual-weapon',
        ],
      },
      {
        level: 5,
        spellIds: ['crusaders-mantle', 'spirit-guardians'],
      },
      {
        level: 7,
        spellIds: ['fire-shield', 'freedom-of-movement'],
      },
      {
        level: 9,
        spellIds: ['hold-monster', 'steel-wind-strike'],
      },
    ],
  },

  Druid: {
    'Land - Arid': [
      {
        level: 3,
        spellIds: ['blur', 'burning-hands', 'fire-bolt'],
      },
      {
        level: 5,
        spellIds: ['fireball'],
      },
      {
        level: 7,
        spellIds: ['blight'],
      },
      {
        level: 9,
        spellIds: ['wall-of-stone'],
      },
    ],

    'Land - Polar': [
      {
        level: 3,
        spellIds: ['fog-cloud', 'hold-person', 'ray-of-frost'],
      },
      {
        level: 5,
        spellIds: ['sleet-storm'],
      },
      {
        level: 7,
        spellIds: ['ice-storm'],
      },
      {
        level: 9,
        spellIds: ['cone-of-cold'],
      },
    ],

    'Land - Temperate': [
      {
        level: 3,
        spellIds: ['misty-step', 'shocking-grasp', 'sleep'],
      },
      {
        level: 5,
        spellIds: ['lightning-bolt'],
      },
      {
        level: 7,
        spellIds: ['freedom-of-movement'],
      },
      {
        level: 9,
        spellIds: ['tree-stride'],
      },
    ],

    'Land - Tropical': [
      {
        level: 3,
        spellIds: ['acid-splash', 'ray-of-sickness', 'web'],
      },
      {
        level: 5,
        spellIds: ['stinking-cloud'],
      },
      {
        level: 7,
        spellIds: ['polymorph'],
      },
      {
        level: 9,
        spellIds: ['insect-plague'],
      },
    ],

    Moon: [
      {
        level: 3,
        spellIds: ['cure-wounds', 'moonbeam', 'starry-wisp'],
      },
      {
        level: 5,
        spellIds: ['conjure-animals'],
      },
      {
        level: 7,
        spellIds: ['fount-of-moonlight'],
      },
      {
        level: 9,
        spellIds: ['mass-cure-wounds'],
      },
    ],

    Sea: [
      {
        level: 3,
        spellIds: ['fog-cloud', 'gust-of-wind', 'ray-of-frost', 'thunderwave'],
      },
      {
        level: 5,
        spellIds: ['lightning-bolt', 'water-breathing'],
      },
      {
        level: 7,
        spellIds: ['control-water', 'ice-storm'],
      },
      {
        level: 9,
        spellIds: ['conjure-elemental', 'hold-monster'],
      },
    ],

    Stars: [
      {
        level: 3,
        spellIds: ['guiding-bolt'],
      },
    ],
  },

  Paladin: {
    Devotion: [
      {
        level: 3,
        spellIds: ['protection-from-evil-and-good', 'shield-of-faith'],
      },
      {
        level: 5,
        spellIds: ['aid', 'zone-of-truth'],
      },
      {
        level: 9,
        spellIds: ['beacon-of-hope', 'dispel-magic'],
      },
      {
        level: 13,
        spellIds: ['freedom-of-movement', 'guardian-of-faith'],
      },
      {
        level: 17,
        spellIds: ['commune', 'flame-strike'],
      },
    ],

    Glory: [
      {
        level: 3,
        spellIds: ['guiding-bolt', 'heroism'],
      },
      {
        level: 5,
        spellIds: ['enhance-ability', 'magic-weapon'],
      },
      {
        level: 9,
        spellIds: ['haste', 'protection-from-energy'],
      },
      {
        level: 13,
        spellIds: ['compulsion', 'freedom-of-movement'],
      },
      {
        level: 17,
        spellIds: ['legend-lore', 'yolandes-regal-presence'],
      },
    ],

    Ancients: [
      {
        level: 3,
        spellIds: ['ensnaring-strike', 'speak-with-animals'],
      },
      {
        level: 5,
        spellIds: ['misty-step', 'moonbeam'],
      },
      {
        level: 9,
        spellIds: ['plant-growth', 'protection-from-energy'],
      },
      {
        level: 13,
        spellIds: ['ice-storm', 'stoneskin'],
      },
      {
        level: 17,
        spellIds: ['commune-with-nature', 'tree-stride'],
      },
    ],

    Vengeance: [
      {
        level: 3,
        spellIds: ['bane', 'hunters-mark'],
      },
      {
        level: 5,
        spellIds: ['hold-person', 'misty-step'],
      },
      {
        level: 9,
        spellIds: ['haste', 'protection-from-energy'],
      },
      {
        level: 13,
        spellIds: ['banishment', 'dimension-door'],
      },
      {
        level: 17,
        spellIds: ['hold-monster', 'scrying'],
      },
    ],
  },

  Ranger: {
    'Beast Master': [],

    'Fey Wanderer': [
      {
        level: 3,
        spellIds: ['charm-person'],
      },
      {
        level: 5,
        spellIds: ['misty-step'],
      },
      {
        level: 9,
        spellIds: ['summon-fey'],
      },
      {
        level: 13,
        spellIds: ['dimension-door'],
      },
      {
        level: 17,
        spellIds: ['mislead'],
      },
    ],

    'Gloom Stalker': [
      {
        level: 3,
        spellIds: ['disguise-self'],
      },
      {
        level: 5,
        spellIds: ['rope-trick'],
      },
      {
        level: 9,
        spellIds: ['fear'],
      },
      {
        level: 13,
        spellIds: ['greater-invisibility'],
      },
      {
        level: 17,
        spellIds: ['seeming'],
      },
    ],

    Hunter: [],
  },

  Sorcerer: {
    'Aberrant Sorcery': [
      {
        level: 3,
        spellIds: [
          'arms-of-hadar',
          'dissonant-whispers',
          'calm-emotions',
          'detect-thoughts',
        ],
      },
      {
        level: 5,
        spellIds: ['hunger-of-hadar', 'sending'],
      },
      {
        level: 7,
        spellIds: ['black-tentacles', 'summon-aberration'],
      },
      {
        level: 9,
        spellIds: ['telepathic-bond', 'telekinesis'],
      },
    ],

    'Clockwork Sorcery': [
      {
        level: 3,
        spellIds: [
          'alarm',
          'protection-from-evil-and-good',
          'aid',
          'lesser-restoration',
        ],
      },
      {
        level: 5,
        spellIds: ['dispel-magic', 'protection-from-energy'],
      },
      {
        level: 7,
        spellIds: ['freedom-of-movement', 'summon-construct'],
      },
      {
        level: 9,
        spellIds: ['greater-restoration', 'wall-of-force'],
      },
    ],

    'Draconic Sorcery': [],
    'Wild Magic': [],
  },

  Warlock: {
    Archfey: [
      {
        level: 3,
        spellIds: [
          'calm-emotions',
          'faerie-fire',
          'misty-step',
          'phantasmal-force',
          'sleep',
        ],
      },
      {
        level: 5,
        spellIds: ['blink', 'plant-growth'],
      },
      {
        level: 7,
        spellIds: ['dominate-beast', 'greater-invisibility'],
      },
      {
        level: 9,
        spellIds: ['dominate-person', 'seeming'],
      },
    ],

    Celestial: [
      {
        level: 3,
        spellIds: [
          'aid',
          'cure-wounds',
          'guiding-bolt',
          'lesser-restoration',
          'light',
          'sacred-flame',
        ],
      },
      {
        level: 5,
        spellIds: ['daylight', 'revivify'],
      },
      {
        level: 7,
        spellIds: ['guardian-of-faith', 'wall-of-fire'],
      },
      {
        level: 9,
        spellIds: ['greater-restoration', 'summon-celestial'],
      },
    ],

    Fiend: [
      {
        level: 3,
        spellIds: ['burning-hands', 'command', 'scorching-ray', 'suggestion'],
      },
      {
        level: 5,
        spellIds: ['fireball', 'stinking-cloud'],
      },
      {
        level: 7,
        spellIds: ['fire-shield', 'wall-of-fire'],
      },
      {
        level: 9,
        spellIds: ['geas', 'insect-plague'],
      },
    ],

    'Great Old One': [
      {
        level: 3,
        spellIds: [
          'detect-thoughts',
          'dissonant-whispers',
          'phantasmal-force',
          'hideous-laughter',
        ],
      },
      {
        level: 5,
        spellIds: ['clairvoyance', 'hunger-of-hadar'],
      },
      {
        level: 7,
        spellIds: ['confusion', 'summon-aberration'],
      },
      {
        level: 9,
        spellIds: ['modify-memory', 'telekinesis'],
      },
      {
        level: 10,
        spellIds: ['hex'],
      },
    ],
  },

  Wizard: {
    Abjurer: [],
    Diviner: [],
    Evoker: [],
    Illusionist: [],
  },
};

function getClassAlwaysPreparedSpellIds(character: Character) {
  const ids: string[] = [];
  if (character.className === 'Paladin' && character.level >= 1) {
    ids.push('divine-smite');
  }
  if (character.className === 'Ranger' && character.level >= 1) {
    ids.push('hunters-mark');
  }

  if (character.className === 'Warlock' && character.level >= 9) {
    ids.push('contact-other-plane');
  }

  if (character.className === 'Bard' && character.level >= 20) {
    ids.push('power-word-heal', 'power-word-kill');
  }

  return ids;
}

export function getAlwaysPreparedSpellIds(character: Character) {
  const subclass = getCharacterSubclass(character);
  const classTable = subclassSpellLists[character.className];
  const classSpellIds = getClassAlwaysPreparedSpellIds(character);

  if (!classTable) return [...new Set(classSpellIds)];

  const subclassTable = classTable[subclass];

  if (!subclassTable) return [...new Set(classSpellIds)];

  const subclassSpellIds = subclassTable
    .filter((entry) => character.level >= entry.level)
    .flatMap((entry) => entry.spellIds);

  return [...new Set([...classSpellIds, ...subclassSpellIds])];
}

export function getAlwaysPreparedSource(spellId: string, character: Character) {
  const subclass = getCharacterSubclass(character);

  if (
    character.className === 'Ranger' &&
    character.level >= 1 &&
    spellId === 'hunters-mark'
  ) {
    return 'Ranger Favored Enemy';
  }

  if (
    character.className === 'Warlock' &&
    character.level >= 9 &&
    spellId === 'contact-other-plane'
  ) {
    return 'Warlock Contact Patron';
  }

  if (
    character.className === 'Bard' &&
    character.level >= 20 &&
    (spellId === 'power-word-heal' || spellId === 'power-word-kill')
  ) {
    return 'Bard Words of Creation';
  }

  if (character.className === 'Cleric') return `${subclass} Domain`;
  if (character.className === 'Paladin') return `Oath of ${subclass}`;
  if (character.className === 'Warlock') return `${subclass} Patron`;
  if (character.className === 'Druid') return `Circle of ${subclass}`;
  if (character.className === 'Sorcerer') return subclass;
  if (character.className === 'Ranger') return subclass;
  if (character.className === 'Bard') return subclass;
  if (character.className === 'Wizard') return subclass;

  return subclass;
}
