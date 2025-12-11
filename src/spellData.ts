// Spell data loader and filtering utilities
// Import all spell JSON files
import spellsPhb from './dnd5eReferences/dndSpellsJsons/spells-phb.json';
import spellsXge from './dnd5eReferences/dndSpellsJsons/spells-xge.json';
import spellsTce from './dnd5eReferences/dndSpellsJsons/spells-tce.json';
import spellsEgtw from './dnd5eReferences/dndSpellsJsons/spells-egw.json';
import spellsFtd from './dnd5eReferences/dndSpellsJsons/spells-ftd.json';
import spellsTdcsr from './dnd5eReferences/dndSpellsJsons/spells-tdcsr.json';
import spellsXphb from './dnd5eReferences/dndSpellsJsons/spells-xphb.json';
import spellsAag from './dnd5eReferences/dndSpellsJsons/spells-aag.json';
import spellsAi from './dnd5eReferences/dndSpellsJsons/spells-ai.json';
import spellsAitfrAvt from './dnd5eReferences/dndSpellsJsons/spells-aitfr-avt.json';
import spellsBmt from './dnd5eReferences/dndSpellsJsons/spells-bmt.json';
import spellsGgr from './dnd5eReferences/dndSpellsJsons/spells-ggr.json';
import spellsIdrotf from './dnd5eReferences/dndSpellsJsons/spells-idrotf.json';
import spellsLlk from './dnd5eReferences/dndSpellsJsons/spells-llk.json';
import spellsSato from './dnd5eReferences/dndSpellsJsons/spells-sato.json';
import spellsScc from './dnd5eReferences/dndSpellsJsons/spells-scc.json';

// Combine all spell sources with error handling
const allSpells: SpellData[] = (() => {
  try {
    return [
      ...(spellsPhb?.spell || []),
      ...(spellsXge?.spell || []),
      ...(spellsTce?.spell || []),
      ...(spellsEgtw?.spell || []),
      ...(spellsFtd?.spell || []),
      ...(spellsTdcsr?.spell || []),
      ...(spellsXphb?.spell || []),
      ...(spellsAag?.spell || []),
      ...(spellsAi?.spell || []),
      ...(spellsAitfrAvt?.spell || []),
      ...(spellsBmt?.spell || []),
      ...(spellsGgr?.spell || []),
      ...(spellsIdrotf?.spell || []),
      ...(spellsLlk?.spell || []),
      ...(spellsSato?.spell || []),
      ...(spellsScc?.spell || []),
    ];
  } catch (error) {
    console.error('Error loading spell data:', error);
    return [];
  }
})();

// Exported for any callers that need the raw list without filtering
export const ALL_SPELLS: SpellData[] = allSpells;

// Class spell lists (simplified - you can expand this)
const classSpells: Record<string, string[]> = {
  'Wizard': [], // Wizards can learn any spell
  'Sorcerer': [], // Sorcerers have limited spell lists
  'Warlock': [], // Warlocks have limited spell lists
  'Cleric': [], // Clerics have domain spells
  'Druid': [], // Druids have nature spells
  'Ranger': [], // Rangers have limited spell lists
  'Paladin': [], // Paladins have limited spell lists
  'Bard': [], // Bards have limited spell lists
  'Fighter': [], // Eldritch Knight
  'Rogue': [], // Arcane Trickster
};

// School abbreviations to full names
const schoolMap: Record<string, string> = {
  'A': 'Abjuration',
  'C': 'Conjuration',
  'D': 'Divination',
  'E': 'Enchantment',
  'V': 'Evocation',
  'I': 'Illusion',
  'N': 'Necromancy',
  'T': 'Transmutation',
};

export interface SpellData {
  name: string;
  level: number;
  school: string;
  source: string;
  page?: number;
  time: any;
  range: any;
  components: any;
  duration: any;
  entries: (string | { type: string; name: string; entries: string[] })[];
  classes?: any;
  [key: string]: any;
}

export function getAvailableSpells(characterClass: string, characterLevel: number): SpellData[] {
  try {
    // Calculate max spell level based on character level and class
    let maxSpellLevel = 0;
    const className = (characterClass || '').toLowerCase();
    const level = Math.max(1, Math.min(20, characterLevel || 1));
    
    // Full casters: Wizard, Sorcerer, Cleric, Druid, Bard, Warlock
    if (className.includes('wizard') || className.includes('sorcerer') || 
        className.includes('cleric') || className.includes('druid') || 
        className.includes('bard') || className.includes('warlock')) {
      maxSpellLevel = Math.ceil(level / 2);
    }
    // Half casters: Paladin, Ranger
    else if (className.includes('paladin') || className.includes('ranger')) {
      maxSpellLevel = Math.max(0, Math.ceil((level - 2) / 2));
    }
    // Third casters: Eldritch Knight (Fighter), Arcane Trickster (Rogue)
    else if (className.includes('fighter') || className.includes('rogue')) {
      maxSpellLevel = Math.max(0, Math.ceil((level - 2) / 3));
    }
    // Non-casters: no spells
    else {
      maxSpellLevel = 0;
    }
    
    if (!ALL_SPELLS || ALL_SPELLS.length === 0) {
      console.warn('No spell data loaded');
      return [];
    }
    
    return ALL_SPELLS
      .filter(spell => {
        if (!spell || typeof spell.level !== 'number') return false;
        // Always include cantrips (level 0), and spells up to max spell level
        return spell.level === 0 || (spell.level > 0 && spell.level <= maxSpellLevel);
      })
      .map(spell => ({
        ...spell,
        school: schoolMap[spell.school] || spell.school,
      }));
  } catch (error) {
    console.error('Error in getAvailableSpells:', error);
    return [];
  }
}

