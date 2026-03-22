import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendToDiscord } from '../utils/discordSend';
import { CareerDashboard } from './CareerDashboard';

export const ResultScreen = ({ result, accentColor, onSave, onRestart, onFlare, profileData }) => {
  const [discordId, setDiscordId] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleDiscordSend = async () => {
    if (!discordId.trim() || sending || sent) return;
    setSending(true);
    try {
      await sendToDiscord(discordId.trim(), result.seven_day_plan);
      setSent(true);
      setToast({ message: "Sent! Check your Discord DMs 🎉", type: 'success' });
      if (onFlare) onFlare();
    } catch (err) {
      setToast({ message: "Something went wrong. Try again.", type: 'error' });
    } finally {
      setSending(false);
    }
  };

  if (!result) return null;

  const { careers = [], actions = [], seven_day_plan = [], encouragement = '' } = result;

  return (
    <section data-testid="result-screen" className="relative min-h-screen z-10 px-6 py-24">

      {selectedCareer && (
        <CareerDashboard
          career={selectedCareer}
          marketData={result.market_data}
          accentColor={accentColor}
          onClose={() => setSelectedCareer(null)}
        />
      )}

      {/* Aurora drift at top */}
      <div className="fixed top-0 left-0 right-0 h-32 pointer-events-none z-20 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}10, transparent)` }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="font-mono text-xs tracking-widest uppercase text-zinc-500 block mb-4">
            Your Roadmap
          </span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">
            The path is clear
          </h2>
          {profileData && (
            <p className="font-sans text-zinc-500 text-sm">
              Built for a {profileData.age} {profileData.occupation}
            </p>
          )}
        </motion.div>

        {/* Career Matches — 8 cards in 4x2 grid */}
        <motion.div className="mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h3 className="font-serif text-2xl font-semibold text-white mb-6">Career Matches</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {careers.map((career, i) => (
              <motion.div
                key={i}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCareer(career);
                  }
                }}
                className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl cursor-pointer group hover:-translate-y-1 transition-transform duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                onClick={() => setSelectedCareer(career)}
              >
                <span className="font-mono text-2xl font-bold block mb-2" style={{ color: accentColor }}>
                  {career.match_score != null ? `${career.match_score}%` : '—'}
                </span>
                <h4 className="font-serif text-base font-semibold text-white mb-2 leading-tight">
                  {career.title}
                </h4>
                {career.salary_range && (
                  <p className="font-sans text-zinc-500 text-xs mb-1">
                    ~${(career.salary_range.average / 1000).toFixed(0)}k/yr avg
                  </p>
                )}
                {career.time_to_entry && (
                  <p className="font-mono text-[10px] text-zinc-600 mb-3">
                    {career.time_to_entry}
                  </p>
                )}
                <div
                  className="font-mono text-[10px] tracking-wider uppercase opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ color: accentColor }}
                >
                  Explore →
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Steps */}
        <motion.div className="mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h3 className="font-serif text-2xl font-semibold text-white mb-6">Start This Week</h3>
          <div className="space-y-3">
            {actions.map((action, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-4 p-5 rounded-xl border border-white/10 bg-white/[0.03]"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <span className="font-mono text-xs font-bold mt-0.5 shrink-0" style={{ color: accentColor }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="font-sans text-zinc-300 text-sm leading-relaxed">{action}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 7-Day Plan */}
        <motion.div className="mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h3 className="font-serif text-2xl font-semibold text-white mb-2">
            Your 7-Day Trial Path
          </h3>
          <p className="font-sans text-zinc-400 text-sm mb-8">
            Live like you already have this career. One real action per day, for 7 days.
          </p>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {seven_day_plan.map((day) => (
              <motion.div
                key={day.day}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl flex flex-col gap-2"
              >
                <span className="font-mono text-xs font-bold tracking-widest uppercase" style={{ color: accentColor }}>
                  Day {day.day}
                </span>
                <p className="font-serif text-sm font-semibold text-white leading-tight">
                  {day.focus}
                </p>
                <p className="font-sans text-zinc-400 text-xs leading-relaxed flex-1">
                  {day.task}
                </p>
                <div className="mt-2 pt-2 border-t border-white/5 font-mono text-[10px] text-zinc-500 leading-tight">
                  ✓ {day.milestone}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Discord Section */}
          <motion.div
            className="mt-10 p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl">🤖</span>
              <h4 className="font-serif text-lg font-semibold text-white">
                Get daily check-ins on Discord
              </h4>
            </div>
            <p className="font-sans text-zinc-400 text-sm mb-5">
              Our AI bot will DM you every morning at 9AM with your day&apos;s task,
              keep you accountable, and check in on how it feels to live this career path.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Your Discord User ID (e.g. 123456789012345678)"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                disabled={sent}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.05]
                  font-sans text-sm text-white placeholder-zinc-600
                  focus:outline-none focus:border-white/25 transition-colors duration-300
                  disabled:opacity-40"
              />
              <button
                type="button"
                onClick={handleDiscordSend}
                disabled={!discordId.trim() || sending || sent}
                className="px-6 py-3 rounded-xl font-sans font-semibold text-sm text-black
                  transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                  disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                style={{ backgroundColor: (!discordId.trim() || sending || sent) ? '#444' : accentColor }}
              >
                {sending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Sending...
                  </>
                ) : sent ? '✓ Sent!' : 'Send to Discord 🚀'}
              </button>
            </div>
            <p className="font-mono text-[10px] text-zinc-600 mt-3">
              To find your User ID: Discord Settings → Advanced → Enable Developer Mode → right-click your name → Copy User ID
            </p>
          </motion.div>
        </motion.div>

        {/* Encouragement Quote */}
        {encouragement && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <motion.p
              className="font-serif text-2xl md:text-4xl italic text-zinc-200 leading-snug max-w-3xl mx-auto"
              animate={{
                textShadow: [`0 0 20px ${accentColor}00`, `0 0 30px ${accentColor}20`, `0 0 20px ${accentColor}00`],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {`"${encouragement}"`}
            </motion.p>
          </motion.div>
        )}

        {/* Bottom Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 pb-16">
          <button
            type="button"
            onClick={onSave}
            className="px-8 py-3 rounded-full font-sans font-medium text-sm text-black hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: accentColor }}
          >
            Save My Journey
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="px-8 py-3 rounded-full font-sans font-medium text-sm text-zinc-400 border border-white/10 bg-white/[0.03] hover:text-white hover:bg-white/[0.06] transition-colors duration-300"
          >
            Start New Journey →
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl font-sans text-sm font-medium shadow-xl
              ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
