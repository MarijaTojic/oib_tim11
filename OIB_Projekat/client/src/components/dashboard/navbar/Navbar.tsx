import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IUserAPI } from "../../../api/users/IUserAPI";
import { useAuth } from "../../../hooks/useAuthHook";
import { UserDTO } from "../../../models/users/UserDTO";

type DashboardNavbarProps = {
  userAPI: IUserAPI;
};

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ userAPI }) => {
  const { user: authUser, logout, token } = useAuth();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (authUser?.id) {
        try {
          const userData = await userAPI.getUserById(token ?? "", authUser.id);
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchUser();
  }, [authUser, userAPI, token]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <nav
      className="titlebar"
      style={{
        height: "60px",
        borderRadius: 0,
        backgroundColor: "white",
        borderBottom: "1px solid #cce6ff",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "none",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0078d4",
            cursor: "pointer",
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/perfumes")}
          style={{
            background: "none",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0078d4",
            cursor: "pointer",
          }}
        >
          Perfumes
        </button>
        <button
          onClick={() => navigate("/processing")}
          style={{
            background: "none",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0078d4",
            cursor: "pointer",
          }}
        >
          Plant processing
        </button>
        <button
          onClick={() => navigate("/production")}
          style={{
            background: "none",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0078d4",
            cursor: "pointer",
          }}
        >
          Plant production
        </button>
        <button
          onClick={() => navigate("/sales")}
          style={{
            background: "none",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0078d4",
            cursor: "pointer",
          }}
        >
          Sales
        </button>
        <button
          onClick={() => navigate("/analytics")}
          style={{
            background: "none",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0078d4",
            cursor: "pointer",
          }}
        >
          Analytics
        </button>
        <button
          onClick={() => navigate("/performance")}
          style={{
            background: "none",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0078d4",
            cursor: "pointer",
          }}
        >
          Performance
        </button>
        <button
          onClick={() => navigate("/storage")}
          style={{
            background: "none",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0078d4",
            cursor: "pointer",
          }}
        > 
          Storage
        </button>
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center gap-3">
        {isLoading ? (
          <div
            className="spinner"
            style={{ width: "20px", height: "20px", borderWidth: "2px" }}
          ></div>
        ) : user ? (
          <>
            {/* Profile Image */}
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #cce6ff",
                }}
              />
            ) : (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#0078d4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "white",
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}

            {/* User Info */}
            <div className="flex flex-col" style={{ gap: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#0078d4" }}>
                {user.email}
              </span>
              <span style={{ fontSize: "11px", color: "#3399ff" }}>{user.role}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                fontSize: "13px",
                fontWeight: 600,
                color: "white",
                backgroundColor: "#0078d4",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M6 2v2H3v8h3v2H2V2h4zm4 3l4 3-4 3V9H6V7h4V5z" />
              </svg>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};