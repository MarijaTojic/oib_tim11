import React, {useEffect, useState} from "react";
import { IPerfumeAPI } from "../api/perfume/IPerfumeAPI";
import { PerfumeDTO } from "../models/perfumes/PerfumeDTO";
import { PerfumesTable } from "../components/perfumes/PrefumesTable";
import { useNavigate } from "react-router-dom";

type Props = {
    perfumeAPI: IPerfumeAPI;
};

export const PerfumesPage: React.FC<Props> = ({perfumeAPI}) => {
    const[perfumes, setPerfumes] = useState<PerfumeDTO[]>([]);
    const navigate = useNavigate();

   useEffect(() => {
    const loadPerfumes = async () => {
      try{
        const perfumes = await perfumeAPI.getAllPerfumes();
        setPerfumes(perfumes);
      }catch(err){
        console.error(err)
      }
    };

    loadPerfumes();
   }, []);

   const backToDashboard = () => {
      navigate("/dashboard");
   }

  return(
   <div className="overlay-blur-none" style={{ position: "fixed" }}>
      <div className="window" style={{ width: "900px" }}>
        <div className="titlebar">
          <span className="titlebar-title">Perfumes</span>
        </div>

        <div className="window-content" style={{ padding: "24px" }}>
          <PerfumesTable perfumes={perfumes} />
        </div>
        <button onClick={backToDashboard}
          style={{ marginBottom: "16px", padding: "8px 16px", cursor: "pointer" }}>
            Back to Dashboard
        </button>
      </div>
    </div>
  );
};