// Bestiary data utilities - now queries from Convex instead of loading JSON files
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export interface MonsterData {
  _id?: Id<"bestiaryReference">;
  name: string;
  source: string;
  size?: string;
  type?: string;
  alignment?: string;
  armorClass: number;
  hitPoints: number;
  hitPointsFormula?: string;
  speed?: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  skills?: string;
  passivePerception: number;
  languages?: string;
  challengeRating?: string;
  description: string;
  rawData?: any;
}

export function formatMonsterForDisplay(monster: MonsterData) {
  // The data from Convex is already formatted, just return it
  return {
    name: monster.name || 'Unknown Monster',
    source: monster.source || 'Custom',
    size: monster.size || '',
    type: monster.type || '',
    alignment: monster.alignment || '',
    armorClass: monster.armorClass || 0,
    hitPoints: monster.hitPoints || 0,
    hitPointsFormula: monster.hitPointsFormula || '',
    speed: monster.speed || '',
    strength: monster.strength || 10,
    dexterity: monster.dexterity || 10,
    constitution: monster.constitution || 10,
    intelligence: monster.intelligence || 10,
    wisdom: monster.wisdom || 10,
    charisma: monster.charisma || 10,
    skills: monster.skills || '',
    passivePerception: monster.passivePerception || 10,
    languages: monster.languages || '—',
    challengeRating: monster.challengeRating || '—',
    description: monster.description || '',
  };
}
