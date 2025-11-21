import React from 'react';
import { X, Table } from 'lucide-react';

const AttributeTableModal = ({ isOpen, onClose, layer }) => {
    if (!isOpen || !layer) return null;

    const features = layer.source?.features || [];
    if (features.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Table size={20} className="text-blue-600" />
                            {layer.name}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-gray-500 text-center">No features in this layer.</p>
                </div>
            </div>
        );
    }

    // Extract all unique keys from all features to form columns
    const allKeys = new Set();
    features.forEach(f => {
        if (f.properties) {
            Object.keys(f.properties).forEach(k => allKeys.add(k));
        }
    });
    const columns = Array.from(allKeys);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-3/4 h-3/4 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Table size={20} className="text-blue-600" />
                        {layer.name} <span className="text-sm font-normal text-gray-500">({features.length} features)</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {features.map((feature, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    {columns.map(col => (
                                        <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100 last:border-r-0">
                                            {feature.properties?.[col] !== undefined ? String(feature.properties[col]) : '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttributeTableModal;
