import React, { useEffect, useState } from "react";
//import { SalesAPI } from "../api/sale/SalesAPI";
import { CatalogueDTO } from "../models/catalogues/CatalogueDTO";
import { CatalogueTable } from "../components/catalogues/Sales";
import { useNavigate } from "react-router-dom";
import { ISalesAPI } from "../api/sale/ISalesAPI";

const styles = {
  page: { padding: "24px", backgroundColor: "#f5f9ff", minHeight: "100vh" },
  window: { maxWidth: "900px", margin: "0 auto", backgroundColor: "#fff" },
  titleBar: { backgroundColor: "#1976d2", color: "#fff", padding: "12px 20px", fontWeight: 600 },
  content: { padding: "24px" },
  table: { width: "100%", borderCollapse: "collapse" as const, marginTop: "12px" },
  th: { padding: "10px", textAlign: "left" as const, borderBottom: "2px solid #bbdefb" },
  td: { padding: "8px", borderBottom: "1px solid #e0e0e0" },
  input: { width: "70px", padding: "4px 6px" },
  btn: { marginTop: "16px", padding: "8px 16px", cursor: "pointer" },
  backBtn: { margin: "16px 24px", padding: "8px 16px", cursor: "pointer" },
  qrCode: { marginTop: "16px", maxWidth: "250px" },
};

type SalesPageProps = {
  userId: number;
  salesAPI: ISalesAPI;
};

export const SalesPage: React.FC<SalesPageProps> = ({ userId, salesAPI }) => {
  const [catalogue, setCatalogue] = useState<CatalogueDTO[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const navigate = useNavigate();
  //const salesAPI = new SalesAPI();

  useEffect(() => {
    const loadCatalogue = async () => {
      try {
        const data = await salesAPI.getCatalogue();
        setCatalogue(data);

        const q: Record<number, number> = {};
        data.forEach(p => { q[p.id] = 0; });
        setQuantities(q);
      } catch (err) {
        console.error(err);
        alert("Failed to load catalogue");
      }
    };
    loadCatalogue();
  }, []);

  const handleQuantityChange = (perfumeId: number, value: number) => {
    setQuantities(prev => ({ ...prev, [perfumeId]: value }));
  };

  const handleBuy = async () => {
    if (catalogue.length === 0) return;

    // Provera da li je bar jedan parfem izabran
    const totalSelected = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    if (totalSelected === 0) {
      alert("Select at least one perfume");
      return;
    }

    setLoading(true);
    try {
      const result = await salesAPI.sell(userId, quantities);

      if (result.success) {
        alert("Purchase successful!");
        if (result.qrCode) setQrCode(result.qrCode);

        const updatedCatalogue = await salesAPI.getCatalogue();
        setCatalogue(updatedCatalogue);

        const resetQty: Record<number, number> = {};
        updatedCatalogue.forEach(p => { resetQty[p.id] = 0; });
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

  const backToDashboard = () => navigate("/dashboard");

  return (
    <div style={styles.page}>
      <div style={styles.window}>
        <div style={styles.titleBar}>Sales</div>
        <div style={styles.content}>
          {catalogue.length > 0 ? (
            <>
              <CatalogueTable catalogue={catalogue} />
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Perfume</th>
                    <th style={styles.th}>Buy quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogue.map(p => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.perfume_name}</td>
                      <td style={styles.td}>
                        <input
                          type="number"
                          min={0}
                          value={quantities[p.id] || 0}
                          onChange={(e) => handleQuantityChange(p.id, Number(e.target.value))}
                          style={styles.input}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button style={styles.btn} onClick={handleBuy} disabled={loading}>
                {loading ? "Processing..." : "Buy"}
              </button>

              {qrCode && (
                <div>
                  <p>QR Code for your purchase:</p>
                  <img src={qrCode} alt="QR Code" style={styles.qrCode} />
                </div>
              )}
            </>
          ) : (
            <p>Loading catalogue...</p>
          )}
        </div>
        <button style={styles.backBtn} onClick={backToDashboard}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};
