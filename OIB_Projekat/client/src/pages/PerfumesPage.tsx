import React, {useState} from "react";
import { IPerfumeAPI } from "../api/perfume/IPerfumeAPI";
import { PerfumeDTO } from "../models/perfumes/PerfumeDTO";
import { PerfumesTable } from "../components/perfumes/PrefumesTable";

type Props = {
    perfumeAPI: IPerfumeAPI;
};

export const PerfumesPage: React.FC<Props> = ({perfumeAPI}) => {
    const[perfumes, setPerfumes] = useState<PerfumeDTO[]>([]);

    const loadPerfumes = async () => {
      const data = await perfumeAPI.getAllPerfumes();
        setPerfumes(data);
    };
    loadPerfumes();
     console.log(perfumes);
    return(
   <div className="overlay-blur-none" style={{ position: "fixed" }}>
      <div className="window" style={{ width: "900px" }}>
        <div className="titlebar">
          <span className="titlebar-title">Perfumes</span>
        </div>

        <div className="window-content" style={{ padding: "24px" }}>
          <PerfumesTable perfumes={perfumes} />
        </div>
      </div>
    </div>
    );
};