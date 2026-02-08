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

  const styles = {
    page: {
      padding: "24px",
      backgroundColor: "#f5f9ff",
      minHeight: "100vh",
    },
    title: {
      color: "#0d47a1",
      marginBottom: "24px",
    },
    card: {
      backgroundColor: "#ffffff",
      padding: "24px",
      borderRadius: "8px",
      maxWidth: "500px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    field: {
      marginBottom: "16px",
      display: "flex",
      flexDirection: "column" as const,
    },
    label: {
      marginBottom: "6px",
      color: "#0d47a1",
      fontWeight: 500,
    },
    input: {
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #bbdefb",
      outline: "none",
      backgroundColor: "#ffffff",
      color: "#0d47a1",
    },
    select: {
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #bbdefb",
      outline: "none",
      backgroundColor: "#ffffff",
      color: "#0d47a1",
    },
    primaryButton: {
      backgroundColor: "#1976d2",
      color: "#ffffff",
      padding: "10px 16px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginRight: "12px",
    },
    secondaryButton: {
      backgroundColor: "#ffffff",
      color: "#1976d2",
      padding: "10px 16px",
      border: "1px solid #1976d2",
      borderRadius: "4px",
      cursor: "pointer",
    },
  };

  return (
  <div style={styles.page}>
    <h2 style={styles.title}>Plant Processing</h2>

    <div style={styles.card}>
      <div style={styles.field}>
        <label style={styles.label}>Select perfume</label>
        <select
          style={styles.select}
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

      <div style={styles.field}>
        <label style={styles.label}>Quantity of bottles</label>
        <input
          style={styles.input}
          type="number"
          min={1}
          value={bottleCount}
          onChange={(e) => setBottleCount(Number(e.target.value))}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Volume of bottles</label>
        <select
          style={styles.select}
          value={bottleVolume}
          onChange={(e) => setBottleVolume(Number(e.target.value))}
        >
          <option value={150}>150 ml</option>
          <option value={250}>250 ml</option>
        </select>
      </div>

      <div>
        <button
          style={styles.primaryButton}
          onClick={async () => {
            if (selectedPerfume === null) {
              alert("Please select a perfume");
              return;
            }

            const perfumeObj = perfumes.find((p) => p.id === selectedPerfume);
            if (!perfumeObj) return;

            try {
              await perfumeAPI.plantProcessing(
                perfumeObj.plantId,
                bottleCount,
                bottleVolume,
                perfumeObj.type
              );
              alert("Processing completed!");
            } catch (err: any) {
              alert(err.message || "Something went wrong");
            }
          }}
        >
          Start processing
        </button>

        <button
          style={styles.secondaryButton}
          onClick={backToDashboard}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  </div>
);
}