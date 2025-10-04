import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface BackgroundAnimationProps {
  enabled?: boolean;
  opacity?: number;
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ 
  enabled = true, 
  opacity 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Click attraction state
    let attractor: { x: number; y: number; power: number; decay: number } | null = null;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    
    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    // Listen globally (canvas has pointerEvents: 'none')
    const onPointerDown = (e: PointerEvent) => {
      attractor = { x: e.clientX, y: e.clientY, power: 1.2, decay: 0.975 };
    };
    window.addEventListener('pointerdown', onPointerDown);

    const nodeCount = Math.max(60, Math.floor(width / 15));
    const nodes = Array.from({ length: nodeCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 3 + Math.random() * 3,
    }));

    const draw = () => {
      const dot = isDark ? '#60a5fa' : '#1e40af';
      const bondBase = isDark ? 0.5 : 0.6;
      const bond = (a: number) => isDark
        ? `rgba(96,165,250,${bondBase + a * 0.6})`
        : `rgba(30,64,175,${bondBase + a * 0.7})`;

      ctx.clearRect(0, 0, width, height);

      // Apply attraction (briefly) toward the last click
      if (attractor && attractor.power > 0.02) {
        for (const n of nodes) {
          const dx = attractor.x - n.x;
          const dy = attractor.y - n.y;
          const dist = Math.hypot(dx, dy) || 1;
          const pull = (attractor.power * 0.025) * Math.min(1, 200 / dist);
          n.vx += (dx / dist) * pull;
          n.vy += (dy / dist) * pull;
        }
        // Decay attraction over time
        attractor.power *= attractor.decay;
        if (attractor.power < 0.02) attractor = null;
      }

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      ctx.lineWidth = isDark ? 1.5 : 1.5;
      const baseMaxDist = 100;
      const maxDist = attractor ? baseMaxDist + 140 * ((attractor as any).power || 0) : baseMaxDist;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < maxDist * maxDist) {
            const alpha = 1 - Math.sqrt(dist2) / maxDist;
            ctx.strokeStyle = bond(alpha);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
       }
      }

      ctx.fillStyle = dot;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isDark, enabled]);

  if (!enabled) return null;

  const finalOpacity = opacity !== undefined ? opacity : (isDark ? 1 : 0.8);

  return (
    <Box sx={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: -1, 
      opacity: finalOpacity, 
      pointerEvents: 'none' 
    }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

export default BackgroundAnimation;
