import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLayerStore = create(
    persist(
        (set) => ({
            layers: [],
            selectedLayerId: null,
            selectedFeature: null,
            mapViewState: { center: null, zoom: null },
            zoomToLayerId: null,

            addLayer: (layer) => set((state) => ({
                layers: [...state.layers, layer],
                selectedLayerId: layer.id // Auto-select new layer
            })),

            removeLayer: (id) => set((state) => ({
                layers: state.layers.filter((l) => l.id !== id),
                selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId
            })),

            toggleLayerVisibility: (id) => set((state) => ({
                layers: state.layers.map((l) =>
                    l.id === id ? { ...l, visible: !l.visible } : l
                )
            })),

            reorderLayers: (newOrder) => set({ layers: newOrder }),

            moveLayerUp: (id) => set((state) => {
                const index = state.layers.findIndex(l => l.id === id);
                if (index <= 0) return state; // Already at top
                const newLayers = [...state.layers];
                [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
                return { layers: newLayers };
            }),

            moveLayerDown: (id) => set((state) => {
                const index = state.layers.findIndex(l => l.id === id);
                if (index === -1 || index === state.layers.length - 1) return state; // Already at bottom
                const newLayers = [...state.layers];
                [newLayers[index + 1], newLayers[index]] = [newLayers[index], newLayers[index + 1]];
                return { layers: newLayers };
            }),

            renameLayer: (id, newName) => set((state) => ({
                layers: state.layers.map((l) =>
                    l.id === id ? { ...l, name: newName } : l
                )
            })),

            setProjectState: (newState) => set({
                layers: newState.layers || [],
                selectedLayerId: null,
                selectedFeature: null,
                mapViewState: newState.mapViewState || { center: null, zoom: null }
            }),

            selectLayer: (id) => set({ selectedLayerId: id }),

            selectFeature: (feature) => set({ selectedFeature: feature }),

            setMapViewState: (viewState) => set({ mapViewState: viewState }),

            triggerZoomToLayer: (id) => set({ zoomToLayerId: id }),

            updateLayerStyle: (id, newStyle) => set((state) => ({
                layers: state.layers.map((l) =>
                    l.id === id ? { ...l, style: { ...l.style, ...newStyle } } : l
                )
            })),
        }),
        {
            name: 'minigis-storage', // unique name
            partialize: (state) => ({
                layers: state.layers,
                selectedLayerId: state.selectedLayerId,
                mapViewState: state.mapViewState
            }),
        }
    )
);

export default useLayerStore;
