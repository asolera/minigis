import React, { useRef, useState } from 'react';
import { Upload, FileJson, Layers, Eye, EyeOff, Trash2, Maximize, MoreVertical, Download, FolderOpen, FilePlus } from 'lucide-react';
import useLayerStore from '../../store/useLayerStore';
import { parseCSV, loadShapefile, createLayerFromGeoJSON } from '../../utils/importers';
import GeoJsonModal from '../Modals/GeoJsonModal';
import AddFeatureModal from '../Modals/AddFeatureModal';
import LayerContextMenu from './LayerContextMenu';

const LeftSidebar = () => {
    const {
        layers,
        toggleLayerVisibility,
        removeLayer,
        reorderLayers,
        selectedLayerId,
        selectLayer,
        addLayer,
        triggerZoomToLayer,
        moveLayerUp,
        moveLayerDown,
        renameLayer,
        mapViewState,
        setProjectState,
        resetProject,
        createEmptyLayer,
        addFeatureToLayer,
        setInteractionMode
    } = useLayerStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);
    const [targetLayerId, setTargetLayerId] = useState(null);
    const [contextMenu, setContextMenu] = useState(null); // { x, y, layerId }

    const csvInputRef = useRef(null);
    const shpInputRef = useRef(null);
    const projectInputRef = useRef(null);

    const handleFileImport = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            if (type === 'project') {
                const text = await file.text();
                const projectData = JSON.parse(text);
                if (projectData.layers && Array.isArray(projectData.layers)) {
                    setProjectState(projectData);
                } else {
                    alert('Invalid project file.');
                }
                return;
            }

            let geojson;
            if (type === 'csv') {
                geojson = await parseCSV(file);
            } else if (type === 'shp') {
                geojson = await loadShapefile(file);
            }

            if (geojson) {
                const newLayer = createLayerFromGeoJSON(geojson, geojson.fileName || 'New Layer');
                addLayer(newLayer);
            }
        } catch (err) {
            alert(`Error importing file: ${err.message}`);
        } finally {
            e.target.value = ''; // Reset input
        }
    };

    const handleExportProject = () => {
        const projectData = {
            layers,
            mapViewState
        };
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'minigis-project.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleNewProject = () => {
        if (window.confirm('Are you sure you want to create a new project? All unsaved changes will be lost.')) {
            resetProject();
        }
    };

    const handleUrlAdd = (geojson, name) => {
        const newLayer = createLayerFromGeoJSON(geojson, name);
        addLayer(newLayer);
    };

    const handleContextMenu = (e, layer) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            layerId: layer.id
        });
    };

    const handleAddFeature = (coords) => {
        if (targetLayerId) {
            const feature = {
                type: "Feature",
                properties: {
                    id: crypto.randomUUID(),
                    addedAt: new Date().toISOString()
                },
                geometry: {
                    type: "Point",
                    coordinates: [coords.lon, coords.lat]
                }
            };
            addFeatureToLayer(targetLayerId, feature);
        }
    };

    const handleEnableClickMode = () => {
        if (targetLayerId) {
            setInteractionMode('addPoint', targetLayerId);
        }
    };

    const handleMenuAction = (action, layerId, value) => {
        switch (action) {
            case 'zoom':
                triggerZoomToLayer(layerId);
                break;
            case 'toggle':
                toggleLayerVisibility(layerId);
                break;
            case 'delete':
                if (window.confirm('Are you sure you want to delete this layer?')) {
                    removeLayer(layerId);
                }
                break;
            case 'moveUp':
                moveLayerUp(layerId);
                break;
            case 'moveDown':
                moveLayerDown(layerId);
                break;
            case 'rename':
                renameLayer(layerId, value);
                break;
            case 'addFeature':
                setTargetLayerId(layerId);
                setIsAddFeatureModalOpen(true);
                break;
            default:
                break;
        }
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-lg z-10">
            <GeoJsonModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleUrlAdd}
            />

            <AddFeatureModal
                isOpen={isAddFeatureModalOpen}
                onClose={() => setIsAddFeatureModalOpen(false)}
                onAdd={handleAddFeature}
                onEnableClickMode={handleEnableClickMode}
            />

            {contextMenu && (
                <LayerContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    layer={layers.find(l => l.id === contextMenu.layerId)}
                    onClose={() => setContextMenu(null)}
                    onAction={handleMenuAction}
                />
            )}

            <input
                type="file"
                ref={csvInputRef}
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFileImport(e, 'csv')}
            />
            <input
                type="file"
                ref={shpInputRef}
                accept=".zip"
                className="hidden"
                onChange={(e) => handleFileImport(e, 'shp')}
            />
            <input
                type="file"
                ref={projectInputRef}
                accept=".json"
                className="hidden"
                onChange={(e) => handleFileImport(e, 'project')}
            />

            {/* Top: Tools */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tools</h2>
                <div className="grid grid-cols-3 gap-2 mb-2">
                    <button
                        onClick={() => csvInputRef.current.click()}
                        className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                    >
                        <Upload size={20} className="text-gray-600 group-hover:text-blue-600 mb-1" />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600">CSV</span>
                    </button>
                    <button
                        onClick={() => shpInputRef.current.click()}
                        className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                    >
                        <Layers size={20} className="text-gray-600 group-hover:text-blue-600 mb-1" />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600">Shapefile</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                    >
                        <FileJson size={20} className="text-gray-600 group-hover:text-blue-600 mb-1" />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600">GeoJSON</span>
                    </button>
                    <button
                        onClick={() => createEmptyLayer()}
                        className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                    >
                        <FilePlus size={20} className="text-gray-600 group-hover:text-blue-600 mb-1" />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600">Empty</span>
                    </button>
                </div>

                {/* Project Tools */}
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={handleNewProject}
                        className="flex items-center justify-center gap-2 p-2 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors text-xs text-red-700"
                        title="New Project (Reset)"
                    >
                        <FilePlus size={14} /> New
                    </button>
                    <button
                        onClick={handleExportProject}
                        className="flex items-center justify-center gap-2 p-2 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition-colors text-xs text-gray-700"
                    >
                        <Download size={14} /> Export Project
                    </button>
                    <button
                        onClick={() => projectInputRef.current.click()}
                        className="flex items-center justify-center gap-2 p-2 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition-colors text-xs text-gray-700"
                    >
                        <FolderOpen size={14} /> Import Project
                    </button>
                </div>
            </div>

            {/* Bottom: Layer List */}
            <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Layers</h2>
                {layers.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        No layers added.
                        <br />
                        Use tools above to add data.
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {layers.map((layer) => (
                            <li
                                key={layer.id}
                                className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${selectedLayerId === layer.id
                                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => selectLayer(layer.id)}
                                onContextMenu={(e) => handleContextMenu(e, layer)}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: layer.style?.color || '#ccc' }}
                                    />
                                    <span className="text-sm font-medium text-gray-700 truncate">{layer.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); triggerZoomToLayer(layer.id); }}
                                        className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                                        title="Zoom to Layer"
                                    >
                                        <Maximize size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                                        className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                                    >
                                        {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleContextMenu(e, layer); }}
                                        className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default LeftSidebar;
