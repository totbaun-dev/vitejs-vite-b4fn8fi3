export type DndClass =
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Paladin'
  | 'Ranger'
  | 'Sorcerer'
  | 'Warlock'
  | 'Wizard';

export type Spell = {
  id: string;
  name: string;
  level: number;
  school: string;
  classes: DndClass[];
  castingTime: string;
  range: string;
  duration: string;
  components: string;
  concentration: boolean;
  ritual: boolean;
  text: string;
  damage?: string;
  scaling?: string;
};

export type Character = {
  name: string;
  className: DndClass;
  subclass?: string;
  level: number;
  spellSaveDc: string;
  spellAttackBonus: string;
};

export type SavedState = {
  character: Character;
  selectedSpellIds: string[];
  usedSlots: Record<string, boolean[]>;
  activeConcentrationSpellId: string | null;
};
