import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CharacterStats } from "./CharacterStats";
import { SpellsTab } from "./SpellsTab";
import { EquipmentTab } from "./EquipmentTab";
import { FeaturesTab } from "./FeaturesTab";
import { TrackersTab } from "./TrackersTab";
import { BestiaryTab } from "./BestiaryTab";

interface CharacterSheetProps {
  characterId: Id<"characters">;
  onBack: () => void;
}

type Tab = "stats" | "spells" | "equipment" | "features" | "trackers" | "bestiary";

export function CharacterSheet({ characterId, onBack }: CharacterSheetProps) {
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const character = useQuery(api.characters.get, { characterId });

  if (!character) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: "stats" as Tab, label: "Character Stats", icon: "📊" },
    { id: "spells" as Tab, label: "Spells", icon: "✨" },
    { id: "equipment" as Tab, label: "Equipment", icon: "⚔️" },
    { id: "features" as Tab, label: "Features & Traits", icon: "🎯" },
    { id: "trackers" as Tab, label: "Trackers", icon: "📝" },
    { id: "bestiary" as Tab, label: "Bestiary", icon: "🐉" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 border border-gray-700 rounded">
        <div className="border-b border-gray-700 px-4 py-2">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={onBack}
                className="text-blue-400 hover:text-blue-300 mb-1 flex items-center text-xs"
              >
                ← Back to Characters
              </button>
              <h1 className="text-lg font-bold text-gray-100">{character.name}</h1>
              <p className="text-gray-400 text-xs">
                Level {character.level} {character.race} {character.class}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Hit Points</div>
              <div className="text-lg font-bold text-red-400">
                {character.hitPoints}/{character.maxHitPoints}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-700">
          <nav className="flex space-x-4 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-xs ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3">
          {activeTab === "stats" && <CharacterStats character={character} />}
          {activeTab === "spells" && <SpellsTab characterId={characterId} character={character} />}
          {activeTab === "equipment" && <EquipmentTab characterId={characterId} />}
          {activeTab === "features" && <FeaturesTab characterId={characterId} />}
          {activeTab === "trackers" && <TrackersTab characterId={characterId} />}
          {activeTab === "bestiary" && <BestiaryTab characterId={characterId} />}
        </div>
      </div>
    </div>
  );
}
