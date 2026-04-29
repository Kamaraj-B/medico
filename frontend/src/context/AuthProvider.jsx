import React, { createContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, refreshToken, logout } from "../store/slices/authSlice";
import Modal from "../components/Utility/Modal";
import CustomLoader from "../components/Utility/CustomLoader";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // local loading for initial rehydrate
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [logoutTimer, setLogoutTimer] = useState(null);

  const scheduleTokenCheck = (exp) => {
    clearTimeout(logoutTimer);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = exp - currentTime;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setShowExpiryModal(true), Math.max(0, timeLeft - 30) * 1000);
      setLogoutTimer(timer);
    }
  };

  // Logout using thunk
  const handleLogout = async () => {
    await dispatch(logout());
    setRole(null);
    setShowExpiryModal(false);
  };

  // Refresh token using thunk
  const handleRefreshToken = async () => {
    //const tokenStr = localStorage.getItem("tokenInfo");
   // const token = tokenStr ? JSON.parse(tokenStr) : null;
    const result = await dispatch(refreshToken());
    if (result.payload) {
      setRole(result.payload.role || (user?.role ?? null));
      scheduleTokenCheck(result.payload.exp);
      setShowExpiryModal(false);
    } else {
      handleLogout();
    }
  };

  // Initial rehydration
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      setLoading(true);
      try {
        const tokenInfo = localStorage.getItem("tokenInfo");
        if (tokenInfo) {
          const parsedToken = JSON.parse(tokenInfo);
          if (parsedToken.exp && Math.floor(Date.now() / 1000) < parsedToken.exp) {
            const result = await dispatch(fetchUserProfile());
            if (result.payload && mounted) {
              setRole(result.payload.role || parsedToken.role || null);
              scheduleTokenCheck(parsedToken.exp);
            }
          } else {
            localStorage.removeItem("tokenInfo");
          }
        } else {
          // Redirect-based Google OAuth sets cookies on backend.
          // Rehydrate from cookie session even when localStorage token is empty.
          const result = await dispatch(fetchUserProfile());
          if (result.payload && mounted) {
            setRole(result.payload.role || null);
            const tokenInfoAfterVerify = localStorage.getItem("tokenInfo");
            if (tokenInfoAfterVerify) {
              const parsedToken = JSON.parse(tokenInfoAfterVerify);
              if (parsedToken?.exp) {
                scheduleTokenCheck(parsedToken.exp);
              }
            }
          } else if (mounted) {
            setRole(null);
          }
        }
      } catch (err) {
        console.error("AuthProvider init error:", err);
        await dispatch(logout());
        setRole(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (logoutTimer) clearTimeout(logoutTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ role, setRole, logout: handleLogout, loading, refreshToken: handleRefreshToken }}>
      {children}
      {showExpiryModal && (
        <Modal
          open={showExpiryModal}
          onClose={() => setShowExpiryModal(false)}
          title="Session Expiry Warning"
          onSubmit={handleRefreshToken}
          submitText="Refresh Session"
          cancelText="Logout"
          showActions={true}
        >
          <CustomLoader />
        </Modal>
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
