import React, { useEffect, useState } from "react";
import { ISalesAPI } from "../api/sale/ISalesAPI";
import { CatalogueDTO } from "../models/catalogues/CatalogueDTO";
import { CatalogueTable } from "../components/catalogues/Sales";
import { useNavigate } from "react-router-dom";

type Props = {
  salesAPI: ISalesAPI;
  userId: number;
};

export const SalesPage: React.FC<Props> = ({ salesAPI, userId }) => {
  const [catalogue, setCatalogue] = useState<CatalogueDTO | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadCatalogue = async () => {
      try {
        const data = await salesAPI.getCatalogue();
        setCatalogue(data);

        const q: Record<number, number> = {};
        data.allPerfumes.forEach(p => {
          if (p.id !== undefined) q[p.id] = 0;
        });
        setQuantities(q);
      } catch (err) {
        console.error(err);
        alert("Failed to load catalogue");
      }
    };

    loadCatalogue();
  }, [salesAPI]);

  const handleQuantityChange = (perfumeId: number, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [perfumeId]: value
    }));
  };

  const handleBuy = async () => {
    if (!catalogue) return;

    const selectedIds: number[] = [];
    Object.entries(quantities).forEach(([id, qty]) => {
      for (let i = 0; i < qty; i++) selectedIds.push(Number(id));
    });

    if (selectedIds.length === 0) {
      alert("Select at least one perfume");
      return;
    }

    setLoading(true);
    try {
      const result = await salesAPI.sell(userId, selectedIds);

      if (result.success) {
        alert("Purchase successful!");
        console.log("QR Code:", result.qrCode);

        const updatedCatalogue = await salesAPI.getCatalogue();
        setCatalogue(updatedCatalogue);

        const resetQty: Record<number, number> = {};
        updatedCatalogue.allPerfumes.forEach(p => {
          if (p.id !== undefined) resetQty[p.id] = 0;
        });
        setQuantities(resetQty);
      } else {
        alert(result.message || "Purchase failed");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const backToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="overlay-blur-none" style={{ position: "fixed" }}>
      <div className="window" style={{ width: "900px" }}>
        <div className="titlebar">
          <span className="titlebar-title">Sales</span>
        </div>

        <div className="window-content" style={{ padding: "24px" }}>
          {catalogue ? (
            <>
              <CatalogueTable catalogue={catalogue} />

              <div style={{ marginTop: "24px" }}>
                <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>Perfume</th>
                      <th>Buy quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogue.allPerfumes.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={quantities[p.id!] || 0}
                            onChange={(e) => handleQuantityChange(p.id!, Number(e.target.value))}
                            style={{ width: "70px" }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  onClick={handleBuy}
                  disabled={loading}
                  style={{ marginTop: "16px", padding: "8px 16px", cursor: "pointer" }}
                >
                  {loading ? "Processing..." : "Buy"}
                </button>
              </div>
            </>
          ) : (
            <p>Loading catalogue...</p>
          )}
        </div>

        <button
          onClick={backToDashboard}
          style={{ marginBottom: "16px", padding: "8px 16px", cursor: "pointer" }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};
