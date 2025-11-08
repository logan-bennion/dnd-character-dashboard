import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface CreateCharacterFormProps {
  onCancel: () => void;
  onSuccess: (characterId: Id<"characters">) => void;
}

const RACES = [
  "Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Elf", 
  "Half-Orc", "Tiefling", "Aasimar", "Genasi", "Goliath", "Tabaxi"
];

const CLASSES = [
  "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin",
  "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard", "Artificer"
];

const BACKGROUNDS = [
  "Acolyte", "Criminal", "Folk Hero", "Noble", "Sage", "Soldier", "Charlatan",
  "Entertainer", "Guild Artisan", "Hermit", "Outlander", "Sailor"
];

const ALIGNMENTS = [
  "Lawful Good", "Neutral Good", "Chaotic Good",
  "Lawful Neutral", "True Neutral", "Chaotic Neutral",
  "Lawful Evil", "Neutral Evil", "Chaotic Evil"
];

export function CreateCharacterForm({ onCancel, onSuccess }: CreateCharacterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    race: "",
    class: "",
    background: "",
    alignment: "",
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  const createCharacter = useMutation(api.characters.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.race || !formData.class || !formData.background || !formData.alignment) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const characterId = await createCharacter({
        ...formData,
        level: 1,
      });
      onSuccess(characterId);
    } catch (error) {
      console.error("Failed to create character:", error);
      alert("Failed to create character. Please try again.");
    }
  };

  const rollStats = () => {
    const rollStat = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    setFormData(prev => ({
      ...prev,
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    }));
  };

  const getModifier = (score: number) => Math.floor((score - 10) / 2);

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 rounded p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-100">Create New Character</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-300 text-xs"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Character Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Race *
            </label>
            <select
              value={formData.race}
              onChange={(e) => setFormData(prev => ({ ...prev, race: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Race</option>
              {RACES.map(race => (
                <option key={race} value={race}>{race}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Class *
            </label>
            <select
              value={formData.class}
              onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Class</option>
              {CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Background *
            </label>
            <select
              value={formData.background}
              onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Background</option>
              {BACKGROUNDS.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Alignment *
            </label>
            <select
              value={formData.alignment}
              onChange={(e) => setFormData(prev => ({ ...prev, alignment: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Alignment</option>
              {ALIGNMENTS.map(alignment => (
                <option key={alignment} value={alignment}>{alignment}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-200">Ability Scores</h3>
            <button
              type="button"
              onClick={rollStats}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
            >
              Roll 4d6 (Drop Lowest)
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { key: 'strength', label: 'Strength' },
              { key: 'dexterity', label: 'Dexterity' },
              { key: 'constitution', label: 'Constitution' },
              { key: 'intelligence', label: 'Intelligence' },
              { key: 'wisdom', label: 'Wisdom' },
              { key: 'charisma', label: 'Charisma' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-300 mb-0.5">
                  {label}
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min="3"
                    max="18"
                    value={formData[key as keyof typeof formData] as number}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      [key]: parseInt(e.target.value) || 10 
                    }))}
                    className="w-14 px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 text-gray-100 text-center text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-400">
                    ({getModifier(formData[key as keyof typeof formData] as number) >= 0 ? '+' : ''}
                    {getModifier(formData[key as keyof typeof formData] as number)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 border border-gray-600 text-gray-300 rounded text-xs hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
          >
            Create Character
          </button>
        </div>
      </form>
    </div>
  );
}
