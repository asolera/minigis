import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat, toLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import useLayerStore from '../../store/useLayerStore';
import { getFeatureStyle } from '../../utils/styleHelpers';

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef({}); // Keep track of OL layers by ID
  const [mapReady, setMapReady] = React.useState(false);

  const {
    layers,
    selectLayer,
    selectFeature,
    selectedLayerId,
    mapViewState,
    setMapViewState,
    zoomToLayerId,
    triggerZoomToLayer
  } = useLayerStore();

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    const initialCenter = mapViewState.center || fromLonLat([-46.6333, -23.5505]);
    const initialZoom = mapViewState.zoom || 12;

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
          zIndex: 0
        }),
      ],
      view: new View({
        center: initialCenter,
        zoom: initialZoom,
      }),
      controls: defaultControls({ zoom: false, rotate: false, attribution: false }),
    });

    // Click Interaction
    mapInstance.current.on('click', (evt) => {
      const { interactionMode, targetLayerId, setInteractionMode, addFeatureToLayer } = useLayerStore.getState();

      if (interactionMode === 'addPoint' && targetLayerId) {
        const [lon, lat] = toLonLat(evt.coordinate);
        const feature = {
          type: "Feature",
          properties: {
            id: crypto.randomUUID(),
            addedAt: new Date().toISOString()
          },
          geometry: {
            type: "Point",
            coordinates: [lon, lat]
          }
        };
        addFeatureToLayer(targetLayerId, feature);
        setInteractionMode('default');
        return;
      }

      const feature = mapInstance.current.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        return { feature, layer };
      });

      if (feature) {
        const layerId = feature.layer.get('id');
        const featureData = feature.feature.getProperties();

        selectLayer(layerId);
        selectFeature({
          id: feature.feature.getId() || Math.random(),
          properties: featureData
        });
      } else {
        selectFeature(null);
      }
    });

    // Persist View State
    mapInstance.current.on('moveend', () => {
      const view = mapInstance.current.getView();
      setMapViewState({
        center: view.getCenter(),
        zoom: view.getZoom()
      });
    });

    setMapReady(true);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(null);
        mapInstance.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Handle Zoom to Layer
  useEffect(() => {
    if (!zoomToLayerId || !mapInstance.current || !mapReady) return;

    const layer = layersRef.current[zoomToLayerId];
    if (layer) {
      const source = layer.getSource();
      if (source && source.getFeatures().length > 0) {
        const extent = source.getExtent();
        mapInstance.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
          maxZoom: 16
        });
      }
    }

    // Reset trigger
    triggerZoomToLayer(null);
  }, [zoomToLayerId, mapReady]);

  // Sync Layers
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;

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
        try {
          const source = new VectorSource({
            features: new GeoJSON().readFeatures(layerData.source, {
              featureProjection: 'EPSG:3857'
            })
          });

          olLayer = new VectorLayer({
            source: source,
            zIndex: index + 1, // Base map is 0
          });

          // Store ID and source reference on layer
          olLayer.set('id', layerData.id);
          olLayer.set('sourceRef', layerData.source);

          map.addLayer(olLayer);
          layersRef.current[layerData.id] = olLayer;
        } catch (error) {
          console.error("Failed to create layer:", layerData.name, error);
        }
      }

      // Update properties
      if (olLayer) {
        olLayer.setVisible(layerData.visible);
        olLayer.setZIndex(index + 1);

        // Update Style
        olLayer.setStyle((feature) => getFeatureStyle(feature, layerData.style));

        // Update Source if changed
        if (olLayer.get('sourceRef') !== layerData.source) {
          const source = olLayer.getSource();
          const newFeatures = new GeoJSON().readFeatures(layerData.source, {
            featureProjection: 'EPSG:3857'
          });
          source.clear();
          source.addFeatures(newFeatures);
          olLayer.set('sourceRef', layerData.source);
        }
      }
    });

  }, [layers, mapReady]);

  const { interactionMode } = useLayerStore();

  return (
    <div
      ref={mapRef}
      className={`w-full h-full bg-gray-200 ${interactionMode === 'addPoint' ? 'cursor-crosshair' : ''}`}
    />
  );
};

export default MapComponent;
