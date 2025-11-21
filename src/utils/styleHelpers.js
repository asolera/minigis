import { Circle as CircleStyle, Fill, Stroke, Style, Icon, Text } from 'ol/style';

export const createLayerStyle = (layerStyle) => {
    if (!layerStyle) {
        // Default style
        return new Style({
            image: new CircleStyle({
                radius: 6,
                fill: new Fill({ color: '#3b82f6' }),
                stroke: new Stroke({ color: '#fff', width: 2 }),
            }),
            fill: new Fill({ color: 'rgba(59, 130, 246, 0.5)' }),
            stroke: new Stroke({ color: '#3b82f6', width: 2 }),
        });
    }

    const opacity = layerStyle.opacity !== undefined ? layerStyle.opacity : 1;

    // Helper to convert hex to rgba with opacity
    const hexToRgba = (hex, alpha) => {
        if (!hex) return `rgba(0,0,0,${alpha})`;
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
        return `rgba(${r},${g},${b},${alpha})`;
    };

    let imageStyle;
    if (layerStyle.iconType === 'icon' && layerStyle.iconUrl) {
        imageStyle = new Icon({
            src: layerStyle.iconUrl,
            scale: (layerStyle.radius || 6) / 10,
            color: layerStyle.color,
            opacity: opacity
        });
    } else {
        imageStyle = new CircleStyle({
            radius: layerStyle.radius || 6,
            fill: new Fill({ color: hexToRgba(layerStyle.color || '#3b82f6', opacity) }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
        });
    }

    return new Style({
        image: imageStyle,
        fill: new Fill({
            color: hexToRgba(layerStyle.fillColor || layerStyle.color || '#3b82f6', (layerStyle.fillOpacity !== undefined ? layerStyle.fillOpacity : 0.5) * opacity)
        }),
        stroke: new Stroke({
            color: hexToRgba(layerStyle.borderColor || layerStyle.color || '#3b82f6', opacity),
            width: 2
        }),
        text: layerStyle.labelField ? new Text({
            text: 'Label',
            font: '12px sans-serif',
            overflow: true,
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
            offsetY: layerStyle.iconType === 'icon' ? -15 : 0 // Offset only for points
        }) : undefined
    });
};

export const getFeatureStyle = (feature, layerStyle) => {
    const baseStyle = createLayerStyle(layerStyle);

    if (layerStyle && layerStyle.labelField) {
        const labelText = feature.get(layerStyle.labelField);
        if (baseStyle.getText()) {
            baseStyle.getText().setText(labelText ? String(labelText) : '');
        }
    }
    return baseStyle;
};
