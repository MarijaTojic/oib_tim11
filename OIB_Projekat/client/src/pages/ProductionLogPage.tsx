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

export const ProductionLogPage: React.FC<Props> = ({ gatewayUrl }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${gatewayUrl}/logs`);
      if (!res.ok) throw new Error("Neuspešno učitavanje logova");
      const data: LogEntry[] = await res.json();
      setLogs(data);
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
    <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Production log</h2>

    {loading && <p>Loading...</p>}
    {error && <p className="text-red-600">{error}</p>}

    {logs.length === 0 && !loading ? (
        <p className="text-gray-500">No events recorded</p>
    ) : (
        <ul className="space-y-3">
        {logs.map((log) => (
            <li key={log.id} className="border-b pb-2">
            <div className="flex justify-between text-sm text-gray-600">
                <span>{new Date(log.datetime).toLocaleString()}</span>
                <span
                className={
                    log.logtype === LogInfo.INFO ? "text-green-600" : "text-red-600"
                }
                >
                {log.logtype === LogInfo.INFO ? "✓" : "✗"}
                </span>
            </div>
            <div className="font-medium">{log.description}</div>
            </li>
        ))}
        </ul>
    )}

    <div className="flex gap-2 mt-4">
        <button
        className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={loadLogs}
        disabled={loading}
        >
        
        Refresh log
        </button>

        <button
        className="btn bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
        onClick={() => navigate("/dashboard")}
        >
        Back to dashboard
        </button>
    </div>
    </div>
  );
};