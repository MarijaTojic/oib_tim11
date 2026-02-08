import React, { useEffect, useState } from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { PlantDTO } from "../models/plants/PlantDTO";
import { UserDTO } from "../models/users/UserDTO";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";

type DashboardPageProps = {
  userAPI: IUserAPI;
  plantAPI: IPlantAPI;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI, plantAPI }) => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorUsers, setErrorUsers] = useState<string>("");
  const [errorPlants, setErrorPlants] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorUsers("");
      setErrorPlants("");

      const token = localStorage.getItem("authToken") || "";

      try{
        const userData = await userAPI.getAllUsers(token);
        setUsers(userData);
      } catch(err: any){
        setErrorUsers(err.response?.data?.message || err.message ||  "Failed to load users");
        setUsers([]);
      }

      try{
        const plantsData = await plantAPI.getAllPlants();
        setPlants(plantsData);
      } catch(err: any){
        setErrorPlants(err.response?.data?.message || err.message ||  "Failed to load plants");
        setPlants([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [userAPI, plantAPI]);

  if(loading) return <div>Loading dashboard...</div>

  const styles = {
  page: {
    padding: 20,
    backgroundColor: "#f5f9ff",
    minHeight: "100vh",
  },
  title: {
    color: "#0d47a1",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    backgroundColor: "#ffffff",
  },
  th: {
    backgroundColor: "#1976d2",
    color: "white",
    padding: "8px",
    border: "1px solid #bbdefb",
  },
  td: {
    padding: "8px",
    border: "1px solid #bbdefb",
    color: "#0d47a1",
  },
  section: {
    marginBottom: 40,
  },
};

<table style={styles.table}>
  <thead>
    <tr>
      <th style={styles.th}>ID</th>
      <th style={styles.th}>Username</th>
      <th style={styles.th}>Email</th>
      <th style={styles.th}>Role</th>
      <th style={styles.th}>Name</th>
      <th style={styles.th}>Surname</th>
    </tr>
  </thead>
  <tbody>
    {users.map((u) => (
      <tr key={u.id}>
        <td style={styles.td}>{u.id}</td>
        <td style={styles.td}>{u.username}</td>
        <td style={styles.td}>{u.email}</td>
        <td style={styles.td}>{u.role}</td>
        <td style={styles.td}>{u.name}</td>
        <td style={styles.td}>{u.surname}</td>
      </tr>
    ))}
  </tbody>
</table>

  return (
    <div style = { styles.page } >
      <DashboardNavbar userAPI={userAPI} />
      <h1 style = { styles.title }>Dashboard</h1>
      <section style={{ marginBottom: 40 }}>
        <h2 style = { styles.title }>Users</h2>
        <table style={styles.table}>
  <thead>
    <tr>
      <th style={styles.th}>ID</th>
      <th style={styles.th}>Username</th>
      <th style={styles.th}>Email</th>
      <th style={styles.th}>Role</th>
      <th style={styles.th}>Name</th>
      <th style={styles.th}>Surname</th>
    </tr>
  </thead>
  <tbody>
    {users.map((u) => (
      <tr key={u.id}>
        <td style={styles.td}>{u.id}</td>
        <td style={styles.td}>{u.username}</td>
        <td style={styles.td}>{u.email}</td>
        <td style={styles.td}>{u.role}</td>
        <td style={styles.td}>{u.name}</td>
        <td style={styles.td}>{u.surname}</td>
      </tr>
    ))}
  </tbody>
  </table>
        </section>

        <section>
          <h2 style = { styles.title }>Plants / Production</h2>
          <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>ID</th>
        <th style={styles.th}>Common name</th>
        <th style={styles.th}>Latin name</th>
        <th style={styles.th}>Aromatic Oil Strength</th>
        <th style={styles.th}>Status</th>
        <th style={styles.th}>Quantity</th>
      </tr>
    </thead>
    <tbody>
      {plants.map((u) => (
        <tr key={u.id}>
          <td style={styles.td}>{u.id}</td>
          <td style={styles.td}>{u.commonName}</td>
          <td style={styles.td}>{u.latinName}</td>
          <td style={styles.td}>{u.aromaticOilStrength}</td>
          <td style={styles.td}>{u.countryOfOrigin}</td>
          <td style={styles.td}>{u.status}</td>
          <td style={styles.td}>{u.quantity}</td>
        </tr>
      ))}
    </tbody>
  </table>
      </section>
    </div>
  );
};
