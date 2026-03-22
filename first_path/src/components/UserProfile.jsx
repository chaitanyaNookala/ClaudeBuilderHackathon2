import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEP1 = [
  { id: 'student', label: 'Student (high school / college / grad)' },
  { id: 'professional', label: 'Working Professional' },
  { id: 'career_changer', label: 'Career Changer' },
  { id: 'unemployed', label: 'Recently Unemployed' },
  { id: 'returning', label: 'Stay-at-home / Returning to workforce' },
];

const STEP2 = [
  { id: 'under_18', label: 'Under 18' },
  { id: '18_22', label: '18–22' },
  { id: '23_28', label: '23–28' },
  { id: '29_35', label: '29–35' },
  { id: '36_plus', label: '36+' },
];

const STEP3 = [
  { id: 'income_3mo', label: 'I need income within 3 months' },
  { id: 'runway_6_12', label: 'I have 6–12 months of runway' },
  { id: 'stable_growth', label: "I'm financially stable, focused on growth" },
  { id: 'full_support', label: 'I have full support (family, scholarship, etc.)' },
];

const STEP4 = [
  { id: 'building', label: 'Building / Making things' },
  { id: 'writing', label: 'Writing / Storytelling' },
  { id: 'helping', label: 'Helping people' },
  { id: 'analyzing', label: 'Analyzing / Research' },
  { id: 'performing', label: 'Performing / Creating art' },
  { id: 'leading', label: 'Leading / Organizing' },
  { id: 'sports', label: 'Sports / Physical activity' },
  { id: 'gaming', label: 'Gaming / Tech' },
];

const AUTO_ADVANCE_MS = 320;

export function UserProfile({ onComplete }) {
  const [step, setStep] = useState(0);
  const [occupation, setOccupation] = useState(null);
  const [age, setAge] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [hobbies, setHobbies] = useState([]);
  const [dreamCareer, setDreamCareer] = useState('');

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, 4)), []);
  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const pickStep1 = (id) => {
    setOccupation(id);
    setTimeout(goNext, AUTO_ADVANCE_MS);
  };
  const pickStep2 = (id) => {
    setAge(id);
    setTimeout(goNext, AUTO_ADVANCE_MS);
  };
  const pickStep3 = (id) => {
    setFinancial(id);
    setTimeout(goNext, AUTO_ADVANCE_MS);
  };

  const toggleHobby = (id) => {
    setHobbies((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleSubmit = () => {
    const trimmed = dreamCareer.slice(0, 100);
    onComplete({
      occupation,
      age,
      financial,
      hobbies: [...hobbies],
      dreamCareer: trimmed,
    });
  };

  const dotsFilled = step;

  return (
    <section
      data-testid="user-profile-onboarding"
      className="relative min-h-screen flex flex-col z-10 px-4 md:px-8 py-20 md:py-24 max-w-2xl mx-auto w-full"
    >
      <div className="flex items-center justify-between gap-4 mb-10">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="shrink-0 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 text-sm font-sans
            hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          ← Back
        </button>
        <div className="flex gap-2 justify-center flex-1" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i < dotsFilled
                  ? 'w-8 bg-white/80'
                  : i === step
                  ? 'w-8 bg-white/40 ring-1 ring-white/30'
                  : 'w-2 bg-white/15'
              }`}
            />
          ))}
        </div>
        <div className="w-[72px] shrink-0" aria-hidden />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <StepPanel key="s0" title="Who are you right now?">
            <div className="space-y-3">
              {STEP1.map((opt) => (
                <OptionCard
                  key={opt.id}
                  selected={occupation === opt.id}
                  onClick={() => pickStep1(opt.id)}
                >
                  {opt.label}
                </OptionCard>
              ))}
            </div>
          </StepPanel>
        )}

        {step === 1 && (
          <StepPanel key="s1" title="How old are you?">
            <div className="space-y-3">
              {STEP2.map((opt) => (
                <OptionCard
                  key={opt.id}
                  selected={age === opt.id}
                  onClick={() => pickStep2(opt.id)}
                >
                  {opt.label}
                </OptionCard>
              ))}
            </div>
          </StepPanel>
        )}

        {step === 2 && (
          <StepPanel key="s2" title="What's your financial situation?">
            <div className="space-y-3">
              {STEP3.map((opt) => (
                <OptionCard
                  key={opt.id}
                  selected={financial === opt.id}
                  onClick={() => pickStep3(opt.id)}
                >
                  {opt.label}
                </OptionCard>
              ))}
            </div>
          </StepPanel>
        )}

        {step === 3 && (
          <StepPanel key="s3" title="What do you do for fun?">
            <p className="font-sans text-zinc-500 text-sm text-center mb-6">
              Choose up to 3
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {STEP4.map((opt) => {
                const active = hobbies.includes(opt.id);
                return (
                  <OptionCard
                    key={opt.id}
                    selected={active}
                    onClick={() => toggleHobby(opt.id)}
                    multi
                  >
                    {opt.label}
                  </OptionCard>
                );
              })}
            </div>
            <motion.button
              type="button"
              onClick={goNext}
              disabled={hobbies.length === 0}
              className="w-full py-4 rounded-xl font-sans font-semibold text-sm text-black bg-white/90
                hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              whileHover={{ scale: hobbies.length ? 1.02 : 1 }}
              whileTap={{ scale: hobbies.length ? 0.98 : 1 }}
            >
              Continue
            </motion.button>
          </StepPanel>
        )}

        {step === 4 && (
          <StepPanel key="s4" title="What career have you secretly dreamed about?">
            <textarea
              value={dreamCareer}
              onChange={(e) => setDreamCareer(e.target.value.slice(0, 100))}
              placeholder="Don't filter yourself — astronaut, chef, CEO, anything."
              rows={4}
              className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/[0.05] font-sans text-sm text-white
                placeholder-zinc-500 focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 resize-none mb-3"
            />
            <p className="font-mono text-xs text-zinc-500 text-right mb-8">
              {dreamCareer.length}/100
            </p>
            <motion.button
              type="button"
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl font-sans font-semibold text-sm text-black bg-white/90 hover:bg-white transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Save & continue
            </motion.button>
          </StepPanel>
        )}
      </AnimatePresence>
    </section>
  );
}

function StepPanel({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 md:p-10"
      style={{ boxShadow: '0 0 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)' }}
    >
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-white text-center mb-10 leading-tight">
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function OptionCard({ children, selected, onClick, multi }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 md:p-5 rounded-xl border font-sans text-sm md:text-base leading-relaxed transition-colors
        ${
          selected
            ? 'border-white/35 bg-white/10 text-white'
            : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.07] hover:border-white/20'
        }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <span className={multi && selected ? 'flex items-center gap-2' : ''}>
        {multi && selected && (
          <span className="text-white/90 font-mono text-xs">✓</span>
        )}
        {children}
      </span>
    </motion.button>
  );
}
