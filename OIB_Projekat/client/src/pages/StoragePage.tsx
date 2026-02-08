import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuthHook";
import "./StoragePage.css";
import { PackagingDTO } from "../models/packaging/PackagingDTO";
import { WarehouseDTO } from "../models/storages/WarehouseDTO";
import { IStorageAPI } from "../api/storage/IStorageAPI";
import { StorageAPI } from "../api/storage/StorageApi";

const StoragePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, logout } = useAuth();

  const shouldShowNavigation = location.pathname === "/storage";

  const [warehouses, setWarehouses] = useState<WarehouseDTO[]>([]);
  const [packages, setPackages] = useState<PackagingDTO[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>();
  const [sendCount, setSendCount] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState("");
  const [newWarehouseLocation, setNewWarehouseLocation] = useState("");
  const [newWarehouseMax, setNewWarehouseMax] = useState(10);
  const [packageName, setPackageName] = useState("");
  const [packageSender, setPackageSender] = useState("");

  const isManager = user?.role === "MANAGER";

  const storageAPI: IStorageAPI = new StorageAPI();

  // Load warehouses and packages
  const loadWarehouses = async () => {
    if (!token) return;
    try {
      const allWarehouses = await storageAPI.getAllWarehouses(token);
      setWarehouses(allWarehouses);
      const allPackages = await storageAPI.getPackagesInWarehouse(token, selectedWarehouseId);
      setPackages(allPackages);
    } catch (err) {
      console.error("Failed to load warehouses or packages", err);
    }
  };

  // Send packages
  const sendPackages = async (packageIds: number[]) => {
    return storageAPI.sendPackages(token!, packageIds);
  };

  const handleSend = async () => {
    if (isSending) return;

    const packedPackages = packages.filter(p => p.status === "PACKED");
    const idsToSend = packedPackages.slice(0, sendCount).map(p => p.id);

    if (idsToSend.length === 0) {
      alert("Нема спремних амбалажа");
      return;
    }

    setIsSending(true);
    try {
      await sendPackages(idsToSend);
      alert(`Послато ${idsToSend.length} амбалажа`);
      await loadWarehouses();
    } catch (err) {
      alert("Грешка при слању амбалажа");
      console.error(err);
    }
    setSendCount(1);
    setIsSending(false);
  };

  // Create warehouse
  const handleCreateWarehouse = async () => {
    if (!newWarehouseName || !newWarehouseLocation) return;
    try {
      await storageAPI.createWarehouse(token!, {
        name: newWarehouseName,
        location: newWarehouseLocation,
        maxPackages: newWarehouseMax,
      });
      setNewWarehouseName("");
      setNewWarehouseLocation("");
      setNewWarehouseMax(10);
      await loadWarehouses();
    } catch (err) {
      alert("Грешка при креирању складишта");
      console.error(err);
    }
  };

  // Receive package
  const handleReceivePackage = async () => {
    if (!packageName || !packageSender || !selectedWarehouseId) return;
    try {
      await storageAPI.receivePackage(token!, {
        name: packageName,
        senderAddress: packageSender,
        warehouseId: selectedWarehouseId,
      });
      setPackageName("");
      setPackageSender("");
      await loadWarehouses();
    } catch (err) {
      alert("Грешка при пријему пакета");
      console.error(err);
    }
  };

  useEffect(() => {
    loadWarehouses();
    const interval = setInterval(loadWarehouses, 5000);
    return () => clearInterval(interval);
  }, [selectedWarehouseId]);

  const packedPackages = packages.filter(p => p.status === "PACKED");
  const getMaxPerSend = () => (isManager ? 3 : 1);

  return (
    <div className="storage-page">
      {shouldShowNavigation && (
        <div className="tab-navigation">
          <button onClick={() => navigate("/production")}>Производња</button>
          <button onClick={() => navigate("/processing")}>Прерада</button>
          <button className="active">Складиштење</button>
          <button onClick={() => navigate("/sales")}>Продаја</button>
          <button
            style={{ marginLeft: "auto" }}
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Одјави се
          </button>
        </div>
      )}

      <div className="storage-content">
        {/* LEFT PANEL */}
        <div className="storage-left-panel">
          <h2>Складишта</h2>
          {warehouses.map(w => {
            const count = w.packages?.length || 0;
            const percent = (count / w.maxPackages) * 100;
            return (
              <div
                key={w.id}
                className={`warehouse-card ${selectedWarehouseId === w.id ? "selected" : ""}`}
                onClick={() => setSelectedWarehouseId(selectedWarehouseId === w.id ? undefined : w.id)}
              >
                <h3>{w.name}</h3>
                <p>{w.location}</p>
                <div className="capacity-bar">
                  <div className="capacity-fill" style={{ width: `${percent}%` }} />
                </div>
                <small>
                  {count}/{w.maxPackages} ({percent.toFixed(1)}%)
                </small>
              </div>
            );
          })}

          <div className="create-warehouse">
            <h3>Ново складиште</h3>
            <input placeholder="Назив" value={newWarehouseName} onChange={e => setNewWarehouseName(e.target.value)} />
            <input placeholder="Локација" value={newWarehouseLocation} onChange={e => setNewWarehouseLocation(e.target.value)} />
            <input
              type="number"
              min={1}
              value={newWarehouseMax}
              onChange={e => setNewWarehouseMax(Number(e.target.value))}
            />
            <button onClick={handleCreateWarehouse}>Креирај складиште</button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="storage-right-panel">
          <div className="panel-header">
            <h2>Спремне амбалаже</h2>
            <button disabled={packedPackages.length === 0 || isSending} onClick={handleSend}>
              {isSending ? "Слање..." : "Пошаљи на продају"}
            </button>
          </div>

          <div className="send-controls">
            <label>
              Број амбалажа:
              <input
                type="number"
                min={1}
                max={getMaxPerSend()}
                value={sendCount}
                onChange={e => setSendCount(Math.min(Number(e.target.value), getMaxPerSend()))}
              />
            </label>
            <span>Макс: {getMaxPerSend()}</span>
          </div>

          <div className="receive-package">
            <h3>Пријем амбалаже</h3>
            <input placeholder="Назив" value={packageName} onChange={e => setPackageName(e.target.value)} />
            <input placeholder="Пошиљалац" value={packageSender} onChange={e => setPackageSender(e.target.value)} />
            <button onClick={handleReceivePackage} disabled={!selectedWarehouseId}>
              Прихвати амбалажу
            </button>
          </div>

          <table className="package-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Назив</th>
                <th>Пошиљалац</th>
                <th>Складиште</th>
              </tr>
            </thead>
            <tbody>
              {packedPackages.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.senderAddress}</td>
                  <td>{p.warehouse?.name}</td>
                </tr>
              ))}
              {packedPackages.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    Нема спремних амбалажа
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoragePage;