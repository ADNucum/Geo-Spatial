import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface TimeSeriesChartProps {
  data: { timestamp: string; passengers: number }[];
  timeUnit: "day" | "week";
  onTimeUnitChange: (timeUnit: "day" | "week") => void;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  timeUnit,
  onTimeUnitChange,
}) => {
  // Preprocess timestamps to ISO 8601 format
  const preprocessData = (data: { timestamp: string; passengers: number }[]) =>
    data.map((point) => ({
      ...point,
      timestamp: new Date(point.timestamp).toISOString(), // Convert to ISO 8601
    }));

  // Filter data to include timestamps only from 7 AM to 7 PM
  const filteredData = preprocessData(data).filter((point) => {
    const hour = new Date(point.timestamp).getHours();
    return hour >= 7 && hour <= 19; // Only include data from 7 AM to 7 PM
  });

  const chartData = {
    labels: filteredData.map((point) => point.timestamp),
    datasets: [
      {
        data: filteredData.map((point) => point.passengers),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: timeUnit,
          displayFormats: {
            day: "MMM d",
            week: "'Week' w",
          },
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6,
          color: "rgb(203, 213, 225)",
        },
        title: {
          display: true,
          text: "Time",
          color: "rgb(203, 213, 225)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "rgb(203, 213, 225)",
        },
        title: {
          display: true,
          text: "Passengers",
          color: "rgb(203, 213, 225)",
        },
      },
    },
  };

  return (
    <div className="p-4 border border-gray-500 rounded-lg shadow-lg bg-gray-700">
      <h2 className="text-center text-md font-semibold text-gray-200 mb-4">
        Passenger Volume Trends
      </h2>
      {/* Time Unit Selector */}
      <div className="flex justify-center mb-6">
        <label htmlFor="timeUnit" className="text-stone-200 font-medium mr-2">
          Select Time Unit
        </label>
        <select
          id="timeUnit"
          value={timeUnit}
          onChange={(e) => onTimeUnitChange(e.target.value as "day" | "week")}
          className="border border-gray-400 bg-gray-400 rounded-md w-25 text-sm"
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
        </select>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TimeSeriesChart;
