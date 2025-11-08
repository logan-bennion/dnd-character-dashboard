import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface Character {
  _id: Id<"characters">;
  name: string;
  race: string;
  class: string;
  level: number;
  hitPoints: number;
  maxHitPoints: number;
}

interface CharacterListProps {
  characters: Character[];
  onSelectCharacter: (id: Id<"characters">) => void;
}

export function CharacterList({ characters, onSelectCharacter }: CharacterListProps) {
  const deleteCharacter = useMutation(api.characters.remove);

  const handleDelete = async (characterId: Id<"characters">, characterName: string) => {
    if (confirm(`Are you sure you want to delete ${characterName}? This action cannot be undone.`)) {
      await deleteCharacter({ characterId });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {characters.map((character) => (
        <div
          key={character._id}
          className="bg-gray-800 border border-gray-700 rounded p-3 hover:border-gray-600 transition-colors cursor-pointer"
          onClick={() => onSelectCharacter(character._id)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-bold text-gray-100">{character.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(character._id, character.name);
              }}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Delete
            </button>
          </div>
          
          <div className="space-y-1 text-xs text-gray-400">
            <div>
              <span className="font-medium text-gray-300">Race:</span> {character.race}
            </div>
            <div>
              <span className="font-medium text-gray-300">Class:</span> {character.class}
            </div>
            <div>
              <span className="font-medium text-gray-300">Level:</span> {character.level}
            </div>
            <div>
              <span className="font-medium text-gray-300">HP:</span> {character.hitPoints}/{character.maxHitPoints}
            </div>
          </div>
          
          <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-red-600 h-1.5 rounded-full transition-all"
              style={{
                width: `${(character.hitPoints / character.maxHitPoints) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
