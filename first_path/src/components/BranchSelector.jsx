import { motion } from 'framer-motion';

const branches = [
  {
    id: 'standard',
    title: 'Standard Path',
    description: 'A classic career discovery journey exploring your strengths, values, and vision for the future.',
    color: '#f5c842',
    icon: '🌅',
  },
  {
    id: 'disability',
    title: 'Disability-Aware',
    description: 'A tailored path that embraces your unique needs and builds a career around your strengths.',
    color: '#5be3b0',
    icon: '⚡',
  },
  {
    id: 'firstgen',
    title: 'First-Gen',
    description: 'For trailblazers carving new paths — your background is your superpower.',
    color: '#f07048',
    icon: '🔥',
  },
];

export const BranchSelector = ({ onSelect }) => {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center z-10 px-6 py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="font-mono text-xs tracking-widest uppercase text-zinc-500 block mb-3">
          Choose Your Path
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
          Every journey is different
        </h2>
        <p className="font-sans text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">
          Select the path that resonates with your story. Each one leads to personalized career insights built around who you are.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        {branches.map((branch, i) => (
          <motion.button
            key={branch.id}
            onClick={() => onSelect(branch.id)}
            className="relative text-left p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl cursor-pointer group"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            whileHover={{ y: -6, borderColor: branch.color }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${branch.color}60`;
              e.currentTarget.style.boxShadow = `0 0 30px ${branch.color}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-2xl"
              style={{ backgroundColor: `${branch.color}15` }}
            >
              {branch.icon}
            </div>
            <h3
              className="font-serif text-2xl font-semibold mb-3"
              style={{ color: branch.color }}
            >
              {branch.title}
            </h3>
            <p className="font-sans text-zinc-400 text-sm leading-relaxed">
              {branch.description}
            </p>
            <div
              className="mt-6 font-mono text-xs tracking-widest uppercase opacity-50 group-hover:opacity-100 transition-opacity duration-300"
              style={{ color: branch.color }}
            >
              Begin Journey →
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
};
