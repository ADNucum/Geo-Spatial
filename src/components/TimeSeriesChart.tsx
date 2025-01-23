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
  Filler, 
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler // Register the Filler plugin
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
  const preprocessData = (data: { timestamp: string; passengers: number }[]) =>
    data.map((point) => ({
      ...point,
      timestamp: new Date(point.timestamp).toISOString(),
    }));

  const filteredData = preprocessData(data).filter((point) => {
    const hour = new Date(point.timestamp).getHours();
    return hour >= 7 && hour <= 19;
  });

  const chartData = {
    labels: filteredData.map((point) => point.timestamp),
    datasets: [
      {
        data: filteredData.map((point) => point.passengers),
        borderColor: "rgba(75, 192, 192, 1)", 
        backgroundColor: "rgba(75, 192, 192, 0.4)", 
        fill: "origin", 
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
          color: "rgb(48, 47, 44)",
        },
        title: {
          display: true,
          text: "Time",
          color: "rgb(48, 47, 44)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "rgb(48, 47, 44)",
        },
        title: {
          display: true,
          text: "Passengers",
          color: "rgb(48, 47, 44)",
        },
      },
    },
  };

  return (
    <div className="p-4 border border-teal-500 rounded-lg shadow-lg bg-gray-100">
      <h2 className="text-center text-md font-semibold text-gray-800 mb-4">
        Passenger Volume Trends
      </h2>
      <div className="flex justify-center mb-6">
        <label htmlFor="timeUnit" className="text-stone-600 font-medium mr-2">
          Select Time Unit
        </label>
        <select
          id="timeUnit"
          value={timeUnit}
          onChange={(e) => onTimeUnitChange(e.target.value as "day" | "week")}
          className="border border-gray-400 bg-gray-200 rounded-md w-25 text-sm"
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
