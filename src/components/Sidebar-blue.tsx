import React from 'react';

interface SidebarProps {
  items: React.ReactNode[];
}

const SidebarBlue: React.FC<SidebarProps> = ({ items }) => {
  return (
    <div className="w-[50px] h-[2c00px] bg-gradient-to-b from-blue-400 to-blue-700 rounded-[20px] shadow-[0px_0px_15px_0px_rgba(0,0,0,0.20)] backdrop-blur-[5px] flex flex-col justify-center items-center">
      {items.map((item, index) => (
        <div
          key={index}
          className="self-stretch h-[50px] p-[3px] rounded-[8px] justify-center items-center gap-[10px] flex transition-colors duration-300 hover:bg-blue-300"
        >
          <div className="w-[20px] h-[20px] flex justify-center items-center overflow-hidden">
            {item}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SidebarBlue;
