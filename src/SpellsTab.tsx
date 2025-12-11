import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { getAvailableSpells, searchSpells, formatSpellForDisplay, SpellData } from "./spellData";

interface SpellsTabProps {
  characterId: Id<"characters">;
  character: {
    class: string;
    level: number;
  };
}

export function SpellsTab({ characterId, character }: SpellsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSpellSelection, setShowSpellSelection] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpellLevel, setSelectedSpellLevel] = useState<number>(0);
  const [lockedTooltip, setLockedTooltip] = useState<string | null>(null);
  const hasInitializedLevel = useRef(false);
  const spells = useQuery(api.spells.list, { characterId }) || [];
  const addSpell = useMutation(api.spells.add);
  const togglePrepared = useMutation(api.spells.togglePrepared);
  const removeSpell = useMutation(api.spells.remove);
  const updateSpellSlotsUsed = useMutation(api.characters.updateSpellSlotsUsed);

  const [newSpell, setNewSpell] = useState({
    name: "",
    level: 0,
    school: "",
    castingTime: "",
    range: "",
    components: "",
    duration: "",
    description: "",
  });

  // Spell reference data is loaded locally from dnd5eReferences JSON bundles
  const availableSpells = useMemo(
    () => getAvailableSpells(character.class, character.level),
    [character.class, character.level],
  );

  const visibleSpells = useMemo(
    () => searchSpells(searchQuery, character.class, character.level, availableSpells),
    [searchQuery, character.class, character.level, availableSpells],
  );

  const handleAddSpell = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSpell({ characterId, ...newSpell });
    setNewSpell({
      name: "",
      level: 0,
      school: "",
      castingTime: "",
      range: "",
      components: "",
      duration: "",
      description: "",
    });
    setShowAddForm(false);
  };

  const handleSelectSpell = async (spell: SpellData) => {
    const formattedSpell = formatSpellForDisplay(spell);
    await addSpell({ characterId, ...formattedSpell });
    setShowSpellSelection(false);
    setSearchQuery("");
  };

  const handleTooltipClick = (spellId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLockedTooltip(lockedTooltip === spellId ? null : spellId);
  };

  const handleClickOutside = () => {
    setLockedTooltip(null);
  };

  // Auto-select first available spell level when modal opens
  useEffect(() => {
    if (!showSpellSelection) {
      // Reset to default when modal closes
      setSelectedSpellLevel(0);
      hasInitializedLevel.current = false;
      return;
    }

    // Only initialize once when modal opens
    if (hasInitializedLevel.current) {
      return;
    }

    try {
      if (!availableSpells || availableSpells.length === 0) {
        console.warn('No spells available for', character.class, character.level);
        return;
      }

      const availableLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(level => 
        availableSpells.some(spell => spell && spell.level === level)
      );
      
      if (availableLevels.length > 0) {
        setSelectedSpellLevel(availableLevels[0]);
        hasInitializedLevel.current = true;
      }
    } catch (error) {
      console.error('Error loading spells:', error);
    }
  }, [showSpellSelection, character.class, character.level, availableSpells]);

  // Calculate spell slots based on character level and class
  const getSpellSlots = (level: number, className: string) => {
    const slots: {[level: number]: number} = {};
    
    if (className.toLowerCase().includes('wizard') || className.toLowerCase().includes('sorcerer') || 
        className.toLowerCase().includes('warlock') || className.toLowerCase().includes('bard') ||
        className.toLowerCase().includes('cleric') || className.toLowerCase().includes('druid')) {
      // Full caster progression
      const fullCasterSlots = [
        [2], // Level 1
        [3], // Level 2
        [4, 2], // Level 3
        [4, 3], // Level 4
        [4, 3, 2], // Level 5
        [4, 3, 3], // Level 6
        [4, 3, 3, 1], // Level 7
        [4, 3, 3, 2], // Level 8
        [4, 3, 3, 3, 1], // Level 9
        [4, 3, 3, 3, 2], // Level 10
        [4, 3, 3, 3, 2, 1], // Level 11
        [4, 3, 3, 3, 2, 1], // Level 12
        [4, 3, 3, 3, 2, 1, 1], // Level 13
        [4, 3, 3, 3, 2, 1, 1], // Level 14
        [4, 3, 3, 3, 2, 1, 1, 1], // Level 15
        [4, 3, 3, 3, 2, 1, 1, 1], // Level 16
        [4, 3, 3, 3, 2, 1, 1, 1, 1], // Level 17
        [4, 3, 3, 3, 2, 1, 1, 1, 1], // Level 18
        [4, 3, 3, 3, 2, 1, 1, 1, 1], // Level 19
        [4, 3, 3, 3, 2, 1, 1, 1, 1] // Level 20
      ];
      
      if (level > 0 && level <= 20) {
        const levelSlots = fullCasterSlots[level - 1];
        levelSlots.forEach((slotCount, index) => {
          slots[index + 1] = slotCount;
        });
      }
    } else if (className.toLowerCase().includes('paladin') || className.toLowerCase().includes('ranger')) {
      // Half caster progression
      const halfCasterSlots = [
        [], // Level 1
        [], // Level 2
        [2], // Level 3
        [3], // Level 4
        [3, 2], // Level 5
        [3, 3], // Level 6
        [3, 3, 1], // Level 7
        [3, 3, 2], // Level 8
        [3, 3, 3, 1], // Level 9
        [3, 3, 3, 2], // Level 10
        [3, 3, 3, 2, 1], // Level 11
        [3, 3, 3, 2, 1], // Level 12
        [3, 3, 3, 2, 1, 1], // Level 13
        [3, 3, 3, 2, 1, 1], // Level 14
        [3, 3, 3, 2, 1, 1, 1], // Level 15
        [3, 3, 3, 2, 1, 1, 1], // Level 16
        [3, 3, 3, 2, 1, 1, 1], // Level 17
        [3, 3, 3, 2, 1, 1, 1], // Level 18
        [3, 3, 3, 2, 1, 1, 1], // Level 19
        [3, 3, 3, 2, 1, 1, 1] // Level 20
      ];
      
      if (level > 0 && level <= 20) {
        const levelSlots = halfCasterSlots[level - 1];
        levelSlots.forEach((slotCount, index) => {
          slots[index + 1] = slotCount;
        });
      }
    }
    
    return slots;
  };

  const spellSlots = getSpellSlots(character.level, character.class);
  const preparedSpells = spells.filter(spell => spell.prepared);
  
  // Get spell slots used from character data
  const spellSlotsUsed = character.spellSlotsUsed || {};
  
  const handleSpellSlotChange = async (level: number, used: number) => {
    const newSpellSlotsUsed = {
      ...spellSlotsUsed,
      [`level${level}`]: used
    };
    
    await updateSpellSlotsUsed({
      characterId,
      spellSlotsUsed: newSpellSlotsUsed
    });
  };

  const spellsByLevel = spells.reduce((acc, spell) => {
    if (!acc[spell.level]) acc[spell.level] = [];
    acc[spell.level].push(spell);
    return acc;
  }, {} as Record<number, typeof spells>);

  const schools = [
    "Abjuration", "Conjuration", "Divination", "Enchantment",
    "Evocation", "Illusion", "Necromancy", "Transmutation"
  ];

  return (
    <div className="space-y-4" onClick={handleClickOutside}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-100">Spells</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSpellSelection(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Browse Spells
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
          >
            Custom Spell
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded">
          <form onSubmit={(e) => void handleAddSpell(e)} className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Spell Name"
                value={newSpell.name}
                onChange={(e) => setNewSpell(prev => ({ ...prev, name: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                required
              />
              <select
                value={newSpell.level}
                onChange={(e) => setNewSpell(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
              >
                <option value={0}>Cantrip</option>
                {[1,2,3,4,5,6,7,8,9].map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
              <select
                value={newSpell.school}
                onChange={(e) => setNewSpell(prev => ({ ...prev, school: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                required
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Casting Time"
                value={newSpell.castingTime}
                onChange={(e) => setNewSpell(prev => ({ ...prev, castingTime: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                required
              />
              <input
                type="text"
                placeholder="Range"
                value={newSpell.range}
                onChange={(e) => setNewSpell(prev => ({ ...prev, range: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                required
              />
              <input
                type="text"
                placeholder="Components"
                value={newSpell.components}
                onChange={(e) => setNewSpell(prev => ({ ...prev, components: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                required
              />
              <input
                type="text"
                placeholder="Duration"
                value={newSpell.duration}
                onChange={(e) => setNewSpell(prev => ({ ...prev, duration: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                required
              />
            </div>
            <textarea
              placeholder="Description"
              value={newSpell.description}
              onChange={(e) => setNewSpell(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400 h-16"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                Add Spell
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showSpellSelection && (() => {
        try {
          return (
            <div className="bg-gray-800 border border-gray-700 p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-100">Select Spells for {character.class} Level {character.level}</h4>
                <button
                  onClick={() => setShowSpellSelection(false)}
                  className="px-2 py-0.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
              
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Search spells..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                />
              </div>
              
              {/* Spell Level Tabs */}
              <div className="mb-2">
                <div className="flex flex-wrap gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                    const levelSpells = availableSpells.filter(spell => spell && spell.level === level);
                    
                    if (levelSpells.length === 0) return null;
                    
                    return (
                      <button
                        key={level}
                        onClick={() => setSelectedSpellLevel(level)}
                        className={`px-2 py-0.5 rounded text-xs ${
                          selectedSpellLevel === level
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {level === 0 ? 'Cantrips' : `Level ${level}`}
                        <span className="ml-0.5 text-xs">({levelSpells.length})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
          
          <div className="max-h-96 overflow-y-auto">
            {(() => {
              try {
                const filteredSpells = visibleSpells
                  .filter(spell => spell.level === selectedSpellLevel);
                
                if (filteredSpells.length === 0) {
                  return (
                    <div className="text-center py-6 text-gray-400 text-xs">
                      {searchQuery.trim() 
                        ? `No spells found matching "${searchQuery}" at ${selectedSpellLevel === 0 ? 'Cantrip' : `Level ${selectedSpellLevel}`} level.`
                        : `No spells available at ${selectedSpellLevel === 0 ? 'Cantrip' : `Level ${selectedSpellLevel}`} level for ${character.class} Level ${character.level}.`
                      }
                    </div>
                  );
                }
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                    {filteredSpells
                      .slice(0, 50) // Limit to first 50 results for performance
                      .map((spell, index) => {
                  try {
                    const formattedSpell = formatSpellForDisplay(spell);
                    const hasConcentration = spell.duration && 
                      Array.isArray(spell.duration) &&
                      spell.duration.some((d: any) => d && d.type === 'timed' && d.concentration);
                    
                    // Detect saving throw type from spell entries
                    let spellText = '';
                    if (spell.entries && Array.isArray(spell.entries)) {
                      spellText = spell.entries
                        .map((entry: any) => typeof entry === 'string' ? entry : '')
                        .join(' ');
                    }
                    const saveMatch = spellText.match(/(\w+)\s+saving\s+throw/gi);
                    const saveType = saveMatch ? saveMatch[0].split(' ')[0].substring(0, 3).toUpperCase() : null;
                    const hasSave = saveType !== null;
                    
                    const hasAttack = spell.entries && Array.isArray(spell.entries) &&
                      spell.entries.some((entry: any) => 
                        typeof entry === 'string' && 
                        (entry.includes('spell attack') || entry.includes('attack roll'))
                      );
                    
                    // Detect area of effect from spell entries
                    const aoeMatch = spellText.match(/(\d+)-foot\s+(radius|sphere|cube|cone|line|cylinder)/gi);
                    const aoeType = aoeMatch ? aoeMatch[0] : null;
                    const hasAoE = aoeType !== null;
                  
                  return (
                    <div
                      key={`${spell.name}-${index}`}
                      className="group relative p-2 border border-gray-700 rounded hover:bg-gray-700 cursor-pointer transition-colors bg-gray-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTooltipClick(`selection-${spell.name}-${index}`, e);
                      }}
                    >
                      {/* Condensed line */}
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-xs truncate text-gray-200">{spell.name}</span>
                            <span className="text-xs text-gray-400">
                              {spell.level === 0 ? 'Cantrip' : `L${spell.level}`}
                            </span>
                            {hasConcentration && (
                              <span className="text-xs bg-yellow-900/50 text-yellow-300 px-0.5 rounded">C</span>
                            )}
                            {hasSave && (
                              <span className="text-xs bg-green-900/50 text-green-300 px-0.5 rounded">
                                {saveType}
                              </span>
                            )}
                            {hasAttack && (
                              <span className="text-xs bg-red-900/50 text-red-300 px-0.5 rounded">Attack</span>
                            )}
                            {hasAoE && (
                              <span className="text-xs bg-purple-900/50 text-purple-300 px-0.5 rounded" title={aoeType}>
                                AoE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                            <span>{formattedSpell.range}</span>
                            <span>•</span>
                            <span>{formattedSpell.castingTime}</span>
                            <span>•</span>
                            <span>{formattedSpell.duration}</span>
                          </div>
                        </div>
                        <button
                          className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleSelectSpell(spell);
                          }}
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Hover tooltip with full spell info */}
                      <div 
                        className={`absolute z-10 left-0 right-0 top-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded shadow-lg transition-opacity ${
                          lockedTooltip === `selection-${spell.name}-${index}` 
                            ? 'opacity-100 pointer-events-auto' 
                            : 'opacity-0 group-hover:opacity-100 pointer-events-none'
                        }`}
                        onClick={(e) => void handleTooltipClick(`selection-${spell.name}-${index}`, e)}
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="font-semibold text-xs text-gray-100">{spell.name}</h6>
                              <p className="text-xs text-gray-400">
                                {spell.school} • Level {spell.level === 0 ? 'Cantrip' : spell.level}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {spell.source} {spell.page && `p.${spell.page}`}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-300">
                            <div>
                              <span className="font-medium">Casting Time:</span> {formattedSpell.castingTime}
                            </div>
                            <div>
                              <span className="font-medium">Range:</span> {formattedSpell.range}
                            </div>
                            <div>
                              <span className="font-medium">Components:</span> {formattedSpell.components}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {formattedSpell.duration}
                            </div>
                          </div>
                          
                          {spell.entries && spell.entries.length > 0 && (
                            <div className="text-xs text-gray-400 whitespace-pre-wrap">
                              {spell.entries.map((entry, i) => (
                                <p key={i} className="mb-0.5">
                                  {typeof entry === 'string' ? entry : 'See description...'}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                  } catch (error) {
                    console.error(`Error rendering spell ${spell.name}:`, error);
                    return (
                      <div key={`${spell.name}-${index}-error`} className="p-2 border border-red-700 rounded bg-red-900/30">
                        <div className="text-xs font-semibold text-red-300">{spell.name}</div>
                        <div className="text-xs text-red-400">Error displaying spell details</div>
                      </div>
                    );
                  }
                  })}
                  </div>
                );
              } catch (error) {
                console.error('Error rendering spells:', error);
                return (
                  <div className="text-center py-6 text-red-400 text-xs">
                    Error loading spells. Please try again.
                  </div>
                );
              }
            })()}
          </div>
        </div>
          );
        } catch (error) {
          console.error('Error rendering spell selection:', error);
          return (
            <div className="bg-gray-800 border border-gray-700 p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-100">Select Spells</h4>
                <button
                  onClick={() => setShowSpellSelection(false)}
                  className="px-2 py-0.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
              <div className="text-center py-6 text-red-400 text-xs">
                Error loading spell browser. Please refresh the page and try again.
              </div>
            </div>
          );
        }
      })()}

      {/* Spell Slots Tracking */}
      {Object.keys(spellSlots).length > 0 && (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded">
          <h3 className="font-semibold text-gray-100 mb-2 text-sm">Spell Slots</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Object.entries(spellSlots)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([level, totalSlots]) => (
                <div key={level} className="text-center">
                  <div className="text-xs font-medium text-gray-300 mb-1">
                    Level {level}
                  </div>
                  <div className="flex justify-center space-x-0.5">
                    {Array.from({ length: totalSlots }, (_, i) => (
                      <input
                        key={i}
                        type="checkbox"
                        checked={(spellSlotsUsed[`level${level}`] || 0) > i}
                        onChange={() => {
                          const newUsed = spellSlotsUsed[`level${level}`] || 0;
                          if (newUsed > i) {
                            void handleSpellSlotChange(parseInt(level), i);
                          } else {
                            void handleSpellSlotChange(parseInt(level), i + 1);
                          }
                        }}
                        className="w-3 h-3 text-blue-600 rounded"
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {spellSlotsUsed[`level${level}`] || 0}/{totalSlots} used
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Prepared Spells */}
      {preparedSpells.length > 0 && (
        <div className="bg-blue-900/30 border border-blue-800 p-3 rounded">
          <h3 className="font-semibold text-gray-100 mb-2 text-sm">Prepared Spells</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {preparedSpells.map((spell) => {
              const hasConcentration = spell.duration && 
                spell.duration.toLowerCase().includes('concentration');
              
              // Detect saving throw type
              const saveMatch = spell.description && 
                spell.description.match(/(\w+)\s+saving\s+throw/gi);
              const saveType = saveMatch ? saveMatch[0].split(' ')[0].substring(0, 3).toUpperCase() : null;
              const hasSave = saveType !== null;
              
              const hasAttack = spell.description && 
                (spell.description.toLowerCase().includes('spell attack') || 
                 spell.description.toLowerCase().includes('attack roll'));
              
              // Detect area of effect
              const aoeMatch = spell.description && 
                spell.description.match(/(\d+)-foot\s+(radius|sphere|cube|cone|line|cylinder)/gi);
              const aoeType = aoeMatch ? aoeMatch[0] : null;
              const hasAoE = aoeType !== null;

              return (
                <div
                  key={spell._id}
                  className="group relative p-2 border border-blue-700 rounded hover:bg-blue-900/50 cursor-pointer transition-colors bg-blue-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleTooltipClick(spell._id, e);
                  }}
                >
                  {/* Condensed line */}
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-xs truncate text-gray-200">{spell.name}</span>
                        <span className="text-xs text-gray-400">
                          {spell.level === 0 ? 'C' : `L${spell.level}`}
                        </span>
                        {hasConcentration && (
                          <span className="text-xs bg-yellow-900/50 text-yellow-300 px-0.5 rounded">C</span>
                        )}
                        {hasSave && (
                          <span className="text-xs bg-green-900/50 text-green-300 px-0.5 rounded">
                            {saveType}
                          </span>
                        )}
                        {hasAttack && (
                          <span className="text-xs bg-red-900/50 text-red-300 px-0.5 rounded">A</span>
                        )}
                        {hasAoE && (
                          <span className="text-xs bg-purple-900/50 text-purple-300 px-0.5 rounded" title={aoeType}>
                            AoE
                          </span>
                        )}
                        <span className="text-xs bg-blue-900/50 text-blue-300 px-0.5 rounded">P</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-400 mt-0.5">
                        <span className="truncate">{spell.range}</span>
                        <span>•</span>
                        <span className="truncate">{spell.castingTime}</span>
                        <span>•</span>
                        <span className="truncate">{spell.duration}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void togglePrepared({ spellId: spell._id });
                        }}
                        className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Unprep
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void removeSpell({ spellId: spell._id });
                        }}
                        className="px-1.5 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Rem
                      </button>
                    </div>
                  </div>
                  
                  {/* Hover tooltip with full spell info */}
                  <div 
                    className={`absolute z-10 left-0 right-0 top-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded shadow-lg transition-opacity ${
                      lockedTooltip === spell._id 
                        ? 'opacity-100 pointer-events-auto' 
                        : 'opacity-0 group-hover:opacity-100 pointer-events-none'
                    }`}
                    onClick={(e) => void handleTooltipClick(spell._id, e)}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h6 className="font-semibold text-xs text-gray-100">{spell.name}</h6>
                          <p className="text-xs text-gray-400">
                            {spell.school} • Level {spell.level === 0 ? 'Cantrip' : spell.level}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-300">
                        <div className="space-y-0.5">
                          <div><strong>Casting Time:</strong> {spell.castingTime}</div>
                          <div><strong>Range:</strong> {spell.range}</div>
                          <div><strong>Components:</strong> {spell.components}</div>
                          <div><strong>Duration:</strong> {spell.duration}</div>
                        </div>
                        <div className="mt-1.5">
                          <div className="text-xs text-gray-400 whitespace-pre-wrap">
                            {spell.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spells Known */}
      <div>
        <h3 className="font-semibold text-gray-100 mb-2 text-sm">Spells Known</h3>
        {Object.keys(spellsByLevel).length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-xs">
            No spells added yet. Click "Browse Spells" or "Custom Spell" to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(spellsByLevel)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([level, levelSpells]) => (
                <div key={level}>
                  <h4 className="font-semibold text-gray-100 mb-2 text-xs">
                    {level === "0" ? "Cantrips" : `Level ${level} Spells`}
                  </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                  {levelSpells.map((spell) => {
                  const hasConcentration = spell.duration && 
                    spell.duration.toLowerCase().includes('concentration');
                  
                  // Detect saving throw type
                  const saveMatch = spell.description && 
                    spell.description.match(/(\w+)\s+saving\s+throw/gi);
                  const saveType = saveMatch ? saveMatch[0].split(' ')[0].substring(0, 3).toUpperCase() : null;
                  const hasSave = saveType !== null;
                  
                  const hasAttack = spell.description && 
                    (spell.description.toLowerCase().includes('spell attack') || 
                     spell.description.toLowerCase().includes('attack roll'));
                  
                  // Detect area of effect
                  const aoeMatch = spell.description && 
                    spell.description.match(/(\d+)-foot\s+(radius|sphere|cube|cone|line|cylinder)/gi);
                  const aoeType = aoeMatch ? aoeMatch[0] : null;
                  const hasAoE = aoeType !== null;
                    
                    return (
                      <div
                        key={spell._id}
                        className={`group relative p-2 border rounded hover:bg-gray-700 cursor-pointer transition-colors ${
                          spell.prepared ? "bg-blue-900/30 border-blue-700" : "bg-gray-800 border-gray-700"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTooltipClick(spell._id, e);
                        }}
                      >
                        {/* Condensed line */}
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-xs truncate text-gray-200">{spell.name}</span>
                              <span className="text-xs text-gray-400">
                                {spell.level === 0 ? 'Cantrip' : `L${spell.level}`}
                              </span>
                              {hasConcentration && (
                                <span className="text-xs bg-yellow-900/50 text-yellow-300 px-0.5 rounded">C</span>
                              )}
                              {hasSave && (
                                <span className="text-xs bg-green-900/50 text-green-300 px-0.5 rounded">
                                  {saveType}
                                </span>
                              )}
                              {hasAttack && (
                                <span className="text-xs bg-red-900/50 text-red-300 px-0.5 rounded">Attack</span>
                              )}
                              {hasAoE && (
                                <span className="text-xs bg-purple-900/50 text-purple-300 px-0.5 rounded" title={aoeType}>
                                  AoE
                                </span>
                              )}
                              {spell.prepared && (
                                <span className="text-xs bg-blue-900/50 text-blue-300 px-0.5 rounded">Prepared</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                              <span>{spell.range}</span>
                              <span>•</span>
                              <span>{spell.castingTime}</span>
                              <span>•</span>
                              <span>{spell.duration}</span>
                            </div>
                          </div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void togglePrepared({ spellId: spell._id });
                              }}
                              className={`px-1.5 py-0.5 text-xs rounded ${
                                spell.prepared
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              }`}
                            >
                              {spell.prepared ? "Prepared" : "Prepare"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void removeSpell({ spellId: spell._id });
                              }}
                              className="px-1.5 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        {/* Hover tooltip with full spell info */}
                        <div 
                          className={`absolute z-10 left-0 right-0 top-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded shadow-lg transition-opacity ${
                            lockedTooltip === spell._id 
                              ? 'opacity-100 pointer-events-auto' 
                              : 'opacity-0 group-hover:opacity-100 pointer-events-none'
                          }`}
                          onClick={(e) => void handleTooltipClick(spell._id, e)}
                        >
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <div>
                                <h6 className="font-semibold text-xs text-gray-100">{spell.name}</h6>
                                <p className="text-xs text-gray-400">
                                  {spell.school} • Level {spell.level === 0 ? 'Cantrip' : spell.level}
                                </p>
                              </div>
                              {spell.source && (
                                <span className="text-xs text-gray-500">
                                  {spell.source}
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-300">
                              <div>
                                <span className="font-medium">Casting Time:</span> {spell.castingTime}
                              </div>
                              <div>
                                <span className="font-medium">Range:</span> {spell.range}
                              </div>
                              <div>
                                <span className="font-medium">Components:</span> {spell.components}
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span> {spell.duration}
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-400 whitespace-pre-wrap">
                              <p>{spell.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
