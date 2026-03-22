import { useEffect, useRef } from 'react';

export const CloudBackground = ({ scrollProgress = 0 }) => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const cloudsRef = useRef([]);
  const initRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    if (!initRef.current) {
      starsRef.current = Array.from({ length: 200 }, () => ({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005
      }));

      cloudsRef.current = Array.from({ length: 12 }, (_, i) => ({
        x: Math.random() * 1.4 - 0.2,
        y: Math.random() * 0.8 + 0.1,
        width: Math.random() * 0.4 + 0.2,
        height: Math.random() * 0.15 + 0.08,
        speed: (Math.random() * 0.5 + 0.3) * (i % 2 === 0 ? 1 : -1),
        opacity: Math.random() * 0.4 + 0.3,
        layer: Math.floor(i / 4)
      }));
      initRef.current = true;
    }

    let frame;
    let time = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      time += 0.01;

      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, w, h);

      const starOpacity = Math.max(0, (scrollProgress - 0.3) / 0.7);
      if (starOpacity > 0) {
        starsRef.current.forEach(star => {
          const twinkle = Math.sin(time * star.twinkleSpeed * 100) * 0.3 + 0.7;
          const alpha = starOpacity * star.brightness * twinkle;
          ctx.fillStyle = `rgba(255, 255, 240, ${alpha})`;
          ctx.beginPath();
          ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      const cloudOpacity = Math.max(0, 1 - scrollProgress * 1.2);
      if (cloudOpacity > 0) {
        cloudsRef.current.forEach(cloud => {
          const drift = scrollProgress * cloud.speed * 0.15;
          const cx = (cloud.x + drift) * w;
          const cy = cloud.y * h;
          const cw = cloud.width * w;
          const ch = cloud.height * h;

          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cw);
          const goldAlpha = cloud.opacity * cloudOpacity * 0.15;
          gradient.addColorStop(0, `rgba(245, 200, 66, ${goldAlpha})`);
          gradient.addColorStop(0.3, `rgba(30, 30, 50, ${cloud.opacity * cloudOpacity * 0.6})`);
          gradient.addColorStop(0.6, `rgba(15, 15, 30, ${cloud.opacity * cloudOpacity * 0.3})`);
          gradient.addColorStop(1, 'rgba(10, 10, 15, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2);
          ctx.fill();
        });

        const fogGradient = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.8);
        fogGradient.addColorStop(0, `rgba(20, 20, 40, ${cloudOpacity * 0.3})`);
        fogGradient.addColorStop(0.5, `rgba(15, 15, 30, ${cloudOpacity * 0.15})`);
        fogGradient.addColorStop(1, 'rgba(10, 10, 15, 0)');
        ctx.fillStyle = fogGradient;
        ctx.fillRect(0, 0, w, h);
      }

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [scrollProgress]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};
