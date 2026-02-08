import React, { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadCatalogue = async () => {
      try {
        const data = await salesAPI.getCatalogue();
        setCatalogue(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load catalogue");
      }
    };
    loadCatalogue();
  }, [salesAPI]);

  useEffect(() => { console.log("CATALOGUE FROM API:", catalogue); }, [catalogue]);

  const handleQuantityChange = (perfumeId: number, value: number) => {
    setCatalogue(prev =>
      prev.map(c => (c.id === perfumeId ? { ...c, perfume_quantity: value } : c))
    );
  };

  const handleBuy = async () => {
    if (catalogue.length === 0) return;

    // Provera da li je bar jedan parfem izabran (količina > 0)
    const totalSelected = catalogue.reduce((sum, c) => sum + c.perfume_quantity, 0);
    if (totalSelected === 0) {
      alert("Select at least one perfume");
      return;
    }

    setLoading(true);
    try {
      const quantities: Record<number, number> = {};
      catalogue.forEach(c => { if (c.perfume_quantity > 0) quantities[c.id] = c.perfume_quantity; });

      const result = await salesAPI.sell(userId, quantities);

      if (result.success) {
        alert("Purchase successful!");
        if (result.qrCode) setQrCode(result.qrCode);

        // Osveži katalog
        const updatedCatalogue = await salesAPI.getCatalogue();
        setCatalogue(updatedCatalogue);
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
                          value={p.perfume_quantity}
                          onChange={(e) =>
                            handleQuantityChange(p.id, Number(e.target.value))
                          }
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
