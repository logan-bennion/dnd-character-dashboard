import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface FeaturesTabProps {
  characterId: Id<"characters">;
}

export function FeaturesTab({ characterId }: FeaturesTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Id<"features"> | null>(null);
  
  const features = useQuery(api.features.list, { characterId }) || [];
  const addFeature = useMutation(api.features.add);
  const updateFeature = useMutation(api.features.update);
  const removeFeature = useMutation(api.features.remove);
  const useFeature = useMutation(api.features.useFeature);
  const rechargeFeature = useMutation(api.features.rechargeFeature);
  const rechargeAll = useMutation(api.features.rechargeAll);

  const [newFeature, setNewFeature] = useState({
    name: "",
    source: "",
    description: "",
    uses: undefined as number | undefined,
    maxUses: undefined as number | undefined,
    rechargeType: "",
  });

  const handleAddFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    await addFeature({ characterId, ...newFeature });
    setNewFeature({
      name: "",
      source: "",
      description: "",
      uses: undefined,
      maxUses: undefined,
      rechargeType: "",
    });
    setShowAddForm(false);
  };

  const handleUpdateFeature = async (featureId: Id<"features">) => {
    const feature = features.find(f => f._id === featureId);
    if (!feature) return;
    
    await updateFeature({
      featureId,
      name: newFeature.name || feature.name,
      source: newFeature.source || feature.source,
      description: newFeature.description || feature.description,
      uses: newFeature.uses,
      maxUses: newFeature.maxUses,
      rechargeType: newFeature.rechargeType || feature.rechargeType,
    });
    
    setEditingFeature(null);
    setNewFeature({
      name: "",
      source: "",
      description: "",
      uses: undefined,
      maxUses: undefined,
      rechargeType: "",
    });
  };

  const handleUseFeature = async (featureId: Id<"features">) => {
    await useFeature({ featureId });
  };

  const handleRechargeFeature = async (featureId: Id<"features">) => {
    await rechargeFeature({ featureId });
  };

  const handleRechargeAll = async (rechargeType: string) => {
    await rechargeAll({ characterId, rechargeType });
  };

  const featuresBySource = features.reduce((acc, feature) => {
    if (!acc[feature.source]) acc[feature.source] = [];
    acc[feature.source].push(feature);
    return acc;
  }, {} as Record<string, typeof features>);

  const rechargeTypes = [...new Set(features.map(f => f.rechargeType).filter(Boolean))];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-100">Features & Traits</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Add Feature
          </button>
          {rechargeTypes.length > 0 && (
            <div className="flex space-x-1">
              {rechargeTypes.map(type => (
                <button
                  key={type}
                  onClick={() => void handleRechargeAll(type)}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Recharge {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Feature Form */}
      {(showAddForm || editingFeature) && (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded">
          <h4 className="font-semibold mb-2 text-gray-100 text-sm">
            {editingFeature ? "Edit Feature" : "Add New Feature"}
          </h4>
          <form onSubmit={(e) => void (editingFeature ? handleUpdateFeature(editingFeature) : handleAddFeature(e))} className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={newFeature.name}
                onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                placeholder="Feature Name"
                required
              />
              <input
                type="text"
                value={newFeature.source}
                onChange={(e) => setNewFeature(prev => ({ ...prev, source: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                placeholder="Source (Class, Race, Feat, etc.)"
                required
              />
            </div>
            <textarea
              value={newFeature.description}
              onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
              placeholder="Description"
              rows={3}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-0.5">
                  Current Uses
                </label>
                <input
                  type="number"
                  value={newFeature.uses || ""}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, uses: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-0.5">
                  Max Uses
                </label>
                <input
                  type="number"
                  value={newFeature.maxUses || ""}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, maxUses: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs placeholder-gray-400"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-0.5">
                  Recharge Type
                </label>
                <select
                  value={newFeature.rechargeType}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, rechargeType: e.target.value }))}
                  className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-gray-100 text-xs"
                >
                  <option value="">No Recharge</option>
                  <option value="short rest">Short Rest</option>
                  <option value="long rest">Long Rest</option>
                  <option value="dawn">Dawn</option>
                  <option value="dusk">Dusk</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                {editingFeature ? "Update Feature" : "Add Feature"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingFeature(null);
                  setNewFeature({
                    name: "",
                    source: "",
                    description: "",
                    uses: undefined,
                    maxUses: undefined,
                    rechargeType: "",
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

      {/* Features List */}
      {Object.keys(featuresBySource).length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-xs">
          No features added yet. Click "Add Feature" to get started!
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(featuresBySource)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([source, sourceFeatures]) => (
              <div key={source}>
                <h4 className="font-semibold text-gray-100 mb-2 text-sm">
                  {source}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {sourceFeatures.map((feature) => (
                    <div
                      key={feature._id}
                      className="bg-gray-800 border border-gray-700 rounded p-2 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h5 className="font-semibold text-gray-100 text-xs">{feature.name}</h5>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setEditingFeature(feature._id);
                              setNewFeature({
                                name: feature.name,
                                source: feature.source,
                                description: feature.description,
                                uses: feature.uses,
                                maxUses: feature.maxUses,
                                rechargeType: feature.rechargeType || "",
                              });
                            }}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void removeFeature({ featureId: feature._id })}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-400 mb-2 whitespace-pre-wrap">{feature.description}</p>
                      
                      {/* Charge Tracking */}
                      {feature.maxUses !== undefined && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-300">Uses:</span>
                            <span className="text-xs text-gray-400">
                              {feature.uses || 0}/{feature.maxUses}
                            </span>
                          </div>
                          
                          <div className="flex space-x-1.5">
                            <button
                              onClick={() => void handleUseFeature(feature._id)}
                              disabled={!feature.uses || feature.uses <= 0}
                              className="flex-1 px-2 py-0.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                              Use
                            </button>
                            <button
                              onClick={() => void handleRechargeFeature(feature._id)}
                              disabled={!feature.maxUses}
                              className="flex-1 px-2 py-0.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                              Recharge
                            </button>
                          </div>
                          
                          {feature.rechargeType && (
                            <div className="text-xs text-gray-500">
                              Recharges on: {feature.rechargeType}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
