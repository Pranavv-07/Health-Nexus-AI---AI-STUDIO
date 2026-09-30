// Source: Google Maps Platform Code Assist
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchPhcById, fetchForecast, generateRedistributionRecommendation } from '../services/api.ts';
import { PHC, ResourceItem, Alert, Recommendation, ResourceForecast } from '../types.ts';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { DataReliabilityBadge } from '../components/common/DataReliabilityBadge.tsx';
import { ConfidenceIndicator } from '../components/common/ConfidenceIndicator.tsx';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bed,
  Box,
  BrainCircuit,
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  Droplet,
  ExternalLink,
  Flame,
  Hospital,
  MapPin,
  Phone,
  Radio,
  Share2,
  TrendingDown,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Wind
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export const PhcDetailView: React.FC = () => {
  const { selectedPhcId, setSelectedPhcId, setActiveView, showDemoToast, triggerRefresh, t, language } = useApp();
  const [phcData, setPhcData] = useState<{ phc: PHC; resources: ResourceItem[]; alerts: Alert[]; recommendations: Recommendation[] } | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [forecast, setForecast] = useState<ResourceForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingRec, setGeneratingRec] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDxq0yDBWnTP56ZtIf1G7XB-elIrSnPQZ0';

  useEffect(() => {
    if (!selectedPhcId) return;
    setLoading(true);
    fetchPhcById(selectedPhcId)
      .then((data) => {
        setPhcData(data);
        if (data.resources.length > 0) {
          const firstRes = data.resources.find((r) => r.riskLevel === 'CRITICAL') || data.resources[0];
          setSelectedResourceId(firstRes.id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedPhcId]);

  useEffect(() => {
    if (selectedPhcId && selectedResourceId) {
      fetchForecast(selectedPhcId, selectedResourceId)
        .then((f) => setForecast(f))
        .catch((e) => console.error(e));
    }
  }, [selectedPhcId, selectedResourceId]);

  const handleLaunchRedistribution = async () => {
    if (!selectedPhcId || !selectedResourceId) return;
    setGeneratingRec(true);
    try {
      await generateRedistributionRecommendation(selectedPhcId, selectedResourceId);
      showDemoToast('✨ Explainable AI Redistribution Recommendation Generated!');
      triggerRefresh();
      setActiveView('recommendations');
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingRec(false);
    }
  };

  if (loading || !phcData) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const { phc, resources, alerts, recommendations } = phcData;
  const activeResource = resources.find((r) => r.id === selectedResourceId) || resources[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Button & Top Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('phcNetwork')}
          className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.buttons.back}</span>
        </button>

        <div className="flex items-center gap-2">
          <RiskBadge level={phc.overallRisk} size="lg" pulse />
          <DataReliabilityBadge
            score={phc.dataReliabilityScore}
            status={phc.dataReliabilityStatus}
            freshnessMinutes={phc.dataFreshnessMinutes}
          />
        </div>
      </div>

      {/* Facility Header Card & Exact Google Maps Pin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Information */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase font-bold">
              <span>{phc.state}</span>
              <span>•</span>
              <span>{phc.district} District</span>
              <span>•</span>
              <span>{phc.cityTown}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
              {phc.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Code: {phc.code} | Population: <strong>{phc.populationServed.toLocaleString()}</strong> | Area: <strong>{phc.areaType} ({phc.terrainType})</strong> {phc.isDisasterProne && '• ⚠ Flood/Cyclone Prone Zone'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs font-mono">
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase">{t.map.contactSuperintendent}</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">{phc.contactPerson}</span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase">Direct Emergency Phone</span>
              <span className="font-semibold text-cyan-300 mt-0.5 block">{phc.phone}</span>
            </div>
          </div>

          {/* Live Context Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs font-mono">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] uppercase block">{t.map.weather}</span>
              <span className="font-bold text-slate-200 flex items-center gap-1 mt-1 text-xs">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                {phc.weather.condition} ({phc.weather.rainfallMm}mm)
              </span>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] uppercase block">{t.map.outbreak}</span>
              <span className="font-bold text-rose-300 flex items-center gap-1 mt-1 text-xs truncate">
                <Activity className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                +{phc.dominantDiseaseTrend.weeklySurgePercent}%
              </span>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] uppercase block">{t.map.footfall}</span>
              <span className="font-bold text-white flex items-center gap-1 mt-1 text-xs">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                {phc.patientFootfallDaily} ({phc.patientFootfallTrend > 0 ? `+${phc.patientFootfallTrend}%` : `${phc.patientFootfallTrend}%`})
              </span>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] uppercase block">{t.map.occupancy}</span>
              <span className="font-bold text-amber-300 flex items-center gap-1 mt-1 text-xs">
                <Bed className="w-3.5 h-3.5 text-amber-400" />
                {phc.bedOccupancy}/{phc.bedCapacity}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Hospital Exact Google Maps Location */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-3 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hospital Location Map</span>
            </span>
            <span className="text-slate-500 text-[10px]">
              {phc.lat.toFixed(4)}, {phc.lng.toFixed(4)}
            </span>
          </div>

          <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative">
            <APIProvider apiKey={apiKey} language={language} region="IN">
              <Map
                defaultCenter={{ lat: phc.lat, lng: phc.lng }}
                defaultZoom={12}
                mapId="DEMO_MAP_ID"
                disableDefaultUI={true}
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                <AdvancedMarker position={{ lat: phc.lat, lng: phc.lng }} title={phc.name}>
                  <Pin
                    background="#06b6d4"
                    glyphColor="#ffffff"
                    borderColor="#0e7490"
                    scale={1.2}
                  />
                </AdvancedMarker>
              </Map>
            </APIProvider>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span className="truncate">{phc.cityTown}</span>
            <span className="text-cyan-400 font-semibold">{phc.district}</span>
          </div>
        </div>
      </div>

      {/* Multi-Resource Selection Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Box className="w-4 h-4 text-cyan-400" />
            <span>Monitored Hospital Inventory & Stocks</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Select a critical resource to view 14-day projection
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {resources.map((res) => {
            const isSelected = selectedResourceId === res.id;
            return (
              <button
                key={res.id}
                onClick={() => setSelectedResourceId(res.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    {res.category}
                  </span>
                  <RiskBadge level={res.riskLevel} size="sm" />
                </div>
                <h4 className="font-bold text-white text-xs mt-1 truncate">{res.name}</h4>
                <div className="mt-2 flex items-baseline justify-between text-xs font-mono">
                  <span className="font-bold text-slate-200">
                    {res.currentStock} {res.unit}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      res.daysUntilShortage <= 2
                        ? 'text-rose-400'
                        : res.daysUntilShortage <= 5
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {res.daysUntilShortage}d
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Resource Predictive Intelligence Box */}
      {forecast && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  14-Day Adaptive Ensemble Forecast: {forecast.resourceName}
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Dynamic ensemble weights: Tree Model ({(forecast.ensembleWeights.treeBased * 100).toFixed(0)}%) + Contextual Surge ({(forecast.ensembleWeights.contextual * 100).toFixed(0)}%) + Baseline ({(forecast.ensembleWeights.timeSeries * 100).toFixed(0)}%)
              </p>
            </div>

            <button
              onClick={handleLaunchRedistribution}
              disabled={generatingRec}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/60 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{generatingRec ? 'Computing Match...' : 'Generate Mutual-Aid Transfer'}</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">Current Stock</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {forecast.currentStock} {activeResource?.unit}
              </span>
              <span className="text-[10px] text-slate-500">Safety Buffer: {forecast.safetyLevel}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">7-Day Projected Demand</span>
              <span className="text-xl font-bold text-rose-400 mt-1 block">
                {forecast.predictedDemandTotal} {activeResource?.unit}
              </span>
              <span className="text-[10px] text-slate-500">Peak Surge: Day 4</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">Ensemble Confidence</span>
              <div className="mt-1 flex items-center gap-2">
                <ConfidenceIndicator level={forecast.confidenceLevel} />
                <span className="font-bold text-white text-sm">{forecast.confidenceLevel}</span>
              </div>
              <span className="text-[10px] text-slate-500">Telemetry Verified</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">{t.table.daysLeft}</span>
              <span className="text-xl font-bold text-amber-300 mt-1 block">~{forecast.daysUntilShortage} Days</span>
              <span className="text-[10px] text-rose-400 font-semibold">{forecast.daysUntilShortage <= 2 ? '⚠ Critical Stockout Risk' : 'Buffer Adequate'}</span>
            </div>
          </div>

          {/* Recharts Forecast Curves */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast.points} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="stockFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <ReferenceLine y={forecast.safetyLevel} label="Safety Threshold" stroke="#eab308" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="predictedDemand" name="Ensemble Daily Demand" stroke="#f43f5e" fillOpacity={1} fill="url(#demandFill)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="projectedStockRemaining" name="Projected Stock Balance" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="treeModelForecast" name="Tree Model" stroke="#a855f7" strokeWidth={1} strokeDasharray="2 2" />
                <Line type="monotone" dataKey="contextualModelForecast" name="Context Model" stroke="#10b981" strokeWidth={1} strokeDasharray="2 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key Drivers Explanation */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
            <span className="font-bold text-cyan-400 block uppercase tracking-wider text-[11px]">
              AI Forecast Explainability & Key Drivers:
            </span>
            {forecast.keyDrivers.map((driver, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{driver}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
