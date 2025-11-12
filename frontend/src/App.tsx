import { useState, useEffect } from "react";
import { UserList } from "./components/UserList";
import { ProductList } from "./components/ProductList";
import { OrderList } from "./components/OrderList";
import { HealthCheck } from "./components/HealthCheck";
import { Login } from "./components/Login";
import "./App.css";

export function App() {
  const [activeTab, setActiveTab] = useState<
    "users" | "products" | "orders" | "health"
  >("users");
  const [isLight, setIsLight] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check token and decode basic info
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      try {
        // Decode JWT payload (not secure for secrets, just UI logic)
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload?.roles?.length) {
          setUserRole(payload.roles[0]); // e.g. "admin" or "user"
        }
      } catch (e) {
        console.warn("Failed to decode token:", e);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  // Theme handling
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsLight(savedTheme === "light");
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: light)");
    setIsLight(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsLight(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    document.documentElement.className = isLight ? "light" : "";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  }, [isLight]);

  const toggleTheme = () => setIsLight(!isLight);

  const handleLoginSuccess = () => {
  setIsAuthenticated(true);
  const token = localStorage.getItem("authToken");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload?.roles?.[0] || null;
      setUserRole(role);

      // Automatically select the correct starting tab
      if (role === "admin") {
        setActiveTab("users");
      } else {
        setActiveTab("products");
      }
    } catch (e) {
      console.warn("Failed to decode token:", e);
    }
  }
};


  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Secure API Gateway</h1>
          <nav className="theme-toggle">
            <button onClick={toggleTheme}>
              {isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            </button>
          </nav>
        </header>
        <main>
          <Login onLoginSuccess={handleLoginSuccess} />
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Secure API Gateway</h1>
        <nav className="theme-toggle">
          <button onClick={toggleTheme}>
            {isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          </button>
        </nav>

        <nav className="tab-navigation">
          {/* Role-based tab visibility */}
          {userRole === "admin" && (
            <button
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              Users
            </button>
          )}
          <button
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={activeTab === "health" ? "active" : ""}
            onClick={() => setActiveTab("health")}
          >
            Health Check
          </button>
        </nav>
      </header>

      <main className="App-main">
        {activeTab === "users" && userRole === "admin" && <UserList />}
        {activeTab === "products" && <ProductList />}
        {activeTab === "orders" && <OrderList />}
        {activeTab === "health" && <HealthCheck />}
      </main>

      <button
        style={{ width: "fit-content", alignSelf: "center", marginTop: 10 }}
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default App;
