import React, { useEffect, useState } from "react";
import { SalesAPI } from "../api/sale/SalesAPI";
import { CatalogueDTO } from "../models/catalogues/CatalogueDTO";
import { CatalogueTable } from "../components/catalogues/Sales";

type Props = {
  userId: number;
  onBackToDashboard: () => void;
};

export const SalesPage: React.FC<Props> = ({ userId, onBackToDashboard }) => {
  const [catalogue, setCatalogue] = useState<CatalogueDTO | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const salesAPI = new SalesAPI();

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
  }, []);

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

  return (
    <div style={{ padding: "24px" }}>
      <button onClick={onBackToDashboard} style={{ marginBottom: "16px" }}>
        ← Back to dashboard
      </button>

      <h2>Catalogue</h2>

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

            <button onClick={handleBuy} disabled={loading} style={{ marginTop: "16px" }}>
              {loading ? "Processing..." : "Buy"}
            </button>
          </div>
        </>
      ) : (
        <p>Loading catalogue...</p>
      )}
    </div>
  );
};
