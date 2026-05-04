import { ShieldCheck, Smartphone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#131b2e] pb-10 pt-20 text-slate-400">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="mb-20 grid grid-cols-1 gap-16 md:grid-cols-4">
          <div>
            <h2 className="mb-8 text-2xl font-bold text-white">MedConnect</h2>
            <p className="mb-8 text-sm leading-relaxed">
              Empowering healthcare through seamless connection and expert care delivery for everyone.
            </p>
          </div>
          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-white">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li>Find a Doctor</li>
              <li>Lab Results</li>
              <li>Virtual Care</li>
              <li>Health Records</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-white">Support</h4>
            <ul className="space-y-4 text-sm">
              <li>Help Center</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-white">Download Our App</h4>
            <p className="mb-6 text-sm">Manage your health on the go with our top-rated mobile app.</p>
            <button className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="rounded-lg bg-white/10 p-2">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase text-slate-500">Available on the</p>
                <p className="text-sm font-bold text-white">App Store</p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-8 border-t border-white/10 pt-10 md:flex-row">
          <p className="text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} MedConnect Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-3 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">
              HIPAA Compliant Secure Portal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

