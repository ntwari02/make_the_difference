# 3D Car Models Directory

This directory contains 3D car models in .glb or .gltf format for the car viewer component.

## Directory Structure

```
models/
├── cars/
│   ├── generic/
│   │   ├── sedan.glb
│   │   ├── suv.glb
│   │   ├── sports.glb
│   │   └── hatchback.glb
│   ├── bmw/
│   │   ├── x5_2023.glb
│   │   ├── 3_series.glb
│   │   └── m3.glb
│   ├── mercedes/
│   │   ├── gle.glb
│   │   ├── c_class.glb
│   │   └── amg_gt.glb
│   ├── audi/
│   │   ├── q7.glb
│   │   ├── a4.glb
│   │   └── rs6.glb
│   ├── tesla/
│   │   ├── model_x.glb
│   │   ├── model_s.glb
│   │   └── model_3.glb
│   ├── toyota/
│   │   ├── rav4.glb
│   │   ├── camry.glb
│   │   └── supra.glb
│   ├── honda/
│   │   ├── cr_v.glb
│   │   ├── accord.glb
│   │   └── civic_type_r.glb
│   └── ford/
│       ├── f_150.glb
│       ├── mustang.glb
│       └── explorer.glb
```

## Model Requirements

### File Format
- **Preferred**: .glb (binary GLTF)
- **Alternative**: .gltf (JSON GLTF with separate .bin files)

### Model Specifications
- **Scale**: Models should be approximately 1 unit = 1 meter
- **Position**: Car should be centered at origin (0, 0, 0)
- **Orientation**: Car should face forward along positive Z-axis
- **Polygon Count**: Recommended 10k-50k triangles for good performance
- **Textures**: Maximum 2048x2048 resolution

### Material Requirements
- Use PBR (Physically Based Rendering) materials
- Include proper metallic/roughness maps
- Car body materials should be named with "body" or "paint" for color customization
- Windows should use transparent materials
- Lights should have emissive materials

### Naming Convention
- Use lowercase letters and underscores
- Format: `{model}_{year}.glb` or `{model}.glb`
- Examples: `x5_2023.glb`, `camry.glb`, `mustang_gt.glb`

## Adding New Models

1. **Obtain 3D Model**: Download or create a car model in .glb/.gltf format
2. **Optimize Model**: Reduce polygon count if necessary (use Blender or similar)
3. **Place in Correct Directory**: 
   - Brand-specific: `/models/cars/{brand}/`
   - Generic fallback: `/models/cars/generic/`
4. **Test Loading**: Use the Car3DModelViewer component to test

## Model Sources

### Free Sources
- **Sketchfab**: Many free car models available
- **Poly Haven**: High-quality PBR models
- **Mixamo**: Adobe's free 3D content
- **TurboSquid**: Some free models available

### Commercial Sources
- **TurboSquid**: Professional car models
- **CGTrader**: Wide selection of automotive models
- **Hum3D**: High-quality car models
- **Evermotion**: Archmodels collections

## Performance Tips

1. **LOD (Level of Detail)**: Use lower poly models for distant views
2. **Texture Compression**: Use compressed texture formats when possible
3. **Model Optimization**: Remove unnecessary details not visible to users
4. **Preloading**: Common models are preloaded for faster access

## Fallback System

The component uses a fallback system:
1. Try brand-specific model: `/models/cars/{brand}/{model}_{year}.glb`
2. Try generic brand model: `/models/cars/{brand}/{model}.glb`
3. Try body type model: `/models/cars/{brand}/{bodyType}.glb`
4. Try generic body type: `/models/cars/generic/{bodyType}.glb`
5. Final fallback: `/models/cars/generic/sedan.glb`

## Example Usage

```tsx
import Car3DModelViewer from '@/shared/components/3d/Car3DModelViewer';

<Car3DModelViewer
  car={{
    id: "1",
    brand: "BMW",
    model: "X5",
    year: 2023,
    color: "#ffffff",
    bodyType: "SUV"
  }}
  height="h-96"
  showControls={true}
  autoRotate={false}
  enableZoom={true}
  enablePan={true}
/>
```

## Troubleshooting

### Model Not Loading
1. Check file path and naming convention
2. Verify file format (.glb/.gltf)
3. Check browser console for loading errors
4. Ensure model is properly exported

### Performance Issues
1. Reduce polygon count
2. Optimize textures (smaller resolution)
3. Use texture compression
4. Implement LOD system

### Visual Issues
1. Check material setup (PBR workflow)
2. Verify lighting setup
3. Check model scale and positioning
4. Ensure proper UV mapping
