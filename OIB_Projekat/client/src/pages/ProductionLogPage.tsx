import React, { useEffect, useState } from "react";
import { LogInfo } from "../enums/Log";
import { useNavigate } from "react-router-dom";

type LogEntry = {
  id: number;
  description: string;
  logtype: LogInfo;
  datetime: string;
};

type Props = {
  gatewayUrl: string;
};

const styles = {
  page: {
    padding: "24px",
    backgroundColor: "#f5f9ff",
    minHeight: "100vh",
  },
  card: {
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "1px solid #bbdefb",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  title: {
    color: "#0d47a1",
    fontSize: "22px",
    fontWeight: 600,
    marginBottom: "20px",
  },
  infoText: {
    color: "#546e7a",
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: "12px",
  },
  logList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  logItem: {
    borderBottom: "1px solid #bbdefb",
    padding: "12px 0",
  },
  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#546e7a",
    marginBottom: "4px",
  },
  logDesc: {
    color: "#0d47a1",
    fontWeight: 500,
  },
  success: {
    color: "#2e7d32",
    fontWeight: 700,
  },
  error: {
    color: "#d32f2f",
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },
  primaryBtn: {
    backgroundColor: "#1976d2",
    color: "#ffffff",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  secondaryBtn: {
    backgroundColor: "#ffffff",
    color: "#1976d2",
    padding: "8px 16px",
    border: "1px solid #1976d2",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export const ProductionLogPage: React.FC<Props> = ({ gatewayUrl }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadLogs = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("authToken"); 

    const res = await fetch(`${gatewayUrl}/logs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Neuspešno učitavanje logova");

    const json = await res.json();
    setLogs(json.logs); 
    setError(null);
  } catch (err: any) {
    setError(err.message);
    setLogs([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Production log</h2>

        {loading && <p style={styles.infoText}>Loading...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {logs.length === 0 && !loading ? (
          <p style={styles.infoText}>No events recorded</p>
        ) : (
          <ul style={styles.logList}>
            {logs.map((log) => (
              <li key={log.id} style={styles.logItem}>
                <div style={styles.logHeader}>
                  <span>{new Date(log.datetime).toLocaleString()}</span>
                  <span
                    style={
                      log.logtype === LogInfo.INFO
                        ? styles.success
                        : styles.error
                    }
                  >
                    {log.logtype === LogInfo.INFO ? "✓" : "✗"}
                  </span>
                </div>
                <div style={styles.logDesc}>{log.description}</div>
              </li>
            ))}
          </ul>
        )}

        <div style={styles.actions}>
          <button
            style={styles.primaryBtn}
            onClick={loadLogs}
            disabled={loading}
          >
            Refresh log
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/dashboard")}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};