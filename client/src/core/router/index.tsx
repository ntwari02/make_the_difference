import React, { useEffect, useRef } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '../theme/ThemeProvider';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { CssBaseline, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Store and theme
import { store } from '../store';
import { queryClient } from '../services/api/queryClient';
import { ENV } from '../config/environment';

// Layout components
import AuthLayout from '../../shared/components/layout/AuthLayout';

// Auth components
import LoginPage from '../../modules/auth/pages/LoginPage';
import RegisterPage from '../../modules/auth/pages/RegisterPage';
import ForgotPasswordPage from '../../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../modules/auth/pages/ResetPasswordPage';
import SecurityQuestionsPage from '../../modules/auth/pages/SecurityQuestionsPage';

// Main pages
import LandingPage from '../../modules/landing/pages/LandingPage';

// Error page
import ErrorPage from '../../shared/components/ui/ErrorPage';
import ProtectedRoute from './ProtectedRoute';

// Dealer pages
const DealerDashboard = React.lazy(() => import('../../modules/dealer/pages/DealerDashboard'));

const Fallback: React.FC = () => (
  <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: '#64748b' }}>Loading…</div>
);

// Create router
const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  
  // Auth routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password/:token',
        element: <ResetPasswordPage />,
      },
      {
        path: 'security-questions',
        element: <SecurityQuestionsPage />,
      },
    ],
  },
  // Dealer dashboard (protected)
  {
    path: '/dealer/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <DealerDashboard />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  
  // Catch all route
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

// Main App component
const App: React.FC = () => {
  const GlobalBondsBackground: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
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

      const nodeCount = Math.max(40, Math.floor(width / 30));
      const nodes = Array.from({ length: nodeCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.8 + Math.random() * 1.8,
      }));

			const draw = () => {
				const dot = isDark ? '#60a5fa' : '#1e40af';
				const bondBase = isDark ? 0.12 : 0.18;
				const bond = (a: number) => isDark
					? `rgba(96,165,250,${bondBase + a * 0.35})`
					: `rgba(30,64,175,${bondBase + a * 0.45})`;

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

				ctx.lineWidth = isDark ? 1 : 1.25;
				const baseMaxDist = 130;
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
    }, [isDark]);

    return (
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 5, opacity: isDark ? 0.22 : 0.22, pointerEvents: 'none' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </Box>
    );
  };

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CssBaseline />
          <GlobalBondsBackground />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <RouterProvider router={router} />
          </Box>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          {ENV.ENABLE_REACT_QUERY_DEVTOOLS && ENV.IS_DEVELOPMENT && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
