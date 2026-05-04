import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Clock3, Hospital, Stethoscope, Video } from "lucide-react";
import apiService from "../services/api.service";

const MODES = ["in-person", "video", "chat"];

function dayNameFromDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { weekday: "long" });
}

function parseRangeToSlots(rangeString) {
  if (!rangeString || !rangeString.includes("-")) return [];
  const [startRaw, endRaw] = rangeString.split("-").map((s) => s.trim());
  const [startH, startM] = startRaw.split(":").map(Number);
  const [endH, endM] = endRaw.split(":").map(Number);
  if ([startH, startM, endH, endM].some(Number.isNaN)) return [];

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const slots = [];
  for (let at = startMinutes; at + 30 <= endMinutes; at += 30) {
    const next = at + 30;
    const toHHMM = (mins) =>
      `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    slots.push({ start: toHHMM(at), end: toHHMM(next) });
  }
  return slots;
}

function getSlotsForDoctorAndDate(doctor, selectedDate) {
  if (!doctor || !selectedDate) return [];
  const day = dayNameFromDate(selectedDate);
  const isAvailable = (doctor.availableDays || []).includes(day);
  if (!isAvailable) return [];

  const timeMap = doctor.availableTime || {};
  const selectedDayWindow = timeMap?.[day] || {};
  const dayWindow = selectedDayWindow?.day || "";
  const nightWindow = selectedDayWindow?.night || "";
  const daySlots = parseRangeToSlots(dayWindow);
  const nightSlots = parseRangeToSlots(nightWindow);
  return [...daySlots, ...nightSlots];
}

function slotStartToMinutes(start) {
  const [h, m] = String(start).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

/** True if two [start, end) HH:mm intervals overlap (touching at boundary does not count). */
function timeIntervalsOverlap(startA, endA, startB, endB) {
  return (
    slotStartToMinutes(startA) < slotStartToMinutes(endB) &&
    slotStartToMinutes(endA) > slotStartToMinutes(startB)
  );
}

function annotateSlotsWithBooked(slots, bookedRanges) {
  return slots.map((slot) => ({
    ...slot,
    booked: bookedRanges.some(
      (b) => b.start && b.end && timeIntervalsOverlap(slot.start, slot.end, b.start, b.end)
    ),
  }));
}

/** Morning 05:00–11:59, Evening 12:00–17:59, Night 18:00–04:59 (late / overnight). */
function periodKeyFromSlotStart(start) {
  const h = Math.floor(slotStartToMinutes(start) / 60);
  if (h >= 18 || h < 5) return "night";
  if (h < 12) return "morning";
  return "evening";
}

const SLOT_PERIOD_GROUPS = [
  { id: "morning", label: "Morning" },
  { id: "evening", label: "Evening" },
  { id: "night", label: "Night" },
];

function groupSlotsByPeriod(slots) {
  const sorted = [...slots].sort((a, b) => slotStartToMinutes(a.start) - slotStartToMinutes(b.start));
  const buckets = { morning: [], evening: [], night: [] };
  for (const slot of sorted) {
    buckets[periodKeyFromSlotStart(slot.start)].push(slot);
  }
  return SLOT_PERIOD_GROUPS.map(({ id, label }) => {
    const list = buckets[id];
    const count = list.length;
    const bookedCount = list.filter((s) => s.booked).length;
    const freeCount = count - bookedCount;
    return {
      id,
      label,
      slots: list,
      count,
      freeCount,
      bookedCount,
    };
  }).filter((g) => g.count > 0);
}

function getDoctorTimePreview(doctor) {
  const days = doctor?.availableDays || [];
  const firstDay = days[0];
  const timeMap = doctor?.availableTime || {};
  const preview = firstDay ? timeMap?.[firstDay] : null;
  if (!preview) return "Time: -";
  const dayText = preview.day || "-";
  const nightText = preview.night ? ` | ${preview.night}` : "";
  return `Time: ${dayText}${nightText}`;
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const facilityDropdownRef = useRef(null);
  const [facility, setFacility] = useState(null);
  const [facilityOptions, setFacilityOptions] = useState([]);
  const [facilitySearch, setFacilitySearch] = useState("");
  const [facilityDropdownOpen, setFacilityDropdownOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookedOccupied, setBookedOccupied] = useState([]);
  const [form, setForm] = useState({
    doctorId: "",
    reason: "",
    date: "",
    mode: "in-person",
    slot: "",
  });

  useEffect(() => {
    const loadFacilityData = async () => {
      setLoading(true);
      setError("");
      try {
        const [selectedFacilityRes, allFacilitiesRes] = await Promise.all([
          apiService.get(`/facilities/${id}`),
          apiService.get("/facilities"),
        ]);

        const selectedFacility = selectedFacilityRes.data?.facility || null;
        setFacility(selectedFacility);
        setFacilitySearch(selectedFacility?.name || "");
        setDoctors(selectedFacilityRes.data?.doctors || []);
        setFacilityOptions(allFacilitiesRes.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    loadFacilityData();
  }, [id]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!facilityDropdownRef.current) return;
      if (!facilityDropdownRef.current.contains(event.target)) {
        setFacilityDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredFacilityOptions = useMemo(() => {
    const query = facilitySearch.trim().toLowerCase();
    if (!query) return facilityOptions.slice(0, 8);
    return facilityOptions
      .filter((item) =>
        `${item.name || ""} ${item.type || ""} ${item.address?.city || ""}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 8);
  }, [facilityOptions, facilitySearch]);

  const selectedDoctor = useMemo(
    () => doctors.find((doc) => doc._id === form.doctorId) || null,
    [doctors, form.doctorId]
  );

  const availableSlots = useMemo(
    () => getSlotsForDoctorAndDate(selectedDoctor, form.date),
    [selectedDoctor, form.date]
  );

  useEffect(() => {
    if (!form.doctorId || !form.date || !id) {
      setBookedOccupied([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiService.get("/appointments/booked-slots", {
          params: { doctorId: form.doctorId, facilityId: id, date: form.date },
        });
        const slots = Array.isArray(res.data?.slots) ? res.data.slots : [];
        if (!cancelled) setBookedOccupied(slots);
      } catch {
        if (!cancelled) setBookedOccupied([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form.doctorId, form.date, id]);

  const slotsWithBooked = useMemo(
    () => annotateSlotsWithBooked(availableSlots, bookedOccupied),
    [availableSlots, bookedOccupied]
  );

  const slotGroups = useMemo(() => groupSlotsByPeriod(slotsWithBooked), [slotsWithBooked]);

  useEffect(() => {
    if (!form.slot) return;
    const parts = form.slot.split("|");
    if (parts.length !== 2 || !parts[0] || !parts[1]) return;
    const [start, end] = parts;
    const taken = bookedOccupied.some(
      (b) => b.start && b.end && timeIntervalsOverlap(start, end, b.start, b.end)
    );
    if (taken) {
      setForm((prev) => ({ ...prev, slot: "" }));
    }
  }, [bookedOccupied, form.slot]);

  const submitBooking = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!form.doctorId || !form.reason || !form.date || !form.slot) {
      setError("Please complete all required fields.");
      return;
    }

    const [start, end] = form.slot.split("|");
    if (!start || !end) {
      setError("Please select a valid time slot.");
      return;
    }

    const slotTaken = bookedOccupied.some(
      (b) => b.start && b.end && timeIntervalsOverlap(start, end, b.start, b.end)
    );
    if (slotTaken) {
      setError("This time slot is no longer available. Please choose another.");
      return;
    }

    try {
      setSubmitting(true);
      await apiService.post("/appointments", {
        doctorId: form.doctorId,
        facilityId: id,
        reason: form.reason,
        date: form.date,
        mode: form.mode,
        timeSlot: { start, end },
      });
      setSuccess("Appointment request submitted successfully.");
      setTimeout(() => navigate("/appointments"), 1000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-3 pb-16 pt-24 sm:px-4 md:pt-28 md:px-8">
      <section className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:mb-5 md:p-7">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Find Care / Booking</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#131b2e] md:text-4xl">Book Appointment</h1>
        <p className="mt-2 text-sm text-slate-500 md:text-base">Select doctor, date, slot and consultation mode.</p>
      </section>

      {loading ? <p className="text-sm text-slate-500">Loading booking information...</p> : null}
      {error ? <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 sm:p-3.5">{error}</p> : null}
      {success ? <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 sm:p-3.5">{success}</p> : null}

      {!loading && facility ? (
        <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-1">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Facility</h2>
            <label ref={facilityDropdownRef} className="mb-4 block rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Search Facility</span>
              <input
                value={facilitySearch}
                onFocus={() => setFacilityDropdownOpen(true)}
                onChange={(e) => {
                  setFacilitySearch(e.target.value);
                  setFacilityDropdownOpen(true);
                }}
                placeholder="Search by name, type, or city"
                className="min-h-6 w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-slate-400"
              />

              {facilityDropdownOpen ? (
                <div className="mt-2 max-h-44 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
                  {filteredFacilityOptions.length ? (
                    filteredFacilityOptions.map((option) => (
                      <button
                        type="button"
                        key={option._id}
                        onClick={() => {
                          setFacilityDropdownOpen(false);
                          setFacilitySearch(option.name || "");
                          navigate(`/booking/${option._id}`);
                        }}
                        className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition ${
                          option._id === id
                            ? "bg-blue-100 text-blue-800"
                            : "bg-white text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <p className="font-semibold">{option.name}</p>
                        <p className="capitalize text-slate-500">{option.type || "facility"}</p>
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-1 text-xs text-slate-500">No facilities found.</p>
                  )}
                </div>
              ) : null}
            </label>

            <div className="space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <Hospital className="h-4 w-4 text-slate-400" />
                <span>{facility.name || "-"}</span>
              </p>
              <p className="capitalize text-slate-500">{facility.type || "-"}</p>
            </div>

            <h3 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-slate-500">Available Doctors</h3>
            <div className="space-y-2">
              {doctors.map((doctor) => (
                <button
                  type="button"
                  key={doctor._id}
                  onClick={() => setForm((prev) => ({ ...prev, doctorId: doctor._id, slot: "" }))}
                  className={`min-h-11 w-full rounded-xl border px-3 py-2.5 text-left transition ${
                    form.doctorId === doctor._id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800">{doctor.username}</p>
                  <p className="text-xs text-slate-500">{doctor.specialization || "General"}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Days: {(doctor.availableDays || []).join(", ") || "-"}
                  </p>
                  <p className="text-[11px] text-slate-500">{getDoctorTimePreview(doctor)}</p>
                </button>
              ))}
              {!doctors.length ? <p className="text-sm text-slate-500">No doctors linked to this facility.</p> : null}
            </div>
          </section>

          <form onSubmit={submitBooking} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2 md:p-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Booking Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Reason</span>
                <input
                  required
                  value={form.reason}
                  onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Describe your concern"
                  className="min-h-6 w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-slate-400"
                />
              </label>

              <label className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Date</span>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value, slot: "" }))}
                    className="min-h-6 w-full border-0 bg-transparent p-0 text-sm outline-none"
                  />
                </div>
              </label>

              <label className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Mode</span>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-slate-400" />
                  <select
                    value={form.mode}
                    onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value }))}
                    className="min-h-6 w-full border-0 bg-transparent p-0 text-sm outline-none"
                  >
                    {MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode[0].toUpperCase() + mode.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Time Slot</span>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  <select
                    required
                    value={form.slot}
                    onChange={(e) => setForm((prev) => ({ ...prev, slot: e.target.value }))}
                    className="min-h-6 w-full border-0 bg-transparent p-0 text-sm outline-none"
                    disabled={!selectedDoctor || !form.date}
                  >
                    <option value="">Select available slot</option>
                    {slotGroups.map((group) => (
                      <optgroup
                        key={group.id}
                        label={`${group.label} — ${group.freeCount} of ${group.count} free${
                          group.bookedCount ? ` (${group.bookedCount} booked)` : ""
                        }`}
                      >
                        {group.slots.map((slot) => (
                          <option
                            key={`${slot.start}-${slot.end}`}
                            value={`${slot.start}|${slot.end}`}
                            disabled={slot.booked}
                          >
                            {slot.start} - {slot.end}
                            {slot.booked ? " (Booked)" : ""}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                {selectedDoctor && form.date && !availableSlots.length ? (
                  <p className="mt-2 text-xs text-amber-700">
                    No slots available for {dayNameFromDate(form.date)}. Try another date.
                  </p>
                ) : null}
              </label>
            </div>

            <div className="mt-5 flex flex-col items-stretch justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
              <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
                <Stethoscope className="h-3.5 w-3.5" />
                {selectedDoctor ? `Doctor: ${selectedDoctor.username}` : "Select a doctor to continue"}
              </p>
              <button
                type="submit"
                disabled={submitting || !form.doctorId}
                className="min-h-11 w-full rounded-xl bg-[#0058be] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2170e4] disabled:opacity-50 sm:w-auto"
              >
                {submitting ? "Submitting..." : "Confirm Booking"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

