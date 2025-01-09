"use client";

import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { supabase } from "@/supabaseClient"; // Import your Supabase client instance

// Registering required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const StatusChart = () => {
    const [chartData, setChartData] = useState({ successful: 0, cancelled: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { count: successfulCount, error: successError } = await supabase
                    .from("trips")
                    .select("id", { count: "exact", head: true })
                    .not("end_timestamp", "is", null);

                const { count: cancelledCount, error: cancelledError } = await supabase
                    .from("trips")
                    .select("id", { count: "exact", head: true })
                    .is("end_timestamp", "null");

                if (successError || cancelledError) {
                    console.error(successError || cancelledError);
                    return;
                }

                // Ensure data is valid
                setChartData({
                    successful: successfulCount || 0,
                    cancelled: cancelledCount || 0,
                });
            } catch (err) {
                console.error("Failed to fetch trip status data:", err);
            }
        };

        fetchData();
    }, []);

    const data = {
        labels: ["Successful", "Cancelled"],
        datasets: [
            {
                data: [chartData.successful, chartData.cancelled],
                backgroundColor: ["#000000", "#333333"],
                hoverBackgroundColor: ["#555555", "#777777"],
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            tooltip: { enabled: true },
        },
        aspectRatio: 1,
        maintainAspectRatio: false, // Allow resizing of the chart
    };

    const totalBookings = chartData.successful + chartData.cancelled; // Calculate the total bookings

    console.log("Chart Data:", chartData);  // Check the values

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <h3 className="text-lg font-semibold mb-4 ml-6 sm:text-xl md:text-2xl">Total Bookings</h3>
            <div className="flex justify-center w-full sm:w-[250px] md:w-[300px] lg:w-[350px]" style={{ height: '300px' }}>
                {/* Check if data exists before rendering */}
                {chartData.successful === 0 && chartData.cancelled === 0 ? (
                    <p>Loading data...</p>
                ) : (
                    <Pie data={data} options={options} height={300} width={300} />
                )}
            </div>
            <div className="mt-4 text-lg font-semibold">
                {/* Display Total Bookings */}
                Total Bookings: {totalBookings}
            </div>
        </div>
    );
};

export { StatusChart };
