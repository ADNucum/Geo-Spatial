"use client";

import { Line } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient"; // Make sure this is the correct import path
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const LineGraph = () => {
  const [tripsData, setTripsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchTripsData = async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('start_timestamp')
        .gte('start_timestamp', '2024-01-01')  // Optional: Adjust the date range
        .lte('start_timestamp', '2024-12-31'); // Optional: Adjust the date range

      if (error) {
        console.error('Error fetching trips data:', error);
      } else {
        setTripsData(data);
      }
    };

    fetchTripsData();
  }, []);

  // Process trips data to group by week or month
  const processTripsData = () => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]; // Adjust based on your needs
    const tripCounts = [0, 0, 0, 0]; // Count trips per week/month

    // Iterate through the trips and group by week (you can change this to month if needed)
    tripsData.forEach((trip: any) => {
      const startDate = new Date(trip.start_timestamp); // Parse the start timestamp
      const weekIndex = Math.floor(startDate.getDate() / 7); // Group by week (adjust logic if needed)
      tripCounts[weekIndex] += 1; // Increment count for that week
    });

    return {
      labels: weeks,
      datasets: [
        {
          label: "Total Trips",
          data: tripCounts,
          borderColor: "#000000", // Line color
          backgroundColor: "rgba(0, 0, 0, 0.2)", // Semi-transparent background
          tension: 0.4, // Smooth curve
        },
      ],
    };
  };

  const data = processTripsData();

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
      title: {
        display: true,
        text: "Total Trips Over the Past Weeks",
        font: {
          family: "'Inter', sans-serif",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Weeks", // Or "Months" if you want monthly grouping
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Trips",
        },
      },
    },
  };

  return (
    <Card className="w-full max-w-full mx-auto">
      <CardHeader>
        <CardTitle>Total Trips Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-5 pr-5">
        <div className="flex justify-center items-center" style={{ width: '100%', height: '350px' }}>
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};
