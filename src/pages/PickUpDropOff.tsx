import React, { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient'; 
import PickUpDropOffMaps from '@/components/PickUpDropOffMaps'; 
import MiniSidebar from '@/components/Mini-Sidebar'; 
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import DataAnalytics from './DataAnalytics'; 

const PickUpDropOff: React.FC = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    const fetchGeoJsonData = async () => {
      const { data, error } = await supabase.rpc('get_trip_locations_as_geojson');
      if (error) {
        console.error('Error fetching GeoJSON data:', error);
      } else {
        console.log('Fetched GeoJSON Data:', data);  
        setGeoJsonData(data);
      }
    };

    fetchGeoJsonData();
  }, []);

  return (
    <SidebarProvider>
      <div className="absolute top-0 left-0 z-10">
        <MiniSidebar />
      </div>

      <SidebarInset>
        <div className="h-screen w-full absolute top-0 left-0">
          {geoJsonData ? (
            <PickUpDropOffMaps geoJsonData={geoJsonData} />
          ) : (
            <p>Loading map...</p>
          )}
        </div>

        <div className="absolute top-30 right-1 z-20 w-full sm:w-96">
          <DataAnalytics />
        </div>



      </SidebarInset>
    </SidebarProvider>
  );
};

export default PickUpDropOff;
