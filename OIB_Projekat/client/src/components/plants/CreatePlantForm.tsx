import { useState } from "react";
import { IPlantAPI } from "../../api/plants/IPlantAPI";
import { PlantStatus } from "../../enums/PlantStatus";

type Props = {
  plantsAPI: IPlantAPI;
  onSuccess: () => void;
};

export const CreatePlantForm: React.FC<Props> = ({ plantsAPI, onSuccess }) => {
  const [form, setForm] = useState({
    commonName: "",
    latinName: "",
    aromaticOilStrength: 1,
    countryOfOrigin: "",
    status: PlantStatus.PROCESSED
  });

  const submit = async () => {
    await plantsAPI.createPlant(form);
    onSuccess();
  };

  return (
    <div className="card">
      <h3>Create new plant</h3>

      <input
        placeholder="Common name"
        onChange={e => setForm({ ...form, commonName: e.target.value })}
      />

      <input
        placeholder="Latin name"
        onChange={e => setForm({ ...form, latinName: e.target.value })}
      />

      <input
        type="number"
        min={1}
        max={5}
        onChange={e =>
          setForm({ ...form, aromaticOilStrength: Number(e.target.value) })
        }
      />

      <input
        placeholder="Country of origin"
        onChange={e => setForm({ ...form, countryOfOrigin: e.target.value })}
      />

      <button className="btn-accent" onClick={submit}>
        Create
      </button>
    </div>
  );
};
