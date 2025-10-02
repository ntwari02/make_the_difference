import React, { Suspense, useState, useRef, useEffect } from 'react';
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
import Car3DModelViewer from './Car3DModelViewer';
import { RealisticCarGenerator } from './RealisticCarGenerator';
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

// Realistic Car Model Generator based on actual car specifications
function RealisticCarModel({ 
  carData,
  color,
  autoRotate = true
}: {
  carData: {
    brand: string;
    model: string;
    bodyType?: string;
    year: number;
  };
  color: string;
  autoRotate?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get ACTUAL car specifications based on real car models
  const getActualCarSpecs = () => {
    const brand = carData.brand?.toLowerCase() || '';
    const model = carData.model?.toLowerCase() || '';
    const bodyType = carData.bodyType?.toLowerCase() || '';
    
    // BMW Models
    if (brand.includes('bmw')) {
      if (model.includes('x5') || model.includes('x3') || model.includes('x7')) {
        return {
          type: 'BMW SUV',
          body: { width: 2.0, height: 1.3, length: 4.9 },
          wheelSize: 0.42,
          ground: -0.65,
          roofStyle: 'suv',
          grilleStyle: 'bmw_kidney',
          headlightStyle: 'bmw_angel_eyes',
          wheelPositions: [[2.1, -0.65, 1.0], [-2.1, -0.65, 1.0], [2.1, -0.65, -1.0], [-2.1, -0.65, -1.0]]
        };
      } else if (model.includes('3 series') || model.includes('320') || model.includes('330')) {
        return {
          type: 'BMW 3 Series',
          body: { width: 1.8, height: 0.9, length: 4.6 },
          wheelSize: 0.36,
          ground: -0.5,
          roofStyle: 'sedan_sporty',
          grilleStyle: 'bmw_kidney',
          headlightStyle: 'bmw_angel_eyes',
          wheelPositions: [[1.8, -0.5, 0.85], [-1.8, -0.5, 0.85], [1.8, -0.5, -0.85], [-1.8, -0.5, -0.85]]
        };
      } else if (model.includes('m3') || model.includes('m5') || model.includes('z4')) {
        return {
          type: 'BMW Sports',
          body: { width: 1.9, height: 0.75, length: 4.5 },
          wheelSize: 0.38,
          ground: -0.4,
          roofStyle: 'sports_low',
          grilleStyle: 'bmw_m_kidney',
          headlightStyle: 'bmw_laser',
          wheelPositions: [[1.9, -0.4, 0.9], [-1.9, -0.4, 0.9], [1.9, -0.4, -0.9], [-1.9, -0.4, -0.9]]
        };
      }
    }
    
    // Mercedes Models
    else if (brand.includes('mercedes')) {
      if (model.includes('gle') || model.includes('gls') || model.includes('g-class')) {
        return {
          type: 'Mercedes SUV',
          body: { width: 2.1, height: 1.4, length: 5.0 },
          wheelSize: 0.44,
          ground: -0.7,
          roofStyle: 'luxury_suv',
          grilleStyle: 'mercedes_star',
          headlightStyle: 'mercedes_multibeam',
          wheelPositions: [[2.2, -0.7, 1.05], [-2.2, -0.7, 1.05], [2.2, -0.7, -1.05], [-2.2, -0.7, -1.05]]
        };
      } else if (model.includes('c-class') || model.includes('e-class')) {
        return {
          type: 'Mercedes Sedan',
          body: { width: 1.85, height: 0.95, length: 4.7 },
          wheelSize: 0.37,
          ground: -0.52,
          roofStyle: 'luxury_sedan',
          grilleStyle: 'mercedes_star',
          headlightStyle: 'mercedes_multibeam',
          wheelPositions: [[1.85, -0.52, 0.87], [-1.85, -0.52, 0.87], [1.85, -0.52, -0.87], [-1.85, -0.52, -0.87]]
        };
      } else if (model.includes('amg') || model.includes('sl') || model.includes('gt')) {
        return {
          type: 'Mercedes AMG',
          body: { width: 1.95, height: 0.7, length: 4.4 },
          wheelSize: 0.39,
          ground: -0.35,
          roofStyle: 'sports_coupe',
          grilleStyle: 'mercedes_amg',
          headlightStyle: 'mercedes_performance',
          wheelPositions: [[1.95, -0.35, 0.95], [-1.95, -0.35, 0.95], [1.95, -0.35, -0.95], [-1.95, -0.35, -0.95]]
        };
      }
    }
    
    // Audi Models
    else if (brand.includes('audi')) {
      if (model.includes('q5') || model.includes('q7') || model.includes('q8')) {
        return {
          type: 'Audi Q Series',
          body: { width: 1.98, height: 1.25, length: 4.8 },
          wheelSize: 0.41,
          ground: -0.62,
          roofStyle: 'modern_suv',
          grilleStyle: 'audi_singleframe',
          headlightStyle: 'audi_matrix_led',
          wheelPositions: [[2.0, -0.62, 0.99], [-2.0, -0.62, 0.99], [2.0, -0.62, -0.99], [-2.0, -0.62, -0.99]]
        };
      } else if (model.includes('a4') || model.includes('a6') || model.includes('a8')) {
        return {
          type: 'Audi A Series',
          body: { width: 1.82, height: 0.92, length: 4.65 },
          wheelSize: 0.36,
          ground: -0.51,
          roofStyle: 'executive_sedan',
          grilleStyle: 'audi_singleframe',
          headlightStyle: 'audi_matrix_led',
          wheelPositions: [[1.82, -0.51, 0.86], [-1.82, -0.51, 0.86], [1.82, -0.51, -0.86], [-1.82, -0.51, -0.86]]
        };
      } else if (model.includes('rs') || model.includes('r8') || model.includes('tt')) {
        return {
          type: 'Audi Performance',
          body: { width: 1.9, height: 0.72, length: 4.3 },
          wheelSize: 0.38,
          ground: -0.38,
          roofStyle: 'performance_coupe',
          grilleStyle: 'audi_rs',
          headlightStyle: 'audi_laser',
          wheelPositions: [[1.9, -0.38, 0.92], [-1.9, -0.38, 0.92], [1.9, -0.38, -0.92], [-1.9, -0.38, -0.92]]
        };
      }
    }
    
    // Tesla Models
    else if (brand.includes('tesla')) {
      if (model.includes('model x') || model.includes('model y')) {
        return {
          type: 'Tesla SUV',
          body: { width: 2.0, height: 1.2, length: 4.95 },
          wheelSize: 0.4,
          ground: -0.6,
          roofStyle: 'tesla_suv',
          grilleStyle: 'tesla_closed',
          headlightStyle: 'tesla_led_strip',
          wheelPositions: [[2.05, -0.6, 1.0], [-2.05, -0.6, 1.0], [2.05, -0.6, -1.0], [-2.05, -0.6, -1.0]]
        };
      } else if (model.includes('model s') || model.includes('model 3')) {
        return {
          type: 'Tesla Sedan',
          body: { width: 1.85, height: 0.85, length: 4.7 },
          wheelSize: 0.37,
          ground: -0.48,
          roofStyle: 'tesla_sedan',
          grilleStyle: 'tesla_closed',
          headlightStyle: 'tesla_led_strip',
          wheelPositions: [[1.9, -0.48, 0.88], [-1.9, -0.48, 0.88], [1.9, -0.48, -0.88], [-1.9, -0.48, -0.88]]
        };
      }
    }
    
    // Toyota Models
    else if (brand.includes('toyota')) {
      if (model.includes('rav4') || model.includes('highlander') || model.includes('4runner')) {
        return {
          type: 'Toyota SUV',
          body: { width: 1.9, height: 1.15, length: 4.6 },
          wheelSize: 0.38,
          ground: -0.58,
          roofStyle: 'practical_suv',
          grilleStyle: 'toyota_bold',
          headlightStyle: 'toyota_led',
          wheelPositions: [[1.9, -0.58, 0.95], [-1.9, -0.58, 0.95], [1.9, -0.58, -0.95], [-1.9, -0.58, -0.95]]
        };
      } else if (model.includes('camry') || model.includes('avalon') || model.includes('corolla')) {
        return {
          type: 'Toyota Sedan',
          body: { width: 1.8, height: 0.9, length: 4.5 },
          wheelSize: 0.35,
          ground: -0.5,
          roofStyle: 'family_sedan',
          grilleStyle: 'toyota_modern',
          headlightStyle: 'toyota_led',
          wheelPositions: [[1.75, -0.5, 0.82], [-1.75, -0.5, 0.82], [1.75, -0.5, -0.82], [-1.75, -0.5, -0.82]]
        };
      } else if (model.includes('supra') || model.includes('86')) {
        return {
          type: 'Toyota Sports',
          body: { width: 1.85, height: 0.68, length: 4.2 },
          wheelSize: 0.36,
          ground: -0.4,
          roofStyle: 'sports_coupe',
          grilleStyle: 'toyota_aggressive',
          headlightStyle: 'toyota_performance',
          wheelPositions: [[1.85, -0.4, 0.88], [-1.85, -0.4, 0.88], [1.85, -0.4, -0.88], [-1.85, -0.4, -0.88]]
        };
      }
    }
    
    // Honda Models
    else if (brand.includes('honda')) {
      if (model.includes('cr-v') || model.includes('pilot') || model.includes('passport')) {
        return {
          type: 'Honda SUV',
          body: { width: 1.88, height: 1.1, length: 4.55 },
          wheelSize: 0.37,
          ground: -0.56,
          roofStyle: 'honda_suv',
          grilleStyle: 'honda_wing',
          headlightStyle: 'honda_led',
          wheelPositions: [[1.88, -0.56, 0.94], [-1.88, -0.56, 0.94], [1.88, -0.56, -0.94], [-1.88, -0.56, -0.94]]
        };
      } else if (model.includes('accord') || model.includes('civic')) {
        return {
          type: 'Honda Sedan',
          body: { width: 1.78, height: 0.88, length: 4.4 },
          wheelSize: 0.34,
          ground: -0.49,
          roofStyle: 'honda_sedan',
          grilleStyle: 'honda_wing',
          headlightStyle: 'honda_led',
          wheelPositions: [[1.72, -0.49, 0.81], [-1.72, -0.49, 0.81], [1.72, -0.49, -0.81], [-1.72, -0.49, -0.81]]
        };
      } else if (model.includes('type r') || model.includes('nsx')) {
        return {
          type: 'Honda Performance',
          body: { width: 1.82, height: 0.7, length: 4.25 },
          wheelSize: 0.36,
          ground: -0.42,
          roofStyle: 'performance_hatch',
          grilleStyle: 'honda_type_r',
          headlightStyle: 'honda_performance',
          wheelPositions: [[1.8, -0.42, 0.85], [-1.8, -0.42, 0.85], [1.8, -0.42, -0.85], [-1.8, -0.42, -0.85]]
        };
      }
    }
    
    // Ford Models
    else if (brand.includes('ford')) {
      if (model.includes('f-150') || model.includes('explorer') || model.includes('expedition')) {
        return {
          type: 'Ford Truck/SUV',
          body: { width: 2.2, height: 1.5, length: 5.2 },
          wheelSize: 0.45,
          ground: -0.75,
          roofStyle: 'truck_suv',
          grilleStyle: 'ford_bold',
          headlightStyle: 'ford_led',
          wheelPositions: [[2.3, -0.75, 1.1], [-2.3, -0.75, 1.1], [2.3, -0.75, -1.1], [-2.3, -0.75, -1.1]]
        };
      } else if (model.includes('mustang')) {
        return {
          type: 'Ford Mustang',
          body: { width: 1.92, height: 0.73, length: 4.38 },
          wheelSize: 0.38,
          ground: -0.4,
          roofStyle: 'muscle_car',
          grilleStyle: 'ford_mustang',
          headlightStyle: 'ford_aggressive',
          wheelPositions: [[1.95, -0.4, 0.93], [-1.95, -0.4, 0.93], [1.95, -0.4, -0.93], [-1.95, -0.4, -0.93]]
        };
      } else if (model.includes('focus') || model.includes('fusion')) {
        return {
          type: 'Ford Sedan',
          body: { width: 1.8, height: 0.9, length: 4.4 },
          wheelSize: 0.35,
          ground: -0.5,
          roofStyle: 'ford_sedan',
          grilleStyle: 'ford_modern',
          headlightStyle: 'ford_led',
          wheelPositions: [[1.75, -0.5, 0.82], [-1.75, -0.5, 0.82], [1.75, -0.5, -0.82], [-1.75, -0.5, -0.82]]
        };
      }
    }
    
    // Default fallback based on body type
    else {
      if (bodyType.includes('suv')) {
        return {
          type: 'Generic SUV',
          body: { width: 1.95, height: 1.2, length: 4.7 },
          wheelSize: 0.4,
          ground: -0.6,
          roofStyle: 'suv',
          grilleStyle: 'generic',
          headlightStyle: 'standard',
          wheelPositions: [[1.9, -0.6, 0.95], [-1.9, -0.6, 0.95], [1.9, -0.6, -0.95], [-1.9, -0.6, -0.95]]
        };
      } else if (bodyType.includes('sports') || bodyType.includes('coupe')) {
        return {
          type: 'Generic Sports',
          body: { width: 1.8, height: 0.75, length: 4.2 },
          wheelSize: 0.36,
          ground: -0.4,
          roofStyle: 'sports',
          grilleStyle: 'generic',
          headlightStyle: 'standard',
          wheelPositions: [[1.8, -0.4, 0.85], [-1.8, -0.4, 0.85], [1.8, -0.4, -0.85], [-1.8, -0.4, -0.85]]
        };
      } else {
        return {
          type: 'Generic Sedan',
          body: { width: 1.8, height: 0.9, length: 4.4 },
          wheelSize: 0.35,
          ground: -0.5,
          roofStyle: 'sedan',
          grilleStyle: 'generic',
          headlightStyle: 'standard',
          wheelPositions: [[1.7, -0.5, 0.8], [-1.7, -0.5, 0.8], [1.7, -0.5, -0.8], [-1.7, -0.5, -0.8]]
        };
      }
    }
  };

  const specs = getActualCarSpecs();

  // Brand-specific styling
  const getBrandStyling = () => {
    const brand = carData.brand?.toLowerCase() || '';
    if (brand.includes('bmw')) return { accent: '#1976d2', chrome: '#e0e0e0', grille: '#333', paint: '#ffffff' };
    if (brand.includes('mercedes')) return { accent: '#424242', chrome: '#f5f5f5', grille: '#222', paint: '#c0c0c0' };
    if (brand.includes('audi')) return { accent: '#ff5722', chrome: '#e0e0e0', grille: '#444', paint: '#2c2c2c' };
    if (brand.includes('tesla')) return { accent: '#4caf50', chrome: '#f0f0f0', grille: '#111', paint: '#ffffff' };
    if (brand.includes('toyota')) return { accent: '#dc143c', chrome: '#d5d5d5', grille: '#333', paint: '#ffffff' };
    if (brand.includes('honda')) return { accent: '#000000', chrome: '#d0d0d0', grille: '#333', paint: '#ffffff' };
    if (brand.includes('ford')) return { accent: '#003f7f', chrome: '#d0d0d0', grille: '#333', paint: '#ffffff' };
    if (brand.includes('porsche')) return { accent: '#ffeb3b', chrome: '#e0e0e0', grille: '#333', paint: '#ffffff' };
    return { accent: '#666666', chrome: '#d0d0d0', grille: '#333', paint: '#ffffff' };
  };

  const styling = getBrandStyling();

  // Render brand-specific grille
  const renderGrille = () => {
    const grillePosition: [number, number, number] = [specs.body.length/2 + 0.05, specs.ground + 0.2, 0];
    
    switch (specs.grilleStyle) {
      case 'bmw_kidney':
        return (
          <group position={grillePosition}>
            {/* BMW Kidney Grille */}
            <mesh position={[0, 0.1, 0.3]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
              <meshStandardMaterial color={styling.grille} />
            </mesh>
            <mesh position={[0, 0.1, -0.3]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
              <meshStandardMaterial color={styling.grille} />
            </mesh>
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[0.05, 0.2, 0.8]} />
              <meshStandardMaterial color={styling.chrome} metalness={0.9} />
            </mesh>
          </group>
        );
      
      case 'mercedes_star':
        return (
          <group position={grillePosition}>
            {/* Mercedes Star Grille */}
            <mesh>
              <boxGeometry args={[0.05, 0.4, 0.8]} />
              <meshStandardMaterial color={styling.grille} />
            </mesh>
            {/* Mercedes Star */}
            <mesh position={[0.03, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02, 6]} />
              <meshStandardMaterial color={styling.chrome} metalness={0.9} />
            </mesh>
          </group>
        );
      
      case 'audi_singleframe':
        return (
          <group position={grillePosition}>
            {/* Audi Singleframe Grille */}
            <mesh>
              <boxGeometry args={[0.05, 0.5, 0.9]} />
              <meshStandardMaterial color={styling.grille} />
            </mesh>
            {/* Audi Rings */}
            <mesh position={[0.03, 0.1, 0]}>
              <torusGeometry args={[0.05, 0.01, 8, 16]} />
              <meshStandardMaterial color={styling.chrome} metalness={0.9} />
            </mesh>
          </group>
        );
      
      case 'tesla_closed':
        return (
          <group position={grillePosition}>
            {/* Tesla Closed Front */}
            <mesh>
              <boxGeometry args={[0.02, 0.3, 0.7]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Tesla T Logo */}
            <mesh position={[0.02, 0, 0]}>
              <boxGeometry args={[0.01, 0.08, 0.02]} />
              <meshStandardMaterial color={styling.chrome} metalness={0.9} />
            </mesh>
          </group>
        );
      
      case 'ford_mustang':
        return (
          <group position={grillePosition}>
            {/* Mustang Aggressive Grille */}
            <mesh>
              <boxGeometry args={[0.05, 0.4, 0.8]} />
              <meshStandardMaterial color={styling.grille} />
            </mesh>
            {/* Mustang Horse Logo */}
            <mesh position={[0.03, 0, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color={styling.chrome} metalness={0.9} />
            </mesh>
          </group>
        );
      
      default:
        return (
          <mesh position={grillePosition}>
            <boxGeometry args={[0.05, 0.4, 0.8]} />
            <meshStandardMaterial color={styling.grille} />
          </mesh>
        );
    }
  };

  // Render brand-specific headlights
  const renderHeadlights = () => {
    const headlightPositions: [[number, number, number], [number, number, number]] = [
      [specs.body.length/2 + 0.1, specs.ground + 0.2, 0.6],
      [specs.body.length/2 + 0.1, specs.ground + 0.2, -0.6]
    ];
    
    return headlightPositions.map((pos, i) => {
      switch (specs.headlightStyle) {
        case 'bmw_angel_eyes':
          return (
            <group key={i} position={pos}>
              {/* BMW Angel Eyes */}
              <mesh>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <torusGeometry args={[0.12, 0.02, 8, 16]} />
                <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.5} />
              </mesh>
            </group>
          );
        
        case 'mercedes_multibeam':
          return (
            <group key={i} position={pos}>
              {/* Mercedes Multibeam LED */}
              <mesh>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
              </mesh>
              <mesh position={[0.05, 0, 0]}>
                <boxGeometry args={[0.05, 0.1, 0.1]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
              </mesh>
            </group>
          );
        
        case 'audi_matrix_led':
          return (
            <group key={i} position={pos}>
              {/* Audi Matrix LED */}
              <mesh>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
              </mesh>
              {/* LED Matrix Pattern */}
              {[-0.05, 0, 0.05].map((offset, j) => (
                <mesh key={j} position={[0.08, offset, 0]}>
                  <sphereGeometry args={[0.02, 8, 8]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
                </mesh>
              ))}
            </group>
          );
        
        case 'tesla_led_strip':
          return (
            <group key={i} position={pos}>
              {/* Tesla LED Strip */}
              <mesh>
                <boxGeometry args={[0.1, 0.05, 0.25]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
              </mesh>
            </group>
          );
        
        default:
          return (
            <mesh key={i} position={pos}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
            </mesh>
          );
      }
    });
  };

  // Auto rotation when not being dragged
  useFrame((state) => {
    if (groupRef.current && autoRotate && !isDragging) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={[0, 0, 0]}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
    >
      
      {/* Main Car Body - More realistic proportions */}
      <mesh ref={meshRef} position={[0, specs.ground + 0.3, 0]}>
        <boxGeometry args={[specs.body.length, specs.body.height, specs.body.width]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Car Hood */}
      <mesh position={[1.8, specs.ground + 0.4, 0]}>
        <boxGeometry args={[0.8, 0.2, specs.body.width * 0.9]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Car Roof */}
      <mesh position={[0, specs.ground + 0.8, 0]}>
        <boxGeometry args={[specs.body.length * 0.7, 0.4, specs.body.width * 0.8]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Windshield */}
      <mesh position={[0.8, specs.ground + 0.9, 0]} rotation={[-0.1, 0, 0]}>
        <planeGeometry args={[specs.body.width * 0.7, 0.8]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3} 
          metalness={0.1} 
          roughness={0.1}
        />
      </mesh>

      {/* Side Windows */}
      <mesh position={[0, specs.ground + 0.9, specs.body.width/2 + 0.05]} rotation={[0, 0, -0.1]}>
        <planeGeometry args={[specs.body.length * 0.6, 0.6]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
        />
      </mesh>
      <mesh position={[0, specs.ground + 0.9, -(specs.body.width/2 + 0.05)]} rotation={[0, 0, 0.1]}>
        <planeGeometry args={[specs.body.length * 0.6, 0.6]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
        />
      </mesh>

      {/* Rear Window */}
      <mesh position={[-0.8, specs.ground + 0.9, 0]} rotation={[0.1, 0, 0]}>
        <planeGeometry args={[specs.body.width * 0.7, 0.7]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
        />
      </mesh>

      {/* Brand-Specific Front Grille */}
      {renderGrille()}

      {/* Brand-Specific Headlights */}
      {renderHeadlights()}

      {/* Taillights */}
      <mesh position={[-(specs.body.length/2 + 0.1), specs.ground + 0.2, 0.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[-(specs.body.length/2 + 0.1), specs.ground + 0.2, -0.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Wheels - Positioned based on car type */}
      {specs.wheelPositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI/2]}>
            <torusGeometry args={[specs.wheelSize, 0.1, 8, 20]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[specs.wheelSize * 0.8, specs.wheelSize * 0.8, 0.1, 20]} />
            <meshStandardMaterial color={styling.chrome} metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Rim center with brand accent */}
          <mesh rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[specs.wheelSize * 0.3, specs.wheelSize * 0.3, 0.12, 8]} />
            <meshStandardMaterial color={styling.accent} metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Side Mirrors */}
      <mesh position={[0.5, specs.ground + 0.8, specs.body.width/2 + 0.2]}>
        <boxGeometry args={[0.1, 0.08, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.5, specs.ground + 0.8, -(specs.body.width/2 + 0.2)]}>
        <boxGeometry args={[0.1, 0.08, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Door Handles */}
      <mesh position={[0.3, specs.ground + 0.2, specs.body.width/2 + 0.05]}>
        <boxGeometry args={[0.15, 0.05, 0.03]} />
        <meshStandardMaterial color={styling.chrome} metalness={0.9} />
      </mesh>
      <mesh position={[0.3, specs.ground + 0.2, -(specs.body.width/2 + 0.05)]}>
        <boxGeometry args={[0.15, 0.05, 0.03]} />
        <meshStandardMaterial color={styling.chrome} metalness={0.9} />
      </mesh>
      <mesh position={[-0.3, specs.ground + 0.2, specs.body.width/2 + 0.05]}>
        <boxGeometry args={[0.15, 0.05, 0.03]} />
        <meshStandardMaterial color={styling.chrome} metalness={0.9} />
      </mesh>
      <mesh position={[-0.3, specs.ground + 0.2, -(specs.body.width/2 + 0.05)]}>
        <boxGeometry args={[0.15, 0.05, 0.03]} />
        <meshStandardMaterial color={styling.chrome} metalness={0.9} />
      </mesh>

      {/* Car Info Display */}
      <Html
        position={[0, -1.5, 0]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minWidth: '250px'
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {carData.year} {carData.brand} {carData.model}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
            {specs.type.toUpperCase()} • 3D Model
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Drag to rotate • Auto-rotating when idle
          </Typography>
        </Box>
      </Html>
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
    bodyType?: string;
    fuelType?: string;
    transmission?: string;
    condition?: string;
    location?: string;
    description?: string;
    images?: string[];
    mileage?: number;
    rating?: number;
  };
  onClose?: () => void;
  fullscreen?: boolean;
  useRealistic3D?: boolean; // New prop to choose between realistic models and geometric models
}

const CarViewer3D: React.FC<CarViewer3DProps> = ({ 
  car, 
  onClose, 
  fullscreen = false,
  useRealistic3D = true // Default to realistic 3D models
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

        {/* 3D Viewer */}
        <Box sx={{ height: '100%', position: 'relative' }}>
          {useRealistic3D ? (
            // Use the new realistic 3D model viewer
            <Car3DModelViewer
              car={{
                id: car.id,
                brand: car.brand,
                model: car.model,
                year: car.year,
                color: selectedColor,
                bodyType: car.bodyType
              }}
              height="h-full"
              showControls={true}
              autoRotate={autoRotate}
              enableZoom={true}
              enablePan={true}
              className="rounded-none"
              onModelLoad={() => console.log('3D model loaded successfully')}
              onModelError={(error) => console.warn('3D model loading failed, using fallback:', error)}
            />
          ) : (
            // Use the original geometric model
            <Canvas
              camera={{ position: [5, 5, 5], fov: 50 }}
              shadows
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <Suspense fallback={<Loader />}>
                <Lighting />
                
                {/* Environment */}
                <Environment preset="studio" />
                
                {/* Realistic Car Display */}
                <RealisticCarGenerator
                  autoRotate={autoRotate}
                  color={selectedColor || '#2563eb'}
                  carData={{
                    brand: car.brand,
                    model: car.model,
                    bodyType: car.bodyType || 'sedan',
                    year: car.year
                  }}
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
          )}
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