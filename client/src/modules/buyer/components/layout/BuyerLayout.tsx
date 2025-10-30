import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
 
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';

interface BuyerLayoutProps {
	children: React.ReactNode;
}

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 70;

const BuyerLayout: React.FC<BuyerLayoutProps> = ({ children }) => {
	
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	

	// Local UI state for sidebar open/close (initialize closed to avoid mobile backdrop on first paint)
	const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);

	React.useEffect(() => {
		setSidebarOpen(!isMobile);
	}, [isMobile]);

	// Intercept same-origin anchor clicks to enable SPA navigation without full reload
	React.useEffect(() => {
		const handler = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;
			const anchor = target.closest('a') as HTMLAnchorElement | null;
			if (!anchor) return;
			// Only intercept left-clicks without modifier keys
			if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			const href = anchor.getAttribute('href');
			if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
			try {
				const url = new URL(href, window.location.origin);
				if (url.origin !== window.location.origin) return; // external
				// Let the router handle it
				e.preventDefault();
				window.history.pushState({}, '', url.pathname + url.search + url.hash);
				// Dispatch a popstate event so React Router notices
				window.dispatchEvent(new PopStateEvent('popstate'));
			} catch {}
		};
		document.addEventListener('click', handler);
		return () => document.removeEventListener('click', handler);
	}, []);

	return (
		<Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden', width: '100%' }}>
			{/* Sidebar */}
			<BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} drawerWidth={DRAWER_WIDTH} collapsedWidth={COLLAPSED_DRAWER_WIDTH} />

			{/* Main Content */}
			<Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
				{/* Header */}
				<BuyerHeader onMenuClick={() => setSidebarOpen((o) => !o)} />

				{/* Page Content */}
				<Box sx={{ flexGrow: 1, mt: '64px', width: '100%', maxWidth: '100%', pl: 2, pr: 3, py: 2 }}>
					<Container maxWidth="xl">
						{children}
					</Container>
				</Box>
			</Box>

			
		</Box>
	);
};

export default BuyerLayout;

