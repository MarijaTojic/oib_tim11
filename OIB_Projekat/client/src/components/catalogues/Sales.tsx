import React from "react";
import { CatalogueDTO } from "../../models/catalogues/CatalogueDTO";

type Props = {
  catalogue: CatalogueDTO[];
};

export const CatalogueTable: React.FC<Props> = ({ catalogue }) => (
  <>
    <h3>Current Catalogue</h3>
    <table
      className="table"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        border: "1px solid #1976d2",
        marginBottom: "16px",
      }}
    >
      <thead>
        <tr>
          <th style={{ border: "1px solid #1976d2", padding: "8px" }}>ID</th>
          <th style={{ border: "1px solid #1976d2", padding: "8px" }}>Name</th>
          <th style={{ border: "1px solid #1976d2", padding: "8px" }}>Quantity</th>
        </tr>
      </thead>
      <tbody>
        {catalogue.map((p) => (
          <tr key={p.id}>
            <td style={{ border: "1px solid #1976d2", padding: "8px" }}>{p.id}</td>
            <td style={{ border: "1px solid #1976d2", padding: "8px" }}>{p.perfume_name}</td>
            <td style={{ border: "1px solid #1976d2", padding: "8px" }}>{p.perfume_quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);
