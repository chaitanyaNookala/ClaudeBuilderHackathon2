import { motion } from 'framer-motion';

export const Hero = () => {
  const words = ['First', 'Path'];
  return (
    <section
      data-testid="hero-section"
      className="relative h-screen flex flex-col items-center justify-center z-10 px-6"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-96 h-96 md:w-[600px] md:h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(245,200,66,0.08) 0%, rgba(245,200,66,0) 70%)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="relative flex gap-4 md:gap-6">
        {words.map((word, i) => (
          <motion.span
            key={word}
            className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        ))}
      </div>
      <motion.p
        className="relative mt-6 text-zinc-400 text-base md:text-lg font-sans max-w-md text-center leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        A story-driven journey to discover the career that was always meant for you.
      </motion.p>
      <motion.div
        className="absolute bottom-12 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="font-mono text-xs tracking-widest uppercase text-zinc-500">
          Scroll to begin
        </span>
        <motion.div
          className="w-px h-8 bg-zinc-600"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
};
