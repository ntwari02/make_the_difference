import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ToyotaCamryModelProps {
  color: string;
  autoRotate?: boolean;
}

export function ToyotaCamryModel({ color, autoRotate = true }: ToyotaCamryModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  console.log('ToyotaCamryModel rendered with color:', color); // Debug log

  // Auto rotation
  useFrame(() => {
    if (groupRef.current && autoRotate && !isDragging) {
      groupRef.current.rotation.y += 0.008;
    }
  });

  // Create realistic Toyota Camry body shape
  const createCamryBody = () => {
    // Toyota Camry dimensions (scaled down)
    const length = 4.88; // Real Camry is 4.88m
    const width = 1.84;  // Real Camry is 1.84m
    const height = 1.45; // Real Camry is 1.45m
    
    const geometry = new THREE.BoxGeometry(length, height * 0.6, width);
    
    // Modify vertices to create Camry-like shape
    const positions = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i);
      
      const x = vertex.x;
      const y = vertex.y;
      const z = vertex.z;
      
      // Toyota Camry front grille slope
      if (x > length * 0.35) {
        vertex.z *= 0.85; // Narrow front for aerodynamics
        vertex.y += 0.1; // Slight hood rise
      }
      
      // Camry rear trunk slope
      if (x < -length * 0.25) {
        vertex.y += Math.abs(x) * 0.05; // Trunk slope
      }
      
      // Side body curves (Camry's distinctive side profile)
      if (Math.abs(z) > width * 0.35) {
        vertex.y -= 0.08; // Wheel arch curves
      }
      
      // Roof curve (Camry's roofline)
      if (y > 0) {
        const roofCurve = 1 - Math.pow(Math.abs(x) / (length * 0.4), 1.5) * 0.2;
        vertex.y *= roofCurve;
      }
      
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  };

  // Create Toyota Camry front grille
  const createCamryGrille = () => {
    const grilleGeometry = new THREE.BoxGeometry(0.1, 0.4, 1.2);
    return grilleGeometry;
  };

  // Create realistic wheels for Camry
  const createCamryWheel = () => {
    const wheelGroup = new THREE.Group();
    
    // Tire
    const tireGeometry = new THREE.TorusGeometry(0.35, 0.08, 8, 20);
    const tireMaterial = new THREE.MeshStandardMaterial({ 
      color: '#1a1a1a', 
      roughness: 0.9 
    });
    const tire = new THREE.Mesh(tireGeometry, tireMaterial);
    tire.rotation.x = Math.PI / 2;
    wheelGroup.add(tire);
    
    // Rim (Toyota style)
    const rimGeometry = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16);
    const rimMaterial = new THREE.MeshStandardMaterial({ 
      color: '#e0e0e0', 
      metalness: 0.9, 
      roughness: 0.1 
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    wheelGroup.add(rim);
    
    // Toyota logo area (center cap)
    const capGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8);
    const capMaterial = new THREE.MeshStandardMaterial({ 
      color: '#c0c0c0', 
      metalness: 0.8 
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.rotation.x = Math.PI / 2;
    wheelGroup.add(cap);
    
    return wheelGroup;
  };

  return (
    <group 
      ref={groupRef}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
    >
      {/* Toyota Camry Main Body */}
      <mesh position={[0, -0.2, 0]}>
        <primitive object={createCamryBody()} />
        <meshStandardMaterial 
          color={color}
          metalness={0.95}
          roughness={0.05}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Camry Hood */}
      <mesh position={[1.8, 0.1, 0]}>
        <boxGeometry args={[1.2, 0.15, 1.7]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Camry Trunk */}
      <mesh position={[-1.6, 0.05, 0]}>
        <boxGeometry args={[1.0, 0.12, 1.65]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Camry Roof */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[3.2, 0.3, 1.4]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Toyota Camry Front Grille */}
      <mesh position={[2.44, -0.1, 0]}>
        <primitive object={createCamryGrille()} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Toyota Logo Area - Make it more visible */}
      <mesh position={[2.5, -0.1, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* "TOYOTA" text indicator */}
      <mesh position={[2.5, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.1, 0.05]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Camry Headlights (LED style) */}
      <mesh position={[2.3, 0, 0.7]}>
        <boxGeometry args={[0.2, 0.15, 0.4]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[2.3, 0, -0.7]}>
        <boxGeometry args={[0.2, 0.15, 0.4]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Camry Taillights */}
      <mesh position={[-2.3, 0, 0.6]}>
        <boxGeometry args={[0.15, 0.12, 0.3]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[-2.3, 0, -0.6]}>
        <boxGeometry args={[0.15, 0.12, 0.3]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Camry Windows */}
      {/* Windshield */}
      <mesh position={[0.8, 0.5, 0]} rotation={[-0.15, 0, 0]}>
        <planeGeometry args={[1.3, 0.8]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Rear Window */}
      <mesh position={[-0.8, 0.5, 0]} rotation={[0.15, 0, 0]}>
        <planeGeometry args={[1.2, 0.7]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
        />
      </mesh>

      {/* Side Windows */}
      <mesh position={[0, 0.5, 0.92]} rotation={[0, 0, -0.1]}>
        <planeGeometry args={[2.5, 0.6]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
        />
      </mesh>
      <mesh position={[0, 0.5, -0.92]} rotation={[0, 0, 0.1]}>
        <planeGeometry args={[2.5, 0.6]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
        />
      </mesh>

      {/* Camry Wheels - positioned like real Camry */}
      <primitive 
        object={createCamryWheel()} 
        position={[1.4, -0.5, 0.85]} 
      />
      <primitive 
        object={createCamryWheel()} 
        position={[-1.4, -0.5, 0.85]} 
      />
      <primitive 
        object={createCamryWheel()} 
        position={[1.4, -0.5, -0.85]} 
      />
      <primitive 
        object={createCamryWheel()} 
        position={[-1.4, -0.5, -0.85]} 
      />

      {/* Side Mirrors */}
      <mesh position={[0.5, 0.4, 1.0]}>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.5, 0.4, -1.0]}>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Door Handles */}
      <mesh position={[0.5, -0.1, 0.92]}>
        <boxGeometry args={[0.12, 0.04, 0.02]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.9} />
      </mesh>
      <mesh position={[0.5, -0.1, -0.92]}>
        <boxGeometry args={[0.12, 0.04, 0.02]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.9} />
      </mesh>
      <mesh position={[-0.5, -0.1, 0.92]}>
        <boxGeometry args={[0.12, 0.04, 0.02]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.9} />
      </mesh>
      <mesh position={[-0.5, -0.1, -0.92]}>
        <boxGeometry args={[0.12, 0.04, 0.02]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.9} />
      </mesh>

      {/* Front and Rear Bumpers */}
      <mesh position={[2.5, -0.4, 0]}>
        <boxGeometry args={[0.2, 0.15, 1.8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[-2.5, -0.4, 0]}>
        <boxGeometry args={[0.2, 0.15, 1.8]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* License Plate Areas */}
      <mesh position={[2.45, -0.25, 0]}>
        <boxGeometry args={[0.02, 0.08, 0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-2.45, -0.25, 0]}>
        <boxGeometry args={[0.02, 0.08, 0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export default ToyotaCamryModel;
