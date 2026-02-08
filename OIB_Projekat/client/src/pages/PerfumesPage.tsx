import React, { useEffect, useState } from "react";
import { IPerfumeAPI } from "../api/perfume/IPerfumeAPI";
import { PerfumeDTO } from "../models/perfumes/PerfumeDTO";
import { PerfumesTable } from "../components/perfumes/PrefumesTable";
import { useNavigate } from "react-router-dom";

type Props = {
  perfumeAPI: IPerfumeAPI;
};

const styles = {
  page: {
    padding: "24px",
    backgroundColor: "#f5f9ff",
    minHeight: "100vh",
  },
  window: {
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #bbdefb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  titleBar: {
    backgroundColor: "#1976d2",
    color: "#ffffff",
    padding: "12px 20px",
    fontSize: "18px",
    fontWeight: 600,
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
  },
  content: {
    padding: "24px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "0 24px 24px",
  },
  backBtn: {
    backgroundColor: "#ffffff",
    color: "#1976d2",
    border: "1px solid #1976d2",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export const PerfumesPage: React.FC<Props> = ({ perfumeAPI }) => {
  const [perfumes, setPerfumes] = useState<PerfumeDTO[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPerfumes = async () => {
      try {
        const perfumes = await perfumeAPI.getAllPerfumes();
        setPerfumes(perfumes);
      } catch (err) {
        console.error(err);
      }
    };

    loadPerfumes();
  }, []);

  const backToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div style={styles.page}>
      <div style={styles.window}>
        <div style={styles.titleBar}>Perfumes</div>

        <div style={styles.content}>
          <PerfumesTable perfumes={perfumes} />
        </div>

        <div style={styles.actions}>
          <button style={styles.backBtn} onClick={backToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};