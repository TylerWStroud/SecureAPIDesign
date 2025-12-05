import React, { useState, useEffect } from "react";
import { userService, type User } from "../services/api";
import RefreshButton from "./RefreshButton";
import "./Components.css";

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await userService.getUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    try {
      await userService.createUser({ username, password, firstName: "", lastName: "", email: "" });
      setUsername("");
      setPassword("");
      fetchUsers();
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Users</h2>
        <div className="refresh-wrapper">
          <RefreshButton onClick={fetchUsers} />
        </div>
      </div>

      <form onSubmit={createUser} className="form-inline">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Add User</button>
      </form>

      <div className="item-container">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user._id || user._id} className="user-card">
              <h3>{user.username}</h3>
              {user._id && <p>User ID: {user._id}</p>}
              {user.roles && <p>Roles: {user.roles.join(", ")}</p>}
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};
