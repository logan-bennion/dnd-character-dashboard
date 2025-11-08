import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { getAvailableItems, searchItems, formatItemForDisplay, getItemCategories, getRarityColor, categorizeItem, ItemData } from "./itemData";

interface EquipmentTabProps {
  characterId: Id<"characters">;
}

export function EquipmentTab({ characterId }: EquipmentTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showItemBrowser, setShowItemBrowser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const equipment = useQuery(api.equipment.list, { characterId }) || [];
  const addEquipment = useMutation(api.equipment.add);
  const toggleEquipped = useMutation(api.equipment.toggleEquipped);
  const removeEquipment = useMutation(api.equipment.remove);

  const [newItem, setNewItem] = useState({
    name: "",
    type: "",
    quantity: 1,
    weight: 0,
    description: "",
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEquipment({ characterId, ...newItem });
    setNewItem({
      name: "",
      type: "",
      quantity: 1,
      weight: 0,
      description: "",
    });
    setShowAddForm(false);
  };

  const handleSelectItem = async (item: ItemData) => {
    const formattedItem = formatItemForDisplay(item);
    const category = categorizeItem(item);
    
    await addEquipment({
      characterId,
      name: formattedItem.name,
      type: category,
      quantity: 1,
      weight: formattedItem.weight,
      description: formattedItem.description,
      magical: formattedItem.rarity !== 'common',
    });
    setShowItemBrowser(false);
  };

  const equipmentTypes = [
    "Weapon", "Armor", "Shield", "Tool", "Adventuring Gear", 
    "Consumable", "Treasure", "Ammunition", "Other"
  ];

  const equippedItems = equipment.filter(item => item.equipped);
  const unequippedItems = equipment.filter(item => !item.equipped);
  const totalWeight = equipment.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-gray-100">Equipment</h3>
          <p className="text-xs text-gray-400">Total Weight: {totalWeight} lbs</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowItemBrowser(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Browse Items
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
          >
            Custom Item
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded">
          <form onSubmit={handleAddItem} className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                required
              />
              <select
                value={newItem.type}
                onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                required
              >
                <option value="">Select Type</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                min="1"
              />
              <input
                type="number"
                placeholder="Weight (lbs)"
                value={newItem.weight}
                onChange={(e) => setNewItem(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                step="0.1"
                min="0"
              />
            </div>
            <textarea
              placeholder="Description (optional)"
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400 h-16"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                Add Item
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

      {/* Item Browser */}
      {showItemBrowser && (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-100 text-sm">Browse D&D Items</h4>
            <button
              onClick={() => setShowItemBrowser(false)}
              className="text-gray-400 hover:text-gray-300 text-xs"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
              >
                <option value="">All Categories</option>
                {getItemCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {searchItems(searchQuery, selectedCategory)
                  .slice(0, 50) // Limit to first 50 results for performance
                  .map((item, index) => {
                    const formattedItem = formatItemForDisplay(item);
                    const category = categorizeItem(item);
                    
                    return (
                      <div
                        key={`${item.name}-${index}`}
                        className="p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 cursor-pointer transition-colors"
                        onClick={() => void handleSelectItem(item)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-semibold text-xs truncate text-gray-200">{item.name}</h5>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getRarityColor(formattedItem.rarity)}`}>
                            {formattedItem.rarity}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 space-y-0.5">
                          <div>Type: {category}</div>
                          {formattedItem.weight > 0 && <div>Weight: {formattedItem.weight} lbs</div>}
                          {formattedItem.reqAttune && <div>Attunement: {formattedItem.reqAttune}</div>}
                          {formattedItem.bonusSpellAttack && <div>Spell Attack: {formattedItem.bonusSpellAttack}</div>}
                          {formattedItem.bonusAC && <div>AC Bonus: {formattedItem.bonusAC}</div>}
                        </div>
                        <div className="mt-1.5">
                          <button className="w-full px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                            Add to Inventory
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {equipment.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-xs">
          No equipment added yet. Click "Add Item" to get started!
        </div>
      ) : (
        <div className="space-y-4">
          {equippedItems.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-100 mb-2 flex items-center text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                Equipped Items
              </h4>
              <div className="grid gap-3">
                {equippedItems.map((item) => (
                  <EquipmentItem
                    key={item._id}
                    item={item}
                    onToggleEquipped={() => toggleEquipped({ equipmentId: item._id })}
                    onRemove={() => removeEquipment({ equipmentId: item._id })}
                  />
                ))}
              </div>
            </div>
          )}

          {unequippedItems.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-100 mb-2 flex items-center text-sm">
                <span className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></span>
                Inventory
              </h4>
              <div className="grid gap-2">
                {unequippedItems.map((item) => (
                  <EquipmentItem
                    key={item._id}
                    item={item}
                    onToggleEquipped={() => toggleEquipped({ equipmentId: item._id })}
                    onRemove={() => removeEquipment({ equipmentId: item._id })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface EquipmentItemProps {
  item: {
    _id: Id<"equipment">;
    name: string;
    type: string;
    quantity: number;
    weight?: number;
    description?: string;
    equipped: boolean;
  };
  onToggleEquipped: () => void;
  onRemove: () => void;
}

function EquipmentItem({ item, onToggleEquipped, onRemove }: EquipmentItemProps) {
  return (
    <div className={`p-2 border rounded ${
      item.equipped ? "bg-green-900/30 border-green-700" : "bg-gray-800 border-gray-700"
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-1.5 mb-1">
            <h5 className="font-semibold text-gray-100 text-xs">{item.name}</h5>
            <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
              {item.type}
            </span>
          </div>
          <div className="text-xs text-gray-400 space-x-2">
            <span>Qty: {item.quantity}</span>
            {item.weight && <span>Weight: {item.weight} lbs</span>}
          </div>
          {item.description && (
            <p className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">{item.description}</p>
          )}
        </div>
        <div className="flex space-x-1.5 ml-2">
          <button
            onClick={onToggleEquipped}
            className={`px-2 py-0.5 text-xs rounded ${
              item.equipped
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {item.equipped ? "Equipped" : "Equip"}
          </button>
          <button
            onClick={onRemove}
            className="px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
