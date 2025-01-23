import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { supabase } from "@/supabaseClient";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions, ChartData } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TotalTripsData {
  week: string;
  total_trips: number;
}

const TotalTripsBarChart: React.FC = () => {
  const [totalTripsData, setTotalTripsData] = useState<TotalTripsData[]>([]);

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

      const tripsByWeek = data.reduce((acc: Record<string, number>, trip: { start_timestamp: string }) => {
        const date = new Date(trip.start_timestamp);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = `Week ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

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

  const createPattern = (ctx: CanvasRenderingContext2D, color: string): CanvasPattern | undefined => {
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 10;
    patternCanvas.height = 10;
    const patternCtx = patternCanvas.getContext("2d");

    if (patternCtx) {
      patternCtx.fillStyle = color;
      patternCtx.fillRect(0, 0, 10, 10);
      patternCtx.strokeStyle = "white";
      patternCtx.lineWidth = 2;
      patternCtx.moveTo(0, 0);
      patternCtx.lineTo(10, 10);
      patternCtx.stroke();
      return ctx.createPattern(patternCanvas, "repeat")!;
    }
    return undefined;
  };

  const barChartData: ChartData<"bar", number[], string> = {
    labels: totalTripsData.map((trip) => trip.week),
    datasets: [
      {
        label: "Total Trips",
        data: totalTripsData.map((trip) => trip.total_trips),
        backgroundColor: (context: any) => {
          const chartCtx = context.chart.ctx;
          const pattern = createPattern(chartCtx, "#22b5b0");
          return pattern || "#42f5bf"; 
        },
        borderColor: "#3b6bcc",
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
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
          color: "rgb(48, 47, 44)",
        },
        ticks: {
          color: "rgb(48, 47, 44)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Trips",
          color: "rgb(48, 47, 44)",
        },
        ticks: {
          color: "rgb(48, 47, 44)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-gray-100 shadow-md rounded-lg p-2 border border-teal-500">
      <h3 className="text-center text-lg font-semibold mb-4 text-stone-700">
        Total Trips Per Week
      </h3>
      <Bar data={barChartData} options={options} />
    </div>
  );
};

export default TotalTripsBarChart;
