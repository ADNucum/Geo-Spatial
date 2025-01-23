import React, { useState } from "react";
import { FaMapMarkedAlt, FaUser, FaStar } from "react-icons/fa"; 
import { PiJeepFill } from "react-icons/pi";
import { Link } from "react-router-dom"; 
import SidebarBlue from "@/components/Sidebar-blue"; 

const MiniSidebar: React.FC = () => {
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isRatingsModalOpen, setIsRatingsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-10 ml-1">
        <SidebarBlue
          items={[
            <Link to="/maps" key="maps">
              <FaMapMarkedAlt size={20} className="text-white hover:text-blue-400" />
            </Link>, 
            <div key="drivers" onClick={() => setIsDriverModalOpen(true)} className="cursor-pointer">
              <PiJeepFill size={20} className="text-white hover:text-blue-400" />
            </div>, 
            <div key="account" onClick={() => setIsAccountModalOpen(true)} className="cursor-pointer">
              <FaUser size={20} className="text-white hover:text-blue-400" />
            </div>, 
            <div key="ratings" onClick={() => setIsRatingsModalOpen(true)} className="cursor-pointer">
              <FaStar size={20} className="text-white hover:text-blue-400" />
            </div>,
          ]}
        />
      </div>

 {/* Driver Modal */}
{isDriverModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
    <div
      className="bg-stone-50 rounded-lg border-2 border-teal-500 shadow-xl w-[80vw] h-[80vh] overflow-y-scroll relative"
      style={{
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
      }}
    >
      <style>
        {`
          .hidden-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari, and Edge */
          }
        `}
      </style>
      <div className="bg-teal-500 text-white text-lg font-bold px-6 py-3 rounded-t-lg sticky top-0 z-10 flex justify-between items-center">
        <span>Modern Jeep Management</span>
        <button
          onClick={() => setIsDriverModalOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-200 transition-colors shadow-md"
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
        className="w-full h-full border-none hidden-scrollbar"
        title="Driver Management"
      />
    </div>
  </div>
)}


      {/* Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <div className="bg-stone-50 border-2 border-teal-500 rounded-lg shadow-xl w-[80vw] h-[80vh] overflow-hidden relative">
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
            <iframe
              src="/account"
              className="w-full h-full border-none"
              title="Account Management"
            />
          </div>
        </div>
      )}

      {/* Ratings Modal */}
      {isRatingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <div className="bg-stone-50 border-2 border-teal-500 rounded-lg shadow-xl w-[80vw] h-[80vh] overflow-hidden relative">
            <button
              onClick={() => setIsRatingsModalOpen(false)}
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
            <iframe
              src="/ratings"
              className="w-full h-full border-none"
              title="Ratings"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MiniSidebar;
