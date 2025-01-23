import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { FaStar } from "react-icons/fa";

interface Rating {
  rank: number;
  driver_name: string;
  mjeep_code: string;
  average_rating: number;
  feedbacks: string[];
}

const Ratings: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<Rating[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase.rpc("get_ratings_leaderboard");
      if (error) {
        console.error("Error fetching leaderboard:", error);
      } else {
        setLeaderboard(data);
      }
    };

    fetchLeaderboard();
  }, []);

  const toggleRow = (rank: number) => {
    setExpandedRow(expandedRow === rank ? null : rank);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6 pt-10 text-teal-600">Leaderboards</h1>
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gradient-to-r from-teal-500 to-teal-700 text-white">
              <th className="py-4 px-6 text-lg">Rank</th>
              <th className="py-4 px-6 text-lg">Driver Name</th>
              <th className="py-4 px-6 text-lg">Mjeep Code</th>
              <th className="py-4 px-6 text-lg">Average Rating</th>
              <th className="py-4 px-6 text-lg">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((item) => (
              <React.Fragment key={item.rank}>
                <tr className="hover:bg-teal-50">
                  <td className="py-4 px-6 text-center text-teal-700">{item.rank}</td>
                  <td className="py-4 px-6 font-medium text-gray-800">{item.driver_name}</td>
                  <td className="py-4 px-6 font-medium text-gray-800">{item.mjeep_code}</td>
                  <td className="py-4 px-6 text-center font-semibold text-teal-700 flex items-center justify-center gap-1">
                    {item.average_rating.toFixed(2)}
                    <FaStar className="text-yellow-400" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.feedbacks && item.feedbacks.length > 0 ? (
                      <button
                        onClick={() => toggleRow(item.rank)}
                        className="text-teal-600 hover:underline"
                      >
                        {expandedRow === item.rank ? "Hide Feedbacks" : "View Feedbacks"}
                      </button>
                    ) : (
                      <span className="text-gray-500 italic">No Feedback</span>
                    )}
                  </td>
                </tr>
                {expandedRow === item.rank && item.feedbacks && (
                  <tr>
                    <td colSpan={5} className="bg-gray-50 px-6 py-4">
                      <ul className="list-disc space-y-2 pl-8">
                        {item.feedbacks.map((feedback, index) => (
                          <li key={index} className="text-gray-700">
                            {feedback}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ratings;
