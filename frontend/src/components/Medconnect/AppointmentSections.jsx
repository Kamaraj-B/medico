import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

function toCard(appointment) {
  return {
    id: appointment._id,
    title: appointment.facilityId?.name || "Facility",
    doctor: appointment.doctorId?.username || appointment.userId?.username || "Provider",
    date: appointment.date ? new Date(appointment.date).toLocaleDateString() : "-",
    time: `${appointment.timeSlot?.start || "-"} - ${appointment.timeSlot?.end || "-"}`,
    mode: appointment.mode || "in-person",
  };
}

function getPreviousAndUpcoming(appointments = []) {
  const now = new Date();
  const previous = appointments
    .filter((item) => item?.date && (new Date(item.date) < now || item.status === "completed"))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(toCard);

  const upcoming = appointments
    .filter((item) => item?.date && new Date(item.date) >= now && ["pending", "scheduled"].includes(item.status))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(toCard);

  return { previous, upcoming };
}

function Section({ title, subtitle, items, upcoming = false }) {
  const [start, setStart] = useState(0);
  const visible = items.slice(start, start + 2);
  const cards = visible.length ? visible : [];

  return (
    <div className="flex flex-col">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="flex gap-1">
          <button
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 disabled:opacity-40"
            disabled={start === 0}
            onClick={() => setStart((prev) => Math.max(prev - 1, 0))}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 disabled:opacity-40"
            disabled={start + 2 >= items.length}
            onClick={() => setStart((prev) => Math.min(prev + 1, Math.max(items.length - 2, 0)))}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(cards.length ? cards : [
          {
            id: "fallback-1",
            title: "XYZ Pharma",
            doctor: "Kamaraj B",
            date: "5/8/2026",
            time: upcoming ? "11:30 - 12:00" : "10:00 - 10:30",
            mode: upcoming ? "in-person" : "",
          },
          {
            id: "fallback-2",
            title: upcoming ? "XYZ Pharma" : "City General",
            doctor: upcoming ? "Kamaraj B" : "Dr. Sarah Wilson",
            date: upcoming ? "5/25/2026" : "4/12/2024",
            time: upcoming ? "11:45 - 12:15" : "14:15 - 14:45",
            mode: upcoming ? "video" : "",
          },
        ]).map((item) => (
          <div key={item.id} className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4">
              <div className="mb-1 flex items-center gap-1.5">
                {upcoming ? <Calendar size={16} className="text-[#0058be]" /> : null}
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              </div>
              <p className="text-xs text-slate-500">{item.doctor}</p>
            </div>
            <div className="mb-5 text-xs text-slate-500">
              <p>{item.date} • {item.time}</p>
              {upcoming ? <p className="mt-1 capitalize">Mode: {item.mode}</p> : null}
            </div>
            <button className="mt-auto w-full rounded-lg bg-[#0058be] py-2.5 text-sm font-semibold text-white hover:bg-[#2170e4]">
              {upcoming ? "Manage" : "View Details"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppointmentSections({ appointments = [] }) {
  const { previous, upcoming } = useMemo(
    () => getPreviousAndUpcoming(appointments),
    [appointments]
  );

  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 py-16 md:px-8 lg:grid-cols-2">
      <Section title="Previously Booked" subtitle="Latest consultations" items={previous} />
      <Section title="Upcoming Appointments" subtitle="Scheduled and pending visits" items={upcoming} upcoming />
    </section>
  );
}

