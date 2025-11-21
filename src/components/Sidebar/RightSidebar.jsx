import React from 'react';
import useLayerStore from '../../store/useLayerStore';
import { X } from 'lucide-react';

const RightSidebar = () => {
    const { selectedLayerId, layers, selectedFeature, selectLayer, updateLayerStyle } = useLayerStore();

    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    if (!selectedLayer) return null;

    const handleStyleChange = (key, value) => {
        updateLayerStyle(selectedLayerId, { [key]: value });
    };

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg z-10">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="font-semibold text-gray-700 truncate">{selectedLayer.name}</h2>
                <button
                    onClick={() => selectLayer(null)}
                    className="text-gray-400 hover:text-gray-700"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Top: Styling */}
            <div className="p-4 border-b border-gray-200 space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Styling</h3>

                {/* Main Color (Point / Border) */}
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Color (Point / Border)</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            className="h-8 w-full cursor-pointer rounded border border-gray-300"
                            value={selectedLayer.style?.color || '#3b82f6'}
                            onChange={(e) => handleStyleChange('color', e.target.value)}
                        />
                    </div>
                </div>

                {/* Fill Color (Polygon) */}
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Fill Color (Polygon)</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            className="h-8 w-full cursor-pointer rounded border border-gray-300"
                            value={selectedLayer.style?.fillColor || selectedLayer.style?.color || '#3b82f6'}
                            onChange={(e) => handleStyleChange('fillColor', e.target.value)}
                        />
                    </div>
                </div>

                {/* Opacity */}
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Opacity: {Math.round((selectedLayer.style?.opacity ?? 1) * 100)}%</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedLayer.style?.opacity ?? 1}
                        onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Radius (Point only) or Border Width (Polygon) */}
                {(() => {
                    const firstFeature = selectedLayer.source?.features?.[0];
                    const geometryType = firstFeature?.geometry?.type;
                    const isPoint = geometryType === 'Point' || geometryType === 'MultiPoint';
                    const isPolygon = geometryType === 'Polygon' || geometryType === 'MultiPolygon';

                    if (isPoint) {
                        return (
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Point Radius: {selectedLayer.style?.radius || 6}px</label>
                                <input
                                    type="range"
                                    min="2"
                                    max="20"
                                    value={selectedLayer.style?.radius || 6}
                                    onChange={(e) => handleStyleChange('radius', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        );
                    }

                    if (isPolygon) {
                        return (
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Border Width: {selectedLayer.style?.borderWidth || 2}px</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={selectedLayer.style?.borderWidth || 2}
                                    onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        );
                    }

                    return null;
                })()}

                {/* Icon Type */}
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Icon Style</label>
                    <div className="flex gap-2">
                        <button
                            className={`p-2 border rounded ${!selectedLayer.style?.iconType ? 'bg-blue-50 border-blue-500' : 'bg-white'}`}
                            onClick={() => handleStyleChange('iconType', null)}
                        >
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        </button>
                        <button
                            className={`p-2 border rounded ${selectedLayer.style?.iconType === 'icon' ? 'bg-blue-50 border-blue-500' : 'bg-white'}`}
                            onClick={() => handleStyleChange('iconType', 'icon')}
                        >
                            <img src="https://openlayers.org/en/latest/examples/data/icon.png" className="w-4 h-4" alt="icon" />
                        </button>
                    </div>
                </div>

                {/* Icon Selection (if Icon Type is icon) */}
                {selectedLayer.style?.iconType === 'icon' && (
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Select Icon</label>
                        <select
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={selectedLayer.style?.iconUrl || 'https://openlayers.org/en/latest/examples/data/icon.png'}
                            onChange={(e) => handleStyleChange('iconUrl', e.target.value)}
                        >
                            <option value="https://openlayers.org/en/latest/examples/data/icon.png">Pin</option>
                            <option value="https://upload.wikimedia.org/wikipedia/commons/8/88/Map_marker.svg">Marker</option>
                            <option value="https://upload.wikimedia.org/wikipedia/commons/e/ec/Red_dot.svg">Red Dot</option>
                        </select>
                    </div>
                )}

                {/* Label Field */}
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Label Field</label>
                    <select
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        value={selectedLayer.style?.labelField || ''}
                        onChange={(e) => handleStyleChange('labelField', e.target.value)}
                    >
                        <option value="">None</option>
                        {(() => {
                            // Get properties from selected feature OR first feature in layer
                            const properties = selectedFeature?.properties ||
                                selectedLayer.source?.features?.[0]?.properties ||
                                {};
                            return Object.keys(properties).map(key => (
                                <option key={key} value={key}>{key}</option>
                            ));
                        })()}
                    </select>
                </div>

                {/* Label Placement */}
                {selectedLayer.style?.labelField && (
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Label Placement</label>
                        <select
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={selectedLayer.style?.labelPlacement || 'top-right'}
                            onChange={(e) => handleStyleChange('labelPlacement', e.target.value)}
                        >
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                        </select>
                    </div>
                )}

            </div>

            {/* Bottom: Attributes */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Feature Attributes</h3>
                {selectedFeature ? (
                    <div className="space-y-2">
                        {Object.entries(selectedFeature.properties || {}).map(([key, value]) => (
                            <div key={key} className="bg-white p-2 rounded border border-gray-200">
                                <div className="text-xs text-gray-500 font-medium">{key}</div>
                                <div className="text-sm text-gray-800 break-words">{String(value)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        Select a feature on the map to view attributes.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RightSidebar;