export function searchSpells(
  query: string,
  characterClass: string,
  characterLevel: number,
  baseList?: SpellData[],
): SpellData[] {
  const availableSpells = baseList ?? getAvailableSpells(characterClass, characterLevel);
  
  if (!query.trim()) {
    return availableSpells;
  }
  
  const searchTerm = query.toLowerCase();
  return availableSpells.filter(spell => 
    spell.name?.toLowerCase().includes(searchTerm) ||
    spell.school?.toLowerCase().includes(searchTerm) ||
    (spell.entries && spell.entries.some(entry => {
      if (typeof entry === 'string') {
        return entry.toLowerCase().includes(searchTerm);
      }
      if (entry && typeof entry === 'object' && Array.isArray(entry.entries)) {
        return entry.entries.some(subEntry => 
          typeof subEntry === 'string' && subEntry.toLowerCase().includes(searchTerm)
        );
      }
      return false;
    }))
  );
}

export function formatSpellForDisplay(spell: SpellData) {
  try {
    return {
      name: spell.name || 'Unknown Spell',
      level: spell.level ?? 0,
      school: spell.school || 'Unknown',
      castingTime: formatCastingTime(spell.time),
      range: formatRange(spell.range),
      components: formatComponents(spell.components),
      duration: formatDuration(spell.duration),
      description: spell.entries && Array.isArray(spell.entries) 
        ? spell.entries.map(entry => {
            if (typeof entry === 'string') return entry;
            if (entry && typeof entry === 'object' && 'entries' in entry && Array.isArray(entry.entries)) {
              return entry.entries.join(' ');
            }
            return '';
          }).filter(Boolean).join(' ')
        : '',
      source: spell.source || 'Custom',
    };
  } catch (error) {
    console.error('Error formatting spell:', spell.name, error);
    return {
      name: spell.name || 'Unknown Spell',
      level: spell.level ?? 0,
      school: spell.school || 'Unknown',
      castingTime: 'Unknown',
      range: 'Unknown',
      components: 'Unknown',
      duration: 'Unknown',
      description: '',
      source: spell.source || 'Custom',
    };
  }
}

function formatCastingTime(time: any): string {
  try {
    if (!time || !Array.isArray(time) || time.length === 0) return '1 action';
    
    const t = time[0];
    if (!t || typeof t !== 'object') return '1 action';
    
    if (t.unit === 'action') return `${t.number || 1} action${(t.number || 1) > 1 ? 's' : ''}`;
    if (t.unit === 'bonus') return `${t.number || 1} bonus action${(t.number || 1) > 1 ? 's' : ''}`;
    if (t.unit === 'reaction') return '1 reaction';
    if (t.unit === 'minute') return `${t.number || 1} minute${(t.number || 1) > 1 ? 's' : ''}`;
    if (t.unit === 'hour') return `${t.number || 1} hour${(t.number || 1) > 1 ? 's' : ''}`;
    
    return '1 action';
  } catch (error) {
    console.error('Error formatting casting time:', error);
    return '1 action';
  }
}

function formatRange(range: any): string {
  try {
    if (!range) return 'Self';
    
    if (typeof range === 'string') return range;
    
    if (range.type === 'point') {
      if (range.distance?.type === 'feet') {
        return `${range.distance.amount || 0} feet`;
      }
    }
    if (range.type === 'self') return 'Self';
    if (range.type === 'touch') return 'Touch';
    if (range.type === 'sight') return 'Sight';
    if (range.type === 'unlimited') return 'Unlimited';
    
    return 'Self';
  } catch (error) {
    console.error('Error formatting range:', error);
    return 'Self';
  }
}

function formatComponents(components: any): string {
  if (!components) return 'V, S, M';
  
  const comps = [];
  if (components.v) comps.push('V');
  if (components.s) comps.push('S');
  if (components.m) comps.push('M');
  if (components.r) comps.push('R');
  
  return comps.join(', ');
}

function formatDuration(duration: any): string {
  try {
    if (!duration || !Array.isArray(duration) || duration.length === 0) return 'Instantaneous';
    
    const d = duration[0];
    if (!d || typeof d !== 'object') return 'Instantaneous';
    
    if (d.type === 'instant') return 'Instantaneous';
    if (d.type === 'timed') {
      if (d.duration?.type === 'minute') {
        const amount = d.duration.amount || 1;
        return `${amount} minute${amount > 1 ? 's' : ''}`;
      }
      if (d.duration?.type === 'hour') {
        const amount = d.duration.amount || 1;
        return `${amount} hour${amount > 1 ? 's' : ''}`;
      }
      if (d.duration?.type === 'day') {
        const amount = d.duration.amount || 1;
        return `${amount} day${amount > 1 ? 's' : ''}`;
      }
      if (d.concentration) return 'Concentration';
    }
    if (d.type === 'permanent') return 'Until dispelled';
    if (d.type === 'special') return 'Special';
    
    return 'Instantaneous';
  } catch (error) {
    console.error('Error formatting duration:', error);
    return 'Instantaneous';
  }
}
