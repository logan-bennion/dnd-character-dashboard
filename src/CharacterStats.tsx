import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface Character {
  _id: Id<"characters">;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  armorClass: number;
  hitPoints: number;
  maxHitPoints: number;
  temporaryHitPoints?: number;
  speed: number;
  proficiencyBonus: number;
  hitDice: string;
  experiencePoints: number;
  savingThrowProficiencies: string[];
  skillProficiencies: string[];
  skillExpertise?: string[];
}

interface CharacterStatsProps {
  character: Character;
}

const SKILLS = [
  { name: "Acrobatics", ability: "dexterity" },
  { name: "Animal Handling", ability: "wisdom" },
  { name: "Arcana", ability: "intelligence" },
  { name: "Athletics", ability: "strength" },
  { name: "Deception", ability: "charisma" },
  { name: "History", ability: "intelligence" },
  { name: "Insight", ability: "wisdom" },
  { name: "Intimidation", ability: "charisma" },
  { name: "Investigation", ability: "intelligence" },
  { name: "Medicine", ability: "wisdom" },
  { name: "Nature", ability: "intelligence" },
  { name: "Perception", ability: "wisdom" },
  { name: "Performance", ability: "charisma" },
  { name: "Persuasion", ability: "charisma" },
  { name: "Religion", ability: "intelligence" },
  { name: "Sleight of Hand", ability: "dexterity" },
  { name: "Stealth", ability: "dexterity" },
  { name: "Survival", ability: "wisdom" },
];

