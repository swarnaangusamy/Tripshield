import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapPage(){
  const center = [11.0168, 76.9558]; // Coimbatore default
  return (
    <div className="glass p-4 rounded">
      <h2 className="text-lg font-semibold">Map — Nearby Help Centers</h2>
      <div className="h-[60vh] mt-2">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={center}>
            <Popup>Default location (Coimbatore)</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
