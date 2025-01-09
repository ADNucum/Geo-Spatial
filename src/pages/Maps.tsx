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

interface Location {
  type: string;
  coordinates: [number, number];
  mjeep_id: number;
  driver_id: number;
  mjeep_code: string;
  plate_number: string;
  seats: number;
  status: boolean;
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
    }, 300), // Debounce delay to avoid too many updates
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
        }));

      updateLocations(formattedLocations);
    } catch (err) {
      console.error('Unexpected error fetching locations:', err);
    }
  };

  useEffect(() => {
    // Fetch locations initially
    fetchLocations();

    // Set up interval to fetch locations every 1 second
    const intervalId = setInterval(fetchLocations, 1000); // 1000ms = 1 second

    return () => {
      // Clean up the interval when the component is unmounted
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
        {/* Map View Selector */}
        <div className="absolute top-4 left-[10%] transform -translate-x-1/2 z-20">
          <Select
            value={mapView}
            onValueChange={(value: MapView) => setMapView(value)}
          >
            <SelectTrigger className="w-[100%] h-[30px] text-stone-100 border-sky-900 bg-sky-500">
              <SelectValue placeholder="Select map view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Map</SelectItem>
              <SelectItem value="heatmap">Heat Map</SelectItem>
              <SelectItem value="pickupdropoff">Pick Up & Drop Off</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderMap()}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Maps;