export function CharacterStats({ character }: CharacterStatsProps) {
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [editingAbilities, setEditingAbilities] = useState(false);
  const [editingCombatStats, setEditingCombatStats] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  
  const [tempHp, setTempHp] = useState(character.hitPoints);
  const [tempTempHp, setTempTempHp] = useState(character.temporaryHitPoints || 0);
  const [tempBasicInfo, setTempBasicInfo] = useState({
    name: character.name,
    race: character.race,
    class: character.class,
    background: character.background,
    alignment: character.alignment,
  });
  const [tempAbilities, setTempAbilities] = useState({
    strength: character.strength,
    dexterity: character.dexterity,
    constitution: character.constitution,
    intelligence: character.intelligence,
    wisdom: character.wisdom,
    charisma: character.charisma,
  });
  const [tempCombatStats, setTempCombatStats] = useState({
    armorClass: character.armorClass,
    maxHitPoints: character.maxHitPoints,
    speed: character.speed,
    hitDice: character.hitDice,
  });
  const [tempSkills, setTempSkills] = useState(character.skillProficiencies);
  const [tempSaves, setTempSaves] = useState(character.savingThrowProficiencies);
  const [tempExpertise, setTempExpertise] = useState(character.skillExpertise || []);

  const updateStats = useMutation(api.characters.updateStats);
  const updateBasicInfo = useMutation(api.characters.updateBasicInfo);
  const updateSkillProficiencies = useMutation(api.characters.updateSkillProficiencies);
  const updateSavingThrows = useMutation(api.characters.updateSavingThrows);
  const levelUp = useMutation(api.characters.levelUp);

  const getModifier = (score: number) => Math.floor((score - 10) / 2);
  const formatModifier = (modifier: number) => modifier >= 0 ? `+${modifier}` : `${modifier}`;

  // Sync temp states when character data changes
  useEffect(() => {
    setTempHp(character.hitPoints);
    setTempTempHp(character.temporaryHitPoints || 0);
    setTempBasicInfo({
      name: character.name,
      race: character.race,
      class: character.class,
      background: character.background,
      alignment: character.alignment,
    });
    setTempAbilities({
      strength: character.strength,
      dexterity: character.dexterity,
      constitution: character.constitution,
      intelligence: character.intelligence,
      wisdom: character.wisdom,
      charisma: character.charisma,
    });
    setTempCombatStats({
      armorClass: character.armorClass,
      maxHitPoints: character.maxHitPoints,
      speed: character.speed,
      hitDice: character.hitDice,
    });
    setTempSkills(character.skillProficiencies);
    setTempSaves(character.savingThrowProficiencies);
    setTempExpertise(character.skillExpertise || []);
  }, [character]);

  const handleHpChange = async () => {
    await updateStats({
      characterId: character._id,
      hitPoints: tempHp,
      temporaryHitPoints: tempTempHp,
    });
  };


  const handleBasicInfoSave = async () => {
    await updateBasicInfo({
      characterId: character._id,
      ...tempBasicInfo,
    });
    setEditingBasicInfo(false);
  };

  const handleAbilitiesSave = async () => {
    await updateStats({
      characterId: character._id,
      ...tempAbilities,
    });
    await updateSavingThrows({
      characterId: character._id,
      savingThrowProficiencies: tempSaves,
    });
    setEditingAbilities(false);
  };

  const handleCombatStatsSave = async () => {
    await updateStats({
      characterId: character._id,
      ...tempCombatStats,
    });
    setEditingCombatStats(false);
  };

  const handleSkillsSave = async () => {
    await updateSkillProficiencies({
      characterId: character._id,
      skillProficiencies: tempSkills,
    });
    await updateStats({
      characterId: character._id,
      skillExpertise: tempExpertise,
    });
  };


  const handleLevelUp = async () => {
    if (confirm(`Level up ${character.name} to level ${character.level + 1}?`)) {
      await levelUp({ characterId: character._id });
    }
  };

  const toggleSkillProficiency = (skillName: string) => {
    setTempSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  const toggleSaveProficiency = (ability: string) => {
    setTempSaves(prev => 
      prev.includes(ability) 
        ? prev.filter(s => s !== ability)
        : [...prev, ability]
    );
  };

  const toggleSkillExpertise = (skillName: string) => {
    setTempExpertise(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  const abilities = [
    { name: "Strength", key: "strength", value: character.strength },
    { name: "Dexterity", key: "dexterity", value: character.dexterity },
    { name: "Constitution", key: "constitution", value: character.constitution },
    { name: "Intelligence", key: "intelligence", value: character.intelligence },
    { name: "Wisdom", key: "wisdom", value: character.wisdom },
    { name: "Charisma", key: "charisma", value: character.charisma },
  ];

  return (
    <div className="space-y-4 bg-gray-900 min-h-screen p-3">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gray-800 border border-gray-700 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-semibold text-gray-100 text-sm">Basic Information</h3>
            <button
              onClick={() => setEditingBasicInfo(!editingBasicInfo)}
              className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700"
            >
              {editingBasicInfo ? "Cancel" : "Edit"}
            </button>
          </div>
          {editingBasicInfo ? (
            <div className="space-y-1.5">
              <input
                type="text"
                value={tempBasicInfo.name}
                onChange={(e) => setTempBasicInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                placeholder="Name"
              />
              <input
                type="text"
                value={tempBasicInfo.race}
                onChange={(e) => setTempBasicInfo(prev => ({ ...prev, race: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                placeholder="Race"
              />
              <input
                type="text"
                value={tempBasicInfo.class}
                onChange={(e) => setTempBasicInfo(prev => ({ ...prev, class: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                placeholder="Class"
              />
              <input
                type="text"
                value={tempBasicInfo.background}
                onChange={(e) => setTempBasicInfo(prev => ({ ...prev, background: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                placeholder="Background"
              />
              <input
                type="text"
                value={tempBasicInfo.alignment}
                onChange={(e) => setTempBasicInfo(prev => ({ ...prev, alignment: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                placeholder="Alignment"
              />
              <button
                onClick={() => void handleBasicInfoSave()}
                className="w-full px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="space-y-0.5 text-xs">
              <div className="text-gray-300"><span className="font-medium text-gray-200">Race:</span> {character.race}</div>
              <div className="text-gray-300"><span className="font-medium text-gray-200">Class:</span> {character.class}</div>
              <div className="text-gray-300"><span className="font-medium text-gray-200">Background:</span> {character.background}</div>
              <div className="text-gray-300"><span className="font-medium text-gray-200">Alignment:</span> {character.alignment}</div>
            </div>
          )}
        </div>

        <div className="bg-gray-800 border border-gray-700 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-semibold text-gray-100 text-sm">Level & Experience</h3>
            <button
              onClick={() => void handleLevelUp()}
              className="text-xs bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700"
            >
              Level Up
            </button>
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="text-gray-300"><span className="font-medium text-gray-200">Level:</span> {character.level}</div>
            <div className="text-gray-300"><span className="font-medium text-gray-200">XP:</span> {character.experiencePoints}</div>
            <div className="text-gray-300"><span className="font-medium text-gray-200">Proficiency:</span> +{character.proficiencyBonus}</div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-semibold text-gray-100 text-sm">Combat Stats</h3>
            <button
              onClick={() => setEditingCombatStats(!editingCombatStats)}
              className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700"
            >
              {editingCombatStats ? "Cancel" : "Edit"}
            </button>
          </div>
          {editingCombatStats ? (
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-300">AC:</span>
                <input
                  type="number"
                  value={tempCombatStats.armorClass}
                  onChange={(e) => setTempCombatStats(prev => ({ ...prev, armorClass: parseInt(e.target.value) || 10 }))}
                  className="w-14 px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-300">Max HP:</span>
                <input
                  type="number"
                  value={tempCombatStats.maxHitPoints}
                  onChange={(e) => setTempCombatStats(prev => ({ ...prev, maxHitPoints: parseInt(e.target.value) || 1 }))}
                  className="w-14 px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-300">Speed:</span>
                <input
                  type="number"
                  value={tempCombatStats.speed}
                  onChange={(e) => setTempCombatStats(prev => ({ ...prev, speed: parseInt(e.target.value) || 30 }))}
                  className="w-14 px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-300">Hit Dice:</span>
                <input
                  type="text"
                  value={tempCombatStats.hitDice}
                  onChange={(e) => setTempCombatStats(prev => ({ ...prev, hitDice: e.target.value }))}
                  className="w-16 px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                  placeholder="1d8"
                />
              </div>
              <button
                onClick={() => void handleCombatStatsSave()}
                className="w-full px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="space-y-0.5 text-xs">
              <div className="text-gray-300"><span className="font-medium text-gray-200">AC:</span> {character.armorClass}</div>
              <div className="text-gray-300"><span className="font-medium text-gray-200">Speed:</span> {character.speed} ft</div>
              <div className="text-gray-300"><span className="font-medium text-gray-200">Hit Dice:</span> {character.hitDice}</div>
            </div>
          )}
        </div>
      </div>

      {/* Hit Points */}
      <div className="bg-gray-800 border border-red-800 p-2 rounded">
        <h3 className="font-semibold text-gray-100 text-sm mb-1">Hit Points</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <input
              type="number"
              value={tempHp}
              onChange={(e) => setTempHp(parseInt(e.target.value) || 0)}
              className="w-16 px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 text-gray-100 text-center text-sm"
              min="0"
              max={character.maxHitPoints}
            />
            <span className="text-gray-400">/</span>
            <span className="text-lg font-bold text-red-400">
              {character.maxHitPoints}
            </span>
            {tempTempHp > 0 && (
              <>
                <span className="text-gray-500 mx-0.5">+</span>
                <span className="text-sm font-semibold text-blue-400">
                  {tempTempHp} temp
                </span>
              </>
            )}
            <button
              onClick={() => void handleHpChange()}
              className="px-2 py-0.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>
        <div className="mt-1.5 flex items-center space-x-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all"
              style={{
                width: `${Math.max(0, (tempHp / character.maxHitPoints) * 100)}%`,
              }}
            />
          </div>
          <div className="flex items-center space-x-1">
            <label className="text-xs text-gray-400">Temp HP:</label>
            <input
              type="number"
              value={tempTempHp}
              onChange={(e) => setTempTempHp(parseInt(e.target.value) || 0)}
              className="w-12 px-1 py-0.5 border border-gray-600 rounded bg-gray-700 text-gray-100 text-center text-xs"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Ability Scores */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-100 text-sm">Ability Scores</h3>
          <button
            onClick={() => setEditingAbilities(!editingAbilities)}
            className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700"
          >
            {editingAbilities ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {abilities.map((ability) => {
            const isProficient = tempSaves.includes(ability.key);
            const modifier = getModifier(ability.value);
            const saveBonus = modifier + (isProficient ? character.proficiencyBonus : 0);
            
            return (
              <div key={ability.key} className="bg-gray-800 border border-gray-700 p-2 rounded text-center">
                <div className="font-medium text-gray-200 text-xs mb-0.5">
                  {ability.name}
                </div>
                {editingAbilities ? (
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-gray-100">
                      {formatModifier(getModifier(tempAbilities[ability.key as keyof typeof tempAbilities]))}
                    </div>
                    <input
                      type="number"
                      value={tempAbilities[ability.key as keyof typeof tempAbilities]}
                      onChange={(e) => setTempAbilities(prev => ({ 
                        ...prev, 
                        [ability.key]: parseInt(e.target.value) || 10 
                      }))}
                      className="w-14 px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 text-gray-100 text-center text-xs"
                      min="1"
                      max="30"
                    />
                    <div className="flex items-center justify-center space-x-1">
                      <input
                        type="checkbox"
                        checked={isProficient}
                        onChange={() => toggleSaveProficiency(ability.key)}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-400">
                        Save: {formatModifier(saveBonus)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-lg font-bold text-gray-100">
                      {formatModifier(getModifier(ability.value))}
                    </div>
                    <div className="text-xs text-gray-400">
                      {ability.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      Save: {formatModifier(saveBonus)}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {editingAbilities && (
          <div className="mt-2 text-center">
            <button
              onClick={() => void handleAbilitiesSave()}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              Save Abilities
            </button>
          </div>
        )}
      </div>


      {/* Skills */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-100 text-sm">Skills</h3>
          <button
            onClick={() => void handleSkillsSave()}
            className="text-xs bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700"
          >
            Save Skills
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {SKILLS.map((skill) => {
            const abilityScore = character[skill.ability as keyof Character] as number;
            const modifier = getModifier(abilityScore);
            const isProficient = tempSkills.includes(skill.name);
            const isExpert = tempExpertise.includes(skill.name);
            const proficiencyBonus = isExpert ? character.proficiencyBonus * 2 : (isProficient ? character.proficiencyBonus : 0);
            const total = modifier + proficiencyBonus;
            
            return (
              <div key={skill.name} className="flex justify-between items-center p-1.5 bg-gray-800 border border-gray-700 rounded">
                <div className="flex items-center space-x-1.5">
                  <input
                    type="checkbox"
                    checked={isProficient}
                    onChange={() => toggleSkillProficiency(skill.name)}
                    className="rounded"
                  />
                  <input
                    type="checkbox"
                    checked={isExpert}
                    onChange={() => toggleSkillExpertise(skill.name)}
                    className="rounded"
                    title="Expertise (double proficiency bonus)"
                  />
                  <span className={`text-xs ${isProficient ? 'font-semibold text-gray-200' : 'text-gray-400'} ${isExpert ? 'text-blue-400' : ''}`}>
                    {skill.name} ({skill.ability.slice(0, 3).toUpperCase()})
                    {isExpert && <span className="text-xs text-blue-400 ml-1">★</span>}
                  </span>
                </div>
                <span className="font-mono text-xs text-gray-300">
                  {formatModifier(total)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
