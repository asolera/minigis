# MiniGIS

MiniGIS is a lightweight, web-based Geographic Information System (GIS) application built with React and OpenLayers. It provides a user-friendly interface for visualizing, managing, and styling geospatial data directly in your browser.

**Official Tool URL:** [https://asolera.github.io/minigis](https://asolera.github.io/minigis)

## Features

### 🗺️ Map & Layer Management
- **Multi-Format Support**: Import GeoJSON and Shapefiles (zipped).
- **Layer Control**: Add, remove, rename, and toggle visibility of layers.
- **Reordering**: Drag and drop or use move up/down controls to change layer drawing order.
- **Zoom to Layer**: Quickly fit the map view to the extent of specific layers.

### 🎨 Styling & Visualization
- **Customizable Styles**: Adjust colors (fill/stroke), opacity, point radius, and border widths.
- **Icon Support**: Switch between simple point markers and icons (Pin, Marker, Red Dot).
- **Labeling**: Dynamically label features based on attribute data with flexible placement options (Top, Bottom, Center, etc.).

### 🛠️ Data Interaction
- **Feature Inspection**: Click on map features to view their attributes in the sidebar.
- **Attribute Table**: View all data for a layer in a tabular format.
- **Editing**: Add new point features interactively to vector layers.
- **Project Management**:
  - **Auto-Save**: Your work is automatically saved to local storage.
  - **Import/Export**: Save your project as a JSON file and restore it later.

## Tech Stack

- **Frontend Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Map Library**: [OpenLayers](https://openlayers.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Parsing**: [shpjs](https://github.com/calvinmetcalf/shapefile-js) (Shapefiles), [Papaparse](https://www.papaparse.com/) (CSV)

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/minigis.git
   cd minigis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

### Building for Production

Create a production-ready build:
```bash
npm run build
```
The output will be in the `dist` directory.

## Usage Guide

1. **Adding Layers**: Click the `+` button in the left sidebar to add a new layer. You can upload a file (GeoJSON/Shapefile) or create an empty layer.
2. **Managing Layers**:
   - Click the "Eye" icon to toggle visibility.
   - Right-click a layer in the list for a context menu (Zoom to Layer, Rename, Delete).
3. **Styling**: Click on a layer in the list to select it. The right sidebar will open, allowing you to change colors, opacity, and other style properties.
4. **Inspecting Data**: Click on any feature on the map to see its details in the right sidebar.

## License

This project is open source and available under the [MIT License](LICENSE).
