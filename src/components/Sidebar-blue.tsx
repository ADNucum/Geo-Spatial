import React from "react";

interface SidebarProps {
  items: React.ReactNode[];
}

const SidebarBlue: React.FC<SidebarProps> = ({ items }) => {
  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col items-center space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="w-[50px] h-[50px] rounded-full bg-gradient-to-b from-teal-400 to-teal-600 shadow-[0px_0px_15px_0px_rgba(0,0,0,0.20)] flex justify-center items-center transition-transform duration-300 hover:scale-110 hover:shadow-md"
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default SidebarBlue;
