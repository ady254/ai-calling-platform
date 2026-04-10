export default function Dashboard() {
  return (
    <div className="w-full">
      <header className="mb-10 w-full flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-2">Welcome back! Here's what's happening with your AI campaigns today.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="rounded-2xl bg-white p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <h3 className="text-slate-500 font-medium text-sm">Total Calls Made</h3>
            <p className="text-4xl font-bold text-slate-800 mt-4 leading-none">1,248</p>
            <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-max">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                +12% this week
            </div>
        </div>
        
        <div className="rounded-2xl bg-white p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <h3 className="text-slate-500 font-medium text-sm">Active Campaigns</h3>
            <p className="text-4xl font-bold text-slate-800 mt-4 leading-none">5</p>
            <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full w-max">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                2 finishing soon
            </div>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 text-white hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300">
            <h3 className="text-white/80 font-medium text-sm">Average Success Rate</h3>
            <p className="text-4xl font-bold text-white mt-4 leading-none">94.2%</p>
            <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-white/90 bg-white/20 px-2.5 py-1 rounded-full w-max backdrop-blur-md border border-white/10">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                +2.4% vs last week
            </div>
        </div>
      </div>
    </div>
  );
}