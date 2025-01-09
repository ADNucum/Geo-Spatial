import React, { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient'; // Import your Supabase client
import PickUpDropOffMaps from '@/components/PickUpDropOffMaps'; // Import the map component
import MiniSidebar from '@/components/Mini-Sidebar'; // Import MiniSidebar
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import DataAnalytics from './DataAnalytics'; // Import DataAnalytics component

const PickUpDropOff: React.FC = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    const fetchGeoJsonData = async () => {
      const { data, error } = await supabase.rpc('get_trip_locations_as_geojson');
      if (error) {
        console.error('Error fetching GeoJSON data:', error);
      } else {
        console.log('Fetched GeoJSON Data:', data);  // Log the fetched data to inspect its structure
        setGeoJsonData(data);
      }
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
            <PickUpDropOffMaps geoJsonData={geoJsonData} />
          ) : (
            <p>Loading map...</p>
          )}
        </div>

        {/* DataAnalytics Floating Above the Map */}
        <div className="absolute top-30 right-1 z-20 w-full sm:w-96">
          <DataAnalytics />
        </div>

        {/* Card on the Bottom Left */}
        <div className="h-10 border-2 border-gray-500 absolute bottom-5 left-5 z-30 text-white bg-gray-600 px-2 pt-1 shadow-lg rounded-md">
          <div className="flex space-x-6">
            <div className="flex items-center">
              <p className="mr-2">Pick-Up Spots</p>
              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
            </div>
            <div className="flex items-center">
              <p className="mr-2">Drop Off Spots</p>
              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>

      </SidebarInset>
    </SidebarProvider>
  );
};

export default PickUpDropOff;
