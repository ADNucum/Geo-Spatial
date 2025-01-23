import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableRow, TableCell } from "@/components/ui/table"; 
import { supabase } from "../supabaseClient"; 
import { Button } from "@/components/ui/button"; 
import AddJeepModal from "@/components/AddJeepModal";
import { FaEdit, FaTrash } from "react-icons/fa"

interface Driver {
  mjeep_code: string;
  plate_number: string;
  seats: number;
  status: boolean;
  driver_name: string;
  driver_id: string;
}

interface JeepResponse {
  mjeep_code: string;
  plate_number: string;
  seats: number;
  status: boolean;
  driver_id: string;
  users: {
    name: string;
  } | null;
}

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<{ user_id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [editDriver, setEditDriver] = useState<Driver | null>(null); 

  // Fetch drivers data
  useEffect(() => {
    const fetchDrivers = async () => {
      const { data: driversData, error: driversError } = await supabase
        .from("users")
        .select("user_id, name")
        .eq("role_id", 2); 

      if (driversError) {
        console.error("Error fetching drivers:", driversError);
      } else {
        setAvailableDrivers(driversData || []);
      }

      const { data, error } = await supabase
        .from("modern_jeeps")
        .select(`
          mjeep_code,
          plate_number,
          seats,
          status,
          driver_id,
          users:driver_id(name)
        `);

      if (error) {
        console.error("Error fetching jeep data:", error);
      } else {
        const formattedData = data.map((item: any) => ({
          mjeep_code: item.mjeep_code,
          plate_number: item.plate_number,
          seats: item.seats,
          status: item.status,
          driver_name: item.users ? item.users.name : "No Driver",
          driver_id: item.driver_id,
        }));
        setDrivers(formattedData);
      }
    };

    fetchDrivers();
  }, []);

  const handleAddJeep = async (formData: any) => {
    const { mjeep_code, plate_number, seats, status, driver_id } = formData;

    const { data, error } = await supabase
      .from("modern_jeeps")
      .insert([{
        mjeep_code,
        plate_number,
        seats,
        status,
        driver_id,
      }])
      .select(`
        mjeep_code,
        plate_number,
        seats,
        status,
        driver_id,
        users:driver_id(name)
      `)
      .single() as { data: JeepResponse | null, error: any };

    if (error || !data) {
      console.error("Error adding jeep:", error);
    } else {
      // Add the new jeep to the state with proper driver name
      const newJeep = {
        mjeep_code: data.mjeep_code,
        plate_number: data.plate_number,
        seats: data.seats,
        status: data.status,
        driver_id: data.driver_id,
        driver_name: data.users?.name || "No Driver"
      };
      
      setDrivers(prevDrivers => [...prevDrivers, newJeep]);
      setIsModalOpen(false);
    }
  };

  const handleEdit = async (driver: Driver) => {
    // Fetch all drivers with role_id = 2
    const { data: allDrivers, error: driversError } = await supabase
      .from("users")
      .select("user_id, name")
      .eq("role_id", 2);

    if (driversError) {
      console.error("Error fetching drivers:", driversError);
      return;
    }

    // Fetch drivers that are already assigned to jeeps
    const { data: assignedDrivers, error: assignedError } = await supabase
      .from("modern_jeeps")
      .select("driver_id")
      .neq('driver_id', driver.driver_id); 

    if (assignedError) {
      console.error("Error fetching assigned drivers:", assignedError);
      return;
    }

    // Filter out assigned drivers, but keep the current driver
    const assignedDriverIds = assignedDrivers.map(jeep => jeep.driver_id);
    const availableDriversList = allDrivers.filter(
      d => !assignedDriverIds.includes(d.user_id) || d.user_id === driver.driver_id
    );

    setAvailableDrivers(availableDriversList);
    setEditDriver(driver);
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (formData: Driver) => {
    const { mjeep_code, plate_number, seats, driver_id } = formData;

    const { error } = await supabase
      .from("modern_jeeps")
      .update({ plate_number, seats, driver_id })
      .match({ mjeep_code });

    if (error) {
      console.error("Error updating jeep:", error);
    } else {
      setDrivers(prevDrivers =>
        prevDrivers.map(driver =>
          driver.mjeep_code === mjeep_code
            ? { ...driver, plate_number, seats, driver_id }
            : driver
        )
      );
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = async (mjeepCode: string) => {
    if (window.confirm("Are you sure you want to delete this jeep?")) {
      const { error } = await supabase
        .from("modern_jeeps")
        .delete()
        .match({ mjeep_code: mjeepCode });

      if (error) {
        console.error("Error deleting jeep:", error);
      } else {
        setDrivers(prevDrivers => prevDrivers.filter(driver => driver.mjeep_code !== mjeepCode));
      }
    }
  };

  return (
    <div className="container mx-auto px-4">

      <div className="flex justify-end p-4">
        <Button
          className="bg-zinc-900 text-white py-2 px-4 rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          Add Jeep
        </Button>
      </div>

      <div className="border rounded-md shadow-lg overflow-hidden">
  <Table className="w-full border-collapse">
    <TableHeader className="bg-teal-800 text-white">
      <TableRow>
        <TableCell className="font-semibold border border-teal-900 px-4 py-3 text-center">
          Type
        </TableCell>
        <TableCell className="font-semibold border border-teal-900 px-4 py-3 text-center">
          Plate Number
        </TableCell>
        <TableCell className="font-semibold border border-teal-900 px-4 py-3 text-center">
          Seats
        </TableCell>
        <TableCell className="font-semibold border border-teal-900 px-4 py-3 text-center">
          Status
        </TableCell>
        <TableCell className="font-semibold border border-teal-900 px-4 py-3 text-center">
          Driver
        </TableCell>
        <TableCell className="font-semibold border border-teal-900 px-4 py-3 text-center">
          Action
        </TableCell>
      </TableRow>
    </TableHeader>
    <tbody>
      {drivers.length === 0 ? (
        <tr>
          <td colSpan={6} className="text-center p-6 text-gray-600 italic">
            No drivers available
          </td>
        </tr>
      ) : (
        drivers.map((driver, index) => (
          <TableRow
            key={index}
            className="hover:bg-gray-100 transition duration-200"
          >
            <TableCell className="border border-gray-300 px-4 py-3 text-center">
              {driver.mjeep_code}
            </TableCell>
            <TableCell className="border border-gray-300 px-4 py-3 text-center">
              {driver.plate_number}
            </TableCell>
            <TableCell className="border border-gray-300 px-4 py-3 text-center">
              {driver.seats}
            </TableCell>
            <TableCell className="border border-gray-300 px-4 py-3 text-center">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  driver.status
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {driver.status ? "Active" : "Inactive"}
              </span>
            </TableCell>
            <TableCell className="border border-gray-300 px-4 py-3 text-center">
              {driver.driver_name}
            </TableCell>
            <TableCell className="border border-gray-300 px-4 py-3 text-center">
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handleEdit(driver)}
                  className="flex items-center px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-800 transition"
                >
                  <FaEdit className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(driver.mjeep_code)}
                  className="flex items-center px-3 py-1 rounded bg-red-600 text-white hover:bg-red-800 transition"
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))
      )}
    </tbody>
  </Table>
</div>

      <AddJeepModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddJeep} />

      {/* Edit Modal */}
      {isEditModalOpen && editDriver && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Edit Jeep</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editDriver) handleSubmitEdit(editDriver);
              }}
            >
              <div className="mb-4">
                <label htmlFor="plate_number" className="block text-sm font-medium">Plate Number</label>
                <input
                  type="text"
                  id="plate_number"
                  value={editDriver.plate_number}
                  onChange={(e) => setEditDriver({ ...editDriver, plate_number: e.target.value })}
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="seats" className="block text-sm font-medium">Seats</label>
                <input
                  type="number"
                  id="seats"
                  value={editDriver.seats}
                  onChange={(e) => setEditDriver({ ...editDriver, seats: Number(e.target.value) })}
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="driver_id" className="block text-sm font-medium">Driver</label>
                <select
                  id="driver_id"
                  value={editDriver.driver_id}
                  onChange={(e) => setEditDriver({ ...editDriver, driver_id: e.target.value })}
                  className="border p-2 w-full"
                >
                  {availableDrivers.map(driver => (
                    <option key={driver.user_id} value={driver.user_id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between">
                <Button type="button" onClick={() => setIsEditModalOpen(false)} variant="outline">
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 text-white">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
