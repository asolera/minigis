import { create } from 'zustand';

const useLayerStore = create((set) => ({
    layers: [],
    selectedLayerId: null,
    selectedFeature: null,

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

    selectLayer: (id) => set({ selectedLayerId: id }),

    selectFeature: (feature) => set({ selectedFeature: feature }),

    updateLayerStyle: (id, newStyle) => set((state) => ({
        layers: state.layers.map((l) =>
            l.id === id ? { ...l, style: { ...l.style, ...newStyle } } : l
        )
    })),
}));

export default useLayerStore;
