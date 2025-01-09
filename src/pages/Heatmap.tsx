import React, { useEffect, useState } from 'react';
import MiniSidebar from '@/components/Mini-Sidebar'; // Import your Mini-Sidebar
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import HeatmapLayerComponent from '@/components/HeatmapLayerComponent'; // Import your HeatmapLayerComponent
import { supabase } from '@/supabaseClient';
import DataAnalytics from './DataAnalytics'; // Import DataAnalytics component
import './Maps.css';

const Heatmap: React.FC = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    const fetchGeoJsonData = async () => {
      const { data, error } = await supabase.rpc('get_trip_locations_as_geojson');
      if (error) {
        console.error('Error fetching GeoJSON data:', error);
        return;
      }

      // Format GeoJSON data for the heatmap
      const features = data.map((item: any) => ({
        type: 'Feature',
        geometry: item.start_location, // Assuming start_location is the focus
        properties: { end_location: item.end_location },
      }));
      setGeoJsonData({ type: 'FeatureCollection', features });
    };

    fetchGeoJsonData();
  }, []);

  return (
    <SidebarProvider>
      {/* Sidebar Floating Above the Map */}
      <div className="absolute top-0 left-0 z-10">
        <MiniSidebar />
      </div>

      <SidebarInset>
        {/* Map takes up full width and height */}
        <div className="h-screen w-full absolute top-0 left-0">
          {geoJsonData ? (
            <HeatmapLayerComponent geoJsonData={geoJsonData} />
          ) : (
            <p>Loading map data...</p>
          )}
        </div>

        {/* DataAnalytics Floating Above the Map */}
        <div className="absolute top-30 right-1 z-20 w-full sm:w-96">
          <DataAnalytics />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Heatmap;
