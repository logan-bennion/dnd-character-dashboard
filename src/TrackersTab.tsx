import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface TrackersTabProps {
  characterId: Id<"characters">;
}

type TrackerType = "counter" | "checkbox" | "progress" | "text" | "checklist";

export function TrackersTab({ characterId }: TrackersTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTracker, setEditingTracker] = useState<Id<"trackers"> | null>(null);
  
  const trackers = useQuery(api.trackers.list, { characterId }) || [];
  const addTracker = useMutation(api.trackers.add);
  const updateTracker = useMutation(api.trackers.update);
  const removeTracker = useMutation(api.trackers.remove);
  const incrementTracker = useMutation(api.trackers.increment);
  const decrementTracker = useMutation(api.trackers.decrement);
  const toggleTracker = useMutation(api.trackers.toggle);
  const addChecklistItem = useMutation(api.trackers.addChecklistItem);
  const removeChecklistItem = useMutation(api.trackers.removeChecklistItem);
  const toggleChecklistItem = useMutation(api.trackers.toggleChecklistItem);
  const updateChecklistItem = useMutation(api.trackers.updateChecklistItem);

  const [newTracker, setNewTracker] = useState({
    name: "",
    description: "",
    type: "counter" as TrackerType,
    value: 0,
    minValue: undefined as number | undefined,
    maxValue: undefined as number | undefined,
  });

  const handleAddTracker = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let value: number | string | boolean;
    if (newTracker.type === "checkbox") {
      value = false;
    } else if (newTracker.type === "text") {
      value = "";
    } else if (newTracker.type === "checklist") {
      value = JSON.stringify([]);
    } else {
      value = newTracker.value || 0;
    }
    
    await addTracker({
      characterId,
      name: newTracker.name,
      description: newTracker.description || undefined,
      type: newTracker.type,
      value,
      minValue: newTracker.minValue,
      maxValue: newTracker.maxValue,
    });
    
    setNewTracker({
      name: "",
      description: "",
      type: "counter",
      value: 0,
      minValue: undefined,
      maxValue: undefined,
    });
    setShowAddForm(false);
  };

  const handleUpdateTracker = async (trackerId: Id<"trackers">) => {
    const tracker = trackers.find(t => t._id === trackerId);
    if (!tracker) return;
    
    let value: number | string | boolean | undefined;
    if (newTracker.type === "checkbox") {
      value = typeof tracker.value === "boolean" ? tracker.value : false;
    } else if (newTracker.type === "text") {
      value = typeof tracker.value === "string" ? tracker.value : "";
    } else if (newTracker.type === "checklist") {
      value = typeof tracker.value === "string" ? tracker.value : JSON.stringify([]);
    } else {
      value = newTracker.value;
    }
    
    await updateTracker({
      trackerId,
      name: newTracker.name,
      description: newTracker.description || undefined,
      type: newTracker.type,
      value,
      minValue: newTracker.minValue,
      maxValue: newTracker.maxValue,
    });
    
    setEditingTracker(null);
    setShowAddForm(false);
    setNewTracker({
      name: "",
      description: "",
      type: "counter",
      value: 0,
      minValue: undefined,
      maxValue: undefined,
    });
  };

  const handleValueChange = async (trackerId: Id<"trackers">, newValue: number | string | boolean) => {
    await updateTracker({
      trackerId,
      value: newValue,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-100">Trackers</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        >
          Add Tracker
        </button>
      </div>

      {/* Add/Edit Tracker Form */}
      {(showAddForm || editingTracker) && (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded">
          <h4 className="font-semibold mb-2 text-gray-100 text-sm">
            {editingTracker ? "Edit Tracker" : "Add New Tracker"}
          </h4>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingTracker) {
              void handleUpdateTracker(editingTracker);
            } else {
              void handleAddTracker(e);
            }
          }} className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={newTracker.name}
                onChange={(e) => setNewTracker(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                placeholder="Tracker Name"
                required
              />
              <select
                value={newTracker.type}
                onChange={(e) => setNewTracker(prev => ({ ...prev, type: e.target.value as TrackerType }))}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                required
              >
                <option value="counter">Counter</option>
                <option value="checkbox">Checkbox</option>
                <option value="progress">Progress Bar</option>
                <option value="text">Text/Notes</option>
                <option value="checklist">Checklist</option>
              </select>
            </div>
            <textarea
              value={newTracker.description}
              onChange={(e) => setNewTracker(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              placeholder="Description (optional)"
              rows={2}
            />
            {(newTracker.type === "counter" || newTracker.type === "progress") && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-0.5">Initial Value</label>
                  <input
                    type="number"
                    value={newTracker.value}
                    onChange={(e) => setNewTracker(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                    onWheel={(e) => {
                      e.currentTarget.blur();
                      const currentValue = newTracker.value || 0;
                      const newValue = e.deltaY < 0 ? currentValue + 1 : currentValue - 1;
                      setNewTracker(prev => ({ ...prev, value: newValue }));
                    }}
                    className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                    min={newTracker.minValue}
                    max={newTracker.maxValue}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-0.5">Min Value</label>
                  <input
                    type="number"
                    value={newTracker.minValue || ""}
                    onChange={(e) => setNewTracker(prev => ({ ...prev, minValue: e.target.value ? parseInt(e.target.value) : undefined }))}
                    onWheel={(e) => {
                      e.currentTarget.blur();
                      const currentValue = newTracker.minValue || 0;
                      const newValue = e.deltaY < 0 ? currentValue + 1 : currentValue - 1;
                      setNewTracker(prev => ({ ...prev, minValue: newValue }));
                    }}
                    className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-0.5">Max Value</label>
                  <input
                    type="number"
                    value={newTracker.maxValue || ""}
                    onChange={(e) => setNewTracker(prev => ({ ...prev, maxValue: e.target.value ? parseInt(e.target.value) : undefined }))}
                    onWheel={(e) => {
                      e.currentTarget.blur();
                      const currentValue = newTracker.maxValue || 0;
                      const newValue = e.deltaY < 0 ? currentValue + 1 : currentValue - 1;
                      setNewTracker(prev => ({ ...prev, maxValue: newValue }));
                    }}
                    className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                {editingTracker ? "Update Tracker" : "Add Tracker"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTracker(null);
                  setNewTracker({
                    name: "",
                    description: "",
                    type: "counter",
                    value: 0,
                    minValue: undefined,
                    maxValue: undefined,
                  });
                }}
                className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trackers List */}
      {trackers.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-xs">
          No trackers added yet. Click "Add Tracker" to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {trackers.map((tracker) => (
            <TrackerCard
              key={tracker._id}
              tracker={tracker}
              onEdit={() => {
                setEditingTracker(tracker._id);
                setNewTracker({
                  name: tracker.name,
                  description: tracker.description || "",
                  type: tracker.type as TrackerType,
                  value: typeof tracker.value === "number" ? tracker.value : 0,
                  minValue: tracker.minValue,
                  maxValue: tracker.maxValue,
                });
              }}
              onRemove={() => void removeTracker({ trackerId: tracker._id })}
              onValueChange={(value) => void handleValueChange(tracker._id, value)}
              onIncrement={() => void incrementTracker({ trackerId: tracker._id })}
              onDecrement={() => void decrementTracker({ trackerId: tracker._id })}
              onToggle={() => void toggleTracker({ trackerId: tracker._id })}
              onAddChecklistItem={(label) => void addChecklistItem({ trackerId: tracker._id, label })}
              onRemoveChecklistItem={(index) => void removeChecklistItem({ trackerId: tracker._id, index })}
              onToggleChecklistItem={(index) => void toggleChecklistItem({ trackerId: tracker._id, index })}
              onUpdateChecklistItem={(index, label) => void updateChecklistItem({ trackerId: tracker._id, index, label })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TrackerCardProps {
  tracker: {
    _id: Id<"trackers">;
    name: string;
    description?: string;
    type: string;
    value: number | string | boolean;
    minValue?: number;
    maxValue?: number;
  };
  onEdit: () => void;
  onRemove: () => void;
  onValueChange: (value: number | string | boolean) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggle: () => void;
  onAddChecklistItem: (label: string) => void;
  onRemoveChecklistItem: (index: number) => void;
  onToggleChecklistItem: (index: number) => void;
  onUpdateChecklistItem: (index: number, label: string) => void;
}

function TrackerCard({ tracker, onEdit, onRemove, onValueChange, onIncrement, onDecrement, onToggle, onAddChecklistItem, onRemoveChecklistItem, onToggleChecklistItem, onUpdateChecklistItem }: TrackerCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded p-2">
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex-1">
          <h5 className="font-semibold text-gray-100 text-xs mb-0.5">{tracker.name}</h5>
          {tracker.description && (
            <p className="text-xs text-gray-400 mb-1 whitespace-pre-wrap">{tracker.description}</p>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={onEdit}
            className="text-blue-400 hover:text-blue-300 text-xs"
          >
            Edit
          </button>
          <button
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 text-xs"
          >
            Remove
          </button>
        </div>
      </div>
      
      {/* Counter Type */}
      {tracker.type === "counter" && typeof tracker.value === "number" && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={onDecrement}
              className="px-2 py-0.5 bg-gray-700 text-gray-200 rounded text-xs hover:bg-gray-600"
            >
              −
            </button>
            <input
              type="number"
              value={tracker.value}
              onChange={(e) => onValueChange(parseInt(e.target.value) || 0)}
              onWheel={(e) => {
                e.currentTarget.blur();
                if (e.deltaY < 0) {
                  onIncrement();
                } else {
                  onDecrement();
                }
              }}
              className="w-20 px-2 py-0.5 border border-gray-600 rounded bg-gray-700 text-gray-100 text-center text-xs"
              min={tracker.minValue}
              max={tracker.maxValue}
            />
            <button
              onClick={onIncrement}
              className="px-2 py-0.5 bg-gray-700 text-gray-200 rounded text-xs hover:bg-gray-600"
            >
              +
            </button>
          </div>
          {(tracker.minValue !== undefined || tracker.maxValue !== undefined) && (
            <div className="text-xs text-gray-500 text-center">
              {tracker.minValue !== undefined ? `Min: ${tracker.minValue}` : ""}
              {tracker.minValue !== undefined && tracker.maxValue !== undefined ? " • " : ""}
              {tracker.maxValue !== undefined ? `Max: ${tracker.maxValue}` : ""}
            </div>
          )}
        </div>
      )}
      
      {/* Checkbox Type */}
      {tracker.type === "checkbox" && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={tracker.value === true}
            onChange={onToggle}
            className="w-4 h-4 rounded"
          />
          <span className="text-xs text-gray-300">
            {tracker.value ? "Checked" : "Unchecked"}
          </span>
        </div>
      )}
      
      {/* Progress Bar Type */}
      {tracker.type === "progress" && typeof tracker.value === "number" && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={onDecrement}
              className="px-2 py-0.5 bg-gray-700 text-gray-200 rounded text-xs hover:bg-gray-600"
            >
              −
            </button>
            <div className="flex-1">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${tracker.maxValue ? Math.max(0, (tracker.value / tracker.maxValue) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            <button
              onClick={onIncrement}
              className="px-2 py-0.5 bg-gray-700 text-gray-200 rounded text-xs hover:bg-gray-600"
            >
              +
            </button>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="number"
              value={tracker.value}
              onChange={(e) => onValueChange(parseInt(e.target.value) || 0)}
              onWheel={(e) => {
                e.currentTarget.blur();
                if (e.deltaY < 0) {
                  onIncrement();
                } else {
                  onDecrement();
                }
              }}
              className="w-16 px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 text-gray-100 text-center text-xs"
              min={tracker.minValue || 0}
              max={tracker.maxValue}
            />
            {tracker.maxValue && (
              <span className="text-xs text-gray-400">
                / {tracker.maxValue}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Text Type */}
      {tracker.type === "text" && (
        <textarea
          value={typeof tracker.value === "string" ? tracker.value : ""}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
          placeholder="Enter notes..."
          rows={3}
        />
      )}
      
      {/* Checklist Type */}
      {tracker.type === "checklist" && (
        <ChecklistTracker
          tracker={tracker}
          onAddItem={onAddChecklistItem}
          onRemoveItem={onRemoveChecklistItem}
          onToggleItem={onToggleChecklistItem}
          onUpdateItem={onUpdateChecklistItem}
        />
      )}
    </div>
  );
}

interface ChecklistTrackerProps {
  tracker: {
    _id: Id<"trackers">;
    name: string;
    description?: string;
    value: number | string | boolean;
  };
  onAddItem: (label: string) => void;
  onRemoveItem: (index: number) => void;
  onToggleItem: (index: number) => void;
  onUpdateItem: (index: number, label: string) => void;
}

function ChecklistTracker({ tracker, onAddItem, onRemoveItem, onToggleItem, onUpdateItem }: ChecklistTrackerProps) {
  const [newItemLabel, setNewItemLabel] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  let items: Array<{ label: string; checked: boolean }> = [];
  try {
    if (typeof tracker.value === "string") {
      items = JSON.parse(tracker.value);
    }
  } catch {
    items = [];
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemLabel.trim()) {
      onAddItem(newItemLabel.trim());
      setNewItemLabel("");
    }
  };

  const handleStartEdit = (index: number, currentLabel: string) => {
    setEditingIndex(index);
    setEditingLabel(currentLabel);
  };

  const handleSaveEdit = (index: number) => {
    if (editingLabel.trim()) {
      onUpdateItem(index, editingLabel.trim());
    }
    setEditingIndex(null);
    setEditingLabel("");
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleAddItem} className="flex space-x-1">
        <input
          type="text"
          value={newItemLabel}
          onChange={(e) => setNewItemLabel(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
          placeholder="Add item..."
        />
        <button
          type="submit"
          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
        >
          Add
        </button>
      </form>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-2">No items yet</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 group">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onToggleItem(index)}
                className="w-4 h-4 rounded"
              />
              {editingIndex === index ? (
                <div className="flex-1 flex items-center space-x-1">
                  <input
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onBlur={() => handleSaveEdit(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveEdit(index);
                      } else if (e.key === "Escape") {
                        setEditingIndex(null);
                        setEditingLabel("");
                      }
                    }}
                    className="flex-1 px-1.5 py-0.5 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <span
                    className={`flex-1 text-xs cursor-pointer ${
                      item.checked ? "line-through text-gray-500" : "text-gray-300"
                    }`}
                    onDoubleClick={() => handleStartEdit(index, item.label)}
                  >
                    {item.label}
                  </span>
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs px-1"
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

