import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { generateNPC, generateMultipleNPCs } from "./lib/npcGenerator";
import { toast } from "sonner";

interface GeneratedNPC {
  name: string;
  race: string;
  gender: string;
  occupation: string;
  description: string;
}

export function NPCGenerator() {
  const [generatedNPCs, setGeneratedNPCs] = useState<GeneratedNPC[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [constraints, setConstraints] = useState({
    race: "",
    occupation: "",
    gender: "",
    nameCulture: "",
  });

  const createNPC = useMutation(api.npcs.createNPC);
  const npcs = useQuery(api.npcs.getUserNPCs);

  const handleGenerate = async (count: number = 1) => {
    setIsGenerating(true);
    try {
      const options: any = {};
      if (constraints.race) options.race = constraints.race;
      if (constraints.occupation) options.occupation = constraints.occupation;
      if (constraints.gender) options.gender = constraints.gender;
      if (constraints.nameCulture) options.nameCulture = constraints.nameCulture;

      const newNPCs = generateMultipleNPCs(count, options);
      setGeneratedNPCs(newNPCs);
      toast.success(`Generated ${count} NPC${count > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error("Failed to generate NPCs");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNPC = async (npc: GeneratedNPC, customName?: string) => {
    try {
      const name = customName || npc.name;
      
      await createNPC({
        name,
        race: npc.race,
        occupation: npc.occupation,
        description: npc.description,
        generatedData: {
          race: npc.race,
          occupation: npc.occupation,
          description: npc.description,
        },
      });
      
      toast.success("NPC saved successfully");
    } catch (error) {
      toast.error("Failed to save NPC");
      console.error(error);
    }
  };

  const clearConstraints = () => {
    setConstraints({
      race: "",
      occupation: "",
      gender: "",
      nameCulture: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 border border-gray-700 rounded p-3">
        <h2 className="text-lg font-bold text-gray-100 mb-3">NPC Generator</h2>
        
        {/* Constraints */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-0.5">
              Race
            </label>
            <select
              value={constraints.race}
              onChange={(e) => setConstraints(prev => ({ ...prev, race: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="human">Human</option>
              <option value="dwarf">Dwarf</option>
              <option value="elf">Elf</option>
              <option value="halfling">Halfling</option>
              <option value="gnome">Gnome</option>
              <option value="half-elf">Half-Elf</option>
              <option value="half-orc">Half-Orc</option>
              <option value="tiefling">Tiefling</option>
              <option value="dragonborn">Dragonborn</option>
              <option value="goblin">Goblin</option>
              <option value="orc">Orc</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-0.5">
              Occupation
            </label>
            <select
              value={constraints.occupation}
              onChange={(e) => setConstraints(prev => ({ ...prev, occupation: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="warrior">Warrior</option>
              <option value="guard">Guard</option>
              <option value="merchant">Merchant</option>
              <option value="farmer">Farmer</option>
              <option value="blacksmith">Blacksmith</option>
              <option value="healer">Healer</option>
              <option value="scholar">Scholar</option>
              <option value="noble">Noble</option>
              <option value="thief">Thief</option>
              <option value="hunter">Hunter</option>
              <option value="sailor">Sailor</option>
              <option value="hermit">Hermit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-0.5">
              Gender
            </label>
            <select
              value={constraints.gender}
              onChange={(e) => setConstraints(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-Binary</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-0.5">
              Name Culture
            </label>
            <select
              value={constraints.nameCulture}
              onChange={(e) => setConstraints(prev => ({ ...prev, nameCulture: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="Nordic">Nordic</option>
              <option value="Celtic">Celtic</option>
              <option value="Arabic">Arabic</option>
              <option value="Japanese">Japanese</option>
              <option value="Latin">Latin</option>
              <option value="Greek">Greek</option>
              <option value="Germanic">Germanic</option>
              <option value="Slavic">Slavic</option>
              <option value="Hebrew">Hebrew</option>
              <option value="Sanskrit">Sanskrit</option>
              <option value="Chinese">Chinese</option>
              <option value="Korean">Korean</option>
            </select>
          </div>
        </div>

        {/* Generate Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => handleGenerate(1)}
            disabled={isGenerating}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate 1 NPC"}
          </button>
          <button
            onClick={() => handleGenerate(3)}
            disabled={isGenerating}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate 3 NPCs"}
          </button>
          <button
            onClick={() => handleGenerate(5)}
            disabled={isGenerating}
            className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate 5 NPCs"}
          </button>
          <button
            onClick={clearConstraints}
            className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
          >
            Clear Constraints
          </button>
        </div>

        {/* Generated NPCs */}
        {generatedNPCs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-100">Generated NPCs</h3>
            {generatedNPCs.map((npc, index) => (
              <NPCCard
                key={index}
                npc={npc}
                onSave={handleSaveNPC}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Saved NPCs */}
      <SavedNPCsList npcs={npcs} />
    </div>
  );
}

function NPCCard({ 
  npc, 
  onSave, 
  index 
}: { 
  npc: GeneratedNPC; 
  onSave: (npc: GeneratedNPC, customName?: string) => void;
  index: number;
}) {
  const [customName, setCustomName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  // Use the name and gender directly from the NPC data
  const displayName = `${npc.name}: ${npc.gender} ${npc.race} ${npc.occupation}`;

  const handleSave = () => {
    if (showNameInput && customName.trim()) {
      onSave(npc, customName.trim());
    } else {
      onSave(npc);
    }
    setShowNameInput(false);
    setCustomName("");
  };

  return (
    <div className="border border-gray-700 rounded p-2 bg-gray-800">
      <div className="flex justify-between items-start mb-1.5">
        <h4 className="font-semibold text-gray-100 text-xs">
          {displayName}
        </h4>
        <div className="flex gap-1.5">
          {!showNameInput ? (
            <button
              onClick={() => setShowNameInput(true)}
              className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save with Custom Name
            </button>
          ) : (
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter custom name"
                className="px-1.5 py-0.5 text-xs border border-gray-600 rounded bg-gray-700 text-gray-100 placeholder-gray-400"
              />
              <button
                onClick={handleSave}
                className="px-2 py-0.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowNameInput(false);
                  setCustomName("");
                }}
                className="px-2 py-0.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
          <button
            onClick={() => onSave(npc)}
            className="px-2 py-0.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
      
      <div className="space-y-1 text-xs text-gray-400">
        <div>
          <span className="font-medium text-gray-300">Name:</span> {npc.name}
        </div>
        <div>
          <span className="font-medium text-gray-300">Gender:</span> {npc.gender}
        </div>
        <div>
          <span className="font-medium text-gray-300">Race:</span> {npc.race}
        </div>
        <div>
          <span className="font-medium text-gray-300">Occupation:</span> {npc.occupation}
        </div>
        <div className="whitespace-pre-wrap">
          <span className="font-medium text-gray-300">Description:</span> {npc.description}
        </div>
      </div>
    </div>
  );
}

function SavedNPCsList({ npcs }: { npcs: any[] | undefined }) {
  const deleteNPC = useMutation(api.npcs.deleteNPC);

  const handleDelete = async (npcId: string) => {
    try {
      await deleteNPC({ npcId: npcId as any });
      toast.success("NPC deleted successfully");
    } catch (error) {
      toast.error("Failed to delete NPC");
      console.error(error);
    }
  };

  if (!npcs || npcs.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded p-3">
        <h3 className="text-sm font-semibold text-gray-100 mb-1.5">Saved NPCs</h3>
        <p className="text-gray-400 text-xs">No saved NPCs yet. Generate some NPCs above to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded p-3">
      <h3 className="text-sm font-semibold text-gray-100 mb-2">Saved NPCs</h3>
      <div className="space-y-2">
        {npcs.map((npc) => (
          <div key={npc._id} className="border border-gray-700 rounded p-2">
            <div className="flex justify-between items-start mb-1.5">
              <h4 className="font-semibold text-gray-100 text-xs">{npc.name}</h4>
              <button
                onClick={() => handleDelete(npc._id)}
                className="px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
            
            <div className="space-y-1 text-xs text-gray-400">
              <div>
                <span className="font-medium text-gray-300">Race:</span> {npc.race}
              </div>
              {npc.occupation && (
                <div>
                  <span className="font-medium text-gray-300">Occupation:</span> {npc.occupation}
                </div>
              )}
              <div className="whitespace-pre-wrap">
                <span className="font-medium text-gray-300">Description:</span> {npc.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
