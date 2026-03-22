import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Chapter = ({ num, scene, story, question, options, accentColor, onAnswer, selectedAnswer }) => {
  const [typedNum, setTypedNum] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isVisible) return;
    const full = `Chapter ${num}`;
    let i = 0;
    setTypedNum('');
    const interval = setInterval(() => {
      if (i < full.length) {
        setTypedNum(full.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [num, isVisible]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  const storyLines = story.split('. ').filter(Boolean).map((s, i, arr) =>
    i < arr.length - 1 ? s + '.' : s
  );

  return (
    <section
      ref={ref}
      data-testid={`chapter-${num}`}
      className="relative min-h-screen flex flex-col justify-center z-10 w-full max-w-3xl mx-auto px-6 md:px-12 py-24"
    >
      <AnimatePresence>
        {isVisible && (
          <>
            <motion.span
              className="font-mono text-xs md:text-sm tracking-widest uppercase mb-6 block"
              style={{ color: `${accentColor}90` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {typedNum}
              <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
                _
              </motion.span>
            </motion.span>

            <motion.h2
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {scene}
            </motion.h2>

            <div className="mb-10 space-y-2">
              {storyLines.map((line, i) => (
                <motion.p
                  key={i}
                  className="font-sans text-zinc-300 text-base md:text-lg leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.p
              className="font-sans text-white text-lg md:text-xl font-medium mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              {question}
            </motion.p>

            <div className="space-y-3">
              {options.map((option, i) => {
                const isSelected = selectedAnswer === option;
                return (
                  <motion.button
                    key={i}
                    onClick={() => !selectedAnswer && onAnswer(option)}
                    disabled={!!selectedAnswer}
                    className={`w-full text-left p-5 md:p-6 rounded-xl border backdrop-blur-md transition-colors duration-300 font-sans text-sm md:text-base leading-relaxed focus:outline-none ${
                      isSelected
                        ? 'bg-white/10'
                        : selectedAnswer
                        ? 'bg-white/[0.02] border-white/5 opacity-40 cursor-default'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] cursor-pointer'
                    }`}
                    style={isSelected ? { borderColor: `${accentColor}80`, boxShadow: `0 0 20px ${accentColor}10` } : {}}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + i * 0.1 }}
                    whileTap={!selectedAnswer ? { scale: 1.02 } : {}}
                  >
                    <span className={isSelected ? 'text-white' : 'text-zinc-300'}>
                      {option}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};
