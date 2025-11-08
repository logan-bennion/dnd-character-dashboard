// Item data loader and filtering utilities
import itemsData from './dnd5eReferences/items.json';

// Item categories for filtering
const itemCategories = {
  'Weapon': ['weapon', 'sword', 'bow', 'crossbow', 'dagger', 'axe', 'mace', 'spear', 'staff', 'whip'],
  'Armor': ['armor', 'plate', 'chain', 'leather', 'studded', 'splint', 'scale', 'ring', 'mail'],
  'Shield': ['shield', 'buckler'],
  'Tool': ['tool', 'thieves', 'disguise', 'forgery', 'herbalism', 'navigator', 'poisoner', 'tinker'],
  'Adventuring Gear': ['rope', 'grappling', 'potion', 'scroll', 'wand', 'staff', 'orb', 'crystal', 'gem'],
  'Consumable': ['potion', 'scroll', 'oil', 'poison', 'antidote', 'elixir'],
  'Treasure': ['coin', 'gem', 'jewel', 'art', 'treasure'],
  'Ammunition': ['arrow', 'bolt', 'bullet', 'dart', 'sling'],
  'Wondrous Item': ['amulet', 'ring', 'cloak', 'boots', 'gloves', 'belt', 'bracers', 'goggles', 'lens'],
  'Other': []
};

// Rarity colors
const rarityColors = {
  'common': 'bg-gray-100 text-gray-800',
  'uncommon': 'bg-green-100 text-green-800',
  'rare': 'bg-blue-100 text-blue-800',
  'very rare': 'bg-purple-100 text-purple-800',
  'legendary': 'bg-yellow-100 text-yellow-800',
  'artifact': 'bg-red-100 text-red-800',
};

export interface ItemData {
  name: string;
  source: string;
  page?: number;
  rarity?: string;
  reqAttune?: string;
  reqAttuneTags?: any[];
  wondrous?: boolean;
  weapon?: boolean;
  armor?: boolean;
  shield?: boolean;
  tool?: boolean;
  ammunition?: boolean;
  weight?: number;
  value?: number;
  entries?: (string | { type: string; name: string; entries: string[] })[];
  bonusSpellAttack?: string;
  bonusSpellSaveDc?: string;
  bonusWeaponAttack?: string;
  bonusWeaponDamage?: string;
  bonusAC?: string;
  focus?: string[];
  [key: string]: any;
}

// Get all items from the JSON data
const allItems: ItemData[] = itemsData?.item || [];

export function getAvailableItems(category?: string, searchQuery?: string): ItemData[] {
  let filteredItems = allItems;

  // Filter by category if specified
  if (category && category.trim() !== '') {
    const categoryKeywords = itemCategories[category as keyof typeof itemCategories];
    
    if (categoryKeywords && categoryKeywords.length > 0) {
      filteredItems = filteredItems.filter(item => {
        const itemName = item.name.toLowerCase();
        
        // Check if item matches any category keywords
        return categoryKeywords.some(keyword => 
          itemName.includes(keyword.toLowerCase())
        );
      });
    }
  }

  // Filter by search query if provided
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      (item.entries && item.entries.some(entry => 
        typeof entry === 'string' 
          ? entry.toLowerCase().includes(searchTerm)
          : entry.entries.some(subEntry => subEntry.toLowerCase().includes(searchTerm))
      )) ||
      (item.rarity && item.rarity.toLowerCase().includes(searchTerm)) ||
      (item.source && item.source.toLowerCase().includes(searchTerm))
    );
  }

  return filteredItems;
}

export function searchItems(query: string, category?: string): ItemData[] {
  try {
    return getAvailableItems(category, query);
  } catch (error) {
    console.error('Error in searchItems:', error);
    return [];
  }
}

export function formatItemForDisplay(item: ItemData) {
  return {
    name: item.name,
    source: item.source,
    rarity: item.rarity || 'common',
    reqAttune: item.reqAttune,
    wondrous: item.wondrous || false,
    weapon: item.weapon || false,
    armor: item.armor || false,
    shield: item.shield || false,
    tool: item.tool || false,
    ammunition: item.ammunition || false,
    weight: item.weight || 0,
    value: item.value || 0,
    description: item.entries ? item.entries.map(entry => 
      typeof entry === 'string' ? entry : (entry.entries ? entry.entries.join(' ') : '')
    ).join(' ') : '',
    bonusSpellAttack: item.bonusSpellAttack,
    bonusSpellSaveDc: item.bonusSpellSaveDc,
    bonusWeaponAttack: item.bonusWeaponAttack,
    bonusWeaponDamage: item.bonusWeaponDamage,
    bonusAC: item.bonusAC,
    focus: item.focus,
  };
}

export function getItemCategories() {
  return Object.keys(itemCategories).filter(category => category !== 'Other');
}

export function getRarityColor(rarity: string) {
  return rarityColors[rarity as keyof typeof rarityColors] || 'bg-gray-100 text-gray-800';
}

export function categorizeItem(item: ItemData): string {
  if (item.weapon) return 'Weapon';
  if (item.armor) return 'Armor';
  if (item.shield) return 'Shield';
  if (item.tool) return 'Tool';
  if (item.ammunition) return 'Ammunition';
  if (item.wondrous) return 'Wondrous Item';
  
  // Check by name keywords
  const itemName = item.name.toLowerCase();
  for (const [category, keywords] of Object.entries(itemCategories)) {
    if (keywords.some(keyword => itemName.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
}
