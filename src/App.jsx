import React from 'react';
import LeftSidebar from './components/Sidebar/LeftSidebar';
import RightSidebar from './components/Sidebar/RightSidebar';
import MapComponent from './components/Map/MapComponent';
import useLayerStore from './store/useLayerStore';

function App() {
  const { selectedLayerId } = useLayerStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <LeftSidebar />

      <div className="flex-1 relative">
        <MapComponent />
      </div>

      {selectedLayerId && <RightSidebar />}
    </div>
  );
}

export default App;
