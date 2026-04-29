import React, { useContext } from "react";
import CustomLoader from "./components/Utility/CustomLoader";
import { AuthContext } from "./context/AuthProvider";
import Login from "./pages/Login";
import AdminRoutes from "./routes/AdminRoutes";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { role, loading } = useContext(AuthContext);

  // While auth is being rehydrated, show loader
  if (loading) {
    return <CustomLoader />;
  }

  // No role -> show login UI
  if (!role) {
    return <Login />;
  }

  // else choose route set
  return role === "admin" ? <AdminRoutes /> : <AppRoutes />;
}

export default App;
