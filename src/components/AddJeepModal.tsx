import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "../supabaseClient";

interface AddJeepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const AddJeepModal: React.FC<AddJeepModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    mjeep_code: "",
    plate_number: "",
    seats: 0,
    driver_id: "",
  });

  const [drivers, setDrivers] = useState<{ user_id: number, name: string }[]>([]);

  useEffect(() => {
    const fetchAvailableDrivers = async () => {
      // Fetch all drivers
      const { data: allDrivers, error: driversError } = await supabase
        .from("users")
        .select("user_id, name")
        .eq("role_id", 2); // Assuming role_id 2 is for drivers

      if (driversError) {
        console.error("Error fetching drivers:", driversError);
        return;
      }

      // Fetch drivers who already have a jeep assigned
      const { data: jeepsData, error: jeepsError } = await supabase
        .from("modern_jeeps")
        .select("driver_id");

      if (jeepsError) {
        console.error("Error fetching jeep assignments:", jeepsError);
        return;
      }

      // Get a list of driver IDs that are already assigned to a jeep
      const assignedDriverIds = jeepsData.map((jeep: any) => jeep.driver_id);

      // Filter out drivers who are already assigned to a jeep
      const availableDrivers = allDrivers.filter(
        (driver) => !assignedDriverIds.includes(driver.user_id)
      );

      setDrivers(availableDrivers);
    };

    if (isOpen) {
      fetchAvailableDrivers();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData); // Pass the form data to the parent component
    onClose(); // Close the modal after submitting
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-md p-6 w-full max-w-xl overflow-auto">
        <DialogTitle>Add New Jeep</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {/* Mjeep Code */}
          <div>
            <label htmlFor="mjeep_code" className="block text-sm font-semibold">Jeep Code</label>
            <input
              type="text"
              id="mjeep_code"
              name="mjeep_code"
              value={formData.mjeep_code}
              onChange={handleChange}
              className="w-full mt-2 p-2 border rounded"
              required
            />
          </div>

          {/* Plate Number */}
          <div>
            <label htmlFor="plate_number" className="block text-sm font-semibold">Plate Number</label>
            <input
              type="text"
              id="plate_number"
              name="plate_number"
              value={formData.plate_number}
              onChange={handleChange}
              className="w-full mt-2 p-2 border rounded"
              required
            />
          </div>

          {/* Seats and Driver */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="seats" className="block text-sm font-semibold">Seats</label>
              <input
                type="number"
                id="seats"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                className="w-full mt-2 p-2 border rounded"
                required
              />
            </div>

            <div className="w-1/2">
              <label htmlFor="driver_id" className="block text-sm font-semibold">Driver</label>
              <select
                id="driver_id"
                name="driver_id"
                value={formData.driver_id}
                onChange={handleChange}
                className="w-full mt-2 p-2 border rounded"
                required
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.user_id} value={driver.user_id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="mt-4 p-2 bg-red-500 text-white rounded">
              Close
            </button>
            <button type="submit" className="mt-4 p-2 bg-green-500 text-white rounded">
              Add Jeep
            </button>
          </div>
        </form>
      </DialogContent>
      <DialogClose />
    </Dialog>
  );
};

export default AddJeepModal;
