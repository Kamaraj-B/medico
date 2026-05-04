import { ArrowRight } from "lucide-react";

export default function HealthResources() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Health Resources</h2>
          <p className="mt-2 text-slate-500">Expert medical advice and wellness tips for your daily life</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="relative overflow-hidden rounded-[2rem] shadow-xl md:col-span-8">
            <img
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGSB3np-EpDSar4OLWllWp5UvzrSnYgd1RAFI5Rtim1eMB5vVQ7_1rn22FisjXiOgDJfZbl4tr8rVuqnMBYkXovj0KaZC_7L_--dqeDiDpA3y0n4Su_Sj5FJLvYIMXavaewByCQk11f0iRlvKJhHOPVe1cO73UPbPNE9wxh9XRaCdhFlgYiZ3rxLoIsf2pm_fr37oM5awmATXlrO9FiUbg51CB9XUJOwVLnlJ70v002iG3sezdYrt-fAHdbsMVNX-95N7-f82kFgEs"
              alt="Meditation and wellness"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#131b2e]/90 via-[#131b2e]/20 to-transparent p-10">
              <span className="mb-4 w-fit rounded-full bg-[#0058be] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                Preventative Care
              </span>
              <h3 className="mb-3 text-3xl font-bold text-white">10 Habits for a Healthier Heart in 2024</h3>
              <p className="max-w-xl text-lg text-white/80">
                Simple lifestyle adjustments that can significantly reduce your risk of cardiovascular issues.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:col-span-4">
            {[
              {
                category: "Mental Health",
                title: "Managing Stress During Work Hours",
                description:
                  "Quick breathing exercises and micro-breaks to keep your productivity high and stress low.",
              },
              {
                category: "Nutrition",
                title: "Superfoods to Boost Your Immunity",
                description:
                  "Discover the best seasonal fruits and vegetables to keep your immune system strong this winter.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col justify-between rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg"
              >
                <div>
                  <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-[#0058be]">
                    {item.category}
                  </span>
                  <h4 className="mb-4 text-xl font-bold leading-tight text-slate-900">{item.title}</h4>
                  <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
                </div>
                <button className="mt-8 flex items-center gap-2 text-sm font-bold text-[#131b2e]">
                  Read more <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

