import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { CharacterList } from "./CharacterList";
import { CharacterSheet } from "./CharacterSheet";
import { CreateCharacterForm } from "./CreateCharacterForm";
import { NPCGenerator } from "./NPCGenerator";
import { Id } from "../convex/_generated/dataModel";

export function CharacterDashboard() {
  const [selectedCharacterId, setSelectedCharacterId] = useState<Id<"characters"> | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'characters' | 'npcs'>('characters');
  const characters = useQuery(api.characters.list) || [];

  if (showCreateForm) {
    return (
      <CreateCharacterForm
        onCancel={() => setShowCreateForm(false)}
        onSuccess={(characterId) => {
          setSelectedCharacterId(characterId);
          setShowCreateForm(false);
        }}
      />
    );
  }

  if (selectedCharacterId) {
    return (
      <CharacterSheet
        characterId={selectedCharacterId}
        onBack={() => setSelectedCharacterId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-4">
          <button
            onClick={() => setActiveTab('characters')}
            className={`py-1.5 px-1 border-b-2 font-medium text-xs ${
              activeTab === 'characters'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            Characters
          </button>
          <button
            onClick={() => setActiveTab('npcs')}
            className={`py-1.5 px-1 border-b-2 font-medium text-xs ${
              activeTab === 'npcs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            NPC Generator
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'characters' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-100">Your Characters</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              Create New Character
            </button>
          </div>

          {characters.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm mb-3">No characters yet</div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                Create Your First Character
              </button>
            </div>
          ) : (
            <CharacterList
              characters={characters}
              onSelectCharacter={setSelectedCharacterId}
            />
          )}
        </div>
      ) : (
        <NPCGenerator />
      )}
    </div>
  );
}
