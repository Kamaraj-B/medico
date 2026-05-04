import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../store/slices/authSlice";
import apiService from "../services/api.service";
import { useSearchParams } from "react-router-dom";

export default function ForcePasswordChangePage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const token = searchParams.get("token");
    if (token) {
      try {
        await apiService.post("/auth/set-password-with-token", { token, newPassword });
        setMessage("Password set successfully. Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } catch (err) {
        setMessage(err?.response?.data?.error || "Invalid or expired setup link.");
      }
      return;
    }

    const result = await dispatch(changePassword({ newPassword }));
    if (!result.error) {
      setMessage("Password updated successfully. Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 900);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pt-20">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Set New Password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your account requires a password change before continuing.
        </p>

        {error ? <p className="mt-3 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{String(error)}</p> : null}
        {message ? <p className="mt-3 rounded-lg bg-blue-50 p-2 text-sm text-blue-700">{message}</p> : null}

        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#0058be] px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}

