import React, { useState } from "react";
import { IAuthAPI } from "../../api/auth/IAuthAPI";
import { RegistrationUserDTO } from "../../models/auth/RegistrationUserDTO";
import { UserRole } from "../../enums/UserRole";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";

type RegisterFormProps = {
  authAPI: IAuthAPI;
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ authAPI }) => {
  const [formData, setFormData] = useState<RegistrationUserDTO>({
    username: "",
    email: "",
    password: "",
    role: UserRole.SELLER,
    profileImage: "",
    name: "",
    surname: ""
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const containsNumber = (str: string) => /\d/.test(str);

    if (!formData.name || containsNumber(formData.name)) {
      setError("First name cannot contain numbers.");
      return;
    }

    if (!formData.surname || containsNumber(formData.surname)) {
      setError("Last name cannot contain numbers.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register(formData);

      if (response.success) {
        setSuccess(response.message || "Registration successful!");
        if (response.token) {
          login(response.token);
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #cce0ff",
    borderRadius: "6px",
    outline: "none",
    transition: "all 0.2s",
    backgroundColor: "#ffffff",
    color: "#0d47a1",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#0078d4";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#cce0ff";
  };

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
      {[
        { id: "name", label: "First Name", placeholder: "Enter your first name", type: "text" },
        { id: "surname", label: "Last Name", placeholder: "Enter your last name", type: "text" },
        { id: "username", label: "Username", placeholder: "Choose a username", type: "text" },
        { id: "email", label: "Email", placeholder: "your.email@example.com", type: "email" },
        { id: "password", label: "Password", placeholder: "Create a password (min 6 chars)", type: "password" },
        { id: "confirmPassword", label: "Confirm Password", placeholder: "Re-enter your password", type: "password" },
        { id: "profileImage", label: "Profile Image URL (Optional)", placeholder: "https://example.com/avatar.jpg", type: "url" },
      ].map(({ id, label, placeholder, type }) => (
        <div key={id}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#003366" }}>
            {label}
          </label>
          <input
            type={type}
            id={id}
            name={id === "confirmPassword" ? "confirmPassword" : id}
            value={id === "confirmPassword" ? confirmPassword : (formData as any)[id]}
            onChange={id === "confirmPassword" ? e => setConfirmPassword(e.target.value) : handleChange}
            placeholder={placeholder}
            disabled={isLoading}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      ))}

      <div>
        <label htmlFor="role" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#003366" }}>
          Role
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={isLoading}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <option value={UserRole.SELLER}>Seller</option>
          <option value={UserRole.ADMIN}>Admin</option>
          <option value={UserRole.MANAGER}>Manager</option>
        </select>
      </div>

      {error && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "rgba(0, 120, 212, 0.1)",
          border: "1px solid #0078d4",
          borderRadius: "6px",
        }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#0078d4">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z"/>
            </svg>
            <span style={{ fontSize: "13px", color: "#003366" }}>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "rgba(0, 120, 212, 0.15)",
          border: "1px solid #0078d4",
          borderRadius: "6px",
        }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#0078d4">
              <path d="M8 2a6 6 0 110 12A6 6 0 018 2zm2.354 4.146a.5.5 0 010 .708l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L7 8.793l2.646-2.647a.5.5 0 01.708 0z"/>
            </svg>
            <span style={{ fontSize: "13px", color: "#003366" }}>{success}</span>
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
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#005a9e")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0078d4")}
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
            <span>Creating account...</span>
          </div>
        ) : (
          "Register"
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