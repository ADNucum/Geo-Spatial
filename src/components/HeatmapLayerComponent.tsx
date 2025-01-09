import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface HeatmapLayerComponentProps {
  geoJsonData: any; // GeoJSON data for the heatmap
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const HeatmapLayerComponent: React.FC<HeatmapLayerComponentProps> = ({ geoJsonData }) => {
  const mapContainer = React.useRef<HTMLDivElement | null>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const nagaBounds: [number, number, number, number] = [
      123.0869253479996, 13.516429633633399, // Southwest corner
      123.39814271303992, 13.714242556168118, // Northeast corner
    ];

    // Initialize the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [123.2000, 13.6050],
      zoom: 13,
      maxBounds: nagaBounds,
    });

    map.current.on('load', () => {
      // Add heatmap layer if GeoJSON data is provided
      if (geoJsonData) {
        map.current!.addSource('trips', {
          type: 'geojson',
          data: geoJsonData,
        });

        map.current!.addLayer({
          id: 'heatmap',
          type: 'heatmap',
          source: 'trips',
          paint: {
            // Heatmap weight based on 'count' field in GeoJSON
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'count'],  // Use the 'count' property for weight
              0, 0,               // No intensity for 0 trips
              50, 0.3,            // Low intensity for 50 trips
              75, 0.6,            // Medium intensity for 75 trips
              100, 1              // Maximum intensity for 100 trips
            ],
            
            // Heatmap intensity changes with zoom
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,  // At zoom level 0, use intensity 1
              15, 3   // At zoom level 15, use intensity 3
            ],
            
            // Color gradient for heatmap based on density
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(173,216,230,0)',     // Transparent for 0 trips
              0.2, 'rgb(135,206,250)',      // Light blue for low density
              0.4, 'rgb(100,149,237)',      // Medium blue for moderate density
              0.6, 'rgb(30,144,255)',       // Stronger blue for higher density
              0.8, 'rgb(0,0,255)',          // Dark blue for dense areas
              1, 'rgb(39,62,176)'           // Deep blue for maximum density
            ],
            
            // Radius of heatmap changes with zoom
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,   // Radius is small at zoom level 0
              15, 20  // Radius increases with zoom
            ],
            
            'heatmap-opacity': 0.8
          }
        });

        // Add markers for debugging purposes (optional)
        geoJsonData.features.forEach((feature: any) => {
          const [lng, lat] = feature.geometry.coordinates;
          const marker = document.createElement('div');
          marker.style.width = '10px';
          marker.style.height = '10px';
          marker.style.backgroundColor = '#231a75';
          marker.style.borderRadius = '50%';
          marker.style.cursor = 'pointer';

          new mapboxgl.Marker(marker).setLngLat([lng, lat]).addTo(map.current!);
        });
      }

      // Add heatmap legend
      const legend = document.createElement('div');
      legend.className = 'mapboxgl-legend';
      legend.innerHTML = `
        <div class="legend-title">Heatmap Legend</div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: rgb(135,206,250);"></span>
          <span>50 trips</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: rgb(100,149,237);"></span>
          <span>65 trips</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: rgb(30,144,255);"></span>
          <span>80 trips</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: rgb(0,0,255);"></span>
          <span>90 trips</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: rgb(39,62,176);"></span>
          <span>100+ trips</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="border-radius: 50%; width: 10px; height: 10px; background-color: #231a75;"></span>
          <span>Booking</span>
        </div>
      `;
      map.current!.getContainer().appendChild(legend);

      // Style the legend to ensure visibility and proper layout
      const style = document.createElement('style');
      style.innerHTML = `
        .mapboxgl-legend {
          position: absolute;
          top: 20px;
          left: 25%;
          background: #484657;
          color: white;
          font-size: 12px;
          border-radius: 5px;
          z-index: 1000;
          display: flex;
          flex-direction: row; /* Horizontal layout */
          gap: 10px;
          align-items: center;
          width: 45%;
          overflow-x: auto; /* Allows horizontal scrolling if needed */
        }
        .legend-title {
          font-weight: bold;
          margin-right: 10px;
          margin-left: 20px;
        }
        .legend-item {
          display: flex;
          align-items: center;
        }
        .legend-color {
          width: 20px;
          height: 20px;
          margin-right: 5px;
        }
      `;
      document.head.appendChild(style);
    });

    return () => {
      map.current?.remove();
    };
  }, [geoJsonData]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
};

export default HeatmapLayerComponent;
