import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Eye, EyeOff, Trash2, ArrowUp, ArrowDown, Edit2, PlusCircle, Table } from 'lucide-react';

const LayerContextMenu = ({ x, y, layer, onClose, onAction }) => {
    const menuRef = useRef(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(layer.name);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleAction = (action, e) => {
        e.stopPropagation();
        onAction(action, layer.id);
        if (action !== 'rename') {
            onClose();
        }
    };

    const handleRenameSubmit = (e) => {
        e.preventDefault();
        onAction('rename', layer.id, newName);
        onClose();
    };

    if (isRenaming) {
        return (
            <div
                ref={menuRef}
                className="fixed bg-white border border-gray-200 shadow-xl rounded z-50 p-2 w-48"
                style={{ top: y, left: x }}
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleRenameSubmit}>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div
            ref={menuRef}
            className="fixed bg-white border border-gray-200 shadow-xl rounded z-50 py-1 w-48"
            style={{ top: y, left: x }}
        >
            <button
                onClick={(e) => handleAction('zoom', e)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
                <Maximize size={14} /> Zoom to Layer
            </button>
            <button
                onClick={(e) => handleAction('toggle', e)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
                {layer.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                {layer.visible ? 'Hide Layer' : 'Show Layer'}
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
                <Edit2 size={14} /> Rename
            </button>
            <button
                onClick={(e) => handleAction('addFeature', e)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
                <PlusCircle size={14} /> Add Feature
            </button>
            <button
                onClick={(e) => handleAction('viewTable', e)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
                <Table size={14} /> View Table
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
                onClick={(e) => handleAction('moveUp', e)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
                <ArrowUp size={14} /> Move Up
            </button>
            <button
                onClick={(e) => handleAction('moveDown', e)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
                <ArrowDown size={14} /> Move Down
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
                onClick={(e) => handleAction('delete', e)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
                <Trash2 size={14} /> Delete
            </button>
        </div>
    );
};

export default LayerContextMenu;
