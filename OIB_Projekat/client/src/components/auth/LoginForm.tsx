import React, { useEffect, useState } from "react";
import { IAuthAPI } from "../../api/auth/IAuthAPI";
import { LoginUserDTO } from "../../models/auth/LoginUserDTO";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";

type LoginFormProps = {
  authAPI: IAuthAPI;
};

export const LoginForm: React.FC<LoginFormProps> = ({ authAPI }) => {
  const [formData, setFormData] = useState<LoginUserDTO>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);

      if (response.success && response.token) {
        login(response.token);
        navigate("/dashboard");
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "An error occurred. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      style={{
        backgroundColor: "#ffffff",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div>
        <label
          htmlFor="username"
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#003366",
          }}
        >
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
          required
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #cce0ff",
            borderRadius: "6px",
            outline: "none",
            transition: "all 0.2s",
            backgroundColor: "#ffffff",
            color: "#0d47a1",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#0078d4")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#cce0ff")}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#003366",
          }}
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #cce0ff",
            borderRadius: "6px",
            outline: "none",
            transition: "all 0.2s",
            backgroundColor: "#ffffff",
            color: "#0d47a1",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#0078d4")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#cce0ff")}
        />
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(0, 120, 212, 0.1)",
            border: "1px solid #0078d4",
            borderRadius: "6px",
          }}
        >
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="#0078d4"
            >
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z"/>
            </svg>
            <span style={{ fontSize: "13px", color: "#003366" }}>{error}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          marginTop: "8px",
          backgroundColor: "#0078d4",
          color: "#ffffff",
          fontWeight: 600,
          padding: "10px 16px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#005a9e")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#0078d4")
        }
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div
              className="spinner"
              style={{
                width: "16px",
                height: "16px",
                borderWidth: "2px",
                borderColor: "#ffffff",
                borderTopColor: "transparent",
                borderStyle: "solid",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <span>Logging in...</span>
          </div>
        ) : (
          "Login"
        )}
      </button>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </form>
  );
};