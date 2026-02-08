import React from "react";
import { PerfumeDTO } from "../../models/perfumes/PerfumeDTO";
import { PerfumeType } from "../../enums/PerfumeType";

type Props = {
  perfumes: PerfumeDTO[];
};

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    backgroundColor: "#ffffff",
    border: "1px solid #bbdefb",
  },
  thead: {
    backgroundColor: "#e3f2fd",
  },
  th: {
    padding: "10px",
    textAlign: "left" as const,
    fontWeight: 600,
    color: "#0d47a1",
    borderBottom: "2px solid #bbdefb",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #e0e0e0",
    color: "#333",
  },
  empty: {
    textAlign: "center" as const,
    padding: "20px",
    color: "#777",
  },
};

export const PerfumesTable: React.FC<Props> = ({ perfumes }) => {
  return (
    <table style={styles.table}>
      <thead style={styles.thead}>
        <tr>
          <th style={styles.th}>ID</th>
          <th style={styles.th}>Name</th>
          <th style={styles.th}>Type</th>
          <th style={styles.th}>Net Quantity (ml)</th>
          <th style={styles.th}>Serial Number</th>
          <th style={styles.th}>Plant ID</th>
          <th style={styles.th}>Expiration Date</th>
        </tr>
      </thead>
      <tbody>
        {perfumes.length === 0 ? (
          <tr>
            <td colSpan={7} style={styles.empty}>
              No perfumes available
            </td>
          </tr>
        ) : (
          perfumes.map((p) => (
            <tr
              key={p.id}
              style={{ transition: "background-color 0.2s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f5f9ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ffffff")
              }
            >
              <td style={styles.td}>{p.id}</td>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>{PerfumeType[p.type]}</td>
              <td style={styles.td}>{p.netQuantity}</td>
              <td style={styles.td}>{p.serialNumber}</td>
              <td style={styles.td}>{p.plantId}</td>
              <td style={styles.td}>
                {new Date(p.expirationDate).toLocaleDateString()}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};