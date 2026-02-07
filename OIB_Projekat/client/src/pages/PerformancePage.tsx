import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IPerformanceAPI } from "../api/performance/IPerformanceAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { LogisticsAlgorithm, PerformanceResultDTO } from "../models/performance/PerformanceResultDTO";
import { SimulationRequestDTO } from "../models/performance/SimulationRequestDTO";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";

type PerformancePageProps = {
  userAPI: IUserAPI;
  performanceAPI: IPerformanceAPI;
};

const algorithmOptions: { label: string; value: LogisticsAlgorithm }[] = [
  { label: "Dijkstra", value: "dijkstra" },
  { label: "A*", value: "astar" },
  { label: "Genetic", value: "genetic_algorithm" },
  { label: "Ant Colony", value: "ant_colony" },
  { label: "Particle Swarm", value: "particle_swarm" },
];

const buildSearchText = (result: PerformanceResultDTO) =>
  [
    result.id,
    result.algorithm,
    result.simulationName,
    result.numberOfSimulations,
    result.numberOfParticles,
    result.numberOfIterations,
    result.metrics.executionTime,
    result.metrics.distanceCovered,
    result.metrics.costOptimization,
    result.metrics.pathEfficiency,
    result.metrics.memoryUsage,
    result.metrics.successRate,
    result.analysisConclusions ?? "",
    result.createdAt,
  ]
    .join(" ")
    .toLowerCase();

const calculateScore = (result: PerformanceResultDTO) =>
  result.metrics.pathEfficiency * 0.3 +
  result.metrics.costOptimization * 0.3 +
  (100 - result.metrics.executionTime / 100) * 0.2 +
  result.metrics.successRate * 0.2;

const buildSeries = (base: number, multipliers: number[]) =>
  multipliers.map((multiplier) => base * multiplier);

type LinePoint = { x: number; y: number; value: number };
type AxisTick = { x: number; y: number; label: string };

const toLinePoints = (series: number[], maxValue: number) => {
  if (series.length === 0) return "";
  return series
    .map((value, index, arr) => {
      const x = 20 + (index / Math.max(1, arr.length - 1)) * 480;
      const y = 140 - (value / Math.max(1, maxValue)) * 120;
      return `${x},${y}`;
    })
    .join(" ");
};

const toPointCoords = (series: number[], maxValue: number): LinePoint[] =>
  series.map((value, index, arr) => {
    const x = 20 + (index / Math.max(1, arr.length - 1)) * 480;
    const y = 140 - (value / Math.max(1, maxValue)) * 120;
    return { x, y, value };
  });

const buildXTicks = (count: number): AxisTick[] => {
  const safeCount = Math.max(2, count);
  return Array.from({ length: safeCount }, (_, index) => {
    const x = 20 + (index / Math.max(1, safeCount - 1)) * 480;
    return { x, y: 150, label: `${index + 1}` };
  });
};

const buildYTicks = (maxValue: number, steps: number, formatLabel: (value: number) => string): AxisTick[] => {
  const safeSteps = Math.max(2, steps);
  return Array.from({ length: safeSteps + 1 }, (_, index) => {
    const value = (maxValue / safeSteps) * index;
    const y = 140 - (value / Math.max(1, maxValue)) * 120;
    return { x: 12, y, label: formatLabel(value) };
  });
};

