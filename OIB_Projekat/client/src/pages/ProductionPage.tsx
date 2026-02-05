import React, { useEffect, useState } from "react";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { PlantDTO } from "../models/plants/PlantDTO";
import { PlantsTable } from "../components/plants/PlantsTable";
import { CreatePlantForm } from "../components/plants/CreatePlantForm";

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
      const mockLogs: LogEntry[] = [
        {
          timestamp: "2026-02-04 21:35",
          userOrSystem: "Sistem (Processing)",
          action: "Zasađena nova biljka – Lavanda",
          status: "success",
          message: "Jačina nasumično postavljena na 3.87",
        },
        {
          timestamp: "2026-02-04 21:28",
          userOrSystem: "Marija",
          action: "Smanjena jačina za 20% na Menti",
          status: "success",
          message: "Nova jačina: 2.45",
        },
        {
          timestamp: "2026-02-04 21:15",
          userOrSystem: "Sistem",
          action: "Berba 10 biljaka Lavande",
          status: "error",
          message: "Nema dovoljno biljaka na lageru",
        },
      ];
      setLogs(mockLogs); 
      setError(null);
    } catch (err: any) {
      setError("Greška pri učitavanju dnevnika: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") loadPlants();
    if (activeTab === "logs") loadLogs();
  }, [activeTab]);

  const handleCreateSuccess = () => {
    loadPlants();
    setActiveTab("list");
  };

  const handleChangeAroma = async (id: number) => {
    const percentage = prompt("Unesite procenat promene (npr. 80 za 80%):");
    if (!percentage || isNaN(Number(percentage))) return;

    try {
      await plantsAPI.changeAromaticOilStrength(id, Number(percentage));
      alert("Jačina uspešno promenjena!");
      loadPlants();
    } catch (err: any) {
      alert("Greška: " + err.message);
    }
  };

  const handleHarvest = async (commonName: string) => {
    const qtyStr = prompt(`Koliko biljaka ${commonName} želite da uberete?`);
    const qty = Number(qtyStr);
    if (!qty || isNaN(qty) || qty <= 0) return;

    try {
      await plantsAPI.harvestPlants(commonName, qty);
      alert("Berba uspešna!");
      loadPlants();
    } catch (err: any) {
      alert("Greška pri berbi: " + err.message);
    }
  };

  return (
    <div className="overlay-blur-none" style={{ position: "fixed", inset: 0 }}>
      <div className="window" style={{ width: "960px", maxWidth: "95vw", margin: "20px auto" }}>
        <div className="titlebar">
          <span className="titlebar-title">Proizvodnja biljaka</span>
        </div>

        <div className="window-content" style={{ padding: 0 }}>
          <div className="flex gap-2 p-4 bg-gray-100 border-b">
            <button
              className={`px-6 py-2 ${activeTab === "list" ? "bg-white font-bold" : "bg-gray-200"}`}
              onClick={() => setActiveTab("list")}
            >
              Trenutno stanje
            </button>
            <button
              className={`px-6 py-2 ${activeTab === "create" ? "bg-white font-bold" : "bg-gray-200"}`}
              onClick={() => setActiveTab("create")}
            >
              Zasadi novu
            </button>
            <button
              className={`px-6 py-2 ${activeTab === "logs" ? "bg-white font-bold" : "bg-gray-200"}`}
              onClick={() => setActiveTab("logs")}
            >
              Dnevnik proizvodnje
            </button>
          </div>

          <div style={{ padding: "24px" }}>
            {loading && <p className="text-center">Učitavanje...</p>}
            {error && <p className="text-red-600 text-center">{error}</p>}

            {activeTab === "list" && (
              <div>
                <PlantsTable
                  plants={plants}
                  onChangeAroma={handleChangeAroma}
                  onHarvest={handleHarvest}
                />
                <button className="btn mt-4" onClick={loadPlants}>
                  Osveži listu
                </button>
              </div>
            )}

            {activeTab === "create" && (
              <CreatePlantForm plantsAPI={plantsAPI} onSuccess={handleCreateSuccess} />
            )}

            {activeTab === "logs" && (
              <div className="border rounded p-4 bg-white">
                <h3 className="text-lg font-bold mb-3">Dnevnik proizvodnje</h3>
                {logs.length === 0 ? (
                  <p className="text-gray-500">Nema zabeleženih događaja</p>
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
                  Osveži dnevnik
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};