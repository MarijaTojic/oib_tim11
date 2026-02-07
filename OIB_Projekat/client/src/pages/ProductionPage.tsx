import React, { useEffect, useState } from "react";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { PlantDTO } from "../models/plants/PlantDTO";
import { PlantsTable } from "../components/plants/PlantsTable";
import { CreatePlantForm } from "../components/plants/CreatePlantForm";
import { useNavigate } from "react-router-dom";

type LogEntry = {
  timestamp: string;
  userOrSystem: string;
  action: string;
  status: "success" | "error";
  message: string;
};

type Props = {
  plantsAPI: IPlantAPI;
};

export const ProductionPage: React.FC<Props> = ({ plantsAPI }) => {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "logs">("list");
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Modal state ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"aroma" | "harvest" | null>(null);
  const [modalValue, setModalValue] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [selectedPlantName, setSelectedPlantName] = useState<string>("");

  const navigate = useNavigate();

  // --- Data loading ---
  const loadPlants = async () => {
    try {
      setLoading(true);
      const data = await plantsAPI.getAllPlants();
      setPlants(data);
      setError(null);
    } catch (err: any) {
      setError("Greška pri učitavanju biljaka: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${import.meta.env.VITE_GATEWAY_URL}/logs`);
    const data = await response.json();
    setLogs(data);
  } catch (err: any) {
    setError("Greška pri učitavanju dnevnika: " + err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (activeTab === "list") loadPlants();
  }, [activeTab]);

  const handleCreateSuccess = () => {
    loadPlants();
    setActiveTab("list");
  };

  // --- Modal open functions ---
  const openAromaModal = (id: number) => {
    setSelectedPlantId(id);
    setModalValue("");
    setModalType("aroma");
    setModalOpen(true);
  };

  const openHarvestModal = (name: string) => {
    setSelectedPlantName(name);
    setModalValue("");
    setModalType("harvest");
    setModalOpen(true);
  };

  return (
    <div className="overlay-blur-none" style={{ position: "fixed", inset: 0 }}>
      <div className="window" style={{ width: "960px", maxWidth: "95vw", margin: "20px auto" }}>
        <div className="titlebar">
          <span className="titlebar-title">Plant production</span>
        </div>

        <div className="window-content" style={{ padding: 0 }}>
          <div className="flex gap-2 p-4 bg-gray-100 border-b">
            <button
              className={`px-6 py-2 ${activeTab === "list" ? "bg-white font-bold" : "bg-gray-200"}`}
              onClick={() => setActiveTab("list")}
            >
              Current state
            </button>
            <button
              className={`px-6 py-2 ${activeTab === "create" ? "bg-white font-bold" : "bg-gray-200"}`}
              onClick={() => setActiveTab("create")}
            >
              Plant a new plant
            </button>
            <button
              className={`px-6 py-2 ${activeTab === "logs" ? "bg-white font-bold" : "bg-gray-200"}`}
              onClick={() => navigate("/production/logs")}
            >
              Production log
            </button>
            <button
              className="btn bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              onClick={() => navigate("/dashboard")} 
            >
              Back to dashboard
            </button>
          </div>

          <div style={{ padding: "24px" }}>
            {loading && <p className="text-center">Loading...</p>}
            {error && <p className="text-red-600 text-center">{error}</p>}

            {activeTab === "list" && (
              <div>
                <PlantsTable
                  plants={plants}
                  onChangeAroma={openAromaModal}
                  onHarvest={openHarvestModal}
                />
                <button className="btn mt-4" onClick={loadPlants}>
                  Refresh list
                </button>
              </div>
            )}

            {activeTab === "create" && (
              <CreatePlantForm plantsAPI={plantsAPI} onSuccess={handleCreateSuccess} />
            )}

            {activeTab === "logs" && (
              <div className="border rounded p-4 bg-white">
                <h3 className="text-lg font-bold mb-3">Production log</h3>
                {logs.length === 0 ? (
                  <p className="text-gray-500">No events recorded</p>
                ) : (
                  <ul className="space-y-3">
                    {logs.map((log, idx) => (
                      <li key={idx} className="border-b pb-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{log.timestamp}</span>
                          <span className={log.status === "success" ? "text-green-600" : "text-red-600"}>
                            {log.status === "success" ? "✓" : "✗"}
                          </span>
                        </div>
                        <div className="font-medium">
                          {log.userOrSystem}: {log.action}
                        </div>
                        <div className="text-sm text-gray-700">{log.message}</div>
                      </li>
                    ))}
                  </ul>
                )}
                <button className="btn mt-4" onClick={loadLogs}>
                  Refresh log
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-80">
            <h3 className="text-lg font-bold mb-2">
              {modalType === "aroma" ? "Change the aroma strength" : "Harvesting plants"}
            </h3>

            <input
              type="number"
              className="border p-2 w-full mb-4"
              placeholder={modalType === "aroma" ? "Percent change" : "Harvest quantity"}
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                className="btn bg-gray-300"
                onClick={() => setModalOpen(false)}
              >
                Cancle
              </button>
              <button
                className="btn bg-blue-500 text-white"
                onClick={async () => {
                  if (!modalValue || isNaN(Number(modalValue))) return;

                  try {
                    if (modalType === "aroma" && selectedPlantId !== null) {
                      await plantsAPI.changeAromaticOilStrength(
                        selectedPlantId,
                        Number(modalValue)
                      );
                      alert("Aroma strength successfully changed!");
                      loadPlants();
                    } else if (modalType === "harvest") {
                      await plantsAPI.harvestPlants(
                        selectedPlantName,
                        Number(modalValue)
                      );
                      alert("Harvest successful!!");
                      loadPlants();
                    }
                  } catch (err: any) {
                    alert("Error: " + err.message);
                  } finally {
                    setModalOpen(false);
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};