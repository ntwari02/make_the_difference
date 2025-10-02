import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ToyotaCamryModel } from './ToyotaCamryModel';

interface RealisticCarGeneratorProps {
  carData: {
    brand: string;
    model: string;
    bodyType?: string;
    year: number;
  };
  color: string;
  autoRotate?: boolean;
}

export function RealisticCarGenerator({ 
  carData, 
  color, 
  autoRotate = true 
}: RealisticCarGeneratorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Check if this is a Toyota Camry and use specific model
  const brand = carData.brand?.toLowerCase() || '';
  const model = carData.model?.toLowerCase() || '';
  
  console.log('Car Data:', { brand, model, fullCarData: carData }); // Debug log
  
  const isToyotaCamry = brand.includes('toyota') && model.includes('camry');
  const isToyota = brand.includes('toyota'); // Show Camry model for any Toyota
  
  console.log('Is Toyota Camry:', isToyotaCamry, 'Is Toyota:', isToyota); // Debug log

  // TEMPORARY: Show Toyota Camry model for ALL cars to test
  return (
    <ToyotaCamryModel 
      color={color}
      autoRotate={autoRotate}
    />
  );

  // if (isToyota) { // Use Camry model for any Toyota for now
  //   return (
  //     <ToyotaCamryModel 
  //       color={color}
  //       autoRotate={autoRotate}
  //     />
  //   );
  // }

  // Create realistic car geometry based on car type
  const carGeometry = useMemo(() => {
    const brand = carData.brand?.toLowerCase() || '';
    const model = carData.model?.toLowerCase() || '';
    const bodyType = carData.bodyType?.toLowerCase() || '';

    // Determine car specifications
    let specs = {
      body: { width: 1.8, height: 0.9, length: 4.3 },
      wheelSize: 0.35,
      ground: -0.5,
      wheelPositions: [
        [1.6, -0.5, 0.8], [-1.6, -0.5, 0.8],
        [1.6, -0.5, -0.8], [-1.6, -0.5, -0.8]
      ] as [number, number, number][],
      roofHeight: 0.4,
      hoodLength: 1.2,
      trunkLength: 1.0
    };

    // Adjust specs based on car type
    if (bodyType.includes('suv') || model.includes('x5') || model.includes('rav4')) {
      specs = {
        body: { width: 2.0, height: 1.2, length: 4.7 },
        wheelSize: 0.4,
        ground: -0.6,
        wheelPositions: [
          [2.0, -0.6, 1.0], [-2.0, -0.6, 1.0],
          [2.0, -0.6, -1.0], [-2.0, -0.6, -1.0]
        ],
        roofHeight: 0.6,
        hoodLength: 1.3,
        trunkLength: 1.1
      };
    } else if (bodyType.includes('sports') || model.includes('mustang') || model.includes('supra')) {
      specs = {
        body: { width: 1.9, height: 0.7, length: 4.2 },
        wheelSize: 0.38,
        ground: -0.4,
        wheelPositions: [
          [1.8, -0.4, 0.9], [-1.8, -0.4, 0.9],
          [1.8, -0.4, -0.9], [-1.8, -0.4, -0.9]
        ],
        roofHeight: 0.3,
        hoodLength: 1.4,
        trunkLength: 0.8
      };
    }

    return specs;
  }, [carData]);

  // Auto rotation
  useFrame(() => {
    if (groupRef.current && autoRotate && !isDragging) {
      groupRef.current.rotation.y += 0.008;
    }
  });

  // Create realistic car body with proper automotive curves
  const createCarBody = () => {
    const length = carGeometry.body.length;
    const width = carGeometry.body.width;
    const height = carGeometry.body.height;
    
    // Create a more realistic car shape using multiple geometries
    const bodyGeometry = new THREE.BoxGeometry(length, height * 0.6, width);
    
    // Apply realistic car proportions and curves
    const positions = bodyGeometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i);
      
      // Create car-like curves
      const x = vertex.x;
      const y = vertex.y;
      const z = vertex.z;
      
      // Front and rear tapering (aerodynamic shape)
      if (x > length * 0.3) {
        vertex.z *= 0.9; // Taper the front
        vertex.y += Math.sin((x / length) * Math.PI) * 0.1;
      } else if (x < -length * 0.3) {
        vertex.z *= 0.95; // Slight taper at rear
      }
      
      // Side curves (wheel arches and body lines)
      if (Math.abs(z) > width * 0.3) {
        vertex.y -= 0.05; // Lower the sides for wheel arches
      }
      
      // Roof curve
      if (y > 0) {
        const roofCurve = 1 - Math.pow(Math.abs(x) / (length * 0.5), 2) * 0.3;
        vertex.y *= roofCurve;
      }
      
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    positions.needsUpdate = true;
    bodyGeometry.computeVertexNormals();
    
    return bodyGeometry;
  };

  // Create car roof
  const createCarRoof = () => {
    const shape = new THREE.Shape();
    const roofLength = carGeometry.body.length * 0.6;
    const roofWidth = carGeometry.body.width * 0.8;
    
    shape.moveTo(-roofLength/2, -roofWidth/2);
    shape.lineTo(roofLength/2 - 0.2, -roofWidth/2);
    shape.quadraticCurveTo(roofLength/2, -roofWidth/2, roofLength/2, -roofWidth/2 + 0.1);
    shape.lineTo(roofLength/2, roofWidth/2 - 0.1);
    shape.quadraticCurveTo(roofLength/2, roofWidth/2, roofLength/2 - 0.2, roofWidth/2);
    shape.lineTo(-roofLength/2 + 0.2, roofWidth/2);
    shape.quadraticCurveTo(-roofLength/2, roofWidth/2, -roofLength/2, roofWidth/2 - 0.1);
    shape.lineTo(-roofLength/2, -roofWidth/2 + 0.1);
    shape.quadraticCurveTo(-roofLength/2, -roofWidth/2, -roofLength/2 + 0.2, -roofWidth/2);

    const extrudeSettings = {
      depth: carGeometry.roofHeight,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  return (
    <group 
      ref={groupRef}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
    >
      {/* Main Car Body - Realistic curved shape */}
      <mesh position={[0, carGeometry.ground + carGeometry.body.height/2, 0]}>
        <primitive object={createCarBody()} />
        <meshStandardMaterial 
          color={color}
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Car Hood - Separate curved piece */}
      <mesh position={[carGeometry.body.length * 0.35, carGeometry.ground + carGeometry.body.height * 0.7, 0]}>
        <boxGeometry args={[carGeometry.body.length * 0.3, carGeometry.body.height * 0.2, carGeometry.body.width * 0.85]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Car Trunk */}
      <mesh position={[-carGeometry.body.length * 0.35, carGeometry.ground + carGeometry.body.height * 0.65, 0]}>
        <boxGeometry args={[carGeometry.body.length * 0.25, carGeometry.body.height * 0.15, carGeometry.body.width * 0.8]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Realistic Roof with proper curves */}
      <mesh position={[0, carGeometry.ground + carGeometry.body.height * 0.9, 0]}>
        <boxGeometry args={[carGeometry.body.length * 0.65, carGeometry.body.height * 0.4, carGeometry.body.width * 0.75]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Hood */}
      <mesh position={[carGeometry.hoodLength, carGeometry.ground + 0.1, 0]}>
        <boxGeometry args={[0.8, 0.15, carGeometry.body.width * 0.9]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Trunk */}
      <mesh position={[-carGeometry.trunkLength, carGeometry.ground + 0.1, 0]}>
        <boxGeometry args={[0.6, 0.12, carGeometry.body.width * 0.85]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Windshield */}
      <mesh 
        position={[0.8, carGeometry.ground + carGeometry.body.height + 0.3, 0]} 
        rotation={[-0.2, 0, 0]}
      >
        <planeGeometry args={[carGeometry.body.width * 0.7, 0.8]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.4} 
          metalness={0.1} 
          roughness={0.1}
        />
      </mesh>

      {/* Rear Window */}
      <mesh 
        position={[-0.8, carGeometry.ground + carGeometry.body.height + 0.3, 0]} 
        rotation={[0.2, 0, 0]}
      >
        <planeGeometry args={[carGeometry.body.width * 0.7, 0.7]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.4}
        />
      </mesh>

      {/* Side Windows */}
      <mesh 
        position={[0, carGeometry.ground + carGeometry.body.height + 0.3, carGeometry.body.width/2 + 0.02]} 
        rotation={[0, 0, -0.1]}
      >
        <planeGeometry args={[carGeometry.body.length * 0.5, 0.6]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.4}
        />
      </mesh>
      <mesh 
        position={[0, carGeometry.ground + carGeometry.body.height + 0.3, -(carGeometry.body.width/2 + 0.02)]} 
        rotation={[0, 0, 0.1]}
      >
        <planeGeometry args={[carGeometry.body.length * 0.5, 0.6]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.4}
        />
      </mesh>

      {/* Headlights */}
      <mesh position={[carGeometry.body.length/2 + 0.05, carGeometry.ground + 0.2, 0.6]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[carGeometry.body.length/2 + 0.05, carGeometry.ground + 0.2, -0.6]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Taillights */}
      <mesh position={[-(carGeometry.body.length/2 + 0.05), carGeometry.ground + 0.2, 0.5]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[-(carGeometry.body.length/2 + 0.05), carGeometry.ground + 0.2, -0.5]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Wheels */}
      {carGeometry.wheelPositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI/2]}>
            <torusGeometry args={[carGeometry.wheelSize, 0.08, 8, 20]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[carGeometry.wheelSize * 0.8, carGeometry.wheelSize * 0.8, 0.08, 20]} />
            <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Rim center */}
          <mesh rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[carGeometry.wheelSize * 0.3, carGeometry.wheelSize * 0.3, 0.1, 8]} />
            <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Side Mirrors */}
      <mesh position={[0.5, carGeometry.ground + carGeometry.body.height + 0.2, carGeometry.body.width/2 + 0.15]}>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.5, carGeometry.ground + carGeometry.body.height + 0.2, -(carGeometry.body.width/2 + 0.15)]}>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Door Handles */}
      {[
        [0.3, carGeometry.body.width/2 + 0.02],
        [0.3, -(carGeometry.body.width/2 + 0.02)],
        [-0.3, carGeometry.body.width/2 + 0.02],
        [-0.3, -(carGeometry.body.width/2 + 0.02)]
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, carGeometry.ground + 0.3, z]}>
          <boxGeometry args={[0.12, 0.04, 0.02]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.9} />
        </mesh>
      ))}

      {/* Front Grille */}
      <mesh position={[carGeometry.body.length/2 + 0.02, carGeometry.ground + 0.2, 0]}>
        <boxGeometry args={[0.03, 0.3, 0.7]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Bumpers */}
      <mesh position={[carGeometry.body.length/2 + 0.1, carGeometry.ground - 0.1, 0]}>
        <boxGeometry args={[0.1, 0.15, carGeometry.body.width]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[-(carGeometry.body.length/2 + 0.1), carGeometry.ground - 0.1, 0]}>
        <boxGeometry args={[0.1, 0.15, carGeometry.body.width]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
}

export default RealisticCarGenerator;
