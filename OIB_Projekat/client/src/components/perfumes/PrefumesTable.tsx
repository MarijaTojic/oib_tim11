import React from "react";
import { PerfumeDTO } from "../../models/perfumes/PerfumeDTO";
import { PerfumeType } from "../../enums/PerfumeType";

type Props = {
  perfumes: PerfumeDTO[];
};

export const PerfumesTable: React.FC<Props> = ({ perfumes }) => (
  <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Type</th>
        <th>Net Quantity (ml)</th>
        <th>Serial Number</th>
        <th>Plant ID</th>
        <th>Expiration Date</th>
      </tr>
    </thead>
    <tbody>
      {perfumes.map(p => (
        <tr key={p.id}>
          <td>{p.id}</td>
          <td>{p.name}</td>
          <td>{PerfumeType[p.type]}</td>
          <td>{p.netQuantity}</td>
          <td>{p.serialNumber}</td>
          <td>{p.plantId}</td>
          <td>{new Date(p.expirationDate).toLocaleDateString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
