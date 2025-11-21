import Papa from 'papaparse';
import shp from 'shpjs';
import { v4 as uuidv4 } from 'uuid';

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.warn("CSV Parse Errors:", results.errors);
                }

                const data = results.data;
                if (!data || data.length === 0) {
                    reject(new Error("Empty CSV"));
                    return;
                }

                // Smart detection of lat/lon fields
                const keys = Object.keys(data[0]);
                const latKey = keys.find(k => /lat|latitude/i.test(k));
                const lonKey = keys.find(k => /lon|lng|longitude/i.test(k));

                if (!latKey || !lonKey) {
                    reject(new Error("Could not detect Latitude/Longitude columns."));
                    return;
                }

                // Convert to GeoJSON
                const features = data.map(row => {
                    const lat = parseFloat(String(row[latKey]).replace(',', '.'));
                    const lon = parseFloat(String(row[lonKey]).replace(',', '.'));

                    if (isNaN(lat) || isNaN(lon)) return null;

                    return {
                        type: "Feature",
                        properties: row,
                        geometry: {
                            type: "Point",
                            coordinates: [lon, lat]
                        }
                    };
                }).filter(f => f !== null);

                resolve({
                    type: "FeatureCollection",
                    features: features,
                    fileName: file.name
                });
            },
            error: (err) => reject(err)
        });
    });
};

export const loadShapefile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const geojson = await shp(arrayBuffer);

    if (Array.isArray(geojson)) {
        // Merge features from all shapefiles in the zip
        const allFeatures = geojson.flatMap(g => g.features);
        return {
            type: "FeatureCollection",
            features: allFeatures,
            fileName: file.name
        };
    }

    return {
        ...geojson,
        fileName: file.name
    };
};

export const createLayerFromGeoJSON = (geojson, name) => {
    return {
        id: uuidv4(),
        name: name || 'New Layer',
        type: 'vector',
        source: geojson,
        visible: true,
        style: {
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            radius: 6
        }
    };
};
