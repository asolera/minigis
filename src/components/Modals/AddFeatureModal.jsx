import React, { useState } from 'react';
import { MapPin, Search, MousePointer } from 'lucide-react';

const AddFeatureModal = ({ isOpen, onClose, onAdd, onEnableClickMode }) => {
    const [mode, setMode] = useState('address'); // 'address' | 'coords'
    const [address, setAddress] = useState('');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSearch = async () => {
        if (!address) return;
        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                onAdd({ lat: parseFloat(lat), lon: parseFloat(lon) });
                onClose();
            } else {
                alert('Address not found');
            }
        } catch (error) {
            alert('Error searching address');
        } finally {
            setLoading(false);
        }
    };

    const handleCoordsSubmit = () => {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        if (isNaN(latitude) || isNaN(longitude)) {
            alert('Invalid coordinates');
            return;
        }
        onAdd({ lat: latitude, lon: longitude });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Add Feature
                </h2>

                <div className="flex gap-2 mb-4">
                    <button
                        className={`flex-1 py-1 text-sm rounded border ${mode === 'address' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'}`}
                        onClick={() => setMode('address')}
                    >
                        Address
                    </button>
                    <button
                        className={`flex-1 py-1 text-sm rounded border ${mode === 'coords' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'}`}
                        onClick={() => setMode('coords')}
                    >
                        Lat/Lon
                    </button>
                </div>

                {mode === 'address' ? (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Address</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                    placeholder="Search address..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={lat}
                                    onChange={(e) => setLat(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={lon}
                                    onChange={(e) => setLon(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCoordsSubmit}
                            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            Add Point
                        </button>
                    </div>
                )}

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                </div>

                <button
                    onClick={() => {
                        onEnableClickMode();
                        onClose();
                    }}
                    className="w-full py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
                >
                    <MousePointer size={16} />
                    Click on Map
                </button>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddFeatureModal;
