import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  Eye,
  Hospital,
  Search,
  Stethoscope,
  UserRound,
  Video,
  X,
} from "lucide-react";
import apiService from "../services/api.service";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

const STATUS_OPTIONS = ["", "pending", "scheduled", "completed", "cancelled", "rejected"];
const MODE_OPTIONS = ["", "in-person", "video", "chat"];

const statusClassMap = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  rejected: "bg-slate-100 text-slate-600 border-slate-200",
};

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
}

export default function AppointmentsPage() {
  const { role } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 8 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    reason: "",
    date: "",
    mode: "in-person",
    start: "",
    end: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    mode: "",
    fromDate: "",
    toDate: "",
    doctorName: "",
  });

  const queryParams = useMemo(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.mode ? { mode: filters.mode } : {}),
      ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
      ...(filters.toDate ? { toDate: filters.toDate } : {}),
      ...(filters.doctorName ? { doctorName: filters.doctorName } : {}),
    }),
    [filters, pagination.page, pagination.limit]
  );

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiService.get("/appointments", { params: queryParams });
        const data = response.data;
        setItems(Array.isArray(data) ? data : data?.items || []);
        setPagination((prev) => ({
          ...prev,
          page: data?.page || prev.page,
          totalPages: data?.totalPages || 1,
          total: data?.total || (Array.isArray(data) ? data.length : 0),
        }));
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [queryParams]);

  const onFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ status: "", mode: "", fromDate: "", toDate: "", doctorName: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openEdit = (appointment) => {
    setEditForm({
      reason: appointment.reason || "",
      date: appointment.date ? new Date(appointment.date).toISOString().slice(0, 10) : "",
      mode: appointment.mode || "in-person",
      start: appointment.timeSlot?.start || "",
      end: appointment.timeSlot?.end || "",
    });
    setActiveAppointment(appointment);
    setEditOpen(true);
  };

  const closeModals = () => {
    setActiveAppointment(null);
    setEditOpen(false);
  };

  const refreshCurrentPage = async () => {
    const response = await apiService.get("/appointments", { params: queryParams });
    const data = response.data;
    setItems(Array.isArray(data) ? data : data?.items || []);
    setPagination((prev) => ({
      ...prev,
      page: data?.page || prev.page,
      totalPages: data?.totalPages || 1,
      total: data?.total || (Array.isArray(data) ? data.length : 0),
    }));
  };

  const submitReschedule = async () => {
    if (!activeAppointment?._id) return;
    try {
      setEditSaving(true);
      await apiService.put(`/appointments/${activeAppointment._id}`, {
        reason: editForm.reason,
        date: editForm.date,
        mode: editForm.mode,
        timeSlot: {
          start: editForm.start,
          end: editForm.end,
        },
      });
      await refreshCurrentPage();
      closeModals();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update appointment.");
    } finally {
      setEditSaving(false);
    }
  };

  const cancelAppointment = async (appointment) => {
    if (!appointment?._id) return;
    const nextStatus = appointment.status === "pending" ? "rejected" : "cancelled";
    try {
      await apiService.put(`/appointments/${appointment._id}`, { status: nextStatus });
      await refreshCurrentPage();
      closeModals();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  const acceptAppointment = async (appointment) => {
    if (!appointment?._id) return;
    try {
      await apiService.put(`/appointments/${appointment._id}`, { status: "scheduled" });
      await refreshCurrentPage();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to accept appointment.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 md:px-8">
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-[#131b2e]">Appointments</h1>
          <p className="text-sm text-slate-500">Track your consultations and manage upcoming visits.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <label className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Doctor</span>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={filters.doctorName}
                onChange={(e) => onFilterChange("doctorName", e.target.value)}
                placeholder="Search doctor"
                className="w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          <label className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Status</span>
            <select
              className="w-full border-0 bg-transparent p-0 text-sm outline-none"
              value={filters.status}
              onChange={(e) => onFilterChange("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option || "all"} value={option}>
                  {option ? option[0].toUpperCase() + option.slice(1) : "All statuses"}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Mode</span>
            <select
              className="w-full border-0 bg-transparent p-0 text-sm outline-none"
              value={filters.mode}
              onChange={(e) => onFilterChange("mode", e.target.value)}
            >
              {MODE_OPTIONS.map((option) => (
                <option key={option || "all"} value={option}>
                  {option ? option[0].toUpperCase() + option.slice(1) : "All modes"}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">From</span>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => onFilterChange("fromDate", e.target.value)}
              className="w-full border-0 bg-transparent p-0 text-sm outline-none"
            />
          </label>

          <label className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">To</span>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => onFilterChange("toDate", e.target.value)}
              className="w-full border-0 bg-transparent p-0 text-sm outline-none"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={clearFilters} className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Reset filters
          </button>
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{items.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{pagination.total}</span> appointments
          </p>
        </div>
      </section>

      {loading ? <p className="text-sm text-slate-500">Loading appointments...</p> : null}
      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">{error}</p> : null}

      {!loading && !error ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.length ? (
            items.map((appointment) => (
              <article key={appointment._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-slate-900">{appointment.reason || "Consultation"}</h2>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                      statusClassMap[appointment.status] || "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {appointment.status || "unknown"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400" /> {formatDate(appointment.date)}</p>
                  <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-400" /> {appointment.timeSlot?.start || "-"} - {appointment.timeSlot?.end || "-"}</p>
                  <p className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-slate-400" /> Dr. {appointment.doctorId?.username || "-"}</p>
                  <p className="flex items-center gap-2"><Hospital className="h-4 w-4 text-slate-400" /> {appointment.facilityId?.name || "-"}</p>
                  <p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-slate-400" /> {appointment.userId?.username || "-"}</p>
                </div>
                <div className="mt-3 flex w-full items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveAppointment(appointment)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0058be] hover:bg-blue-100"
                    title="View details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openEdit(appointment)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                    title="Reschedule"
                  >
                    <CalendarDays className="h-5 w-5" />
                  </button>

                  {role === "doctor" ? (
                    <>
                      {appointment.status === "pending" ? (
                        <button
                          onClick={() => acceptAppointment(appointment)}
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                          title="Accept"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      ) : null}
                      {["pending", "scheduled"].includes(appointment.status) ? (
                        <button
                          onClick={() => cancelAppointment(appointment)}
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200"
                          title="Cancel"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              No appointments found for current filters.
            </div>
          )}
        </section>
      ) : null}

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
          disabled={pagination.page <= 1}
          className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm font-semibold text-slate-600">
          Page {pagination.page} / {pagination.totalPages}
        </span>
        <button
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              page: Math.min(prev.page + 1, prev.totalPages || 1),
            }))
          }
          disabled={pagination.page >= pagination.totalPages}
          className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {activeAppointment && !editOpen ? (
        <div className="fixed inset-0 z-[100] bg-slate-900/45 px-4 pb-10 pt-24">
          <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-7">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-slate-900">Appointment Details</h3>
                <p className="text-sm text-slate-500">{activeAppointment.reason || "Consultation"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                    statusClassMap[activeAppointment.status] || "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {activeAppointment.status || "unknown"}
                </span>
                <button onClick={closeModals} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-shadow hover:shadow-sm">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Schedule</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <span>{formatDate(activeAppointment.date)}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-slate-400" />
                    <span>
                      {activeAppointment.timeSlot?.start || "-"} - {activeAppointment.timeSlot?.end || "-"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 capitalize">
                    <Video className="h-4 w-4 text-slate-400" />
                    <span>{activeAppointment.mode || "-"}</span>
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-shadow hover:shadow-sm">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Clinical Assignment</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-slate-400" />
                    <span>Dr. {activeAppointment.doctorId?.username || "-"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Hospital className="h-4 w-4 text-slate-400" />
                    <span>{activeAppointment.facilityId?.name || "-"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-slate-400" />
                    <span>{activeAppointment.userId?.username || "-"}</span>
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-shadow hover:shadow-sm md:col-span-2">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Reason</h4>
                <p className="flex items-start gap-2 text-sm text-slate-700">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>{activeAppointment.reason || "-"}</span>
                </p>
              </section>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                onClick={() => openEdit(activeAppointment)}
                className="rounded-lg bg-[#0058be] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2170e4]"
              >
                Reschedule
              </button>
              {role !== "user" && ["pending", "scheduled"].includes(activeAppointment.status) ? (
                <button
                  onClick={() => cancelAppointment(activeAppointment)}
                  className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Cancel Appointment
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {activeAppointment && editOpen ? (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/45 px-4 pb-10 pt-24">
          <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:max-h-[calc(100vh-8rem)] md:overflow-y-auto md:p-7">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-slate-900">Reschedule Appointment</h3>
                <p className="text-sm text-slate-500">Update date, time, mode and consultation reason.</p>
              </div>
              <button onClick={closeModals} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-shadow hover:shadow-sm md:col-span-2">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Consultation Details</h4>
                <label className="block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Reason</span>
                  <div className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      value={editForm.reason}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, reason: e.target.value }))}
                      className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                    />
                  </div>
                </label>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-shadow hover:shadow-sm">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Schedule</h4>
                <label className="mb-3 block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Date</span>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                    />
                  </div>
                </label>
                <label className="mb-3 block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Start time</span>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-slate-400" />
                    <input
                      value={editForm.start}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, start: e.target.value }))}
                      className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                    />
                  </div>
                </label>
                <label className="block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">End time</span>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-slate-400" />
                    <input
                      value={editForm.end}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, end: e.target.value }))}
                      className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                    />
                  </div>
                </label>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-shadow hover:shadow-sm">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Consultation Mode</h4>
                <label className="block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Mode</span>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-slate-400" />
                    <select
                      value={editForm.mode}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, mode: e.target.value }))}
                      className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                    >
                      {MODE_OPTIONS.filter(Boolean).map((option) => (
                        <option key={option} value={option}>
                          {option[0].toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
              </section>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                onClick={closeModals}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={submitReschedule}
                disabled={editSaving}
                className="rounded-lg bg-[#0058be] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

