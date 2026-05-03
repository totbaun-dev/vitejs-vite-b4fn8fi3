import React, { useEffect, useMemo, useState } from 'react';
import type { Character, DndClass, Spell } from './types';
import { spells } from './spells';
import {
  getAlwaysPreparedSpellIds,
  getAlwaysPreparedSource,
  getCharacterSubclass,
  getDefaultSubclass,
  getSubclassOptions,
} from './subclassesData';

const STORAGE_KEY = 'dnd-spell-manager-v2-multi-character';
const OLD_STORAGE_KEY = 'dnd-spell-manager-v1';

type StoredCharacter = {
  id: string;
  character: Character;
  selectedSpellIds: string[];
  usedSlots: Record<string, boolean[]>;
  activeConcentrationSpellId: string | null;
};

type AppSaveState = {
  characters: StoredCharacter[];
  activeCharacterId: string | null;
};

const classOptions: DndClass[] = [
  'Bard',
  'Cleric',
  'Druid',
  'Paladin',
  'Ranger',
  'Sorcerer',
  'Warlock',
  'Wizard',
];

const classRules: Record<DndClass, string> = {
  Bard: 'Bard: Prepared caster. Du skifter typisk én prepared spell, når du stiger level.',
  Cleric:
    'Cleric: Prepared caster. Du kan ændre dine prepared spells efter Long Rest.',
  Druid:
    'Druid: Prepared caster. Du kan ændre dine prepared spells efter Long Rest.',
  Paladin:
    'Paladin: Prepared half-caster. Du kan typisk ændre én prepared spell efter Long Rest.',
  Ranger:
    'Ranger: Prepared half-caster. Du kan typisk ændre én prepared spell efter Long Rest.',
  Sorcerer:
    'Sorcerer: Prepared caster. Du skifter typisk én prepared spell, når du stiger level.',
  Warlock: 'Warlock: Pact Magic. Pact slots kommer tilbage på Short Rest.',
  Wizard:
    'Wizard: Spellbook caster. Du forbereder spells fra din egen spellbook efter Long Rest.',
};

const preparedSpellsByClass: Record<DndClass, number[]> = {
  Bard: [
    0, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21,
    22,
  ],
  Cleric: [
    0, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21,
    22,
  ],
  Druid: [
    0, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21,
    22,
  ],
  Paladin: [
    0, 2, 3, 4, 5, 6, 6, 7, 7, 8, 8, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15,
  ],
  Ranger: [
    0, 2, 3, 4, 5, 6, 6, 7, 7, 8, 8, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15,
  ],
  Sorcerer: [
    0, 2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21,
    22,
  ],
  Warlock: [
    0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15,
  ],
  Wizard: [
    0, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24,
    25,
  ],
};

