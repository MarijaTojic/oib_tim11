import React, { useEffect, useState} from "react";
import { IPerfumeAPI } from "../api/perfume/IPerfumeAPI";
import { PerfumeDTO } from "../models/perfumes/PerfumeDTO";
import { useNavigate } from "react-router-dom";

type Props = {
    perfumeAPI: IPerfumeAPI;
}

export const ProcessingPage: React.FC<Props> = ({perfumeAPI}) => {
    const [perfumes, setPerfumes] = useState<PerfumeDTO[]>([]);
    const [selectedPerfume, setSelectedPerfume] = useState<number | null>(null);
    const [bottleCount, setBottleCount] = useState<number>(1);
    const [bottleVolume, setBottleVolume] = useState<number>(150);

    const navigate = useNavigate();

      useEffect(() => {
    const loadPerfumes = async () => {
      try {
        const data = await perfumeAPI.getAllPerfumes();
        setPerfumes(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadPerfumes();
  }, []);

  const backToDashboard = () => {
      navigate("/dashboard");
   }

  return (
    <div style={{ padding: "24px" }}>
      <h2>Plant Processing</h2>

      <div style={{ marginBottom: "16px" }}>
        <label>Select perfume:</label>
        <select
          value={selectedPerfume ?? ""}
          onChange={(e) => setSelectedPerfume(Number(e.target.value))}
        >
          <option value="">-- Select perfume --</option>
          {perfumes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label>Quantity of bottles:</label>
        <input
          type="number"
          min={1}
          value={bottleCount}
          onChange={(e) => setBottleCount(Number(e.target.value))}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label>Volume of bottles</label>
        <select
          value={bottleVolume}
          onChange={(e) => setBottleVolume(Number(e.target.value))}
        >
          <option value={150}>150 ml</option>
          <option value={250}>250 ml</option>
        </select>
      </div>

      <div>
        <button
          onClick={async () => {
            if (selectedPerfume === null) {
              alert("Please select a perfume");
              return;
            }

            const perfumeObj = perfumes.find((p) => p.id === selectedPerfume);
            if (!perfumeObj) return;

            try {
              const result = await perfumeAPI.plantProcessing(
                perfumeObj.plantId,
                bottleCount,
                bottleVolume,
                perfumeObj.type
              );  
              console.log("Processing result:", result);
              alert("Processing completed!");
            } catch (err: any) {
              console.error(err);
              alert(err.message || "Something went wrong");
            }
          }}
        >
          Start processing
        </button>

        <button onClick={backToDashboard}
          style={{ marginBottom: "16px", padding: "8px 16px", cursor: "pointer" }}>
            Back to Dashboard
        </button>
        
      </div>
    </div>
  );
}