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
    const target = normalize(pathname);
    let best = '/';
    let bestScore = -1;
    for (const cand of CANDIDATES) {
      const s = similarity(target, cand);
      if (s > bestScore) { bestScore = s; best = cand; }
    }
    navigate(best, { replace: true });
  }, [pathname, navigate]);

  return null;
};

export default SmartRedirect;


