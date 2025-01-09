import React, { useState } from "react";
import { FaMapMarkedAlt, FaUser } from "react-icons/fa"; // Import icons
import { PiJeepFill } from "react-icons/pi";
import { Link } from "react-router-dom"; // Import Link for navigation
import SidebarBlue from "@/components/Sidebar-blue"; // Import your Sidebar component

const MiniSidebar: React.FC = () => {
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  return (
    <>
      <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-10 ml-5">
        <SidebarBlue
          items={[
            <Link to="/maps">
              <FaMapMarkedAlt size={20} className="text-white hover:text-blue-400" />
            </Link>, // Map icon - navigates to /map
            <div onClick={() => setIsDriverModalOpen(true)} className="cursor-pointer">
              <PiJeepFill size={20} className="text-white hover:text-blue-400" />
            </div>, // Jeep icon - navigates to /jeep
            <div onClick={() => setIsAccountModalOpen(true)} className="cursor-pointer">
              <FaUser size={20} className="text-white hover:text-blue-400" />
            </div>, // User icon - navigates to /profile
          ]}
        />
      </div>

      {/* Driver Modal */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <div className="bg-stone-50 p-6 rounded-lg shadow-xl w-[80vw] h-[80vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsDriverModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <iframe
              src="/drivers"
              className="w-full h-full border-none"
              title="Driver Management"
            />
          </div>
        </div>
      )}

      {/* Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <div className="bg-stone-50 rounded-lg shadow-xl w-[80vw] h-[80vh] overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <iframe
              src="/account"
              className="w-full h-full border-none"
              title="Account Management"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MiniSidebar;
