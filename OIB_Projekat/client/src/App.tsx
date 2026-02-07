import { Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";

import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductionPage } from "./pages/ProductionPage";
import { PerfumesPage } from "./pages/PerfumesPage";
import { ProcessingPage } from "./pages/ProcessingPage";
import { SalesPage } from "./pages/SalesPage";

import { IAuthAPI } from "./api/auth/IAuthAPI";
import { AuthAPI } from "./api/auth/AuthAPI";

import { IUserAPI } from "./api/users/IUserAPI";
import { UserAPI } from "./api/users/UserAPI";

import { IPlantAPI } from "./api/plants/IPlantAPI";
import { PlantAPI } from "./api/plants/PlantAPI";

import { IPerfumeAPI } from "./api/perfume/IPerfumeAPI";
import { PerfumeAPI } from "./api/perfume/PerfumeAPI";

import { SalesAPI } from "./api/sale/SalesAPI";
import { ISalesAPI } from "./api/sale/ISalesAPI";

import { useContext } from "react";
import AuthContext from "./contexts/AuthContext";
import { ProductionLogPage } from "./pages/ProductionLogPage";

const authAPI: IAuthAPI = new AuthAPI();
const userAPI: IUserAPI = new UserAPI();
const plantAPI: IPlantAPI = new PlantAPI();
const perfumeAPI: IPerfumeAPI = new PerfumeAPI();
const salesAPI: ISalesAPI = new SalesAPI();

function App() {
  const authContext = useContext(AuthContext);
  const currentUserId = authContext?.user?.id;

  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<AuthPage authAPI={authAPI} />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="admin,seller">
            <DashboardPage userAPI={userAPI} plantAPI={plantAPI} />
          </ProtectedRoute>
        }
      />

      {/* Protected ProductionPage */}
      <Route
        path="/production"
        element={
          <ProtectedRoute requiredRole="admin,seller">
            <ProductionPage plantsAPI={plantAPI} />
          </ProtectedRoute>
        }
      />

      {/* Protected PerfumesPage */}
      <Route
        path="/perfumes"
        element={
          <ProtectedRoute requiredRole="admin,seller">
            <PerfumesPage perfumeAPI={perfumeAPI} />
          </ProtectedRoute>
        }
      />

      {/* Protected ProcessingPage */}
      <Route
        path="/processing"
        element={
          <ProtectedRoute requiredRole="admin,seller">
            <ProcessingPage perfumeAPI={perfumeAPI} />
          </ProtectedRoute>
        }
      />

      {/* Protected SalesPage */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute requiredRole="admin,seller">
            {currentUserId ? (
              <SalesPage salesAPI={salesAPI} userId={currentUserId} />
            ) : (
              <Navigate to="/" />
            )}
          </ProtectedRoute>
        }
      />

      <Route
          path="/production/logs"
          element={
            <ProtectedRoute requiredRole="admin">
              <ProductionLogPage gatewayUrl={import.meta.env.VITE_GATEWAY_URL || ""} />
          </ProtectedRoute>
        }
        />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
      
    </Routes>
  );
}

export default App;
