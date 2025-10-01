import React from 'react';
import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  sx?: any;
  enableAnimation?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'lg',
  disableGutters = false,
  sx = {},
  enableAnimation = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const containerSx = {
    py: { xs: 2, sm: 3, md: 4 },
    px: disableGutters ? 0 : { xs: 2, sm: 3, md: 4 },
    minHeight: '100%',
    ...sx,
  };

  const content = (
    <Container maxWidth={maxWidth} sx={containerSx}>
      {children}
    </Container>
  );

  if (enableAnimation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

interface GridContainerProps {
  children: React.ReactNode;
  spacing?: number;
  sx?: any;
}

const GridContainer: React.FC<GridContainerProps> = ({
  children,
  spacing = 3,
  sx = {},
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: spacing,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(auto-fit, minmax(300px, 1fr))',
          md: 'repeat(auto-fit, minmax(350px, 1fr))',
          lg: 'repeat(auto-fit, minmax(400px, 1fr))',
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

interface CardGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  spacing?: number;
  sx?: any;
}

const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  spacing = 3,
  sx = {},
}) => {
  const theme = useTheme();

  const gridTemplateColumns = {
    xs: `repeat(${columns.xs || 1}, 1fr)`,
    sm: `repeat(${columns.sm || 2}, 1fr)`,
    md: `repeat(${columns.md || 3}, 1fr)`,
    lg: `repeat(${columns.lg || 4}, 1fr)`,
    xl: `repeat(${columns.xl || columns.lg || 4}, 1fr)`,
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: spacing,
        gridTemplateColumns,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: number;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  sx?: any;
}

const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = 'row',
  spacing = 2,
  alignItems = 'center',
  justifyContent = 'flex-start',
  sx = {},
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: {
          xs: direction === 'row' ? 'column' : 'column',
          sm: direction === 'row' ? 'row' : 'column',
          md: direction,
        },
        gap: spacing,
        alignItems: {
          xs: 'stretch',
          sm: alignItems,
        },
        justifyContent,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  sx?: any;
}

const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  maxWidth = 'lg',
  sx = {},
}) => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, sm: 6, md: 8 },
        backgroundColor: theme.palette.background.default,
        ...sx,
      }}
    >
      <Container maxWidth={maxWidth}>
        {(title || subtitle) && (
          <Box textAlign="center" mb={4}>
            {title && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 'bold',
                    mb: 1,
                  }}
                >
                  {title}
                </Box>
              </motion.div>
            )}
            {subtitle && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Box
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    maxWidth: 600,
                    mx: 'auto',
                  }}
                >
                  {subtitle}
                </Box>
              </motion.div>
            )}
          </Box>
        )}
        {children}
      </Container>
    </Box>
  );
};

export {
  PageContainer,
  GridContainer,
  CardGrid,
  ResponsiveStack,
  Section,
};
