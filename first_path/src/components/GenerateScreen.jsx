import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Spline from '@splinetool/react-spline';

export const GenerateScreen = ({ answers, accentColor, onGenerate, isGenerating }) => {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const answerEntries = Object.entries(answers);

  return (
    <section
      data-testid="generate-screen"
      className="relative min-h-screen flex flex-col items-center justify-center z-10 px-6 py-24 overflow-hidden"
    >
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: splineLoaded ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            >
              <Spline
                scene="https://prod.spline.design/VuL41aTs5u8-mjBr/scene.splinecode"
                onLoad={() => setSplineLoaded(true)}
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
        <motion.span
          className="font-mono text-xs tracking-widest uppercase mb-4 block"
          style={{ color: `${accentColor}90` }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Journey Complete
        </motion.span>

        <motion.h2
          className="font-serif text-3xl md:text-5xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {isGenerating ? 'Mapping your constellation...' : 'Your story has been told'}
        </motion.h2>

        {!isGenerating && (
          <>
            <motion.p
              className="font-sans text-zinc-400 text-base mb-12 max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Based on your answers, we'll generate a personalized career roadmap — careers, actions, and a 90-day plan just for you.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
              {answerEntries.map(([question, answer], i) => (
                <motion.div
                  key={question}
                  className="p-5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <p className="font-mono text-xs tracking-wider uppercase text-zinc-500 mb-2">Q{i + 1}</p>
                  <p className="font-sans text-zinc-300 text-sm leading-relaxed">{answer}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              data-testid="generate-roadmap-btn"
              onClick={onGenerate}
              disabled={isGenerating}
              className="px-10 py-4 rounded-full font-sans font-semibold text-base text-black transition-all duration-300 focus:outline-none hover:scale-105"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 40px ${accentColor}40` }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              animate={{
                boxShadow: [`0 0 20px ${accentColor}20`, `0 0 50px ${accentColor}50`, `0 0 20px ${accentColor}20`],
              }}
            >
              Reveal My Path →
            </motion.button>
          </>
        )}

        {isGenerating && (
          <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                  animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: `${accentColor}80` }}>
              AI is building your roadmap
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};
