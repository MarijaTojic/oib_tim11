import React, { useState } from "react";
import { IAuthAPI } from "../api/auth/IAuthAPI";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";

type AuthPageProps = {
  authAPI: IAuthAPI;
};

export const AuthPage: React.FC<AuthPageProps> = ({ authAPI }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div
      className="overlay-blur-none"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(255,255,255,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <div
        className="window"
        style={{
          width: "480px",
          maxWidth: "90%",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Titlebar */}
        <div
          className="titlebar"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            backgroundColor: "#60cdff",
            color: "white",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          <div className="titlebar-icon">
            <img style={{ marginTop: -2 }} src="/icon.png" width="20" height="20" />
          </div>
          <span className="titlebar-title" style={{ marginLeft: 8 }}>
            Authentication
          </span>
        </div>

        {/* Tabs */}
        <div
          className="flex"
          style={{
            borderBottom: "1px solid #cce6ff",
          }}
        >
          <button
            className={`flex-1 ${activeTab === "login" ? "btn-accent" : "btn-ghost"}`}
            style={{
              borderRadius: 0,
              height: "48px",
              fontSize: "14px",
              fontWeight: 600,
              borderBottom: activeTab === "login" ? "3px solid #0078d4" : "none",
              color: activeTab === "login" ? "#0078d4" : "#555",
              backgroundColor: "white",
            }}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 ${activeTab === "register" ? "btn-accent" : "btn-ghost"}`}
            style={{
              borderRadius: 0,
              height: "48px",
              fontSize: "14px",
              fontWeight: 600,
              borderBottom: activeTab === "register" ? "3px solid #0078d4" : "none",
              color: activeTab === "register" ? "#0078d4" : "#555",
              backgroundColor: "white",
            }}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "24px",
            maxHeight: "calc(90vh - 88px)",
            overflowY: "auto",
            backgroundColor: "white",
          }}
        >
          {activeTab === "login" ? (
            <LoginForm authAPI={authAPI} />
          ) : (
            <RegisterForm authAPI={authAPI} />
          )}
        </div>
      </div>
    </div>
  );
};