import { useState } from "react";
import { IPlantAPI } from "../../api/plants/IPlantAPI";
import { PlantStatus } from "../../enums/PlantStatus";

type Props = {
  plantsAPI: IPlantAPI;
  onSuccess: () => void;
};

export const CreatePlantForm: React.FC<Props> = ({ plantsAPI, onSuccess }) => {
  const [form, setForm] = useState({
    id: 0,
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
    <div className="card max-w-lg mx-auto">
      <h3 className="text-xl font-bold mb-6">Zasadi novu biljku</h3>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Common name *</label>
          <input
            type="text"
            placeholder="npr. Lavanda"
            value={form.commonName}
            onChange={(e) => setForm({ ...form, commonName: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Latin name</label>
          <input
            type="text"
            placeholder="npr. Lavandula angustifolia"
            value={form.latinName}
            onChange={(e) => setForm({ ...form, latinName: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Zemlja porekla</label>
          <input
            type="text"
            placeholder="npr. Srbija"
            value={form.countryOfOrigin}
            onChange={(e) => setForm({ ...form, countryOfOrigin: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`btn-accent w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Kreiranje..." : "Zasadi biljku"}
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Jačina aromatičnih ulja biće nasumično generisana (1.0 – 5.0)
        </p>
      </div>
    </div>
  );
};