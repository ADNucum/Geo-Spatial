import React, { useEffect, useState, useCallback } from 'react';
import MiniSidebar from '@/components/Mini-Sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import MapComponent from '@/components/MapComponent';
import { supabase } from '@/supabaseClient';
import './Maps.css';
import DataAnalytics from './DataAnalytics';
import debounce from 'lodash.debounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Heatmap from '@/pages/Heatmap';
import PickUpDropOff from '@/pages/PickUpDropOff';
import { FaMap, FaFire, FaMapMarkerAlt } from 'react-icons/fa';

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

type MapView = 'standard' | 'heatmap' | 'pickupdropoff';

const Maps: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [mapView, setMapView] = useState<MapView>('standard');

  const updateLocations = useCallback(
    debounce((newLocations: Location[]) => {
      setLocations((prevLocations) => {
        const isEqual =
          JSON.stringify(prevLocations) === JSON.stringify(newLocations);
        return isEqual ? prevLocations : newLocations;
      });
    }, 300),
    []
  );

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase.rpc('get_modern_jeep_locations_geojson');
      if (error) {
        console.error('Error fetching modern jeep locations:', error);
        return;
      }

      const formattedLocations: Location[] = (data as any[]).filter(item => item.location?.coordinates)
        .map(item => ({
          type: item.location.type,
          coordinates: item.location.coordinates,
          mjeep_id: item.mjeep_id,
          driver_id: item.driver_id,
          mjeep_code: item.mjeep_code,
          plate_number: item.plate_number,
          seats: item.seats,
          status: item.status,
          driver_name: item.driver_name,
          jeep_type: item.jeep_type,
        }));

      updateLocations(formattedLocations);
    } catch (err) {
      console.error('Unexpected error fetching locations:', err);
    }
  };

  useEffect(() => {
    fetchLocations();

    const intervalId = setInterval(fetchLocations, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [updateLocations]);

  const renderMap = () => {
    switch (mapView) {
      case 'heatmap':
        return <Heatmap />;
      case 'pickupdropoff':
        return <PickUpDropOff />;
      default:
        return (
          <>
            <div className="h-screen w-full absolute top-0 left-0">
              <MapComponent locations={locations} />
            </div>
            <div className="absolute top-30 right-1 z-20 w-full sm:w-96">
              <DataAnalytics />
            </div>
          </>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="absolute top-0 left-0 z-[9999]">
        <MiniSidebar />
      </div>

      <SidebarInset>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
      <Select
        value={mapView}
        onValueChange={(value: MapView) => setMapView(value)}
      >
        <SelectTrigger className="w-[200px] h-[40px] p-6 text-stone-900 border border-gray-200 rounded-xl shadow-md hover:bg-teal-100 focus:ring-2 focus:ring-teal-300 transition duration-200">
          <SelectValue placeholder="Select map view" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
          <SelectItem value="standard">
            <div className="flex items-center py-2 px-3 hover:bg-gray-100 rounded-lg">
              <FaMap className="mr-2 text-teal-600 text-lg" />
              <span className="text-gray-800 font-medium">Standard Map</span>
            </div>
          </SelectItem>
          <SelectItem value="heatmap">
            <div className="flex items-center py-2 px-3 hover:bg-gray-100 rounded-lg">
              <FaFire className="mr-2 text-red-600 text-lg" />
              <span className="text-gray-800 font-medium">Heat Map</span>
            </div>
          </SelectItem>
          <SelectItem value="pickupdropoff">
            <div className="flex items-center py-2 px-3 hover:bg-gray-100 rounded-lg">
              <FaMapMarkerAlt className="mr-2 text-blue-600 text-lg" />
              <span className="text-gray-800 font-medium text-xs">Pick Up & Drop Off</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

        {renderMap()}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Maps;
