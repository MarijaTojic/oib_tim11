import React from "react";
import { CatalogueDTO } from "../../models/catalogues/CatalogueDTO";

type Props = {
  catalogue: CatalogueDTO[];
};

export const CatalogueTable: React.FC<Props> = ({ catalogue }) => (
  <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Quantity</th>
      </tr>
    </thead>
    <tbody>
      {catalogue.map((p) => (
        <tr key={p.id}>
          <td>{p.id}</td>
          <td>{p.perfume_name}</td>
          <td>{p.perfume_quantity}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
