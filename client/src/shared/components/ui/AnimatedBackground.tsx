import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

interface AnimatedBackgroundProps {
  isDarkMode?: boolean;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ isDarkMode = false }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
        background: isDarkMode
          ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isDarkMode
            ? 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
        },
      }}
    >
      {/* Floating Geometric Shapes */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          style={{
            position: 'absolute',
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            background: isDarkMode
              ? `linear-gradient(45deg, rgba(102, 126, 234, ${Math.random() * 0.1 + 0.02}), rgba(118, 75, 162, ${Math.random() * 0.08 + 0.02}))`
              : `linear-gradient(45deg, rgba(255, 255, 255, ${Math.random() * 0.15 + 0.05}), rgba(255, 255, 255, ${Math.random() * 0.1 + 0.03}))`,
            borderRadius: Math.random() > 0.5 ? '50%' : `${Math.random() * 20 + 10}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            pointerEvents: 'none',
            filter: 'blur(1px)',
          }}
          initial={{
            opacity: 0,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            opacity: [0, 0.6, 0.3, 0.6, 0],
            scale: [0, 1.2, 0.8, 1.1, 0],
            rotate: [0, 180, 360],
            y: [0, -50, -25, -75, 0],
            x: [0, 30, -20, 40, 0],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}

      {/* Animated Particles */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: isDarkMode
              ? `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`
              : `rgba(102, 126, 234, ${Math.random() * 0.4 + 0.2})`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            pointerEvents: 'none',
          }}
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: [0, -100, -200],
            x: [0, Math.random() * 50 - 25, Math.random() * 100 - 50],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Floating Lines */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`line-${i}`}
          style={{
            position: 'absolute',
            width: Math.random() * 200 + 100,
            height: '2px',
            background: isDarkMode
              ? `linear-gradient(90deg, transparent, rgba(102, 126, 234, ${Math.random() * 0.3 + 0.1}), transparent)`
              : `linear-gradient(90deg, transparent, rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2}), transparent)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            pointerEvents: 'none',
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
          initial={{
            opacity: 0,
            scaleX: 0,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scaleX: [0, 1, 0],
            x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
            y: [0, Math.random() * 50 - 25, Math.random() * 100 - 50],
          }}
          transition={{
            duration: 12 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 6,
          }}
        />
      ))}

      {/* Pulsing Circles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`pulse-${i}`}
          style={{
            position: 'absolute',
            width: Math.random() * 300 + 200,
            height: Math.random() * 300 + 200,
            border: `2px solid ${isDarkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            pointerEvents: 'none',
          }}
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 10,
          }}
        />
      ))}

      {/* Floating Triangles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`triangle-${i}`}
          style={{
            position: 'absolute',
            width: 0,
            height: 0,
            borderLeft: `${Math.random() * 30 + 20}px solid transparent`,
            borderRight: `${Math.random() * 30 + 20}px solid transparent`,
            borderBottom: `${Math.random() * 40 + 30}px solid ${isDarkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            pointerEvents: 'none',
          }}
          initial={{
            opacity: 0,
            rotate: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            rotate: [0, 360],
            scale: [0, 1, 0],
            y: [0, -30, -60],
            x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40],
          }}
          transition={{
            duration: 18 + Math.random() * 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}
    </Box>
  );
};

export default AnimatedBackground;
