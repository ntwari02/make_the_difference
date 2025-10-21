import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function normalize(path: string) {
  return String(path || '')
    .toLowerCase()
    .replace(/\/+$/, '')
    .replace(/^\/+/, '/')
    .replace(/[^a-z0-9\/_-]+/g, '');
}

function similarity(a: string, b: string): number {
  a = normalize(a);
  b = normalize(b);
  if (a === b) return 1;
  const as = a.split('/').filter(Boolean);
  const bs = b.split('/').filter(Boolean);
  const len = Math.max(as.length, bs.length);
  let score = 0;
  for (let i = 0; i < len; i++) {
    if (as[i] && bs[i] && (as[i] === bs[i] || bs[i].startsWith(as[i]) || as[i].startsWith(bs[i]))) score += 1;
  }
  return score / Math.max(1, len);
}

const CANDIDATES: string[] = [
  '/',
  '/browse',
  '/cars',
  '/buyer/dashboard',
  '/buyer/favorites',
  '/dealer/dashboard',
  '/seller/dashboard',
  '/student/dashboard',
  '/instructor/dashboard',
  '/university/dashboard',
  '/visa/dashboard',
  '/admin/dashboard',
  '/login',
  '/register',
];

const SmartRedirect: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is actually authenticated before redirecting to dashboards
    const hasValidAuth = () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      if (!token || !userData) return false;
      
      try {
        const user = JSON.parse(userData);
        return user && user.id && user.email && user.role;
      } catch {
        return false;
      }
    };

    const target = normalize(pathname);
    let best = '/';
    let bestScore = -1;
    
    // If user is not authenticated, prioritize login/register over dashboards
    const isAuthenticated = hasValidAuth();
    
    for (const cand of CANDIDATES) {
      const s = similarity(target, cand);
      
      // If not authenticated and candidate is a dashboard, reduce its score
      if (!isAuthenticated && cand.includes('/dashboard')) {
        const reducedScore = s * 0.5; // Reduce dashboard scores by half
        if (reducedScore > bestScore) { 
          bestScore = reducedScore; 
          best = cand; 
        }
      } else if (s > bestScore) { 
        bestScore = s; 
        best = cand; 
      }
    }
    
    // If not authenticated and best match is a dashboard, redirect to login instead
    if (!isAuthenticated && best.includes('/dashboard')) {
      best = '/login';
    }
    
    navigate(best, { replace: true });
  }, [pathname, navigate]);

  return null;
};

export default SmartRedirect;


