// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin, useMap } from '@vis.gl/react-google-maps';
import { useApp } from '../context/AppContext.tsx';
import { fetchDigitalTwinSnapshot, fetchForecast } from '../services/api.ts';
import { DigitalTwinSnapshot, DigitalTwinNodeState, DigitalTwinFlow, TimelineStep, RiskLevel, ResourceForecast } from '../types.ts';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bed,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  FastForward,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Wind,
  Zap
} from 'lucide-react';

const MapCameraHandler: React.FC<{ targetNode: DigitalTwinNodeState | null }> = ({ targetNode }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetNode) return;
    map.panTo({ lat: targetNode.lat, lng: targetNode.lng });
    map.setZoom(10);
  }, [map, targetNode]);

  return null;
};

export const DigitalTwinView: React.FC = () => {
  const { t, language, setSelectedPhcId, setActiveView, showDemoToast, role } = useApp();

  const [timelineStep, setTimelineStep] = useState<TimelineStep>('TODAY');
  const [snapshot, setSnapshot] = useState<DigitalTwinSnapshot | null>(null);
  const [selectedNode, setSelectedNode] = useState<DigitalTwinNodeState | null>(null);
  const [nodeForecast, setNodeForecast] = useState<ResourceForecast | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'map' | 'topology' | 'split'>('map');
  const [mapTypeId, setMapTypeId] = useState<string>('roadmap');
  const [selectedCorridor, setSelectedCorridor] = useState<DigitalTwinFlow | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const timelineSteps: TimelineStep[] = ['T-7', 'T-3', 'TODAY', 'T+1', 'T+3', 'T+7', 'T+14'];
  const timerRef = useRef<any>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDxq0yDBWnTP56ZtIf1G7XB-elIrSnPQZ0';

  // Fetch snapshot on step change
  useEffect(() => {
    loadSnapshot(timelineStep);
  }, [timelineStep]);

  const loadSnapshot = async (step: TimelineStep) => {
    setIsLoading(true);
    try {
      const data = await fetchDigitalTwinSnapshot(step);
      setSnapshot(data);
      // Auto select first critical or first node
      if (data.nodes && data.nodes.length > 0) {
        const crit = data.nodes.find((n) => n.currentRisk === 'CRITICAL') || data.nodes[0];
        if (!selectedNode) {
          setSelectedNode(crit);
        } else {
          // Refresh existing selection with new step data
          const updated = data.nodes.find((n) => n.phcId === selectedNode.phcId);
          if (updated) setSelectedNode(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load digital twin snapshot:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch forecast for selected node
  useEffect(() => {
    if (selectedNode) {
      fetchForecast(selectedNode.phcId, `res-${selectedNode.phcId}-ors`)
        .then((f) => setNodeForecast(f))
        .catch(() => setNodeForecast(null));
    }
  }, [selectedNode]);

  // Timeline Auto-play feature
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimelineStep((curr) => {
          const currentIndex = timelineSteps.indexOf(curr);
          const nextIndex = (currentIndex + 1) % timelineSteps.length;
          return timelineSteps[nextIndex];
        });
      }, 3500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/50', hex: '#f43f5e' };
      case 'HIGH':
        return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/50', hex: '#f59e0b' };
      case 'MEDIUM':
        return { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/50', hex: '#f97316' };
      case 'NORMAL':
      default:
        return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/50', hex: '#10b981' };
    }
  };

  const filteredNodes = snapshot?.nodes.filter((n) => {
    if (filterRisk === 'ALL') return true;
    return n.currentRisk === filterRisk || n.projectedRisk === filterRisk;
  }) || [];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Digital Twin Header Banner */}
      <div className="relative rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-5 sm:p-6 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Cpu className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
                    {t.digitalTwin.title}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
                    Live Twin Engine
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  {t.digitalTwin.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                {t.digitalTwin.shortageIndex}
              </span>
              <span className={`text-lg font-black font-mono ${
                (snapshot?.networkShortageIndex || 0) > 40 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {snapshot?.networkShortageIndex || 0}%
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                {t.digitalTwin.resilienceScore}
              </span>
              <span className="text-lg font-black font-mono text-cyan-400">
                {snapshot?.networkResilienceScore || 85}/100
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                {t.digitalTwin.activeCorridors}
              </span>
              <span className="text-lg font-black font-mono text-amber-400">
                {snapshot?.flows.length || 0} In-Transit
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Horizon Summary Pill */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-ping shrink-0" />
            <span className="text-slate-400">Active Horizon State:</span>
            <span className="text-cyan-300 font-semibold">{snapshot?.summary}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">View Mode:</span>
            <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                  viewMode === 'map' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Google Maps
              </button>
              <button
                onClick={() => setViewMode('topology')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                  viewMode === 'topology' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Flow Topology
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                  viewMode === 'split' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Split View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE CONTROL SCRUBBER */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white font-sans">
              {t.digitalTwin.timeline}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Step: <strong className="text-cyan-400">{timelineStep}</strong>
            </span>
          </div>

          {/* Timeline Play / Pause / Reset Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Auto-Scrub</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Simulate Timeline Horizon</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setTimelineStep('TODAY');
              }}
              title="Reset to Today"
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Slider Track */}
        <div className="grid grid-cols-7 gap-2">
          {timelineSteps.map((step) => {
            const isActive = timelineStep === step;
            const isFuture = step.startsWith('T+');
            const isPast = step.startsWith('T-');
            const isToday = step === 'TODAY';

            return (
              <button
                key={step}
                onClick={() => {
                  setIsPlaying(false);
                  setTimelineStep(step);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-b from-cyan-600/30 to-blue-600/40 border-cyan-400 text-white shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-500/50'
                    : isToday
                    ? 'bg-slate-950 border-cyan-500/40 text-cyan-300 hover:bg-slate-800'
                    : isFuture
                    ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-500 hover:bg-slate-900'
                }`}
              >
                <span className={`text-xs font-mono font-black ${isActive ? 'text-white' : isToday ? 'text-cyan-400' : ''}`}>
                  {step}
                </span>
                <span className="text-[10px] text-slate-400 font-sans mt-0.5 truncate max-w-full">
                  {step === 'T-7'
                    ? '7d Ago'
                    : step === 'T-3'
                    ? '3d Ago'
                    : step === 'TODAY'
                    ? 'Current Live'
                    : step === 'T+1'
                    ? '+24h Surge'
                    : step === 'T+3'
                    ? '+72h Peak'
                    : step === 'T+7'
                    ? '+7d Deficit'
                    : '+14d Stable'}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN WORKSPACE: MAP / TOPOLOGY + NODE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Interactive Canvas / Map Area (7 or 8 columns) */}
        <div className={selectedNode ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
            {/* Top Toolbar */}
            <div className="p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Filter Risk:</span>
                <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
                  {['ALL', 'CRITICAL', 'HIGH', 'NORMAL'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setFilterRisk(r)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        filterRisk === r ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Type / View Controls */}
              {viewMode !== 'topology' && (
                <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
                  <button
                    onClick={() => setMapTypeId('roadmap')}
                    className={`px-2 py-1 rounded text-[11px] font-mono ${
                      mapTypeId === 'roadmap' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Roadmap
                  </button>
                  <button
                    onClick={() => setMapTypeId('hybrid')}
                    className={`px-2 py-1 rounded text-[11px] font-mono ${
                      mapTypeId === 'hybrid' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Satellite
                  </button>
                </div>
              )}
            </div>

            {/* View Port: Google Maps Mode */}
            {(viewMode === 'map' || viewMode === 'split') && (
              <div className={`relative w-full ${viewMode === 'split' ? 'h-[360px]' : 'h-[540px]'} bg-slate-950`}>
                <APIProvider apiKey={apiKey} language={language} region="IN">
                  <Map
                    defaultCenter={{ lat: 17.5, lng: 79.5 }}
                    defaultZoom={6}
                    minZoom={4}
                    maxZoom={14}
                    mapId="DIGITAL_TWIN_MAP"
                    mapTypeId={mapTypeId}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <MapCameraHandler targetNode={selectedNode} />

                    {filteredNodes.map((node) => {
                      const isSelected = selectedNode?.phcId === node.phcId;
                      const riskStyle = getRiskColor(node.currentRisk);

                      return (
                        <AdvancedMarker
                          key={node.phcId}
                          position={{ lat: node.lat, lng: node.lng }}
                          title={`${node.name} (${node.district})`}
                          onClick={() => setSelectedNode(node)}
                        >
                          <Pin
                            background={riskStyle.hex}
                            glyphColor="#ffffff"
                            borderColor="#0f172a"
                            scale={isSelected ? 1.4 : 1.0}
                          />
                        </AdvancedMarker>
                      );
                    })}

                    {selectedNode && (
                      <InfoWindow
                        position={{ lat: selectedNode.lat, lng: selectedNode.lng }}
                        onCloseClick={() => setSelectedNode(null)}
                      >
                        <div className="p-2.5 text-slate-900 max-w-xs space-y-2 font-sans">
                          <div className="border-b border-slate-200 pb-1.5">
                            <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase block">
                              {selectedNode.district}, {selectedNode.state}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm leading-tight mt-0.5">
                              {selectedNode.name}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-100 p-1.5 rounded">
                              <span className="text-[10px] text-slate-500 block">Risk (Current)</span>
                              <strong className={selectedNode.currentRisk === 'CRITICAL' ? 'text-rose-600' : 'text-slate-800'}>
                                {selectedNode.currentRisk}
                              </strong>
                            </div>
                            <div className="bg-slate-100 p-1.5 rounded">
                              <span className="text-[10px] text-slate-500 block">Horizon ({timelineStep})</span>
                              <strong className={selectedNode.projectedRisk === 'CRITICAL' ? 'text-rose-600' : 'text-slate-800'}>
                                {selectedNode.projectedRisk}
                              </strong>
                            </div>
                            <div className="bg-slate-100 p-1.5 rounded">
                              <span className="text-[10px] text-slate-500 block">Beds</span>
                              <strong>{selectedNode.bedOccupancy}/{selectedNode.bedCapacity}</strong>
                            </div>
                            <div className="bg-slate-100 p-1.5 rounded">
                              <span className="text-[10px] text-slate-500 block">Staff</span>
                              <strong>{selectedNode.staffAvailable}/{selectedNode.staffTotal}</strong>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedPhcId(selectedNode.phcId);
                              setActiveView('phcDetail');
                            }}
                            className="w-full mt-1 py-1 px-2 rounded bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold text-center transition-colors"
                          >
                            Inspect Facility Telemetry →
                          </button>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              </div>
            )}

            {/* View Port: Flow & Risk Topology SVG Canvas */}
            {(viewMode === 'topology' || viewMode === 'split') && (
              <div className={`relative w-full ${viewMode === 'split' ? 'h-[360px]' : 'h-[540px]'} bg-slate-950 p-4 border-t border-slate-800/80 overflow-hidden flex flex-col justify-between`}>
                {/* SVG Visual Network Topology */}
                <div className="relative flex-1 w-full">
                  <svg className="w-full h-full" viewBox="0 0 800 450">
                    <defs>
                      <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Epicenter Ripple Animation for Critical Surge Zones */}
                    <circle cx="560" cy="240" r="45" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6">
                      <animate attributeName="r" values="30;85;120" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.3;0" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="680" cy="140" r="40" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6">
                      <animate attributeName="r" values="25;70;110" dur="3.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.3;0" dur="3.5s" repeatCount="indefinite" />
                    </circle>

                    {/* Active Resource Corridors (Flow vectors) */}
                    {snapshot?.flows.map((flow, idx) => {
                      // Coordinates mapped schematically across India canvas
                      const coords: Record<string, [number, number]> = {
                        'phc-ap-02': [520, 210], // New GGH Vijayawada
                        'phc-ap-01': [550, 240], // GGH Guntur
                        'phc-ts-02': [460, 160], // Osmania Hyderabad
                        'phc-ts-01': [470, 210], // GGH Mahabubnagar
                        'phc-od-02': [650, 110], // SCB / Capital
                        'phc-od-01': [680, 140], // DHH Puri
                        'phc-mh-02': [280, 190], // Sassoon Pune
                        'phc-mh-01': [240, 180]  // Alibag
                      };

                      const from = coords[flow.fromId] || [300, 200];
                      const to = coords[flow.toId] || [400, 250];

                      return (
                        <g key={flow.id} className="cursor-pointer" onClick={() => setSelectedCorridor(flow)}>
                          {/* Flow Line */}
                          <line
                            x1={from[0]}
                            y1={from[1]}
                            x2={to[0]}
                            y2={to[1]}
                            stroke={flow.status === 'IN_TRANSIT' ? '#38bdf8' : '#64748b'}
                            strokeWidth={flow.status === 'IN_TRANSIT' ? '3' : '1.5'}
                            strokeDasharray={flow.status === 'IN_TRANSIT' ? '6,4' : 'none'}
                          >
                            {flow.status === 'IN_TRANSIT' && (
                              <animate attributeName="stroke-dashoffset" values="20;0" dur="1.2s" repeatCount="indefinite" />
                            )}
                          </line>

                          {/* Center Corridor Label Badge */}
                          <circle
                            cx={(from[0] + to[0]) / 2}
                            cy={(from[1] + to[1]) / 2}
                            r="11"
                            fill="#0f172a"
                            stroke="#0ea5e9"
                            strokeWidth="1.5"
                          />
                          <text
                            x={(from[0] + to[0]) / 2}
                            y={(from[1] + to[1]) / 2 + 3.5}
                            fill="#38bdf8"
                            fontSize="8"
                            fontFamily="monospace"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            #{idx + 1}
                          </text>
                        </g>
                      );
                    })}

                    {/* Nodes positioned topologically */}
                    {snapshot?.nodes.map((node) => {
                      // Schematically map coordinates to 800x400 canvas
                      const x = 150 + ((node.lng - 72) / (86 - 72)) * 550;
                      const y = 380 - ((node.lat - 10) / (21 - 10)) * 320;
                      const isSelected = selectedNode?.phcId === node.phcId;
                      const risk = getRiskColor(node.currentRisk);

                      return (
                        <g
                          key={node.phcId}
                          className="cursor-pointer group"
                          onClick={() => setSelectedNode(node)}
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={isSelected ? 14 : 9}
                            fill={risk.hex}
                            stroke="#0f172a"
                            strokeWidth="2.5"
                            filter={isSelected ? 'url(#glow)' : undefined}
                          />
                          {node.currentRisk === 'CRITICAL' && (
                            <circle
                              cx={x}
                              cy={y}
                              r="16"
                              fill="none"
                              stroke={risk.hex}
                              strokeWidth="1.5"
                              opacity="0.7"
                            >
                              <animate attributeName="r" values="10;22" dur="1.5s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                          )}
                          <text
                            x={x}
                            y={y - 12}
                            fill="#e2e8f0"
                            fontSize="9"
                            fontFamily="sans-serif"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="pointer-events-none drop-shadow-md"
                          >
                            {node.district}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Topology Bottom Legend */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <span>Surge Epicenter (Critical)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>High Vulnerability</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Stable Surplus Node</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Active Transfer Corridors (#1 to #4)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Flow Corridors Strip */}
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>{t.digitalTwin.activeCorridors} ({snapshot?.flows.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Real-time Haversine Routing Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {snapshot?.flows.map((flow) => {
                const isSelected = selectedCorridor?.id === flow.id;
                return (
                  <div
                    key={flow.id}
                    onClick={() => setSelectedCorridor(flow)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-slate-400">
                      <span className="truncate">{flow.fromName.split(',')[0]}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate font-semibold text-slate-200">{flow.toName.split(',')[0]}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300">
                        {flow.quantity} {flow.unit}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          flow.status === 'IN_TRANSIT'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : flow.status === 'DELIVERED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {flow.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      {flow.resourceName} • {flow.corridorDistanceKm}km ({flow.estimatedHours}h)
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Node Inspector (4 Columns) */}
        {selectedNode && (
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-xl">
              {/* Node Title & Badges */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                    {selectedNode.district}, {selectedNode.state}
                  </span>
                  <h3 className="text-base font-bold text-white font-sans mt-0.5">
                    {selectedNode.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {selectedNode.code} • {selectedNode.areaType} / {selectedNode.terrainType}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    selectedNode.currentRisk === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse'
                      : selectedNode.currentRisk === 'HIGH'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {selectedNode.currentRisk}
                </span>
              </div>

              {/* 4 FUNDAMENTAL DIGITAL TWIN STATES */}
              <div className="mt-4 space-y-3.5 text-xs font-sans">
                {/* 1. CURRENT OPERATIONAL STATE */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <h4 className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Activity className="w-3.5 h-3.5" />
                    <span>1. {t.digitalTwin.currentState}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Daily Inflow</span>
                      <strong className="text-sm font-mono text-white">{selectedNode.patientFootfallDaily} pts/day</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Bed Occupancy</span>
                      <strong className="text-sm font-mono text-white">{selectedNode.bedOccupancy}/{selectedNode.bedCapacity}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Available Staff</span>
                      <strong className="text-sm font-mono text-white">{selectedNode.staffAvailable}/{selectedNode.staffTotal}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Weather</span>
                      <strong className="text-sm font-mono text-cyan-300">{selectedNode.weatherCondition} ({selectedNode.rainfallMm}mm)</strong>
                    </div>
                  </div>
                </div>

                {/* 2. PREDICTED STATE (Timeline Connection) */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <h4 className="text-[11px] font-mono font-bold text-blue-300 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>2. {t.digitalTwin.predictedState} ({timelineStep})</span>
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Projected Risk Horizon:</span>
                      <strong
                        className={`font-mono ${
                          selectedNode.projectedRisk === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {selectedNode.projectedRisk}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Surge Epidemic:</span>
                      <span className="font-semibold text-rose-300 truncate max-w-[180px]">
                        {selectedNode.activeSurgeDisease}
                      </span>
                    </div>
                    {nodeForecast && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">ORS Shortage Probability:</span>
                        <strong className="font-mono text-amber-400">{nodeForecast.shortageProbability}%</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. RESOURCE STATE */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <h4 className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>3. {t.digitalTwin.resourceState}</span>
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Critical Stockout Risk:</span>
                      <span
                        className={`font-mono font-bold ${
                          selectedNode.criticalResourceStockoutRisk ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {selectedNode.criticalResourceStockoutRisk ? 'YES (< 48 HOURS)' : 'STABLE BUFFER'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target Replenishment:</span>
                      <span className="font-mono text-cyan-300">600 units via New GGH Vijayawada</span>
                    </div>
                  </div>
                </div>

                {/* 4. RISK & PROPAGATION STATE */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <h4 className="text-[11px] font-mono font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>4. {t.digitalTwin.riskState}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {selectedNode.currentRisk === 'CRITICAL'
                      ? 'EPICENTER: High acute diarrheal inflow compounding with coastal flash flood risk. Mutual-aid corridor active.'
                      : 'BUFFER NODE: Operating within capacity; surplus available for regional distribution to adjacent critical centers.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setSelectedPhcId(selectedNode.phcId);
                    setActiveView('phcDetail');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t.buttons.inspectFacility}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedPhcId(selectedNode.phcId);
                    setActiveView('whatIfSimulator');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Simulate Regional Shock in What-If</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
