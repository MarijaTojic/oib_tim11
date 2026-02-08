import React, { useEffect, useState } from "react";
import { ISalesAPI } from "../api/sale/ISalesAPI";
import { CatalogueDTO } from "../models/catalogues/CatalogueDTO";
import { CatalogueTable } from "../components/catalogues/Sales";
import { useNavigate } from "react-router-dom";

type Props = {
  salesAPI: ISalesAPI;
  userId: number;
};

const styles = {
  page: {
    padding: "24px",
    backgroundColor: "#f5f9ff",
    minHeight: "100vh",
  },
  window: {
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #bbdefb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  titleBar: {
    backgroundColor: "#1976d2",
    color: "#ffffff",
    padding: "12px 20px",
    fontSize: "18px",
    fontWeight: 600,
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
  },
  content: {
    padding: "24px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginTop: "12px",
  },
  th: {
    padding: "10px",
    textAlign: "left" as const,
    backgroundColor: "#e3f2fd",
    color: "#0d47a1",
    borderBottom: "2px solid #bbdefb",
  },
  td: {
    padding: "8px",
    borderBottom: "1px solid #e0e0e0",
  },
  input: {
    width: "70px",
    padding: "4px 6px",
    border: "1px solid #bbdefb",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    color: "#000",
  },
  btn: {
    marginTop: "16px",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#1976d2",
    color: "#ffffff",
  },
  backBtn: {
    margin: "16px 24px",
    padding: "8px 16px",
    border: "1px solid #1976d2",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#ffffff",
    color: "#1976d2",
  },
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
        data.allPerfumes.forEach((p) => {
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
    setQuantities((prev) => ({
      ...prev,
      [perfumeId]: value,
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
        updatedCatalogue.allPerfumes.forEach((p) => {
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
    <div style={styles.page}>
      <div style={styles.window}>
        <div style={styles.titleBar}>Sales</div>

        <div style={styles.content}>
          {catalogue ? (
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
                  {catalogue.allPerfumes.map((p) => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.name}</td>
                      <td style={styles.td}>
                        <input
                          type="number"
                          min={0}
                          value={quantities[p.id!] || 0}
                          onChange={(e) =>
                            handleQuantityChange(p.id!, Number(e.target.value))
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