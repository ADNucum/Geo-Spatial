import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Add this within your modal form
interface AddJeepModalProps {
  onClose: () => void;
}

const AddJeepModal: React.FC<AddJeepModalProps> = ({ onClose }) => {
  const [newJeep, setNewJeep] = useState({
    plateNumber: "",
    seats: 0,
    status: true,
    type: "",
    driverId: null as number | null,
  });
  const [drivers, setDrivers] = useState<any[]>([]); // Replace `any` with your actual driver type
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available drivers (user role "driver")
    const fetchDrivers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("user_id, name")
        .eq("role_id", 2); // Assuming 2 is the "driver" role ID in your system

      if (error) {
        console.error("Error fetching drivers:", error);
      } else if (data) {
        setDrivers(data);
      }
      setLoading(false);
    };

    fetchDrivers();
  }, []);

  const addJeep = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newJeep.driverId) {
      alert("Please select a driver.");
      return;
    }

    const { error } = await supabase.from("modern_jeeps").insert({
      mjeep_code: newJeep.type,
      plate_number: newJeep.plateNumber,
      seats: newJeep.seats,
      status: newJeep.status,
      driver_id: newJeep.driverId,
    });

    if (!error) {
      alert("Jeep added successfully");
      onClose(); // Close modal after success
    } else {
      console.error("Error adding jeep:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Add Jeep</h2>
        <form onSubmit={addJeep}>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Plate Number</label>
            <input
              type="text"
              className="border border-gray-300 rounded w-full p-2 mt-1"
              value={newJeep.plateNumber}
              onChange={(e) => setNewJeep({ ...newJeep, plateNumber: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Seats</label>
            <input
              type="number"
              className="border border-gray-300 rounded w-full p-2 mt-1"
              value={newJeep.seats}
              onChange={(e) => setNewJeep({ ...newJeep, seats: Number(e.target.value) })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Jeep Type</label>
            <input
              type="text"
              className="border border-gray-300 rounded w-full p-2 mt-1"
              value={newJeep.type}
              onChange={(e) => setNewJeep({ ...newJeep, type: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Select Driver</label>
            <select
              className="border border-gray-300 rounded w-full p-2 mt-1"
              value={newJeep.driverId ?? ""}
              onChange={(e) => setNewJeep({ ...newJeep, driverId: Number(e.target.value) })}
            >
              <option value="" disabled>Select a Driver</option>
              {drivers.map((driver) => (
                <option key={driver.user_id} value={driver.user_id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between mb-4">
            <label className="block text-sm font-semibold">Status</label>
            <input
              type="checkbox"
              checked={newJeep.status}
              onChange={() => setNewJeep({ ...newJeep, status: !newJeep.status })}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Add Jeep
          </button>
        </form>
        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AddJeepModal;
