import React, { useEffect, useState } from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { PlantDTO } from "../models/plants/PlantDTO";
import { UserDTO } from "../models/users/UserDTO";

type DashboardPageProps = {
  userAPI: IUserAPI;
  plantAPI: IPlantAPI;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI, plantAPI }) => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";
        const [usersData, plantsData] = await Promise.all([
          userAPI.getAllUsers(token),
          plantAPI.getAllPlants(),
        ]);
        setUsers(usersData);
        setPlants(plantsData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userAPI, plantAPI]);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      <section style={{ marginBottom: 40 }}>
        <h2>Users</h2>
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Name</th>
              <th>Surname</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.name}</td>
                <td>{u.surname}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Plants / Production</h2>
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Common Name</th>
              <th>Latin Name</th>
              <th>Country</th>
              <th>Aromatic Oil Strength</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {plants.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.commonName}</td>
                <td>{p.latinName}</td>
                <td>{p.countryOfOrigin}</td>
                <td>{p.aromaticOilStrength.toFixed(2)}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
