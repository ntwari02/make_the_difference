import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html, useProgress } from '@react-three/drei';
import { Box, Typography, IconButton, Tooltip, CircularProgress, Alert } from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateLeft, 
  RotateRight, 
  CenterFocusStrong,
  Fullscreen,
  FullscreenExit,
  ThreeDRotation
} from '@mui/icons-material';
import * as THREE from 'three';

// Types
interface Car3DModelViewerProps {
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    color?: string;
    bodyType?: string;
  };
  className?: string;
  height?: string;
  showControls?: boolean;
  autoRotate?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  onModelLoad?: () => void;
  onModelError?: (error: Error) => void;
}

interface CarModelProps {
  car: Car3DModelViewerProps['car'];
  autoRotate: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Loading component
function ModelLoader() {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
        <CircularProgress size={40} className="mb-3" />
        <Typography variant="body2" className="text-gray-700 font-medium">
          Loading 3D Model...
        </Typography>
        <Typography variant="caption" className="text-gray-500 mt-1">
          {Math.round(progress)}% complete
        </Typography>
      </div>
    </Html>
  );
}

// Car model component that loads the actual .glb/.gltf file
function CarModel({ car, autoRotate, onLoad, onError }: CarModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [modelPath, setModelPath] = useState<string>('');
  
  // Generate model path based on car details
  useEffect(() => {
    const generateModelPath = () => {
      // Create a standardized filename based on car details
      const brand = car.brand.toLowerCase().replace(/\s+/g, '_');
      const model = car.model.toLowerCase().replace(/\s+/g, '_');
      const bodyType = car.bodyType?.toLowerCase().replace(/\s+/g, '_') || 'sedan';
      
      // Try multiple possible paths for the model
      const possiblePaths = [
        `/models/cars/${brand}/${model}_${car.year}.glb`,
        `/models/cars/${brand}/${model}.glb`,
        `/models/cars/${brand}/${bodyType}.glb`,
        `/models/cars/generic/${bodyType}.glb`,
        `/models/cars/generic/sedan.glb` // Ultimate fallback
      ];
      
      return possiblePaths[0]; // Start with the most specific path
    };
    
    setModelPath(generateModelPath());
  }, [car]);

  // Load the GLTF model
  const { scene, error } = useGLTF(modelPath, true);
  
  // Handle model loading
  useEffect(() => {
    if (scene) {
      // Scale and position the model appropriately
      scene.scale.setScalar(1);
      scene.position.set(0, 0, 0);
      
      // Apply car color if specified
      if (car.color) {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Only apply color to car body materials (not windows, lights, etc.)
            if (child.name.includes('body') || child.name.includes('paint')) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.color.setHex(parseInt(car.color!.replace('#', ''), 16));
                  }
                });
              } else if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.color.setHex(parseInt(car.color!.replace('#', ''), 16));
              }
            }
          }
        });
      }
      
      onLoad?.();
    }
  }, [scene, car.color, onLoad]);

  // Handle loading errors
  useEffect(() => {
    if (error) {
      console.error('Error loading 3D model:', error);
      onError?.(error as Error);
    }
  }, [error, onError]);

  // Auto rotation animation
  useFrame((state) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  if (error) {
    return (
      <Html center>
        <Alert severity="warning" className="max-w-sm">
          <Typography variant="body2">
            3D model not available for this car. Showing placeholder.
          </Typography>
        </Alert>
      </Html>
    );
  }

  return (
    <group ref={meshRef}>
      <primitive object={scene} />
    </group>
  );
}

// Lighting setup for automotive visualization
function AutomotiveLighting() {
  return (
    <>
      {/* Main key light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-5, 5, 5]}
        intensity={0.8}
      />
      
      {/* Rim light */}
      <directionalLight
        position={[0, 5, -10]}
        intensity={0.6}
      />
      
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Environment for reflections */}
      <Environment preset="studio" />
    </>
  );
}

