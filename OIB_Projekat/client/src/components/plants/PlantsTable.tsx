import { PlantStatus } from "../../enums/PlantStatus";
import { PlantDTO } from "../../models/plants/PlantDTO";

type Props = {
  plants: PlantDTO[];
  onChangeAroma: (id: number) => void;
  onHarvest: (commonName: string) => void;
};

export const PlantsTable: React.FC<Props> = ({ plants, onChangeAroma, onHarvest }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Common Name</th>
            <th className="p-3 text-left">Latin Name</th>
            <th className="p-3 text-left">Aromatic Oil Strength</th>
            <th className="p-3 text-left">Country of Origin</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {plants.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center p-6 text-gray-500">
                Nema biljaka u proizvodnji
              </td>
            </tr>
          ) : (
            plants.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{p.id}</td>
                <td className="p-3 font-medium">{p.commonName}</td>
                <td className="p-3">{p.latinName || "—"}</td>
                <td className="p-3">
                  <span className={p.aromaticOilStrength > 4 ? "text-red-600 font-bold" : ""}>
                    {p.aromaticOilStrength.toFixed(2)}
                  </span>
                </td>
                <td className="p-3">{p.countryOfOrigin || "—"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      p.status === PlantStatus.PLANTED
                        ? "bg-green-100 text-green-800"
                        : p.status === PlantStatus.PROCESSED
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => onChangeAroma(p.id!)}
                    className="btn-small bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Promeni jačinu
                  </button>
                  <button
                    onClick={() => onHarvest(p.commonName)}
                    className="btn-small bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Beri
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};