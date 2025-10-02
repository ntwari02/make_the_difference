import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  CircularProgress,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Fullscreen,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  Palette,
  Close,
  PlayArrow,
  Pause,
  Share,
  Favorite,
  Compare,
  Visibility,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 3,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 2,
          color: 'white',
        }}
      >
        <CircularProgress variant="determinate" value={progress} />
        <Typography variant="body2">
          Loading 3D Model... {Math.round(progress)}%
        </Typography>
      </Box>
    </Html>
  );
}

// Simple Car Model Component (using basic geometry for demo)
function SimpleCarModel({ 
  color, 
  autoRotate = true 
}: {
  color: string;
  autoRotate?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Auto rotation
  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Car Body */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Car Roof */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.5, 0.8, 1.2]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[1.2, -0.5, 0.8]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-1.2, -0.5, 0.8]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[1.2, -0.5, -0.8]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-1.2, -0.5, -0.8]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[1.6, 0, 0.4]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FFFFAA" emissive="#FFFFAA" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[1.6, 0, -0.4]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FFFFAA" emissive="#FFFFAA" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Lighting setup
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
      />
    </>
  );
}

// Car viewer interface
interface CarViewer3DProps {
  car: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    price: number;
    features: string[];
  };
  onClose?: () => void;
  fullscreen?: boolean;
}

const CarViewer3D: React.FC<CarViewer3DProps> = ({ 
  car, 
  onClose, 
  fullscreen = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedColor, setSelectedColor] = useState(car.color);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);

  // Available colors for the car
  const availableColors = [
    { name: 'Original', value: car.color },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Silver', value: '#C0C0C0' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#008000' },
    { name: 'Yellow', value: '#FFFF00' },
  ];

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleShare = () => {
    console.log('Sharing car:', car.title);
  };

  const handleCompare = () => {
    console.log('Adding to compare:', car.title);
  };

  const handleFavorite = () => {
    console.log('Adding to favorites:', car.title);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: isFullscreen ? '100vh' : '60vh',
          width: isFullscreen ? '100vw' : '100%',
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          zIndex: isFullscreen ? 9999 : 'auto',
          borderRadius: isFullscreen ? 0 : 2,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
            p: 2,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="bold" color="white">
                {car.title}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.8)">
                {car.brand} {car.model} • {car.year} • ${car.price.toLocaleString()}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title="Auto Rotate">
                <IconButton
                  onClick={() => setAutoRotate(!autoRotate)}
                  sx={{ color: 'white' }}
                >
                  {autoRotate ? <Pause /> : <PlayArrow />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Fullscreen">
                <IconButton onClick={handleFullscreen} sx={{ color: 'white' }}>
                  <Fullscreen />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Share">
                <IconButton onClick={handleShare} sx={{ color: 'white' }}>
                  <Share />
                </IconButton>
              </Tooltip>
              
              {onClose && (
                <Tooltip title="Close">
                  <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <Close />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* 3D Canvas */}
        <Box sx={{ height: '100%', position: 'relative' }}>
          <Canvas
            camera={{ position: [5, 5, 5], fov: 50 }}
            shadows
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <Suspense fallback={<Loader />}>
              <Lighting />
              
              {/* Environment */}
              <Environment preset="studio" />
              
              {/* Car Model */}
              <SimpleCarModel
                color={selectedColor}
                autoRotate={autoRotate}
              />
            </Suspense>
            
            {/* Orbit Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={20}
              autoRotate={autoRotate}
              autoRotateSpeed={2}
            />
          </Canvas>
        </Box>

        {/* Controls Panel */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            p: 2,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            {/* Color Selector */}
            <Box>
              <Typography variant="caption" color="white" gutterBottom>
                Change Color
              </Typography>
              <Stack direction="row" spacing={1}>
                {availableColors.map((colorOption) => (
                  <Tooltip key={colorOption.name} title={colorOption.name}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: colorOption.value,
                        border: selectedColor === colorOption.value ? '3px solid white' : '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                      onClick={() => handleColorChange(colorOption.value)}
                    />
                  </Tooltip>
                ))}
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1}>
              <Tooltip title="Add to Favorites">
                <IconButton onClick={handleFavorite} sx={{ color: 'white' }}>
                  <Favorite />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Compare">
                <IconButton onClick={handleCompare} sx={{ color: 'white' }}>
                  <Compare />
                </IconButton>
              </Tooltip>
              
              <Button
                variant="contained"
                startIcon={<Visibility />}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                View Details
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Card>
    </motion.div>
  );
};

// Car Viewer Modal
interface CarViewerModalProps {
  open: boolean;
  onClose: () => void;
  car: CarViewer3DProps['car'];
}

export const CarViewerModal: React.FC<CarViewerModalProps> = ({ 
  open, 
  onClose, 
  car 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: '95vw',
          height: '95vh',
          maxWidth: 'none',
          maxHeight: 'none',
          m: 0,
          borderRadius: 2,
        },
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%' }}>
        <CarViewer3D car={car} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CarViewer3D;