import React, { useEffect, useState } from "react";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { PlantDTO } from "../models/plants/PlantDTO";
import { PlantsTable } from "../components/plants/PlantsTable";
import { CreatePlantForm } from "../components/plants/CreatePlantForm";

type Props = {
  plantsAPI: IPlantAPI;
};

export const ProductionPage: React.FC<Props> = ({ plantsAPI }) => {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [plants, setPlants] = useState<PlantDTO[]>([]);

  const loadPlants = async () => {
    setPlants(await plantsAPI.getAllPlants());
  };

  useEffect(() => {
    loadPlants();
  }, []);

  return (
    <div className="overlay-blur-none" style={{ position: "fixed" }}>
      <div className="window" style={{ width: "900px" }}>
        <div className="titlebar">
          <span className="titlebar-title">Plants production</span>
        </div>

        <div className="window-content" style={{ padding: 0 }}>
          <div className="flex">
            <button onClick={() => setActiveTab("list")}>Plants</button>
            <button onClick={() => setActiveTab("create")}>Create</button>
          </div>

          <div style={{ padding: "24px" }}>
            {activeTab === "list" ? (
              <PlantsTable plants={plants} />
            ) : (
              <CreatePlantForm
                plantsAPI={plantsAPI}
                onSuccess={() => {
                  loadPlants();
                  setActiveTab("list");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
