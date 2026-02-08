import { useState } from "react";
import { IPlantAPI } from "../../api/plants/IPlantAPI";
import { PlantStatus } from "../../enums/PlantStatus";

type Props = {
  plantsAPI: IPlantAPI;
  onSuccess: () => void;
};

const styles = {
  card: {
    maxWidth: "520px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "1px solid #bbdefb",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  title: {
    color: "#0d47a1",
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "24px",
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
    padding: "8px 10px",
    borderRadius: "4px",
    border: "1px solid #bbdefb",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#0d47a1",
  },
  errorBox: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#e3f2fd",
    color: "#0d47a1",
    border: "1px solid #90caf9",
    borderRadius: "4px",
  },
  submitBtn: {
    width: "100%",
    backgroundColor: "#1976d2",
    color: "#ffffff",
    padding: "10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 500,
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  hint: {
    marginTop: "16px",
    fontSize: "13px",
    color: "#546e7a",
    textAlign: "center" as const,
  },
};

export const CreatePlantForm: React.FC<Props> = ({ plantsAPI, onSuccess }) => {
  const [form, setForm] = useState({
    commonName: "",
    latinName: "",
    countryOfOrigin: "",
    status: PlantStatus.PLANTED,
    aromaticOilStrength: 0,
    quantity: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.commonName.trim()) {
      setError("Common name je obavezan");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await plantsAPI.createPlant(form);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Greška pri kreiranju biljke");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Zasadi novu biljku</h3>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div>
        <div style={styles.field}>
          <label style={styles.label}>Common name *</label>
          <input
            style={styles.input}
            type="text"
            placeholder="npr. Lavanda"
            value={form.commonName}
            onChange={(e) => setForm({ ...form, commonName: e.target.value })}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Latin name</label>
          <input
            style={styles.input}
            type="text"
            placeholder="npr. Lavandula angustifolia"
            value={form.latinName}
            onChange={(e) => setForm({ ...form, latinName: e.target.value })}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Zemlja porekla</label>
          <input
            style={styles.input}
            type="text"
            placeholder="npr. Srbija"
            value={form.countryOfOrigin}
            onChange={(e) =>
              setForm({ ...form, countryOfOrigin: e.target.value })
            }
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...styles.submitBtn,
            ...(loading ? styles.submitBtnDisabled : {}),
          }}
        >
          {loading ? "Kreiranje..." : "Zasadi biljku"}
        </button>

        <p style={styles.hint}>
          Jačina aromatičnih ulja biće nasumično generisana (1.0 – 5.0)
        </p>
      </div>
    </div>
  );
};