export const PerformancePage: React.FC<PerformancePageProps> = ({ userAPI, performanceAPI }) => {
  const navigate = useNavigate();
  const [results, setResults] = useState<PerformanceResultDTO[]>([]);
  const [simulationName, setSimulationName] = useState("Logistics Run");
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<LogisticsAlgorithm[]>(["astar"]);
  const [numberOfSimulations, setNumberOfSimulations] = useState(3);
  const [numberOfParticles, setNumberOfParticles] = useState(100);
  const [numberOfIterations, setNumberOfIterations] = useState(120);
  const [activeCenter, setActiveCenter] = useState<"distribution" | "warehouse">("distribution");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken") ?? "";

  const loadResults = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await performanceAPI.getResults(token);
      setResults(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load performance results.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const sortedByScore = useMemo(() => {
    return [...results].sort((a, b) => calculateScore(b) - calculateScore(a));
  }, [results]);

  const best = sortedByScore[0] ?? null;
  const second = sortedByScore[1] ?? null;
  const centerLabel = activeCenter === "distribution"
    ? "Distribucijski centar (Menadzer)"
    : "Magacinski centar (Prodavac)";
  const otherCenterLabel = activeCenter === "distribution"
    ? "Magacinski centar (Prodavac)"
    : "Distribucijski centar (Menadzer)";
  const execSeconds = best ? best.metrics.executionTime / 1000 : null;
  const throughput = best
    ? (best.metrics.distanceCovered / Math.max(1, best.metrics.executionTime)) * 1000
    : 0;
  const otherThroughput = second
    ? (second.metrics.distanceCovered / Math.max(1, second.metrics.executionTime)) * 1000
    : 0;

  const timeSeriesA = best
    ? buildSeries(best.metrics.executionTime / 1000, [0.6, 0.75, 0.9, 1.0, 1.15])
    : [];
  const timeSeriesB = second
    ? buildSeries(second.metrics.executionTime / 1000, [0.65, 0.8, 0.95, 1.05, 1.2])
    : [];
  const maxTime = Math.max(1, ...timeSeriesA, ...timeSeriesB);

  const efficiencySeriesA = best
    ? buildSeries(best.metrics.pathEfficiency, [1.0, 0.98, 0.96, 0.94, 0.92])
    : [];
  const efficiencySeriesB = second
    ? buildSeries(second.metrics.pathEfficiency, [0.9, 0.88, 0.86, 0.84, 0.82])
    : [];

  const filteredResults = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    const filtered = results.filter((result) => {
      if (!lowered) return true;
      return buildSearchText(result).includes(lowered);
    });

    const getValue = (result: PerformanceResultDTO) => {
      switch (sortKey) {
        case "id":
          return result.id;
        case "algorithm":
          return result.algorithm;
        case "score":
          return calculateScore(result);
        case "executionTime":
          return result.metrics.executionTime;
        case "pathEfficiency":
          return result.metrics.pathEfficiency;
        case "successRate":
          return result.metrics.successRate;
        default:
          return result.createdAt;
      }
    };

    return [...filtered].sort((a, b) => {
      const left = getValue(a);
      const right = getValue(b);
      if (typeof left === "number" && typeof right === "number") {
        return sortDir === "asc" ? left - right : right - left;
      }
      return sortDir === "asc"
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left));
    });
  }, [results, query, sortKey, sortDir]);

  const runSimulation = async () => {
    setIsLoading(true);
    setError("");
    try {
      const payload: SimulationRequestDTO = {
        algorithms: selectedAlgorithms.length ? selectedAlgorithms : ["astar"],
        simulationName,
        numberOfSimulations,
        numberOfParticles,
        numberOfIterations,
      };
      const data = await performanceAPI.runSimulation(token, payload);
      setResults(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to run simulation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (result: PerformanceResultDTO) => {
    try {
      setError("");
      const blob = await performanceAPI.downloadPdf(token, result.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `performance_${result.id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message ?? "Failed to export PDF.");
    }
  };

  return (
    <div className="page-shell performance-shell">
      <DashboardNavbar userAPI={userAPI} />
      <div className="perf-header">
        <div>
          <div className="page-eyebrow">Analiza performansi</div>
          <h1 className="page-title">Analiza logistickog algoritma</h1>
        </div>
        <div className="perf-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>Nazad na Dashboard</button>
          <button className="btn btn-accent" onClick={runSimulation} disabled={isLoading}>Pokreni simulaciju</button>
        </div>
      </div>

      <div className="perf-tabs">
        <button
          className={`perf-tab ${activeCenter === "distribution" ? "active" : ""}`}
          onClick={() => setActiveCenter("distribution")}
        >
          Distribucijski centar (Menadzer)
        </button>
        <button
          className={`perf-tab ${activeCenter === "warehouse" ? "active" : ""}`}
          onClick={() => setActiveCenter("warehouse")}
        >
          Magacinski centar (Prodavac)
        </button>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: "16px", padding: "12px 16px" }}>
          <span style={{ color: "var(--win11-close-hover)", fontSize: "13px" }}>{error}</span>
        </div>
      )}

      <div className="perf-section">
        <div className="perf-section-header">Parametri algoritma: {centerLabel}</div>
        <div className="perf-section-body">
          <div className="kpi-strip perf-kpi">
            <div className="kpi-card">
              <span className="kpi-title"><span className="perf-icon">⚙️</span>Algoritama u setu</span>
              <span className="kpi-value">{selectedAlgorithms.length}</span>
              <span className="kpi-note">Aktivni izbor</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-title"><span className="perf-icon">⏱️</span>Vreme za isporuku</span>
              <span className="kpi-value">{execSeconds !== null ? `${execSeconds.toFixed(1)} s` : "-"}</span>
              <span className="kpi-note">Prosek</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-title"><span className="perf-icon">🚚</span>Brzina obrade</span>
              <span className="kpi-value">{best ? `${throughput.toFixed(1)} amb/s` : "-"}</span>
              <span className="kpi-note">Krozput</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-title"><span className="perf-icon">✅</span>Efikasnost</span>
              <span className="kpi-value">{best ? `${best.metrics.successRate.toFixed(1)}%` : "-"}</span>
              <span className="kpi-note">Stabilnost</span>
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label>Naziv simulacije</label>
              <input
                type="text"
                value={simulationName}
                onChange={(event) => setSimulationName(event.target.value)}
              />
            </div>
            <div>
              <label>Algoritmi</label>
              <div className="checkbox-group">
                {algorithmOptions.map((option) => (
                  <label key={option.value} className="checkbox-pill">
                    <input
                      type="checkbox"
                      checked={selectedAlgorithms.includes(option.value)}
                      onChange={(event) => {
                        setSelectedAlgorithms((prev) =>
                          event.target.checked
                            ? [...prev, option.value]
                            : prev.filter((algo) => algo !== option.value)
                        );
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label>Broj simulacija</label>
              <input
                type="number"
                min={1}
                max={50}
                value={numberOfSimulations}
                onChange={(event) => setNumberOfSimulations(Number(event.target.value))}
              />
            </div>
            <div>
              <label>Cestice</label>
              <input
                type="number"
                min={10}
                max={500}
                value={numberOfParticles}
                onChange={(event) => setNumberOfParticles(Number(event.target.value))}
              />
            </div>
            <div>
              <label>Iteracije</label>
              <input
                type="number"
                min={10}
                max={500}
                value={numberOfIterations}
                onChange={(event) => setNumberOfIterations(Number(event.target.value))}
              />
            </div>
          </div>
          <div className="note">Rezultati se cuvaju i mogu se eksportovati u PDF.</div>
        </div>
      </div>

      <div className="performance-grid">
        <div className="panel perf-chart">
          <div className="perf-chart-header danger">Uporedna analiza vremena obrade</div>
          <div className="chart-card">
            <svg viewBox="0 0 520 160" className="line-chart">
              <line x1="20" y1="20" x2="20" y2="140" className="chart-axis" />
              <line x1="20" y1="140" x2="500" y2="140" className="chart-axis" />
              <text x="12" y="18" textAnchor="start" className="chart-axis-title">Vreme (sekunde)</text>
              <text x="250" y="156" textAnchor="middle" className="chart-axis-title">Iteracije</text>
              {buildYTicks(maxTime, 4, (value) => `${value.toFixed(1)} s`).map((tick, index) => (
                <g key={`time-y-${index}`}>
                  <line x1="20" y1={tick.y} x2="500" y2={tick.y} className="chart-grid" />
                  <line x1="18" y1={tick.y} x2="20" y2={tick.y} className="chart-tick" />
                  <text x={tick.x} y={tick.y + 4} textAnchor="end" className="chart-axis-label">
                    {tick.label}
                  </text>
                </g>
              ))}
              {buildXTicks(timeSeriesA.length || timeSeriesB.length || 5).map((tick) => (
                <g key={`time-x-${tick.label}`}>
                  <line x1={tick.x} y1="140" x2={tick.x} y2="142" className="chart-tick" />
                  <text x={tick.x} y={tick.y} textAnchor="middle" className="chart-axis-label">
                    {tick.label}
                  </text>
                </g>
              ))}
              <polyline
                fill="none"
                stroke="#ff6b6b"
                strokeWidth="3"
                points={toLinePoints(timeSeriesA, maxTime)}
              />
              {toPointCoords(timeSeriesA, maxTime).map((point, index) => (
                <g key={`time-a-${index}`}>
                  <circle cx={point.x} cy={point.y} r="4" fill="#ff6b6b" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              ))}
              {second && (
                <>
                  <polyline
                    fill="none"
                    stroke="#60cdff"
                    strokeWidth="3"
                    points={toLinePoints(timeSeriesB, maxTime)}
                  />
                  {toPointCoords(timeSeriesB, maxTime).map((point, index) => (
                    <g key={`time-b-${index}`}>
                      <circle cx={point.x} cy={point.y} r="4" fill="#60cdff" stroke="#ffffff" strokeWidth="1.5" />
                    </g>
                  ))}
                </>
              )}
            </svg>
          </div>
        </div>

        <div className="panel perf-chart">
          <div className="perf-chart-header info">Efikasnost pod opterecenjem</div>
          <div className="chart-card">
            <svg viewBox="0 0 520 160" className="line-chart">
              <line x1="20" y1="20" x2="20" y2="140" className="chart-axis" />
              <line x1="20" y1="140" x2="500" y2="140" className="chart-axis" />
              <text x="12" y="18" textAnchor="start" className="chart-axis-title">Efikasnost (%)</text>
              <text x="250" y="156" textAnchor="middle" className="chart-axis-title">Iteracije</text>
              {buildYTicks(100, 4, (value) => `${Math.round(value)}%`).map((tick, index) => (
                <g key={`eff-y-${index}`}>
                  <line x1="20" y1={tick.y} x2="500" y2={tick.y} className="chart-grid" />
                  <line x1="18" y1={tick.y} x2="20" y2={tick.y} className="chart-tick" />
                  <text x={tick.x} y={tick.y + 4} textAnchor="end" className="chart-axis-label">
                    {tick.label}
                  </text>
                </g>
              ))}
              {buildXTicks(efficiencySeriesA.length || efficiencySeriesB.length || 5).map((tick) => (
                <g key={`eff-x-${tick.label}`}>
                  <line x1={tick.x} y1="140" x2={tick.x} y2="142" className="chart-tick" />
                  <text x={tick.x} y={tick.y} textAnchor="middle" className="chart-axis-label">
                    {tick.label}
                  </text>
                </g>
              ))}
              <polyline
                fill="none"
                stroke="#7fe3a4"
                strokeWidth="3"
                points={toLinePoints(efficiencySeriesA, 100)}
              />
              {toPointCoords(efficiencySeriesA, 100).map((point, index) => (
                <g key={`eff-a-${index}`}>
                  <circle cx={point.x} cy={point.y} r="4" fill="#7fe3a4" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              ))}
              {second && (
                <>
                  <polyline
                    fill="none"
                    stroke="#ffd36b"
                    strokeWidth="3"
                    points={toLinePoints(efficiencySeriesB, 100)}
                  />
                  {toPointCoords(efficiencySeriesB, 100).map((point, index) => (
                    <g key={`eff-b-${index}`}>
                      <circle cx={point.x} cy={point.y} r="4" fill="#ffd36b" stroke="#ffffff" strokeWidth="1.5" />
                    </g>
                  ))}
                </>
              )}
            </svg>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Zakljucak analize</h2>
        </div>
        <div className="perf-summary">
          <div className="perf-summary-card primary">
            <h3>{centerLabel}</h3>
            <ul>
              <li>Brzina: {best ? `${throughput.toFixed(1)} amb/s` : "-"}</li>
              <li>Kapacitet: {numberOfSimulations} simulacija</li>
              <li>Vreme: {execSeconds !== null ? `${execSeconds.toFixed(1)} s` : "-"}</li>
              <li>Efikasnost: {best ? `${best.metrics.successRate.toFixed(1)}%` : "-"}</li>
            </ul>
          </div>
          <div className="perf-summary-card secondary">
            <h3>{otherCenterLabel}</h3>
            <ul>
              <li>Brzina: {second ? `${otherThroughput.toFixed(1)} amb/s` : "-"}</li>
              <li>Kapacitet: {numberOfSimulations} simulacija</li>
              <li>Vreme: {second ? `${(second.metrics.executionTime / 1000).toFixed(1)} s` : "-"}</li>
              <li>Efikasnost: {second ? `${second.metrics.successRate.toFixed(1)}%` : "-"}</li>
            </ul>
          </div>
        </div>
        <div className="perf-recommend">
          <h3>Preporuka za optimizaciju</h3>
          <p>
            {best
              ? `Preporucuje se algoritam ${best.algorithm} uz pracenje opterecenja i vremena izvrsavanja.`
              : "Pokreni simulaciju da dobijes preporuku."}
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Istorija simulacija</h2>
        </div>
        <div className="toolbar">
          <input
            type="search"
            placeholder="Pretraga po svim kriterijumima"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
            <option value="createdAt">Datum</option>
            <option value="id">ID</option>
            <option value="algorithm">Algoritam</option>
            <option value="score">Skor</option>
            <option value="executionTime">Vreme</option>
            <option value="pathEfficiency">Efikasnost</option>
            <option value="successRate">Uspesnost</option>
          </select>
          <select value={sortDir} onChange={(event) => setSortDir(event.target.value as any)}>
            <option value="desc">Opadajuce</option>
            <option value="asc">Rastuce</option>
          </select>
        </div>

        <div className="table-lite">
          <div className="table-row table-head">
            <span>ID</span>
            <span>Algoritam</span>
            <span>Skor</span>
            <span>Vreme</span>
            <span>Efikasnost</span>
            <span>Zakljucak</span>
            <span>PDF</span>
          </div>
          {filteredResults.map((result) => (
            <div className="table-row" key={result.id}>
              <span>#{result.id}</span>
              <span>{result.algorithm}</span>
              <span>{calculateScore(result).toFixed(1)}</span>
              <span>{result.metrics.executionTime.toFixed(1)} ms</span>
              <span>{result.metrics.pathEfficiency.toFixed(1)}%</span>
              <span>{result.analysisConclusions ?? "-"}</span>
              <span>
                <button className="btn btn-standard" onClick={() => handleExport(result)}>
                  Export PDF
                </button>
              </span>
            </div>
          ))}
          {!isLoading && filteredResults.length === 0 && (
            <div className="table-row empty">Nema simulacija.</div>
          )}
        </div>
      </div>

      <div className="page-footnote">Algoritam: Distributivni sistem | Simulacija: spremna</div>
    </div>
  );
};
