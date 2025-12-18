import { PlantDTO } from "../../models/plants/PlantDTO";

type Props = {
  plants: PlantDTO[];
};

export const PlantsTable: React.FC<Props> = ({ plants }) => (
  <table className="table" style={{ width: "100%" }}>
    <thead>
      <tr>
        <th>ID</th>
        <th>Common</th>
        <th>Latin</th>
        <th>Aroma</th>
        <th>Country</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {plants.map(p => (
        <tr key={p.id}>
          <td>{p.id}</td>
          <td>{p.commonName}</td>
          <td>{p.latinName}</td>
          <td>{p.aromaticOilStrength}</td>
          <td>{p.countryOfOrigin}</td>
          <td>{p.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
