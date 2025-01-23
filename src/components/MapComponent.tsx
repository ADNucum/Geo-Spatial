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
      123.0869253479996, 13.516429633633399, 
      123.39814271303992, 13.714242556168118,
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
        showCompass: true
      });
      map.current!.addControl(navControl, 'top-left');

      const style = document.createElement('style');
      style.textContent = `
        .mapboxgl-ctrl-group {
          display: flex !important;
          flex-direction: row !important;
          background: none !important;
          box-shadow: none !important;
        }
        .mapboxgl-ctrl-group button {
          width: 40px !important;
          height: 40px !important;
          margin: 5px !important;
          background-color: #f9f9f9 !important;
          border: 1px solid #36b5b3 !important;
          border-radius: 4px !important;
          transition: all 0.2s ease !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background-color: #e6e6e6 !important;
          transform: scale(1.1) !important;
        }
        .mapboxgl-ctrl-group button:not(:disabled):hover {
          background-color: #e6e6e6 !important;
        }
        .mapboxgl-ctrl-compass {
          width: 40px !important;
          height: 40px !important;
        }
        .mapboxgl-ctrl-icon {
          background-position: center !important;
        }
      `;
      document.head.appendChild(style);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (map.current && locations.length > 0) {
      const existingMarkers = document.querySelectorAll('.custom-marker');
      existingMarkers.forEach(marker => marker.remove());

      locations
        .filter(location => location.status)
        .forEach(async location => {
          if (location.coordinates && Array.isArray(location.coordinates)) {
            const [lng, lat] = location.coordinates;

            const markerElement = document.createElement('div');
            markerElement.className = 'custom-marker';
            markerElement.style.backgroundImage = `url('/busMarker.png')`; 
            markerElement.style.width = '40px'; 
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
