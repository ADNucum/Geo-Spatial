import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface Location {
  type: string;
  coordinates: [number, number];
  mjeep_id: number;
  driver_id: number;
  mjeep_code: string;
  plate_number: string;
  seats: number;
  status: boolean;
  driver_name: string;
  jeep_type: string;
}

interface MapComponentProps {
  locations: Location[];
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MapComponent: React.FC<MapComponentProps> = ({ locations }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const nagaBounds: [number, number, number, number] = [
      123.0869253479996, 13.516429633633399, // Southwest corner
      123.39814271303992, 13.714242556168118, // Northeast corner
    ];

    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [123.2000, 13.6050],
      zoom: 13,
      maxBounds: nagaBounds,
    });

    map.current.on('load', () => {
      const navControl = new mapboxgl.NavigationControl({
        visualizePitch: true,
      });
      map.current!.addControl(navControl, 'top-left');
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (map.current && locations.length > 0) {
      // Remove old markers
      const existingMarkers = document.querySelectorAll('.custom-marker');
      existingMarkers.forEach(marker => marker.remove());

      // Add new markers
      locations
        .filter(location => location.status)
        .forEach(async location => {
          if (location.coordinates && Array.isArray(location.coordinates)) {
            const [lng, lat] = location.coordinates;

            // Create a custom HTML marker
            const markerElement = document.createElement('div');
            markerElement.className = 'custom-marker';
            markerElement.style.backgroundImage = `url('/busMarker.png')`; // Replace with your image path
            markerElement.style.width = '40px'; // Set custom size
            markerElement.style.height = '40px';
            markerElement.style.backgroundSize = 'cover';
            markerElement.style.borderRadius = '50%';

            const marker = new mapboxgl.Marker({
              element: markerElement,
            })
              .setLngLat([lng, lat])
              .addTo(map.current!);

            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div>
                  <strong>Type: </strong>${location.mjeep_code || 'Unknown'}<br />
                  <strong>Plate Number: </strong>${location.plate_number}<br />
                  <strong>Seats: </strong>${location.seats}<br />
                  <strong>Status: </strong>${location.status ? 'Active' : 'Inactive'}
                </div>
              `);

            marker.setPopup(popup);

            markerElement.addEventListener('click', () => {
              popup.addTo(map.current!);
            });
          }
        });
    }
  }, [locations]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapComponent;
