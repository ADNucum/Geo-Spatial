import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface PickUpDropOffMapsProps {
  geoJsonData?: any; 
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const PickUpDropOffMaps: React.FC<PickUpDropOffMapsProps> = ({ geoJsonData }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const getMarkerSize = (zoom: number) => {
    const baseSize = 20; 
    const zoomFactor = 1 + (zoom - 13) * 0.2; 
    return baseSize * zoomFactor;
  };

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
      console.log('Raw GeoJSON Data:', geoJsonData);

      if (Array.isArray(geoJsonData)) {
        geoJsonData.forEach((location: any) => {
          if (location.start_location?.coordinates) {
            const [lng, lat] = location.start_location.coordinates;
            const dot = document.createElement('div');
            dot.className = 'dot';

            const initialSize = getMarkerSize(13); 
            dot.style.width = `${initialSize}px`;
            dot.style.height = `${initialSize}px`;

            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = 'rgba(63, 177, 206, 0.5)'; 
            dot.style.border = '2px solid #2a99c2'; 
            dot.style.boxSizing = 'border-box';

            const marker = new mapboxgl.Marker({
              element: dot,
              anchor: 'center',
            })
              .setLngLat([lng, lat])
              .addTo(map.current!);

            markers.current.push(marker);
          }

          if (location.end_location?.coordinates) {
            const [lng, lat] = location.end_location.coordinates;
            const dot = document.createElement('div');
            dot.className = 'dot';

            const initialSize = getMarkerSize(13); 
            dot.style.width = `${initialSize}px`;
            dot.style.height = `${initialSize}px`;

            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = 'rgba(80, 200, 120, 0.5)'; 
            dot.style.border = '2px solid #3da665'; 
            dot.style.boxSizing = 'border-box';

            const marker = new mapboxgl.Marker({
              element: dot,
              anchor: 'center',
            })
              .setLngLat([lng, lat])
              .addTo(map.current!);

            markers.current.push(marker);
          }
        });
      } else {
        console.error('GeoJSON data is not in the expected format:', geoJsonData);
      }
    });

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

  return (
    <div style={{ position: 'relative', width: '100%', height: '112%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '90%' }} />
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0', fontSize: '11px' }}>Pickup & Dropoff Legend</h4>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div
            style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              backgroundColor: 'rgba(63, 177, 206, 0.5)',
              border: '2px solid #2a99c2',
              marginRight: '10px',
            }}
          ></div>
          <span className='text-xs'>Pickup Location</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              backgroundColor: 'rgba(80, 200, 120, 0.5)',
              border: '2px solid #3da665',
              marginRight: '10px',
            }}
          ></div>
          <span className='text-xs'>Dropoff Location</span>
        </div>
      </div>
    </div>
  );
};

export default PickUpDropOffMaps;
