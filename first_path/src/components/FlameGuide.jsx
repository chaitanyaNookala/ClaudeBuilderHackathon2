import { useEffect, useRef } from 'react';

export const FlameGuide = ({ color = '#e2e8f0', flare = false }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const flareRef = useRef(false);

  useEffect(() => {
    flareRef.current = flare;
  }, [flare]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 80;
    canvas.height = 200;

    let frame;
    let time = 0;

    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const draw = () => {
      time += 0.05;
      ctx.clearRect(0, 0, 80, 200);

      const rgb = hexToRgb(color);
      const isFlaring = flareRef.current;
      const scale = isFlaring ? 1.3 : 1;
      const baseY = 140;
      const centerX = 40;
      const flameHeight = (60 + Math.sin(time * 3) * 8) * scale;
      const flameWidth = (16 + Math.sin(time * 4) * 3) * scale;

      const glowGrad = ctx.createRadialGradient(
        centerX, baseY - flameHeight * 0.4, 0,
        centerX, baseY - flameHeight * 0.4, flameHeight * 0.8
      );
      glowGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isFlaring ? 0.25 : 0.1})`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 80, 200);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, baseY);
      ctx.quadraticCurveTo(
        centerX - flameWidth - Math.sin(time * 5) * 3,
        baseY - flameHeight * 0.4,
        centerX - Math.sin(time * 3) * 2,
        baseY - flameHeight
      );
      ctx.quadraticCurveTo(
        centerX + flameWidth + Math.cos(time * 5) * 3,
        baseY - flameHeight * 0.4,
        centerX,
        baseY
      );

      const flameGrad = ctx.createLinearGradient(centerX, baseY, centerX, baseY - flameHeight);
      flameGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`);
      flameGrad.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
      flameGrad.addColorStop(0.7, `rgba(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)}, 0.3)`);
      flameGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = flameGrad;
      ctx.fill();

      ctx.beginPath();
      const coreHeight = flameHeight * 0.5;
      const coreWidth = flameWidth * 0.4;
      ctx.moveTo(centerX, baseY);
      ctx.quadraticCurveTo(centerX - coreWidth, baseY - coreHeight * 0.5, centerX, baseY - coreHeight);
      ctx.quadraticCurveTo(centerX + coreWidth, baseY - coreHeight * 0.5, centerX, baseY);
      ctx.fillStyle = `rgba(255, 255, 240, 0.4)`;
      ctx.fill();
      ctx.restore();

      if (Math.random() < (isFlaring ? 0.5 : 0.2)) {
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * flameWidth,
          y: baseY - flameHeight * 0.3,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 2 - 0.5,
          life: 1,
          size: Math.random() * 2.5 + 0.5
        });
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) return false;
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.life * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [color]);

  return (
    <div
      className="fixed z-50 pointer-events-none left-4 top-1/2 -translate-y-1/2 hidden md:block"
      style={{ filter: `drop-shadow(0 0 20px ${color}40)` }}
    >
      <canvas ref={canvasRef} width={80} height={200} />
    </div>
  );
};
