import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '../supabaseClient';

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

    // Initialize the map
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
      // Remove old markers before adding new ones
      const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
      existingMarkers.forEach(marker => marker.remove());

      // Add new markers
      locations
        .filter(location => location.status)
        .forEach(async location => {
          if (location.coordinates && Array.isArray(location.coordinates)) {
            // Fetch driver name from users table
            const { data: driverData, error: driverError } = await supabase
              .from('users')
              .select('name')
              .eq('user_id', location.driver_id)
              .single();

            if (driverError) {
              console.error(`Error fetching driver name for user_id ${location.driver_id}:`, driverError);
              return;
            }

            // Fetch jeep details
            const { data: jeepData, error: jeepError } = await supabase
              .from('modern_jeeps')
              .select('mjeep_code')
              .eq('mjeep_id', location.mjeep_id)
              .single();

            if (jeepError) {
              console.error(`Error fetching mjeep_code for mjeep_id ${location.mjeep_id}:`, jeepError);
              return;
            }

            const [lng, lat] = location.coordinates;
            const marker = new mapboxgl.Marker()
              .setLngLat([lng, lat])
              .addTo(map.current!);

            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div>
                  <strong>Driver: </strong>${driverData?.name || 'Unknown'}<br />
                  <strong>Type: </strong>${jeepData?.mjeep_code || 'Unknown'}<br />
                  <strong>Plate Number: </strong>${location.plate_number}<br />
                  <strong>Seats: </strong>${location.seats}<br />
                  <strong>Status: </strong>${location.status ? 'Active' : 'Inactive'}
                </div>
              `);

            marker.setPopup(popup);

            marker.getElement().addEventListener('click', () => {
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
