import { motion } from 'framer-motion';

export const ResultScreen = ({ result, accentColor, onSave, onRestart }) => {
  if (!result) return null;
  const { careers = [], actions = [], ninety_day_plan = {}, encouragement = '' } = result;

  return (
    <section
      data-testid="result-screen"
      className="relative min-h-screen z-10 px-6 py-24"
    >
      <div className="fixed top-0 left-0 right-0 h-32 pointer-events-none z-20 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}10, transparent)` }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="max-w-4xl mx-auto">
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
        </motion.div>

        <motion.div className="mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h3 className="font-serif text-2xl font-semibold text-white mb-6">Career Matches</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {careers.map((career, i) => (
              <motion.div
                key={i}
                className="p-6 md:p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
              >
                <span className="font-mono text-2xl font-bold block mb-4" style={{ color: accentColor }}>
                  {career.match_score}%
                </span>
                <h4 className="font-serif text-xl font-semibold text-white mb-3">{career.title}</h4>
                <p className="font-sans text-zinc-400 text-sm leading-relaxed">{career.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div className="mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h3 className="font-serif text-2xl font-semibold text-white mb-6">Action Steps</h3>
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

        <motion.div className="mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h3 className="font-serif text-2xl font-semibold text-white mb-6">90-Day Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Object.entries(ninety_day_plan).map(([month, plan], i) => (
              <motion.div
                key={month}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.03]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
              >
                <span className="font-mono text-xs tracking-widest uppercase block mb-3" style={{ color: accentColor }}>
                  Month {i + 1}
                </span>
                <p className="font-sans text-zinc-300 text-sm leading-relaxed">{plan}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 pb-16">
          <button
            onClick={onSave}
            className="px-8 py-3 rounded-full font-sans font-medium text-sm text-black hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: accentColor }}
          >
            Save My Journey
          </button>
          <button
            onClick={onRestart}
            className="px-8 py-3 rounded-full font-sans font-medium text-sm text-zinc-400 border border-white/10 bg-white/[0.03] hover:text-white hover:bg-white/[0.06] transition-colors duration-300"
          >
            Start New Journey →
          </button>
        </div>
      </div>
    </section>
  );
};
