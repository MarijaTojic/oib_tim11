import React, { useEffect, useState } from "react";
import { CatalogueDTO } from "../models/catalogues/CatalogueDTO";
import { useNavigate } from "react-router-dom";
import { ISalesAPI } from "../api/sale/ISalesAPI";

const styles = {
  page: { padding: "24px", backgroundColor: "#f5f9ff", minHeight: "100vh" },
  window: { maxWidth: "900px", margin: "0 auto", backgroundColor: "#fff" },
  titleBar: { backgroundColor: "#1976d2", color: "#fff", padding: "12px 20px", fontWeight: 600 },
  content: { color: "#000000", padding: "24px" },
  table: { width: "100%", borderCollapse: "collapse" as const, marginTop: "12px" },
  th: { padding: "10px", textAlign: "left" as const, borderBottom: "2px solid #bbdefb" },
  td: { padding: "8px", borderBottom: "1px solid #e0e0e0" },
  input: { width: "70px", padding: "4px 6px" },
  btn: { marginTop: "16px", padding: "8px 16px", cursor: "pointer" },
  backBtn: { margin: "16px 24px", padding: "8px 16px", cursor: "pointer" },
  qrCode: { marginTop: "16px", maxWidth: "250px" },
};

type CatalogueUI = CatalogueDTO & {
  selectedQuantity: number; 
};

type SalesPageProps = {
  userId: number;
  salesAPI: ISalesAPI;
};

export const SalesPage: React.FC<SalesPageProps> = ({ userId, salesAPI }) => {
  const [catalogue, setCatalogue] = useState<CatalogueUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadCatalogue = async () => {
      try {
        const data = await salesAPI.getCatalogue();

        setCatalogue(
          data.map((p) => ({
            ...p,
            selectedQuantity: 0, 
          }))
        );
      } catch (err) {
        console.error(err);
        alert("Failed to load catalogue");
      }
    };

    loadCatalogue();
  }, [salesAPI]);

  const handleQuantityChange = (id: number, value: number) => {
    setCatalogue((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, selectedQuantity: value } : c
      )
    );
  };

  const handleBuy = async () => {
    const totalSelected = catalogue.reduce(
      (sum, c) => sum + c.selectedQuantity,
      0
    );

    if (totalSelected === 0) {
      alert("Select at least one perfume");
      return;
    }

    setLoading(true);

    try {
      const quantities: Record<number, number> = {};

      catalogue.forEach((c) => {
        if (c.selectedQuantity > 0) {
          quantities[c.id] = c.selectedQuantity;
        }
      });

      const result = await salesAPI.sell(userId, quantities);

      if (!result.success) {
        alert(result.message || "Purchase failed");
        return;
      }

      alert("Purchase successful!");

      if (result.qrCode) {
        setQrCode(result.qrCode);
      }

      const updated = await salesAPI.getCatalogue();

      setCatalogue(
        updated.map((p) => ({
          ...p,
          selectedQuantity: 0,
        }))
      );
    } catch (err: any) {
      console.error(err);
      alert("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.window}>
        <div style={styles.titleBar}>Sales</div>

        <div style={styles.content}>
          {catalogue.length > 0 ? (
            <>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Perfume</th>
                    <th style={styles.th}>Price</th> 
                    <th style={styles.th}>Stock</th> 
                    <th style={styles.th}>Quantity</th>
                  </tr>
                </thead>

                <tbody>
                  {catalogue.map((p) => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.perfume_name}</td>
                      <td style={styles.td}>{p.price}</td>
                      <td style={styles.td}>{p.perfume_quantity}</td>
                      <td style={styles.td}>
                        <input
                          type="number"
                          min={0}
                          max={p.perfume_quantity} 
                          value={p.selectedQuantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              p.id,
                              Number(e.target.value)
                            )
                          }
                          style={styles.input}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                style={styles.btn}
                onClick={handleBuy}
                disabled={loading}
              >
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

        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};