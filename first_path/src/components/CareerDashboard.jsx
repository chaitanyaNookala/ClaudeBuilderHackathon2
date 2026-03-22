import { motion, AnimatePresence } from 'framer-motion';

export const CareerDashboard = ({ career, marketData, accentColor, onClose }) => {
  if (!career) return null;

  const {
    title = '',
    description = '',
    match_score = 0,
    salary_range = {},
    success_rate = 0,
    time_to_entry = '',
    remote_friendly = false,
  } = career;

  const {
    growth_rate = 0,
    ai_impact = 'medium',
    ai_impact_detail = '',
    demand_trend = [],
    top_companies = [],
    key_skills = [],
  } = marketData || {};

  const avgSalary = salary_range.average || 0;
  const maxSalary = salary_range.maximum || 0;
  const minSalary = Math.round(avgSalary * 0.65);

  const aiColors = {
    low: '#5be3b0',
    medium: '#f5c842',
    high: '#f07048',
  };

  const maxDemand = Math.max(...demand_trend.map(d => d.demand), 1);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Card */}
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0d0d14] shadow-2xl"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>

          <div className="p-6 md:p-10">

            {/* Header */}
            <div className="flex items-start gap-4 mb-8 pr-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="font-mono text-sm font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                  >
                    {match_score}% Match
                  </span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
                  {title}
                </h2>
                <p className="font-sans text-zinc-400 text-sm leading-relaxed max-w-2xl">
                  {description}
                </p>
              </div>
            </div>

            {/* At a Glance — stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Avg Salary', value: `$${(avgSalary/1000).toFixed(0)}k/yr` },
                { label: 'Success Rate', value: `${success_rate}%` },
                { label: 'Time to Entry', value: time_to_entry },
                { label: 'Remote', value: remote_friendly ? 'Yes ✓' : 'Limited' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mb-2">
                    {stat.label}
                  </p>
                  <p className="font-serif text-xl font-bold text-white">
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Demand Trend — pure SVG bar chart */}
            {demand_trend.length > 0 && (
              <div className="mb-8">
                <h3 className="font-serif text-lg font-semibold text-white mb-4">
                  Industry Demand Trend
                </h3>
                <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="flex items-end gap-2 h-32">
                    {demand_trend.map((point, i) => {
                      const heightPct = (point.demand / maxDemand) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="font-mono text-[9px] text-zinc-500">
                            {point.demand}
                          </span>
                          <motion.div
                            className="w-full rounded-t-md"
                            style={{ backgroundColor: `${accentColor}80` }}
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            transition={{ delay: i * 0.06, duration: 0.5 }}
                          />
                          <span className="font-mono text-[9px] text-zinc-600">
                            {point.year}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: accentColor }}
                    >
                      +{growth_rate}% growth
                    </span>
                    <span className="font-mono text-[10px] text-zinc-600">
                      projected over this period
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Salary Range Bar */}
            <div className="mb-8">
              <h3 className="font-serif text-lg font-semibold text-white mb-4">
                Salary Range
              </h3>
              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="relative h-3 rounded-full bg-white/10 mb-4">
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${accentColor}40, ${accentColor})`,
                      width: '100%'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                  {/* Average marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
                    style={{
                      left: `${((avgSalary - minSalary) / (maxSalary - minSalary)) * 100}%`,
                      backgroundColor: accentColor
                    }}
                  />
                </div>
                <div className="flex justify-between font-mono text-xs text-zinc-400">
                  <span>${(minSalary/1000).toFixed(0)}k entry</span>
                  <span style={{ color: accentColor }}>${(avgSalary/1000).toFixed(0)}k avg</span>
                  <span>${(maxSalary/1000).toFixed(0)}k senior</span>
                </div>
              </div>
            </div>

            {/* AI Impact */}
            <div className="mb-8">
              <h3 className="font-serif text-lg font-semibold text-white mb-4">
                AI Impact on This Field
              </h3>
              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] flex items-start gap-4">
                <span
                  className="font-mono text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0"
                  style={{
                    backgroundColor: `${aiColors[ai_impact] || '#f5c842'}20`,
                    color: aiColors[ai_impact] || '#f5c842'
                  }}
                >
                  {ai_impact} impact
                </span>
                <p className="font-sans text-zinc-400 text-sm leading-relaxed">
                  {ai_impact_detail}
                </p>
              </div>
            </div>

            {/* Two columns — Skills + Companies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-serif text-lg font-semibold text-white mb-4">
                  Key Skills Needed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {key_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="font-sans text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-zinc-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-white mb-4">
                  Top Companies Hiring
                </h3>
                <div className="space-y-2">
                  {top_companies.map((company, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span style={{ color: accentColor }} className="text-xs">▸</span>
                      <span className="font-sans text-sm text-zinc-300">{company}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
