// Source: Google Maps Platform Code Assist
import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin, useMap } from '@vis.gl/react-google-maps';
import { PHC, RiskLevel } from '../../types.ts';
import { useApp } from '../../context/AppContext.tsx';
import {
  Activity,
  Bed,
  CheckCircle2,
  ChevronRight,
  Eye,
  Hospital,
  MapPin,
  Phone,
  Search,
  User,
  Wind
} from 'lucide-react';

interface IndiaPhcMapProps {
  phcs: PHC[];
  onSelectPhc: (phc: PHC) => void;
  selectedPhcId?: string | null;
}

const MapCameraHandler: React.FC<{ targetPhc: PHC | null }> = ({ targetPhc }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetPhc) return;
    map.panTo({ lat: targetPhc.lat, lng: targetPhc.lng });
    map.setZoom(11);
  }, [map, targetPhc]);

  return null;
};

export const IndiaPhcMap: React.FC<IndiaPhcMapProps> = ({
  phcs,
  onSelectPhc,
  selectedPhcId
}) => {
  const { t, language } = useApp();
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [activeMarkerPhc, setActiveMarkerPhc] = useState<PHC | null>(null);
  const [mapTypeId, setMapTypeId] = useState<string>('roadmap');

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDxq0yDBWnTP56ZtIf1G7XB-elIrSnPQZ0';

  // Find currently selected PHC
  useEffect(() => {
    if (selectedPhcId) {
      const match = phcs.find((p) => p.id === selectedPhcId);
      if (match) {
        setActiveMarkerPhc(match);
      }
    }
  }, [selectedPhcId, phcs]);

  const filteredPhcs = phcs.filter((p) => {
    if (filterRisk === 'ALL') return true;
    return p.overallRisk === filterRisk;
  });

  const getPinColors = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return { background: '#f43f5e', glyphColor: '#ffffff', borderColor: '#9f1239' };
      case 'HIGH':
        return { background: '#f59e0b', glyphColor: '#ffffff', borderColor: '#b45309' };
      case 'MEDIUM':
        return { background: '#f97316', glyphColor: '#ffffff', borderColor: '#c2410c' };
      case 'NORMAL':
      default:
        return { background: '#10b981', glyphColor: '#ffffff', borderColor: '#065f46' };
    }
  };

  const handleHospitalJump = (phcId: string) => {
    if (!phcId) return;
    const found = phcs.find((p) => p.id === phcId);
    if (found) {
      setActiveMarkerPhc(found);
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/95 p-4 sm:p-5 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Top Map Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-wide font-sans flex items-center gap-2">
                <span>{t.map.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {phcs.length} Real Facilities
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                {t.map.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Jump Dropdown, Map Type, & Risk Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Jump To Hospital Selector */}
          <div className="relative">
            <select
              value={activeMarkerPhc?.id || ''}
              onChange={(e) => handleHospitalJump(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-500 cursor-pointer max-w-[200px] truncate"
            >
              <option value="">{t.map.jumpToHospital}</option>
              {phcs.map((phc) => (
                <option key={phc.id} value={phc.id} className="bg-slate-900 text-white">
                  {phc.name} ({phc.district})
                </option>
              ))}
            </select>
          </div>

          {/* Map Type Toggle */}
          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => setMapTypeId('roadmap')}
              className={`px-2 py-1 rounded text-[11px] ${
                mapTypeId === 'roadmap' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.map.roadmap}
            </button>
            <button
              onClick={() => setMapTypeId('hybrid')}
              className={`px-2 py-1 rounded text-[11px] ${
                mapTypeId === 'hybrid' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.map.satellite}
            </button>
          </div>

          {/* Risk Filters */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setFilterRisk('ALL')}
              className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
                filterRisk === 'ALL'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.map.allHospitals}
            </button>
            <button
              onClick={() => setFilterRisk('CRITICAL')}
              className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
                filterRisk === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400 hover:text-rose-200'
              }`}
            >
              {t.map.criticalOnly}
            </button>
            <button
              onClick={() => setFilterRisk('HIGH')}
              className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
                filterRisk === 'HIGH'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:text-amber-200'
              }`}
            >
              {t.map.highRiskOnly}
            </button>
            <button
              onClick={() => setFilterRisk('NORMAL')}
              className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
                filterRisk === 'NORMAL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:text-emerald-200'
              }`}
            >
              {t.map.normalOnly}
            </button>
          </div>
        </div>
      </div>

      {/* Google Maps Viewport Container */}
      <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <APIProvider apiKey={apiKey} language={language} region="IN">
          <Map
            defaultCenter={{ lat: 17.5, lng: 79.5 }}
            defaultZoom={6}
            minZoom={4}
            maxZoom={15}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapTypeId}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <MapCameraHandler targetPhc={activeMarkerPhc} />

            {filteredPhcs.map((phc) => {
              const pinColors = getPinColors(phc.overallRisk);
              const isSelected = (selectedPhcId === phc.id) || (activeMarkerPhc?.id === phc.id);

              return (
                <AdvancedMarker
                  key={phc.id}
                  position={{ lat: phc.lat, lng: phc.lng }}
                  title={`${phc.name} - ${phc.cityTown}`}
                  onClick={() => setActiveMarkerPhc(phc)}
                >
                  <Pin
                    background={pinColors.background}
                    glyphColor={pinColors.glyphColor}
                    borderColor={pinColors.borderColor}
                    scale={isSelected ? 1.3 : 1.0}
                  />
                </AdvancedMarker>
              );
            })}

            {activeMarkerPhc && (
              <InfoWindow
                position={{ lat: activeMarkerPhc.lat, lng: activeMarkerPhc.lng }}
                onCloseClick={() => setActiveMarkerPhc(null)}
              >
                <div className="p-2.5 text-slate-900 max-w-xs space-y-2 font-sans">
                  {/* InfoWindow Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase block tracking-wider">
                        {activeMarkerPhc.district}, {activeMarkerPhc.state}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight mt-0.5">
                        {activeMarkerPhc.name}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                        {activeMarkerPhc.code} • {activeMarkerPhc.cityTown}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        activeMarkerPhc.overallRisk === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : activeMarkerPhc.overallRisk === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {activeMarkerPhc.overallRisk}
                    </span>
                  </div>

                  {/* Bed & Footfall Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase">{t.map.occupancy}</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {activeMarkerPhc.bedOccupancy} / {activeMarkerPhc.bedCapacity}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ({Math.round((activeMarkerPhc.bedOccupancy / activeMarkerPhc.bedCapacity) * 100)}% cap)
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase">{t.map.footfall}</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {activeMarkerPhc.patientFootfallDaily}
                      </span>
                      <span className="text-rose-600 text-[10px] block font-semibold">
                        +{activeMarkerPhc.patientFootfallTrend}% surge
                      </span>
                    </div>
                  </div>

                  {/* Contact Person & Superintendent */}
                  <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 space-y-1 font-mono">
                    <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <User className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span className="truncate">{activeMarkerPhc.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{activeMarkerPhc.phone}</span>
                    </div>
                  </div>

                  {/* Weather and Active Outbreak */}
                  <div className="text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200">
                    <div>
                      <strong>{t.map.weather}:</strong> {activeMarkerPhc.weather.condition} ({activeMarkerPhc.weather.rainfallMm}mm)
                    </div>
                    <div className="truncate text-rose-700 font-medium">
                      <strong>{t.map.outbreak}:</strong> {activeMarkerPhc.dominantDiseaseTrend.disease}
                    </div>
                  </div>

                  {/* Action Button: Inspect Details */}
                  <button
                    onClick={() => onSelectPhc(activeMarkerPhc)}
                    className="w-full flex items-center justify-center gap-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold py-1.5 px-3 rounded text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t.map.inspectHospital}</span>
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Floating Quick Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-950/95 border border-slate-800 rounded-lg p-2.5 flex items-center gap-3 text-[11px] font-mono text-slate-300 shadow-xl backdrop-blur-md z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>{t.common.critical}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>{t.common.high}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{t.common.normal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