const cantripsByClass: Record<DndClass, number[]> = {
  Bard: [0, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  Cleric: [0, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  Druid: [0, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  Paladin: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Ranger: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Sorcerer: [0, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  Warlock: [0, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  Wizard: [0, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
};

const fullCasterSlotsByLevel: Record<number, Record<number, number>> = {
  1: { 1: 2 },
  2: { 1: 3 },
  3: { 1: 4, 2: 2 },
  4: { 1: 4, 2: 3 },
  5: { 1: 4, 2: 3, 3: 2 },
  6: { 1: 4, 2: 3, 3: 3 },
  7: { 1: 4, 2: 3, 3: 3, 4: 1 },
  8: { 1: 4, 2: 3, 3: 3, 4: 2 },
  9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
};

const halfCasterSlotsByLevel: Record<number, Record<number, number>> = {
  1: { 1: 2 },
  2: { 1: 2 },
  3: { 1: 3 },
  4: { 1: 3 },
  5: { 1: 4, 2: 2 },
  6: { 1: 4, 2: 2 },
  7: { 1: 4, 2: 3 },
  8: { 1: 4, 2: 3 },
  9: { 1: 4, 2: 3, 3: 2 },
  10: { 1: 4, 2: 3, 3: 2 },
  11: { 1: 4, 2: 3, 3: 3 },
  12: { 1: 4, 2: 3, 3: 3 },
  13: { 1: 4, 2: 3, 3: 3, 4: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 2 },
  16: { 1: 4, 2: 3, 3: 3, 4: 2 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
};

const warlockPactSlotsByLevel: Record<
  number,
  { slotLevel: number; slots: number }
> = {
  1: { slotLevel: 1, slots: 1 },
  2: { slotLevel: 1, slots: 2 },
  3: { slotLevel: 2, slots: 2 },
  4: { slotLevel: 2, slots: 2 },
  5: { slotLevel: 3, slots: 2 },
  6: { slotLevel: 3, slots: 2 },
  7: { slotLevel: 4, slots: 2 },
  8: { slotLevel: 4, slots: 2 },
  9: { slotLevel: 5, slots: 2 },
  10: { slotLevel: 5, slots: 2 },
  11: { slotLevel: 5, slots: 3 },
  12: { slotLevel: 5, slots: 3 },
  13: { slotLevel: 5, slots: 3 },
  14: { slotLevel: 5, slots: 3 },
  15: { slotLevel: 5, slots: 3 },
  16: { slotLevel: 5, slots: 3 },
  17: { slotLevel: 5, slots: 4 },
  18: { slotLevel: 5, slots: 4 },
  19: { slotLevel: 5, slots: 4 },
  20: { slotLevel: 5, slots: 4 },
};

function createCharacterId() {
  return `char-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createDefaultCharacter(name = 'Ny karakter'): Character {
  return {
    name,
    className: 'Cleric',
    subclass: 'Life',
    level: 3,
    spellSaveDc: '',
    spellAttackBonus: '',
  };
}

function isHalfCaster(className: DndClass) {
  return className === 'Paladin' || className === 'Ranger';
}

function isWarlock(className: DndClass) {
  return className === 'Warlock';
}

function getSpellSlotTable(character: Character): Record<string, boolean[]> {
  if (isWarlock(character.className)) {
    const pact = warlockPactSlotsByLevel[character.level];

    return {
      [`Pact ${pact.slotLevel}`]: Array(pact.slots).fill(false),
    };
  }

  const slotTable = isHalfCaster(character.className)
    ? halfCasterSlotsByLevel[character.level]
    : fullCasterSlotsByLevel[character.level];

  const result: Record<string, boolean[]> = {};

  Object.entries(slotTable ?? {}).forEach(([level, count]) => {
    result[level] = Array(count).fill(false);
  });

  return result;
}

function createStoredCharacter(character?: Character): StoredCharacter {
  const newCharacter = character ?? createDefaultCharacter();

  return {
    id: createCharacterId(),
    character: newCharacter,
    selectedSpellIds: [],
    usedSlots: getSpellSlotTable(newCharacter),
    activeConcentrationSpellId: null,
  };
}

function getMaxSpellLevelForClass(character: Character) {
  if (isWarlock(character.className)) {
    return warlockPactSlotsByLevel[character.level].slotLevel;
  }

  const slotTable = isHalfCaster(character.className)
    ? halfCasterSlotsByLevel[character.level]
    : fullCasterSlotsByLevel[character.level];

  const availableLevels = Object.keys(slotTable ?? {}).map(Number);

  if (availableLevels.length === 0) return 0;

  return Math.max(...availableLevels);
}

function getPreparedSpellLimit(character: Character) {
  return preparedSpellsByClass[character.className][character.level] ?? 0;
}

function getCantripLimit(character: Character) {
  return cantripsByClass[character.className][character.level] ?? 0;
}

function getPreparedChangeText(className: DndClass) {
  if (
    className === 'Cleric' ||
    className === 'Druid' ||
    className === 'Wizard'
  ) {
    return 'Kan ændre alle prepared spells efter Long Rest.';
  }

  if (className === 'Paladin' || className === 'Ranger') {
    return 'Kan ændre én prepared spell efter Long Rest.';
  }

  if (className === 'Warlock') {
    return 'Kan normalt ændre én prepared spell ved level-up. Pact slots kommer tilbage på Short Rest.';
  }

  return 'Kan normalt ændre én prepared spell ved level-up.';
}

function canCharacterUseSpell(spell: Spell, character: Character) {
  const maxSpellLevel = getMaxSpellLevelForClass(character);

  return (
    spell.classes.includes(character.className) &&
    (spell.level === 0 || spell.level <= maxSpellLevel)
  );
}

function getSpellLevelLabel(level: number) {
  return level === 0 ? 'Cantrip' : `Level ${level}`;
}

function loadInitialState(): AppSaveState {
  const savedV2 = localStorage.getItem(STORAGE_KEY);

  if (savedV2) {
    try {
      const parsed = JSON.parse(savedV2) as AppSaveState;

      if (Array.isArray(parsed.characters) && parsed.characters.length > 0) {
        return {
          characters: parsed.characters,
          activeCharacterId:
            parsed.activeCharacterId ?? parsed.characters[0].id,
        };
      }
    } catch {
      console.warn('Could not load multi-character save.');
    }
  }

  const savedV1 = localStorage.getItem(OLD_STORAGE_KEY);

  if (savedV1) {
    try {
      const parsed = JSON.parse(savedV1) as {
        character?: Character;
        selectedSpellIds?: string[];
        usedSlots?: Record<string, boolean[]>;
        activeConcentrationSpellId?: string | null;
      };

      const migratedCharacter = parsed.character ?? createDefaultCharacter();
      const migrated: StoredCharacter = {
        id: createCharacterId(),
        character: migratedCharacter,
        selectedSpellIds: parsed.selectedSpellIds ?? [],
        usedSlots: parsed.usedSlots ?? getSpellSlotTable(migratedCharacter),
        activeConcentrationSpellId: parsed.activeConcentrationSpellId ?? null,
      };

      return {
        characters: [migrated],
        activeCharacterId: migrated.id,
      };
    } catch {
      console.warn('Could not migrate old save.');
    }
  }

  const firstCharacter = createStoredCharacter();

  return {
    characters: [firstCharacter],
    activeCharacterId: firstCharacter.id,
  };
}

export default function App() {
  const [characters, setCharacters] = useState<StoredCharacter[]>(
    () => loadInitialState().characters
  );
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(
    () => loadInitialState().activeCharacterId
  );
  const [newCharacterName, setNewCharacterName] = useState('');
  const [search, setSearch] = useState('');
  const [spellLevelFilter, setSpellLevelFilter] = useState('all');
  const [onlyConcentration, setOnlyConcentration] = useState(false);
  const [onlyRitual, setOnlyRitual] = useState(false);
  const [view, setView] = useState<'manage' | 'table'>('manage');
  const [backupText, setBackupText] = useState('');
  const [importText, setImportText] = useState('');
  const [importMessage, setImportMessage] = useState('');

  const activeStoredCharacter =
    characters.find((item) => item.id === activeCharacterId) ?? characters[0];

  const character = activeStoredCharacter.character;
  const selectedSpellIds = activeStoredCharacter.selectedSpellIds;
  const usedSlots = activeStoredCharacter.usedSlots;
  const activeConcentrationSpellId =
    activeStoredCharacter.activeConcentrationSpellId;

  function updateActiveStoredCharacter(
    updater: (storedCharacter: StoredCharacter) => StoredCharacter
  ) {
    setCharacters((prev) =>
      prev.map((item) =>
        item.id === activeStoredCharacter.id ? updater(item) : item
      )
    );
  }

  useEffect(() => {
    const state: AppSaveState = {
      characters,
      activeCharacterId: activeStoredCharacter?.id ?? null,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [characters, activeStoredCharacter?.id]);

  const alwaysPreparedSpellIds = useMemo(
    () => getAlwaysPreparedSpellIds(character),
    [character]
  );

  const selectedSpells = useMemo(() => {
    return spells
      .filter((spell) => selectedSpellIds.includes(spell.id))
      .filter((spell) => !alwaysPreparedSpellIds.includes(spell.id))
      .filter((spell) => canCharacterUseSpell(spell, character))
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [selectedSpellIds, character, alwaysPreparedSpellIds]);

  const alwaysPreparedSpells = useMemo(() => {
    const maxSpellLevel = getMaxSpellLevelForClass(character);

    return spells
      .filter((spell) => alwaysPreparedSpellIds.includes(spell.id))
      .filter((spell) => spell.level === 0 || spell.level <= maxSpellLevel)
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [alwaysPreparedSpellIds, character]);

  const activeSpells = useMemo(() => {
    const spellMap = new Map<string, Spell>();
    [...selectedSpells, ...alwaysPreparedSpells].forEach((spell) =>
      spellMap.set(spell.id, spell)
    );
    return Array.from(spellMap.values()).sort(
      (a, b) => a.level - b.level || a.name.localeCompare(b.name)
    );
  }, [selectedSpells, alwaysPreparedSpells]);

  const preparedSpellLimit = getPreparedSpellLimit(character);
  const cantripLimit = getCantripLimit(character);
  const preparedSpellCount = selectedSpells.filter(
    (spell) => spell.level > 0
  ).length;
  const cantripCount = selectedSpells.filter(
    (spell) => spell.level === 0
  ).length;
  const canPrepareMoreSpells = preparedSpellCount < preparedSpellLimit;
  const canSelectMoreCantrips = cantripCount < cantripLimit;

  useEffect(() => {
    updateActiveStoredCharacter((storedCharacter) => {
      const alwaysPreparedIds = getAlwaysPreparedSpellIds(
        storedCharacter.character
      );
      const validSelectedSpellIds = storedCharacter.selectedSpellIds.filter(
        (spellId) => {
          const spell = spells.find((item) => item.id === spellId);
          if (!spell) return false;
          return (
            canCharacterUseSpell(spell, storedCharacter.character) &&
            !alwaysPreparedIds.includes(spellId)
          );
        }
      );

      const activeConcentrationSpell =
        storedCharacter.activeConcentrationSpellId
          ? spells.find(
              (item) => item.id === storedCharacter.activeConcentrationSpellId
            )
          : null;

      return {
        ...storedCharacter,
        selectedSpellIds: validSelectedSpellIds,
        activeConcentrationSpellId:
          activeConcentrationSpell &&
          canCharacterUseSpell(
            activeConcentrationSpell,
            storedCharacter.character
          )
            ? storedCharacter.activeConcentrationSpellId
            : null,
      };
    });
  }, [
    activeCharacterId,
    character.className,
    character.level,
    character.subclass,
  ]);

  const availableSpells = useMemo(() => {
    return spells
      .filter((spell) => canCharacterUseSpell(spell, character))
      .filter((spell) =>
        spell.name.toLowerCase().includes(search.toLowerCase())
      )
      .filter(
        (spell) =>
          spellLevelFilter === 'all' || String(spell.level) === spellLevelFilter
      )
      .filter((spell) => !onlyConcentration || spell.concentration)
      .filter((spell) => !onlyRitual || spell.ritual)
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [character, search, spellLevelFilter, onlyConcentration, onlyRitual]);

  const groupedSelectedSpells = useMemo(() => {
    const grouped: Record<string, Spell[]> = {};

    activeSpells.forEach((spell) => {
      const label = getSpellLevelLabel(spell.level);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(spell);
    });

    return grouped;
  }, [activeSpells]);

  const activeConcentrationSpell = spells.find(
    (spell) => spell.id === activeConcentrationSpellId
  );

  const maxSpellLevel = getMaxSpellLevelForClass(character);

  function createNewCharacter() {
    const name = newCharacterName.trim() || `Karakter ${characters.length + 1}`;
    const created = createStoredCharacter(createDefaultCharacter(name));

    setCharacters((prev) => [...prev, created]);
    setActiveCharacterId(created.id);
    setNewCharacterName('');
  }

  function deleteActiveCharacter() {
    if (characters.length <= 1) return;

    const remaining = characters.filter(
      (item) => item.id !== activeStoredCharacter.id
    );
    setCharacters(remaining);
    setActiveCharacterId(remaining[0].id);
  }

  function updateCharacter(partial: Partial<Character>) {
    updateActiveStoredCharacter((storedCharacter) => {
      let nextCharacter = { ...storedCharacter.character, ...partial };

      if (partial.className) {
        nextCharacter = {
          ...nextCharacter,
          subclass: getDefaultSubclass(nextCharacter.className),
        };
      }

      if (partial.className || partial.level) {
        return {
          ...storedCharacter,
          character: nextCharacter,
          usedSlots: getSpellSlotTable(nextCharacter),
          activeConcentrationSpellId: null,
        };
      }

      return {
        ...storedCharacter,
        character: nextCharacter,
      };
    });
  }

  function toggleSpell(spellId: string) {
    const spell = spells.find((item) => item.id === spellId);
    if (!spell) return;

    if (alwaysPreparedSpellIds.includes(spellId)) {
      return;
    }

    updateActiveStoredCharacter((storedCharacter) => {
      const prev = storedCharacter.selectedSpellIds;

      if (prev.includes(spellId)) {
        return {
          ...storedCharacter,
          selectedSpellIds: prev.filter((id) => id !== spellId),
        };
      }

      const currentSelectedSpells = prev
        .map((id) => spells.find((item) => item.id === id))
        .filter((item): item is Spell => Boolean(item))
        .filter((item) => !alwaysPreparedSpellIds.includes(item.id));

      if (spell.level === 0) {
        const currentCantripCount = currentSelectedSpells.filter(
          (item) => item.level === 0
        ).length;

        if (currentCantripCount >= cantripLimit) {
          return storedCharacter;
        }
      }

      if (spell.level > 0) {
        const currentPreparedCount = currentSelectedSpells.filter(
          (item) => item.level > 0
        ).length;

        if (currentPreparedCount >= preparedSpellLimit) {
          return storedCharacter;
        }
      }

      return {
        ...storedCharacter,
        selectedSpellIds: [...prev, spellId],
      };
    });
  }

  function toggleSlot(slotLevel: string, index: number) {
    updateActiveStoredCharacter((storedCharacter) => {
      const next = { ...storedCharacter.usedSlots };
      next[slotLevel] = [...next[slotLevel]];
      next[slotLevel][index] = !next[slotLevel][index];

      return {
        ...storedCharacter,
        usedSlots: next,
      };
    });
  }

  function setActiveConcentrationSpellId(spellId: string | null) {
    updateActiveStoredCharacter((storedCharacter) => ({
      ...storedCharacter,
      activeConcentrationSpellId: spellId,
    }));
  }

  function longRest() {
    updateActiveStoredCharacter((storedCharacter) => ({
      ...storedCharacter,
      usedSlots: getSpellSlotTable(storedCharacter.character),
      activeConcentrationSpellId: null,
    }));
  }

  function exportCharacter() {
    setBackupText(JSON.stringify(activeStoredCharacter, null, 2));
  }

  function importCharacter() {
    try {
      const parsed = JSON.parse(importText) as StoredCharacter;

      if (!parsed.character || !parsed.selectedSpellIds || !parsed.usedSlots) {
        setImportMessage('Import fejlede: data mangler vigtige felter.');
        return;
      }

      const imported: StoredCharacter = {
        ...parsed,
        id: createCharacterId(),
      };

      setCharacters((prev) => [...prev, imported]);
      setActiveCharacterId(imported.id);
      setImportMessage('Karakter importeret som ny karakter.');
    } catch {
      setImportMessage('Import fejlede: teksten er ikke gyldig JSON.');
    }
  }

  return (
    <div style={styles.page} className="app-shell">
      <header style={styles.header} className="app-header">
        <div>
          <div style={styles.eyebrow}>D&D Spell Manager</div>
          <h1 style={styles.title}>Spell preparation ved bordet</h1>
          <p style={styles.subtitle}>
            {character.className} level {character.level} · max spell level:{' '}
            {maxSpellLevel === 0 ? 'Cantrips only' : maxSpellLevel} · cantrips:{' '}
            {cantripCount}/{cantripLimit} · prepared: {preparedSpellCount}/
            {preparedSpellLimit}
            {alwaysPreparedSpells.length > 0
              ? ` · always: ${alwaysPreparedSpells.length}`
              : ''}
          </p>
        </div>

        <div style={styles.headerCharacterBox}>
          <label style={styles.headerCharacterLabel}>
            Aktiv karakter
            <select
              style={styles.headerSelect}
              value={activeStoredCharacter.id}
              onChange={(e) => setActiveCharacterId(e.target.value)}
            >
              {characters.map((storedCharacter) => (
                <option key={storedCharacter.id} value={storedCharacter.id}>
                  {storedCharacter.character.name || 'Unavngiven'} —{' '}
                  {storedCharacter.character.className}{' '}
                  {storedCharacter.character.level}
                </option>
              ))}
            </select>
          </label>

          <div style={styles.headerCreateRow}>
            <input
              style={styles.headerInput}
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              placeholder="Ny karakter"
            />
            <button style={styles.primaryButton} onClick={createNewCharacter}>
              Opret
            </button>
          </div>

          <button
            style={
              characters.length <= 1
                ? styles.disabledButtonCompact
                : styles.dangerButtonCompact
            }
            onClick={deleteActiveCharacter}
            disabled={characters.length <= 1}
          >
            Slet
          </button>
        </div>

        <div style={styles.headerButtons}>
          <button
            style={
              view === 'manage' ? styles.primaryButton : styles.secondaryButton
            }
            onClick={() => setView('manage')}
          >
            Manage
          </button>
          <button
            style={
              view === 'table' ? styles.primaryButton : styles.secondaryButton
            }
            onClick={() => setView('table')}
          >
            Table View
          </button>
        </div>
      </header>

      {view === 'manage' ? (
        <main style={styles.mainGrid} className="manage-grid">
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Character</h2>

            <label style={styles.label}>
              Navn
              <input
                style={styles.input}
                value={character.name}
                onChange={(e) => updateCharacter({ name: e.target.value })}
              />
            </label>

            <label style={styles.label}>
              Class
              <select
                style={styles.input}
                value={character.className}
                onChange={(e) =>
                  updateCharacter({ className: e.target.value as DndClass })
                }
              >
                {classOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Subclass
              <select
                style={styles.input}
                value={getCharacterSubclass(character)}
                onChange={(e) => updateCharacter({ subclass: e.target.value })}
              >
                {getSubclassOptions(character.className).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Level
              <select
                style={styles.input}
                value={character.level}
                onChange={(e) =>
                  updateCharacter({ level: Number(e.target.value) })
                }
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Spell Save DC
              <input
                style={styles.input}
                value={character.spellSaveDc}
                onChange={(e) =>
                  updateCharacter({ spellSaveDc: e.target.value })
                }
                placeholder="Fx 14"
              />
            </label>

            <label style={styles.label}>
              Spell Attack Bonus
              <input
                style={styles.input}
                value={character.spellAttackBonus}
                onChange={(e) =>
                  updateCharacter({ spellAttackBonus: e.target.value })
                }
                placeholder="Fx +6"
              />
            </label>

            <div style={styles.infoBox}>{classRules[character.className]}</div>

            <div style={styles.preparedBox}>
              <div style={styles.preparedNumber}>
                {cantripCount}/{cantripLimit}
              </div>
              <div>
                <strong>Cantrips</strong>
                <p style={styles.preparedText}>
                  Cantrips tælles separat fra level 1+ spells. Paladin og Ranger
                  har normalt 0 cantrips.
                </p>
              </div>
            </div>

            <div style={styles.preparedBox}>
              <div style={styles.preparedNumber}>
                {preparedSpellCount}/{preparedSpellLimit}
              </div>
              <div>
                <strong>Prepared level 1+ spells</strong>
                <p style={styles.preparedText}>
                  Always-prepared spells tæller ikke med i denne grænse.
                </p>
                <p style={styles.preparedText}>
                  {getPreparedChangeText(character.className)}
                </p>
              </div>
            </div>

            {alwaysPreparedSpells.length > 0 && (
              <div style={styles.preparedBox}>
                <div style={styles.preparedNumber}>
                  {alwaysPreparedSpells.length}
                </div>
                <div>
                  <strong>Always prepared</strong>
                  <p style={styles.preparedText}>
                    Kommer automatisk fra class/subclass og kan ikke vælges fra.
                  </p>
                  <div style={styles.alwaysPreparedMiniList}>
                    {alwaysPreparedSpells.map((spell) => (
                      <span key={spell.id} style={styles.alwaysPreparedPill}>
                        {spell.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!canSelectMoreCantrips && cantripLimit > 0 && (
              <div style={styles.warningBox}>
                Du har nået grænsen for cantrips. Fjern en cantrip for at vælge
                en anden.
              </div>
            )}

            {!canPrepareMoreSpells && (
              <div style={styles.warningBox}>
                Du har nået grænsen for prepared level 1+ spells. Fjern en spell
                for at vælge en anden.
              </div>
            )}

            <h2 style={styles.panelTitle}>
              {character.className === 'Warlock' ? 'Pact slots' : 'Spell slots'}
            </h2>
            <SlotTracker usedSlots={usedSlots} toggleSlot={toggleSlot} />
            <button style={styles.secondaryButtonFull} onClick={longRest}>
              {character.className === 'Warlock'
                ? 'Short Rest reset'
                : 'Long Rest reset'}
            </button>

            <h2 style={styles.panelTitle}>Backup</h2>
            <button
              style={styles.secondaryButtonFull}
              onClick={exportCharacter}
            >
              Export aktiv karakter
            </button>
            <textarea
              style={styles.textArea}
              value={backupText}
              onChange={(e) => setBackupText(e.target.value)}
              placeholder="Export vises her"
            />

            <textarea
              style={styles.textArea}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Indsæt backup her for import"
            />
            <button
              style={styles.secondaryButtonFull}
              onClick={importCharacter}
            >
              Import som ny karakter
            </button>
            {importMessage && (
              <div style={styles.smallText}>{importMessage}</div>
            )}
          </section>

          <section style={styles.panelWide}>
            <h2 style={styles.panelTitle}>Spell list</h2>

            <div style={styles.filters}>
              <input
                style={styles.input}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søg spell"
              />

              <select
                style={styles.input}
                value={spellLevelFilter}
                onChange={(e) => setSpellLevelFilter(e.target.value)}
              >
                <option value="all">Alle tilgængelige levels</option>
                <option value="0">Cantrips</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
                <option value="6">Level 6</option>
                <option value="7">Level 7</option>
                <option value="8">Level 8</option>
                <option value="9">Level 9</option>
              </select>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={onlyConcentration}
                  onChange={(e) => setOnlyConcentration(e.target.checked)}
                />
                Concentration
              </label>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={onlyRitual}
                  onChange={(e) => setOnlyRitual(e.target.checked)}
                />
                Ritual
              </label>
            </div>

            <div style={styles.spellGrid} className="spell-grid">
              {availableSpells.map((spell) => (
                <SpellCard
                  key={spell.id}
                  spell={spell}
                  selected={selectedSpellIds.includes(spell.id)}
                  alwaysPrepared={alwaysPreparedSpellIds.includes(spell.id)}
                  alwaysPreparedSource={getAlwaysPreparedSource(
                    spell.id,
                    character
                  )}
                  onToggle={() => toggleSpell(spell.id)}
                  onConcentrate={() => setActiveConcentrationSpellId(spell.id)}
                  compact={false}
                />
              ))}
            </div>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Active spells</h2>

            {activeConcentrationSpell ? (
              <div style={styles.concentrationBox}>
                Concentration: <strong>{activeConcentrationSpell.name}</strong>
              </div>
            ) : (
              <div style={styles.infoBox}>
                Ingen active concentration spell.
              </div>
            )}

            {activeSpells.length === 0 ? (
              <p style={styles.smallText}>Ingen spells valgt endnu.</p>
            ) : (
              <div style={styles.selectedList}>
                {activeSpells.map((spell) => (
                  <button
                    key={spell.id}
                    style={styles.selectedSpellButton}
                    onClick={() => toggleSpell(spell.id)}
                  >
                    {getSpellLevelLabel(spell.level)} — {spell.name}
                  </button>
                ))}
              </div>
            )}
          </section>
        </main>
      ) : (
        <main style={styles.tableView} className="table-view">
          <section style={styles.tableHeader}>
            <div>
              <h2 style={styles.tableTitle}>{character.name}</h2>
              <p style={styles.subtitle}>
                {character.className} level {character.level}
                {character.spellSaveDc
                  ? ` · Save DC ${character.spellSaveDc}`
                  : ''}
                {character.spellAttackBonus
                  ? ` · Spell attack ${character.spellAttackBonus}`
                  : ''}
              </p>
            </div>

            <button
              style={styles.secondaryButton}
              onClick={() => setView('manage')}
            >
              Tilbage
            </button>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>
              {character.className === 'Warlock' ? 'Pact slots' : 'Spell slots'}
            </h2>
            <SlotTracker usedSlots={usedSlots} toggleSlot={toggleSlot} />
            <button style={styles.secondaryButtonFull} onClick={longRest}>
              {character.className === 'Warlock'
                ? 'Short Rest reset'
                : 'Long Rest reset'}
            </button>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Concentration</h2>
            {activeConcentrationSpell ? (
              <div style={styles.concentrationBox}>
                Aktiv: <strong>{activeConcentrationSpell.name}</strong>
                <button
                  style={styles.smallButton}
                  onClick={() => setActiveConcentrationSpellId(null)}
                >
                  Stop
                </button>
              </div>
            ) : (
              <div style={styles.infoBox}>Ingen concentration aktiv.</div>
            )}
          </section>

          {Object.keys(groupedSelectedSpells).length === 0 ? (
            <section style={styles.panel}>
              <p style={styles.smallText}>Ingen aktive spells valgt.</p>
            </section>
          ) : (
            Object.entries(groupedSelectedSpells).map(([level, group]) => (
              <section key={level} style={styles.panel}>
                <h2 style={styles.panelTitle}>{level}</h2>
                <div style={styles.spellGrid} className="spell-grid">
                  {group.map((spell) => (
                    <SpellCard
                      key={spell.id}
                      spell={spell}
                      selected={true}
                      alwaysPrepared={alwaysPreparedSpellIds.includes(spell.id)}
                      alwaysPreparedSource={getAlwaysPreparedSource(
                        spell.id,
                        character
                      )}
                      onToggle={() => toggleSpell(spell.id)}
                      onConcentrate={() =>
                        setActiveConcentrationSpellId(spell.id)
                      }
                      compact={true}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      )}
    </div>
  );
}

function SlotTracker({
  usedSlots,
  toggleSlot,
}: {
  usedSlots: Record<string, boolean[]>;
  toggleSlot: (slotLevel: string, index: number) => void;
}) {
  const entries = Object.entries(usedSlots);

  if (entries.length === 0) {
    return <p style={styles.smallText}>Ingen spell slots på dette level.</p>;
  }

  return (
    <div style={styles.slotArea}>
      {entries.map(([level, slots]) => (
        <div key={level} style={styles.slotRow}>
          <div style={styles.slotLabel}>
            {level.startsWith('Pact') ? level : `Level ${level}`}
          </div>
          <div style={styles.slotBoxes}>
            {slots.map((used, index) => (
              <button
                key={index}
                style={used ? styles.slotUsed : styles.slotUnused}
                onClick={() => toggleSlot(level, index)}
                title={used ? 'Used' : 'Available'}
              >
                {used ? '×' : ''}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SpellCard({
  spell,
  selected,
  onToggle,
  onConcentrate,
  alwaysPrepared = false,
  alwaysPreparedSource,
  compact,
}: {
  spell: Spell;
  selected: boolean;
  alwaysPrepared?: boolean;
  alwaysPreparedSource?: string;
  onToggle: () => void;
  onConcentrate: () => void;
  compact: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article style={isOpen ? { ...styles.card, ...styles.cardOpen } : styles.card}>
      <div style={styles.compactCardTop}>
        <button
          type="button"
          style={styles.cardTextButton}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div style={styles.cardMeta}>
            {getSpellLevelLabel(spell.level)} · {spell.school}
          </div>

          <h3 style={styles.cardTitle}>{spell.name}</h3>

          <div style={styles.compactTagLine}>
            <span>{spell.castingTime}</span>
            <span>·</span>
            <span>{spell.range}</span>

            {spell.concentration && (
              <>
                <span>·</span>
                <span>Concentration</span>
              </>
            )}

            {spell.ritual && (
              <>
                <span>·</span>
                <span>Ritual</span>
              </>
            )}
          </div>

          {alwaysPrepared && (
            <div style={styles.compactAlwaysPrepared}>
              Always prepared
              {alwaysPreparedSource ? ` · ${alwaysPreparedSource}` : ''}
            </div>
          )}

          <div style={styles.compactHint}>
            {isOpen ? 'Skjul detaljer' : 'Vis detaljer'}
          </div>
        </button>

        {!compact && (
          <button
            style={
              alwaysPrepared
                ? styles.alwaysPreparedButton
                : selected
                ? styles.selectedButton
                : styles.selectButton
            }
            onClick={onToggle}
            disabled={alwaysPrepared}
          >
            {alwaysPrepared ? 'Always' : selected ? 'Selected' : 'Select'}
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div style={styles.statGrid}>
            <div style={styles.statBox}>
              <span>Casting</span>
              {spell.castingTime}
            </div>
            <div style={styles.statBox}>
              <span>Range</span>
              {spell.range}
            </div>
            <div style={styles.statBox}>
              <span>Duration</span>
              {spell.duration}
            </div>
            <div style={styles.statBox}>
              <span>Components</span>
              {spell.components}
            </div>
          </div>

          <p style={styles.spellText}>{spell.text}</p>

          {spell.damage && (
            <div style={styles.damageBox}>
              <strong>Effect:</strong> {spell.damage}
            </div>
          )}

          {spell.scaling && (
            <div style={styles.scalingBox}>
              <strong>At higher levels:</strong> {spell.scaling}
            </div>
          )}

          <div style={styles.tags}>
            {spell.concentration && <span style={styles.tag}>Concentration</span>}
            {spell.ritual && <span style={styles.tag}>Ritual</span>}
            {spell.level === 0 && <span style={styles.tag}>Cantrip</span>}
          </div>

          {spell.concentration && (
            <button style={styles.smallButton} onClick={onConcentrate}>
              Start concentration
            </button>
          )}
        </>
      )}
    </article>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0c0a09',
    color: '#f5f5f4',
    fontFamily: 'Inter, system-ui, Arial, sans-serif',
    padding: '24px',
  },
  header: {
    maxWidth: '1400px',
    margin: '0 auto 24px auto',
    padding: '24px',
    border: '1px solid #292524',
    borderRadius: '20px',
    background: '#1c1917',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  eyebrow: {
    color: '#fbbf24',
    fontSize: '14px',
    marginBottom: '8px',
  },
  title: {
    margin: 0,
    fontSize: '32px',
    lineHeight: 1.1,
  },
  subtitle: {
    color: '#a8a29e',
    margin: '8px 0 0 0',
    lineHeight: 1.5,
  },
  headerCharacterBox: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    minWidth: '320px',
  },
  headerCharacterLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    color: '#d6d3d1',
    fontSize: '12px',
    minWidth: '220px',
  },
  headerSelect: {
    border: '1px solid #44403c',
    background: '#0c0a09',
    color: '#f5f5f4',
    borderRadius: '12px',
    padding: '10px',
    fontSize: '14px',
  },
  headerCreateRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  headerInput: {
    width: '150px',
    boxSizing: 'border-box',
    border: '1px solid #44403c',
    background: '#0c0a09',
    color: '#f5f5f4',
    borderRadius: '12px',
    padding: '10px',
    fontSize: '14px',
  },
  headerButtons: {
    display: 'flex',
    gap: '8px',
  },
  mainGrid: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '300px 1fr 300px',
    gap: '16px',
  },
  panel: {
    background: '#1c1917',
    border: '1px solid #292524',
    borderRadius: '18px',
    padding: '18px',
    marginBottom: '16px',
  },
  panelWide: {
    background: '#1c1917',
    border: '1px solid #292524',
    borderRadius: '18px',
    padding: '18px',
    marginBottom: '16px',
    minWidth: 0,
  },
  panelTitle: {
    margin: '0 0 14px 0',
    fontSize: '18px',
  },
  label: {
    display: 'block',
    color: '#d6d3d1',
    fontSize: '14px',
    marginBottom: '12px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '6px',
    border: '1px solid #44403c',
    background: '#0c0a09',
    color: '#f5f5f4',
    borderRadius: '12px',
    padding: '11px',
    fontSize: '14px',
  },
  inputNoMargin: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #44403c',
    background: '#0c0a09',
    color: '#f5f5f4',
    borderRadius: '12px',
    padding: '11px',
    fontSize: '14px',
  },
  characterCreateRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '8px',
    marginBottom: '12px',
  },
  infoBox: {
    background: '#0c0a09',
    border: '1px solid #292524',
    borderRadius: '14px',
    padding: '12px',
    color: '#d6d3d1',
    lineHeight: 1.5,
    fontSize: '14px',
    marginBottom: '14px',
  },
  preparedBox: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    background: '#111827',
    border: '1px solid #374151',
    borderRadius: '14px',
    padding: '12px',
    color: '#e5e7eb',
    marginBottom: '14px',
  },
  preparedNumber: {
    minWidth: '58px',
    height: '58px',
    borderRadius: '14px',
    background: '#fbbf24',
    color: '#1c1917',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '18px',
  },
  preparedText: {
    margin: '6px 0 0 0',
    color: '#cbd5e1',
    fontSize: '13px',
    lineHeight: 1.4,
  },
  alwaysPreparedMiniList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
  },
  alwaysPreparedPill: {
    background: '#14532d',
    color: '#dcfce7',
    border: '1px solid #166534',
    borderRadius: '999px',
    padding: '4px 8px',
    fontSize: '12px',
  },
  warningBox: {
    background: '#3f1d1d',
    border: '1px solid #7f1d1d',
    borderRadius: '14px',
    padding: '12px',
    color: '#fecaca',
    fontSize: '13px',
    lineHeight: 1.4,
    marginBottom: '14px',
  },
  concentrationBox: {
    background: '#451a03',
    border: '1px solid #92400e',
    borderRadius: '14px',
    padding: '12px',
    color: '#ffedd5',
    lineHeight: 1.5,
    fontSize: '14px',
    marginBottom: '14px',
  },
  damageBox: {
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '12px',
    background: '#3f1d1d',
    border: '1px solid #7f1d1d',
    color: '#fecaca',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  scalingBox: {
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '12px',
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#cbd5e1',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  primaryButton: {
    border: '0',
    background: '#fbbf24',
    color: '#1c1917',
    padding: '11px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 700,
  },
  secondaryButton: {
    border: '1px solid #44403c',
    background: '#292524',
    color: '#f5f5f4',
    padding: '11px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 700,
  },
  secondaryButtonFull: {
    width: '100%',
    border: '1px solid #44403c',
    background: '#292524',
    color: '#f5f5f4',
    padding: '11px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 700,
    marginBottom: '12px',
  },
  dangerButtonFull: {
    width: '100%',
    border: '1px solid #7f1d1d',
    background: '#3f1d1d',
    color: '#fecaca',
    padding: '11px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 700,
    marginBottom: '12px',
  },
  disabledButtonFull: {
    width: '100%',
    border: '1px solid #44403c',
    background: '#1c1917',
    color: '#78716c',
    padding: '11px 14px',
    borderRadius: '12px',
    cursor: 'not-allowed',
    fontWeight: 700,
    marginBottom: '12px',
  },
  dangerButtonCompact: {
    border: '1px solid #7f1d1d',
    background: '#3f1d1d',
    color: '#fecaca',
    padding: '10px 12px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 700,
  },
  disabledButtonCompact: {
    border: '1px solid #44403c',
    background: '#1c1917',
    color: '#78716c',
    padding: '10px 12px',
    borderRadius: '12px',
    cursor: 'not-allowed',
    fontWeight: 700,
  },
  smallButton: {
    border: '1px solid #57534e',
    background: '#292524',
    color: '#f5f5f4',
    padding: '8px 10px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    marginTop: '10px',
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: '1fr 160px',
    gap: '10px',
    marginBottom: '16px',
  },
  checkboxLabel: {
    color: '#d6d3d1',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spellGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '14px',
  },
  card: {
    background: '#0c0a09',
    border: '1px solid #292524',
    borderRadius: '18px',
    padding: '16px',
    cardOpen: {
      border: '1px solid #57534e',
    },
    compactCardTop: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      alignItems: 'flex-start',
    },
    cardTextButton: {
      flex: 1,
      border: '0',
      background: 'transparent',
      color: '#f5f5f4',
      padding: 0,
      textAlign: 'left',
      cursor: 'pointer',
    },
    compactTagLine: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      color: '#a8a29e',
      fontSize: '13px',
      marginTop: '6px',
      lineHeight: 1.4,
    },
    compactHint: {
      color: '#78716c',
      fontSize: '12px',
      marginTop: '8px',
    },
    compactAlwaysPrepared: {
      marginTop: '8px',
      background: '#14532d',
      color: '#dcfce7',
      border: '1px solid #166534',
      borderRadius: '999px',
      padding: '5px 9px',
      fontSize: '12px',
      display: 'inline-block',
    },
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'flex-start',
  },
  cardMeta: {
    color: '#fbbf24',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  cardTitle: {
    margin: '4px 0 0 0',
    fontSize: '20px',
  },
  selectButton: {
    border: '1px solid #44403c',
    background: '#292524',
    color: '#f5f5f4',
    padding: '8px 10px',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  selectedButton: {
    border: '1px solid #15803d',
    background: '#166534',
    color: '#dcfce7',
    padding: '8px 10px',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  alwaysPreparedButton: {
    border: '1px solid #166534',
    background: '#14532d',
    color: '#dcfce7',
    padding: '8px 10px',
    borderRadius: '10px',
    cursor: 'not-allowed',
    fontWeight: 700,
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '14px',
  },
  statBox: {
    background: '#1c1917',
    borderRadius: '12px',
    padding: '10px',
    color: '#e7e5e4',
    fontSize: '13px',
    lineHeight: 1.4,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  spellText: {
    color: '#d6d3d1',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    background: '#292524',
    color: '#d6d3d1',
    borderRadius: '999px',
    padding: '5px 9px',
    fontSize: '12px',
  },
  alwaysPreparedTag: {
    background: '#14532d',
    color: '#dcfce7',
    border: '1px solid #166534',
    borderRadius: '999px',
    padding: '5px 9px',
    fontSize: '12px',
  },
  selectedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  selectedSpellButton: {
    textAlign: 'left',
    border: '1px solid #292524',
    background: '#0c0a09',
    color: '#f5f5f4',
    padding: '10px',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  slotArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '14px',
  },
  slotRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  slotLabel: {
    color: '#d6d3d1',
    fontSize: '14px',
    minWidth: '70px',
  },
  slotBoxes: {
    display: 'flex',
    gap: '7px',
    flexWrap: 'wrap',
  },
  slotUnused: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    border: '1px solid #78716c',
    background: '#0c0a09',
    color: '#f5f5f4',
    cursor: 'pointer',
  },
  slotUsed: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    border: '1px solid #b45309',
    background: '#78350f',
    color: '#ffedd5',
    cursor: 'pointer',
    fontWeight: 700,
  },
  tableView: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  tableHeader: {
    background: '#1c1917',
    border: '1px solid #292524',
    borderRadius: '18px',
    padding: '18px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  tableTitle: {
    margin: 0,
    fontSize: '28px',
  },
  textArea: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '90px',
    marginBottom: '10px',
    border: '1px solid #44403c',
    background: '#0c0a09',
    color: '#f5f5f4',
    borderRadius: '12px',
    padding: '10px',
    fontSize: '12px',
  },
  smallText: {
    color: '#a8a29e',
    fontSize: '13px',
    lineHeight: 1.5,
  },
};
