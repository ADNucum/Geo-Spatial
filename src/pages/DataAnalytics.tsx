import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import { supabase } from "@/supabaseClient";
import TotalTripsBarChart from "../components/TotalTripsBarChart";

interface DataPoint {
  timestamp: string;
  passengers: number;
}

interface Location {
  start_location: {
    coordinates: [number, number];
  };
}

const DataAnalytics: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [timeUnit, setTimeUnit] = useState<"day" | "week">("day");
  const [activeJeeps, setActiveJeeps] = useState<number>(0);
  const [inactiveJeeps, setInactiveJeeps] = useState<number>(0);
  const [placeCounts, setPlaceCounts] = useState<Map<string, number>>(new Map());
  const [isExpanded, setIsExpanded] = useState<boolean>(true); 

  const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiYWRudWN1bSIsImEiOiJjbTU0d2d3M3kwbmdkMmpzZDlmcDV6c2tpIn0.xtX4hjSL9WBL475tR5ICFA";

  useEffect(() => {
    const fetchPassengerData = async () => {
      const { data: result, error } = await supabase.rpc("get_passenger_data", {
        interval_type: timeUnit,
      });

      if (error) {
        console.error("Error fetching passenger data:", error);
        return;
      }

      const mappedData = result.map((row: any) => ({
        timestamp: row.time_interval,
        passengers: row.passengers,
      }));

      setData(mappedData);
    };

    fetchPassengerData();
  }, [timeUnit]);

  useEffect(() => {
    const fetchJeepsCount = async () => {
      try {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("user_id")
          .eq("role_id", 2);

        if (usersError) {
          console.error("Error fetching users with role_id=2:", usersError);
          return;
        }

        const userIds = usersData.map((user) => user.user_id);

        const { data: activeData, error: activeError } = await supabase
          .from("modern_jeeps")
          .select("*")
          .eq("status", true)
          .in("driver_id", userIds);

        if (activeError) {
          console.error("Error fetching active jeepneys:", activeError);
          return;
        }

        const { data: totalData, error: totalError } = await supabase
          .from("modern_jeeps")
          .select("mjeep_id", { count: "exact" })
          .in("driver_id", userIds);

        if (totalError) {
          console.error("Error fetching total jeepneys:", totalError);
          return;
        }

        setActiveJeeps(activeData.length);
        setInactiveJeeps(totalData.length - activeData.length);
      } catch (error) {
        console.error("Error fetching jeepney data:", error);
      }
    };

    fetchJeepsCount();

    const activeJeepSubscription = supabase
      .channel("public:modern_jeeps")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "modern_jeeps" },
        (payload) => {
          if (payload.new.status !== payload.old.status) {
            fetchJeepsCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activeJeepSubscription);
    };
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase.rpc(
          "get_trip_locations_as_geojson"
        );
        if (error) throw error;

        const parsedLocations = data || [];
        const results = await Promise.all(
          parsedLocations.map(async (location: Location) => {
            const [longitude, latitude] = location.start_location.coordinates;
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;

            const response = await fetch(url);
            const json = await response.json();

            if (json.features && json.features.length > 0) {
              return json.features[0]?.place_name || "Place not found";
            }
            return "No address available";
          })
        );

        const placeMap = new Map<string, number>();
        results.forEach((place) => {
          placeMap.set(place, (placeMap.get(place) || 0) + 1);
        });

        setPlaceCounts(placeMap);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  const sortedPlaces = Array.from(placeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="relative flex justify-end items-center min-h-screen ">
      <Card className="w-full max-w-xs p-2 pl-9  bg-transparent border-0 z-10">
        <CardContent className="p-2 space-y-1">

          <div className="flex space-x-1">
            <div className="flex-1 bg-gray-50 rounded-lg shadow-md border border-green-500">
              <h3 className="text-center text-base font-bold bg-gradient-to-r from-green-500 to-green-200 text-stone-800 mb-2 p-2 rounded-t-lg">
                Active Jeeps
              </h3>
              <p className="text-center text-stone-800 text-xl font-semibold pb-5">
                {activeJeeps}
              </p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg shadow-md border border-red-500">
              <h3 className="text-center text-base font-bold bg-gradient-to-r from-red-500 to-red-200 text-stone-800 mb-2 p-2 rounded-t-lg">
                Inactive Jeeps
              </h3>
              <p className="text-center text-stone-800 text-xl font-semibold pb-5">
                {inactiveJeeps}
              </p>
            </div>
          </div>
          <div className="h-98">
            <TotalTripsBarChart />
          </div>
          <TimeSeriesChart
            data={data}
            timeUnit={timeUnit}
            onTimeUnitChange={setTimeUnit}
          />

          {/* Top 5 Pickup Places */}
          <div className="relative bg-gradient-to-r from-teal-500 to-teal-100 rounded-lg p-3 text-stone-800 border border-teal-500">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold">Top 5 Pickup Places</h3>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-stone-700 hover:text-stone-900"
              >
                {isExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 12h-15" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19.5v-15m7.5 7.5h-15" />
                  </svg>
                )}
              </button>
            </div>
            {isExpanded && (
              <ul
                className="absolute top-[-22px] right-full mr-0 w-[350%] h-[160%] rounded-lg p-2 flex space-x-2 text-xs z-50"
              >
                {sortedPlaces.slice(0, 5).map(([place], index) => (
                  <li
                    key={index}
                    className="bg-stone-50 border border-teal-500 text-stone-800 rounded-md px-2 py-1 pt-2 hover:bg-gray-400 flex-1 text-center"
                  >
                    {place || "Fetching..."}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataAnalytics;
