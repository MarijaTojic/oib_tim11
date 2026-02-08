import { PlantStatus } from "../../enums/PlantStatus";
import { PlantDTO } from "../../models/plants/PlantDTO";
import React from "react";

type Props = {
  plants: PlantDTO[];
  onChangeAroma: (id: number) => void;
  onHarvest: (commonName: string) => void;
};

const styles = {
  tableWrapper: {
    overflowX: "auto" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    backgroundColor: "#ffffff",
  },
  thead: {
    backgroundColor: "#1976d2",
  },
  th: {
    padding: "10px",
    textAlign: "left" as const,
    color: "#ffffff",
    fontWeight: 600,
    border: "1px solid #bbdefb",
    fontSize: "14px",
  },
  tr: {
    borderBottom: "1px solid #bbdefb",
  },
  td: {
    padding: "10px",
    color: "#0d47a1",
    border: "1px solid #bbdefb",
    fontSize: "14px",
  },
  empty: {
    textAlign: "center" as const,
    padding: "24px",
    color: "#546e7a",
  },
  strongRed: {
    color: "#d32f2f",
    fontWeight: 600,
  },
  statusBase: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
  },
  statusPlanted: {
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
  },
  statusProcessed: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  statusOther: {
    backgroundColor: "#eceff1",
    color: "#455a64",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  aromaBtn: {
    backgroundColor: "#1976d2",
    color: "#ffffff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  harvestBtn: {
    backgroundColor: "#ffffff",
    color: "#1976d2",
    border: "1px solid #1976d2",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export const PlantsTable: React.FC<Props> = ({
  plants,
  onChangeAroma,
  onHarvest,
}) => {
  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Common Name</th>
            <th style={styles.th}>Latin Name</th>
            <th style={styles.th}>Aromatic Oil Strength</th>
            <th style={styles.th}>Country of Origin</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {plants.length === 0 ? (
            <tr>
              <td colSpan={7} style={styles.empty}>
                No plants in production!
              </td>
            </tr>
          ) : (
            plants.map((p) => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>{p.id}</td>
                <td style={{ ...styles.td, fontWeight: 600 }}>
                  {p.commonName}
                </td>
                <td style={styles.td}>{p.latinName || "—"}</td>
                <td style={styles.td}>
                  <span
                    style={
                      p.aromaticOilStrength > 4
                        ? styles.strongRed
                        : undefined
                    }
                  >
                    {p.aromaticOilStrength.toFixed(2)}
                  </span>
                </td>
                <td style={styles.td}>{p.countryOfOrigin || "—"}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusBase,
                      ...(p.status === PlantStatus.PLANTED
                        ? styles.statusPlanted
                        : p.status === PlantStatus.PROCESSED
                        ? styles.statusProcessed
                        : styles.statusOther),
                    }}
                  >
                    {p.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button
                      style={styles.aromaBtn}
                      onClick={() => onChangeAroma(p.id!)}
                    >
                      Change aroma
                    </button>
                    <button
                      style={styles.harvestBtn}
                      onClick={() => onHarvest(p.commonName)}
                    >
                      Harvest
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};