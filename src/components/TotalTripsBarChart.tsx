//Updated

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { supabase } from "@/supabaseClient";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TotalTripsData {
  week: string; // Week identifier (e.g., "2025-W01")
  total_trips: number; // Total trips in the week
}


const TotalTripsBarChart: React.FC = () => {
  const [totalTripsData, setTotalTripsData] = useState<TotalTripsData[]>([]);
  const [chartGradient, setChartGradient] = useState<CanvasGradient | null>(null);

  useEffect(() => {
    const fetchTotalTrips = async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("start_timestamp")
        .order("start_timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching total trips:", error);
        return;
      }

      // Always group by week
      const tripsByWeek = data.reduce((acc: Record<string, number>, trip: { start_timestamp: string }) => {
        const date = new Date(trip.start_timestamp);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = `Week ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        acc[weekKey] = (acc[weekKey] || 0) + 1;
        return acc;
      }, {});

      setTotalTripsData(
        Object.entries(tripsByWeek).map(([week, total_trips]) => ({
          week,
          total_trips,
        }))
      );
    };

    fetchTotalTrips();
  }, []);

  // Prepare the gradient color for the bars
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, "rgba(76, 131, 232, 1)"); // Start: Light blue
      gradient.addColorStop(1, "rgba(55, 102, 204, 1)"); // End: Darker blue
      setChartGradient(gradient);
    }
  }, []);

  // Prepare data for the bar chart
  const barChartData = {
    labels: totalTripsData.map((trip) => trip.week),
    datasets: [
      {
        label: "Total Trips",
        data: totalTripsData.map((trip) => trip.total_trips),
        backgroundColor: chartGradient || "rgba(76, 131, 232, 1)", // Apply the gradient if available, otherwise fallback to a solid color
        borderColor: "#3b6bcc", // Slightly darker border
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: "rgb(48, 47, 44)",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Weeks (Start Date)",
          color: "rgb(48, 47, 44)", // Color of the x-axis title
        },
        ticks: {
          color: "rgb(48, 47, 44)", // Color of the x-axis ticks
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Trips",
          color: "rgb(48, 47, 44)", // Color of the y-axis title
        },
        ticks: {
          color: "rgb(48, 47, 44)", // Color of the y-axis ticks
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-gray-200 shadow-md rounded-lg p-1 border border-gray-500">
      <h3 className="text-center text-lg font-semibold mb-4 text-stone-700">Total Trips Per Week</h3>
      <Bar data={barChartData} options={options} />
    </div>
  );
};

export default TotalTripsBarChart;
