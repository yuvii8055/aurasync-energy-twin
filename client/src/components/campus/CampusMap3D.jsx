import React, { useEffect, useRef, useState } from 'react';
import { Map, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Sun, Moon, RotateCcw, Compass, Layers } from 'lucide-react';
import defaultHotspots from '../../config/campus-hotspots.json';

export default function CampusMap3D({ telemetry, onSelectBuilding }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [isNight, setIsNight] = useState(false);

  const campusConfig = defaultHotspots.campus || {
    center: [77.5146, 12.8252],
    zoom: 17.2,
    bearing: -20,
    pitch: 55
  };

  // Build GeoJSON FeatureCollection from campus hotspots
  const getGeojsonData = () => {
    const buildings = defaultHotspots.buildings || [];
    const features = buildings.map((b) => {
      // Find building telemetry safely whether buildings is an Array or Object
      let tel = null;
      if (telemetry?.buildings) {
        if (Array.isArray(telemetry.buildings)) {
          tel = telemetry.buildings.find((tb) => tb.id === b.id || tb.buildingId === b.id);
        } else if (typeof telemetry.buildings === 'object') {
          tel = telemetry.buildings[b.id] || Object.values(telemetry.buildings).find((tb) => tb?.id === b.id || tb?.buildingId === b.id);
        }
      }
      const realKw = tel?.realKw || b.baselineKw || 40;
      const ghostKw = tel?.ghostKw || 30;
      const ratio = realKw / (ghostKw || 1);

      let color = '#10b981'; // emerald
      if (ratio > 1.35) color = '#f43f5e'; // rose
      else if (ratio > 1.1) color = '#f59e0b'; // amber

      // Ensure polygon is closed (first coord === last coord)
      const coords = [...(b.coordinates || [])];
      if (coords.length > 0 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
        coords.push(coords[0]);
      }

      return {
        type: 'Feature',
        properties: {
          id: b.id,
          name: b.shortName || b.name,
          label: b.label || b.name,
          height: b.height || 18,
          floors: b.floors || 4,
          realKw,
          ghostKw,
          color
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features
    };
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Carto Voyager Style with OpenStreetMap data attribution
    const mapStyle = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors, © CARTO'
        }
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 20
        }
      ]
    };

    const map = new Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: campusConfig.center,
      zoom: campusConfig.zoom,
      bearing: campusConfig.bearing,
      pitch: campusConfig.pitch,
      antialias: true
    });

    mapRef.current = map;

    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', () => {
      // Add 3D Extruded Buildings GeoJSON Source
      map.addSource('dsatm-buildings-3d', {
        type: 'geojson',
        data: getGeojsonData()
      });

      // Add 3D Fill-Extrusion Layer (Fix 3.3)
      map.addLayer({
        id: 'dsatm-buildings-extrusion',
        type: 'fill-extrusion',
        source: 'dsatm-buildings-3d',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.85
        }
      });

      // Click to select building
      map.on('click', 'dsatm-buildings-extrusion', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          const found = defaultHotspots.buildings.find((b) => b.id === props.id);
          if (found && onSelectBuilding) {
            onSelectBuilding(found);
          }
        }
      });

      // Cursor change on hover
      map.on('mouseenter', 'dsatm-buildings-extrusion', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'dsatm-buildings-extrusion', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update GeoJSON data when telemetry updates
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.getSource('dsatm-buildings-3d')) {
      map.getSource('dsatm-buildings-3d').setData(getGeojsonData());
    }
  }, [telemetry]);

  // Toggle Day / Night Simulation
  const toggleDayNight = () => {
    setIsNight(!isNight);
    const map = mapRef.current;
    if (!map) return;

    if (!isNight) {
      // Night mode pitch black with neon glowing extrusions
      map.setPaintProperty('osm-tiles-layer', 'raster-brightness-max', 0.25);
      map.setPaintProperty('dsatm-buildings-extrusion', 'fill-extrusion-opacity', 0.95);
    } else {
      // Day mode normal lighting
      map.setPaintProperty('osm-tiles-layer', 'raster-brightness-max', 1.0);
      map.setPaintProperty('dsatm-buildings-extrusion', 'fill-extrusion-opacity', 0.85);
    }
  };

  const handleResetCamera = () => {
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: campusConfig.center,
        zoom: campusConfig.zoom,
        pitch: campusConfig.pitch,
        bearing: campusConfig.bearing,
        duration: 1500
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-[#070B14]">
      {/* MapLibre 3D Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 3D Floating Control Buttons */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
        <button
          onClick={toggleDayNight}
          className="p-2.5 rounded-xl glass-panel bg-black/70 hover:bg-black/90 text-white border border-white/15 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-xl shadow-xl transition"
        >
          {isNight ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          <span>{isNight ? 'Daylight' : 'Night Sun Glow'}</span>
        </button>

        <button
          onClick={handleResetCamera}
          className="p-2.5 rounded-xl glass-panel bg-black/70 hover:bg-black/90 text-white border border-white/15 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-xl shadow-xl transition"
          title="Reset Camera Angle"
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
          <span>Reset Camera</span>
        </button>
      </div>

      {/* Attribution Badge */}
      <div className="absolute bottom-2 right-2 z-20 text-[10px] text-slate-500 font-mono bg-black/60 px-2 py-0.5 rounded">
        {campusConfig.tilesAttribution}
      </div>
    </div>
  );
}
