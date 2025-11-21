import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import useLayerStore from '../../store/useLayerStore';
import { getFeatureStyle } from '../../utils/styleHelpers';

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef({}); // Keep track of OL layers by ID

  const { layers, selectLayer, selectFeature, selectedLayerId } = useLayerStore();

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
          zIndex: 0
        }),
      ],
      view: new View({
        center: fromLonLat([-46.6333, -23.5505]), // Sao Paulo
        zoom: 12,
      }),
      controls: defaultControls({ zoom: false, rotate: false, attribution: false }),
    });

    // Click Interaction
    mapInstance.current.on('click', (evt) => {
      const feature = mapInstance.current.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        return { feature, layer };
      });

      if (feature) {
        const layerId = feature.layer.get('id');
        const featureData = feature.feature.getProperties();
        // Remove geometry from properties to avoid circular issues in store if needed, 
        // but usually it's fine. Let's keep it simple.

        selectLayer(layerId);
        selectFeature({
          id: feature.feature.getId() || Math.random(),
          properties: featureData
        });
      } else {
        selectFeature(null);
        // Optional: Deselect layer if clicking empty space? 
        // User said: "sempre que eu selecionar um ponto... aquela camada deverá ser automaticamente selecionada".
        // Doesn't say what happens when clicking map. Let's keep selection if clicking map, or maybe deselect feature but keep layer?
        // Let's deselect feature.
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(null);
      }
    };
  }, []);

  // Sync Layers
  useEffect(() => {
    if (!mapInstance.current) return;

    const map = mapInstance.current;
    const currentLayerIds = Object.keys(layersRef.current);
    const newLayerIds = layers.map(l => l.id);

    // Remove deleted layers
    currentLayerIds.forEach(id => {
      if (!newLayerIds.includes(id)) {
        map.removeLayer(layersRef.current[id]);
        delete layersRef.current[id];
      }
    });

    // Add or Update layers
    layers.forEach((layerData, index) => {
      let olLayer = layersRef.current[layerData.id];

      if (!olLayer) {
        // Create new layer
        const source = new VectorSource({
          features: new GeoJSON().readFeatures(layerData.source, {
            featureProjection: 'EPSG:3857'
          })
        });

        olLayer = new VectorLayer({
          source: source,
          zIndex: index + 1, // Base map is 0
        });

        // Store ID on layer for click detection
        olLayer.set('id', layerData.id);

        map.addLayer(olLayer);
        layersRef.current[layerData.id] = olLayer;
      }

      // Update properties
      olLayer.setVisible(layerData.visible);
      olLayer.setZIndex(index + 1);

      // Update Style
      olLayer.setStyle((feature) => getFeatureStyle(feature, layerData.style));
    });

  }, [layers]);

  return (
    <div ref={mapRef} className="w-full h-full bg-gray-200" />
  );
};

export default MapComponent;
