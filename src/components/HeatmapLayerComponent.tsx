import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface HeatmapLayerComponentProps {
  geoJsonData: any;
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const HeatmapLayerComponent: React.FC<HeatmapLayerComponentProps> = ({ geoJsonData }) => {
  const mapContainer = React.useRef<HTMLDivElement | null>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const nagaBounds: [number, number, number, number] = [
      123.0869253479996, 13.516429633633399, 
      123.39814271303992, 13.714242556168118, 
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
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'count'],  
              0, 0,               
              50, 0.3,            
              75, 0.6,            
              100, 1              
            ],
            
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,  
              15, 3  
            ],
            
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(173,216,230,0)',     
              0.2, 'rgb(135,206,250)',      
              0.4, 'rgb(100,149,237)',      
              0.6, 'rgb(30,144,255)',       
              0.8, 'rgb(0,0,255)',          
              1, 'rgb(39,62,176)'           
            ],
            
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,   
              15, 20  
            ],
            
            'heatmap-opacity': 0.8
          }
        });

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

      const style = document.createElement('style');
      style.innerHTML = `
        .mapboxgl-legend {
          width: 110px;
          height: 170px;
          position: absolute;
          top: 10px;
          left: 20px; /* Move to the top-left corner */
          background: white; /* Teal-100 background color */
          color: #1d4044; /* Dark teal text for contrast */
          font-size: 10px;
          border-radius: 5px;
          z-index: 1000;
          display: flex;
          flex-direction: column; /* Stack items vertically */
          gap: 2px;
          padding: 10px; /* Add padding for spacing */
        }
        .legend-title {
          font-weight: bold;
        }
        .legend-item {
          display: flex;
          align-items: center;
        }
        .legend-color {
          width: 20px;
          height: 20px;
          margin-right: 10px; /* Add spacing between color and text */
          border-radius: 5px; /* Slightly rounded corners */
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
