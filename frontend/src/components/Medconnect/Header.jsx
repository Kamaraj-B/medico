import { Bell, Menu, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { text: "Appointments", to: "/appointments" },
  { text: "Records", to: "/records" },
  { text: "Messages", to: "/messages" },
  { text: "Find Care", to: "/" },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-[#131b2e]">
            MedConnect
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.text}
                  to={item.to}
                  className={`text-sm font-semibold transition-colors ${
                    active ? "text-[#0058be]" : "text-slate-600 hover:text-[#0058be]"
                  }`}
                >
                  {item.text}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden rounded-full border border-red-100 bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 sm:block">
            Emergency
          </button>
          <button className="text-slate-500 hover:text-[#0058be]">
            <Bell size={20} />
          </button>
          <button className="text-slate-500 hover:text-[#0058be]">
            <User size={20} />
          </button>
          <button className="text-slate-500 md:hidden">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

