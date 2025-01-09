import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface PickUpDropOffMapsProps {
  geoJsonData?: any; // GeoJSON data for the pickup and dropoff locations
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const PickUpDropOffMaps: React.FC<PickUpDropOffMapsProps> = ({ geoJsonData }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]); // Store markers to update later

  // Function to adjust marker size based on zoom level
  const getMarkerSize = (zoom: number) => {
    const baseSize = 20; // Base size for the marker
    const zoomFactor = 1 + (zoom - 13) * 0.2; // Adjust the multiplier as necessary
    return baseSize * zoomFactor;
  };

  useEffect(() => {
    const nagaBounds: [number, number, number, number] = [
      123.0869253479996, 13.516429633633399,
      123.39814271303992, 13.714242556168118,
    ];

    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [123.2000, 13.6050],
      zoom: 13,
      maxBounds: nagaBounds,
    });

    map.current.on('load', () => {
      console.log('Raw GeoJSON Data:', geoJsonData);

      if (Array.isArray(geoJsonData)) {
        geoJsonData.forEach((location: any) => {
          // Add dot for start location
          if (location.start_location?.coordinates) {
            const [lng, lat] = location.start_location.coordinates;
            const dot = document.createElement('div');
            dot.className = 'dot';

            // Set initial size based on zoom level
            const initialSize = getMarkerSize(13); // Initial zoom level
            dot.style.width = `${initialSize}px`;
            dot.style.height = `${initialSize}px`;

            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = 'rgba(63, 177, 206, 0.5)'; // Blue with 50% transparency
            dot.style.border = '2px solid #2a99c2'; // Darker blue border
            dot.style.boxSizing = 'border-box';

            const marker = new mapboxgl.Marker({
              element: dot,
              anchor: 'center',
            })
              .setLngLat([lng, lat])
              .setPopup(new mapboxgl.Popup().setHTML('Pickup Location'))
              .addTo(map.current!);

            markers.current.push(marker);
          }

          // Add dot for end location
          if (location.end_location?.coordinates) {
            const [lng, lat] = location.end_location.coordinates;
            const dot = document.createElement('div');
            dot.className = 'dot';

            // Set initial size based on zoom level
            const initialSize = getMarkerSize(13); // Initial zoom level
            dot.style.width = `${initialSize}px`;
            dot.style.height = `${initialSize}px`;

            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = 'rgba(80, 200, 120, 0.5)'; // Green with 50% transparency
            dot.style.border = '2px solid #3da665'; // Darker green border
            dot.style.boxSizing = 'border-box';

            const marker = new mapboxgl.Marker({
              element: dot,
              anchor: 'center',
            })
              .setLngLat([lng, lat])
              .setPopup(new mapboxgl.Popup().setHTML('Dropoff Location'))
              .addTo(map.current!);

            markers.current.push(marker);
          }
        });
      } else {
        console.error('GeoJSON data is not in the expected format:', geoJsonData);
      }
    });

    // Update marker size on zoom change
    map.current.on('zoom', () => {
      const zoomLevel = map.current?.getZoom() || 13;
      markers.current.forEach((marker) => {
        const newSize = getMarkerSize(zoomLevel);
        const dot = marker.getElement();
        dot.style.width = `${newSize}px`;
        dot.style.height = `${newSize}px`;
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [geoJsonData]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
};

export default PickUpDropOffMaps;
