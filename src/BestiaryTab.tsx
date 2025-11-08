import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { formatMonsterForDisplay, MonsterData } from "./bestiaryData";

interface BestiaryTabProps {
  characterId: Id<"characters">;
}

export function BestiaryTab({ characterId }: BestiaryTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBestiaryBrowser, setShowBestiaryBrowser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const bestiaryEntries = useQuery(api.bestiary.list, { characterId }) || [];
  const addBestiaryEntry = useMutation(api.bestiary.add);
  const removeBestiaryEntry = useMutation(api.bestiary.remove);
  
  // Query bestiary reference data from Convex
  const bestiaryCount = useQuery(api.bestiaryReference.count);
  const bestiaryDebug = useQuery(api.bestiaryReference.getAll);
  const searchedMonsters = useQuery(
    api.bestiaryReference.search,
    searchQuery.trim().length >= 2 && showBestiaryBrowser
      ? { query: searchQuery, limit: 50 }
      : "skip"
  ) || [];

  const [newMonster, setNewMonster] = useState({
    name: "",
    source: "",
    size: "",
    type: "",
    alignment: "",
    armorClass: 0,
    hitPoints: 0,
    hitPointsFormula: "",
    speed: "",
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    skills: "",
    passivePerception: 10,
    languages: "",
    challengeRating: "",
    description: "",
  });

  const handleAddMonster = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBestiaryEntry({ characterId, ...newMonster });
    setNewMonster({
      name: "",
      source: "",
      size: "",
      type: "",
      alignment: "",
      armorClass: 0,
      hitPoints: 0,
      hitPointsFormula: "",
      speed: "",
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      skills: "",
      passivePerception: 10,
      languages: "",
      challengeRating: "",
      description: "",
    });
    setShowAddForm(false);
  };

  const handleSelectMonster = async (monster: MonsterData) => {
    const formattedMonster = formatMonsterForDisplay(monster);
    await addBestiaryEntry({ characterId, ...formattedMonster });
    setShowBestiaryBrowser(false);
    setSearchQuery("");
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-100">Bestiary</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowBestiaryBrowser(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Browse Bestiary
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
          >
            Custom Statblock
          </button>
        </div>
      </div>

      {/* Add Custom Monster Form */}
      {showAddForm && (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded">
          <h4 className="font-semibold mb-2 text-gray-100 text-sm">Add Custom Statblock</h4>
          <form onSubmit={(e) => void handleAddMonster(e)} className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Monster Name"
                value={newMonster.name}
                onChange={(e) => setNewMonster(prev => ({ ...prev, name: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                required
              />
              <input
                type="text"
                placeholder="Source"
                value={newMonster.source}
                onChange={(e) => setNewMonster(prev => ({ ...prev, source: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Size"
                value={newMonster.size}
                onChange={(e) => setNewMonster(prev => ({ ...prev, size: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Type"
                value={newMonster.type}
                onChange={(e) => setNewMonster(prev => ({ ...prev, type: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Alignment"
                value={newMonster.alignment}
                onChange={(e) => setNewMonster(prev => ({ ...prev, alignment: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              />
              <input
                type="number"
                placeholder="Armor Class"
                value={newMonster.armorClass}
                onChange={(e) => setNewMonster(prev => ({ ...prev, armorClass: parseInt(e.target.value) || 0 }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                required
              />
              <input
                type="number"
                placeholder="Hit Points"
                value={newMonster.hitPoints}
                onChange={(e) => setNewMonster(prev => ({ ...prev, hitPoints: parseInt(e.target.value) || 0 }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                required
              />
              <input
                type="text"
                placeholder="HP Formula (e.g., 3d8)"
                value={newMonster.hitPointsFormula}
                onChange={(e) => setNewMonster(prev => ({ ...prev, hitPointsFormula: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Speed"
                value={newMonster.speed}
                onChange={(e) => setNewMonster(prev => ({ ...prev, speed: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Challenge Rating"
                value={newMonster.challengeRating}
                onChange={(e) => setNewMonster(prev => ({ ...prev, challengeRating: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-0.5">STR</label>
                <input
                  type="number"
                  value={newMonster.strength}
                  onChange={(e) => setNewMonster(prev => ({ ...prev, strength: parseInt(e.target.value) || 10 }))}
                  className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-0.5">DEX</label>
                <input
                  type="number"
                  value={newMonster.dexterity}
                  onChange={(e) => setNewMonster(prev => ({ ...prev, dexterity: parseInt(e.target.value) || 10 }))}
                  className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-0.5">CON</label>
                <input
                  type="number"
                  value={newMonster.constitution}
                  onChange={(e) => setNewMonster(prev => ({ ...prev, constitution: parseInt(e.target.value) || 10 }))}
                  className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-0.5">INT</label>
                <input
                  type="number"
                  value={newMonster.intelligence}
                  onChange={(e) => setNewMonster(prev => ({ ...prev, intelligence: parseInt(e.target.value) || 10 }))}
                  className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-0.5">WIS</label>
                <input
                  type="number"
                  value={newMonster.wisdom}
                  onChange={(e) => setNewMonster(prev => ({ ...prev, wisdom: parseInt(e.target.value) || 10 }))}
                  className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-0.5">CHA</label>
                <input
                  type="number"
                  value={newMonster.charisma}
                  onChange={(e) => setNewMonster(prev => ({ ...prev, charisma: parseInt(e.target.value) || 10 }))}
                  className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Skills"
                value={newMonster.skills}
                onChange={(e) => setNewMonster(prev => ({ ...prev, skills: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              />
              <input
                type="number"
                placeholder="Passive Perception"
                value={newMonster.passivePerception}
                onChange={(e) => setNewMonster(prev => ({ ...prev, passivePerception: parseInt(e.target.value) || 10 }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Languages"
                value={newMonster.languages}
                onChange={(e) => setNewMonster(prev => ({ ...prev, languages: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              />
            </div>
            <textarea
              placeholder="Description (Traits, Actions, etc.)"
              value={newMonster.description}
              onChange={(e) => setNewMonster(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400 h-24"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                Add Statblock
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

      {/* Bestiary Browser */}
      {showBestiaryBrowser && (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-gray-100">Browse Bestiary</h4>
            <button
              onClick={() => {
                setShowBestiaryBrowser(false);
                setSearchQuery("");
              }}
              className="px-2 py-0.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
            >
              Close
            </button>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search monsters... (type to search)"
            className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400 mb-2"
          />
          <div className="max-h-96 overflow-y-auto space-y-1">
            {bestiaryCount === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4 space-y-2">
                <p className="font-semibold text-yellow-400">Bestiary data not loaded yet.</p>
                <p>To load the data:</p>
                <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                  <li>Open your Convex Dashboard</li>
                  <li>Go to Functions → bestiaryReference:loadMonsters</li>
                  <li>Run it with: <code className="bg-gray-700 px-1 rounded">{"{ \"monsters\": [/* monster array from JSON */] }"}</code></li>
                  <li>Make sure you're passing the <code className="bg-gray-700 px-1 rounded">monster</code> array, not the whole JSON object</li>
                </ol>
                {bestiaryDebug && (
                  <div className="mt-2 text-yellow-400">
                    Debug: Count = {bestiaryDebug.count}, Sample: {bestiaryDebug.sample.map(m => m.name).join(', ')}
                  </div>
                )}
              </div>
            ) : !searchQuery.trim() ? (
              <p className="text-xs text-gray-400 text-center py-4">Enter a search term to browse monsters (minimum 2 characters)</p>
            ) : searchQuery.trim().length < 2 ? (
              <p className="text-xs text-gray-400 text-center py-4">Please enter at least 2 characters to search</p>
            ) : searchedMonsters.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No monsters found matching "{searchQuery}"</p>
            ) : (
              searchedMonsters.map((monster, index) => (
                <div
                  key={index}
                  className="bg-gray-700 border border-gray-600 rounded p-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() => void handleSelectMonster(monster)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-100 text-xs">{monster.name}</div>
                      <div className="text-xs text-gray-400">
                        {monster.type || ''} • 
                        CR {monster.challengeRating || '—'} • 
                        {monster.size || ''}
                      </div>
                    </div>
                    <button className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      Add
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Bestiary Entries List */}
      {bestiaryEntries.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-xs">
          No statblocks added yet. Click "Browse Bestiary" or "Custom Statblock" to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {bestiaryEntries.map((entry) => (
            <BestiaryCard
              key={entry._id}
              entry={entry}
              onRemove={() => void removeBestiaryEntry({ bestiaryId: entry._id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BestiaryCardProps {
  entry: {
    _id: Id<"bestiary">;
    name: string;
    source?: string;
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
  };
  onRemove: () => void;
}

function BestiaryCard({ entry, onRemove }: BestiaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getModifier = (score: number) => Math.floor((score - 10) / 2);
  const formatModifier = (modifier: number) => modifier >= 0 ? `+${modifier}` : `${modifier}`;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded p-2">
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex-1">
          <h5 className="font-semibold text-gray-100 text-xs mb-0.5">{entry.name}</h5>
          <div className="text-xs text-gray-400 space-x-1">
            {entry.size && <span>{entry.size}</span>}
            {entry.type && <span>• {entry.type}</span>}
            {entry.alignment && <span>• {entry.alignment}</span>}
            {entry.challengeRating && <span>• CR {entry.challengeRating}</span>}
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 text-xs"
        >
          Remove
        </button>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="grid grid-cols-2 gap-1 text-gray-300">
          <div><strong>AC:</strong> {entry.armorClass}</div>
          <div><strong>HP:</strong> {entry.hitPoints}{entry.hitPointsFormula && ` (${entry.hitPointsFormula})`}</div>
          {entry.speed && <div><strong>Speed:</strong> {entry.speed}</div>}
          <div><strong>PP:</strong> {entry.passivePerception}</div>
        </div>
        
        <div className="grid grid-cols-6 gap-0.5 text-gray-300 text-center">
          <div>
            <div className="font-semibold">STR</div>
            <div>{entry.strength} ({formatModifier(getModifier(entry.strength))})</div>
          </div>
          <div>
            <div className="font-semibold">DEX</div>
            <div>{entry.dexterity} ({formatModifier(getModifier(entry.dexterity))})</div>
          </div>
          <div>
            <div className="font-semibold">CON</div>
            <div>{entry.constitution} ({formatModifier(getModifier(entry.constitution))})</div>
          </div>
          <div>
            <div className="font-semibold">INT</div>
            <div>{entry.intelligence} ({formatModifier(getModifier(entry.intelligence))})</div>
          </div>
          <div>
            <div className="font-semibold">WIS</div>
            <div>{entry.wisdom} ({formatModifier(getModifier(entry.wisdom))})</div>
          </div>
          <div>
            <div className="font-semibold">CHA</div>
            <div>{entry.charisma} ({formatModifier(getModifier(entry.charisma))})</div>
          </div>
        </div>
        
        {entry.skills && (
          <div className="text-gray-400"><strong>Skills:</strong> {entry.skills}</div>
        )}
        {entry.languages && (
          <div className="text-gray-400"><strong>Languages:</strong> {entry.languages}</div>
        )}
      </div>
      
      {entry.description && (
        <div className="mt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-400 hover:text-blue-300 mb-1"
          >
            {isExpanded ? "Hide" : "Show"} Description
          </button>
          {isExpanded && (
            <div className="text-xs text-gray-400 whitespace-pre-wrap bg-gray-700 p-2 rounded mt-1">
              {entry.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