// Main Car 3D Model Viewer Component
export default function Car3DModelViewer({
  car,
  className = '',
  height = 'h-96',
  showControls = true,
  autoRotate = false,
  enableZoom = true,
  enablePan = true,
  onModelLoad,
  onModelError
}: Car3DModelViewerProps) {
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState<Error | null>(null);
  const orbitControlsRef = useRef<any>(null);

  // Handle model loading
  const handleModelLoad = () => {
    setModelLoaded(true);
    setModelError(null);
    onModelLoad?.();
  };

  // Handle model error
  const handleModelError = (error: Error) => {
    setModelError(error);
    setModelLoaded(false);
    onModelError?.(error);
  };

  // Control functions
  const resetCamera = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
    }
  };

  const zoomIn = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.dollyIn(1.2);
      orbitControlsRef.current.update();
    }
  };

  const zoomOut = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.dollyOut(1.2);
      orbitControlsRef.current.update();
    }
  };

  const rotateLeft = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.rotateLeft(Math.PI / 8);
      orbitControlsRef.current.update();
    }
  };

  const rotateRight = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.rotateLeft(-Math.PI / 8);
      orbitControlsRef.current.update();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative ${height} ${className} bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200`}>
      {/* Car Info Header */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
        <Typography variant="h6" className="font-bold text-gray-800">
          {car.year} {car.brand} {car.model}
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          {car.bodyType || 'Sedan'} • 3D Model View
        </Typography>
      </div>

      {/* Control Panel */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
            <div className="flex flex-col gap-1">
              <Tooltip title="Zoom In">
                <IconButton size="small" onClick={zoomIn} className="text-gray-700 hover:text-blue-600">
                  <ZoomIn fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Zoom Out">
                <IconButton size="small" onClick={zoomOut} className="text-gray-700 hover:text-blue-600">
                  <ZoomOut fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Rotate Left">
                <IconButton size="small" onClick={rotateLeft} className="text-gray-700 hover:text-blue-600">
                  <RotateLeft fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Rotate Right">
                <IconButton size="small" onClick={rotateRight} className="text-gray-700 hover:text-blue-600">
                  <RotateRight fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Reset View">
                <IconButton size="small" onClick={resetCamera} className="text-gray-700 hover:text-blue-600">
                  <CenterFocusStrong fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={isAutoRotating ? "Stop Auto Rotate" : "Auto Rotate"}>
                <IconButton 
                  size="small" 
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`${isAutoRotating ? 'text-blue-600' : 'text-gray-700'} hover:text-blue-600`}
                >
                  <ThreeDRotation fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton size="small" onClick={toggleFullscreen} className="text-gray-700 hover:text-blue-600">
                  {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* Loading Status */}
      {!modelLoaded && !modelError && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
          <div className="flex items-center gap-2">
            <CircularProgress size={16} />
            <Typography variant="caption" className="text-gray-600">
              Loading 3D model...
            </Typography>
          </div>
        </div>
      )}

      {/* Error Status */}
      {modelError && (
        <div className="absolute bottom-4 left-4 z-10 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 shadow-md">
          <Typography variant="caption" className="text-orange-700">
            Using fallback model
          </Typography>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: [5, 2, 5], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        className="w-full h-full"
        shadows
      >
        <Suspense fallback={<ModelLoader />}>
          {/* Lighting */}
          <AutomotiveLighting />
          
          {/* Car Model */}
          <CarModel
            car={car}
            autoRotate={isAutoRotating}
            onLoad={handleModelLoad}
            onError={handleModelError}
          />
          
          {/* Ground plane with contact shadows */}
          <ContactShadows
            position={[0, -1.4, 0]}
            opacity={0.4}
            scale={10}
            blur={2.5}
            far={4.5}
          />
          
          {/* Orbit Controls */}
          <OrbitControls
            ref={orbitControlsRef}
            enablePan={enablePan}
            enableZoom={enableZoom}
            enableRotate={true}
            autoRotate={false} // We handle this manually
            autoRotateSpeed={0.5}
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
        <Typography variant="caption" className="text-gray-600">
          Drag to rotate • Scroll to zoom • Right-click to pan
        </Typography>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <Car3DModelViewer
            car={car}
            className="w-full h-full"
            height="h-full"
            showControls={showControls}
            autoRotate={isAutoRotating}
            enableZoom={enableZoom}
            enablePan={enablePan}
            onModelLoad={onModelLoad}
            onModelError={onModelError}
          />
          <IconButton
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70"
          >
            <FullscreenExit />
          </IconButton>
        </div>
      )}
    </div>
  );
}

// Preload common car models
useGLTF.preload('/models/cars/generic/sedan.glb');
useGLTF.preload('/models/cars/generic/suv.glb');
useGLTF.preload('/models/cars/generic/sports.glb');
