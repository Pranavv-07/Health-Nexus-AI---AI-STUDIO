import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchPhcs } from '../services/api.ts';
import { PHC, RiskLevel } from '../types.ts';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { DataReliabilityBadge } from '../components/common/DataReliabilityBadge.tsx';
import { IndiaPhcMap } from '../components/map/IndiaPhcMap.tsx';
import {
  Activity,
  Bed,
  Building2,
  ChevronRight,
  Eye,
  Filter,
  Grid,
  Hospital,
  Map,
  MapPin,
  Phone,
  Search,
  User,
  Users,
  Wind
} from 'lucide-react';

export const PhcNetworkView: React.FC = () => {
  const { setSelectedPhcId, setActiveView, refreshSignal, t } = useApp();
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [viewLayout, setViewLayout] = useState<'cards' | 'map' | 'split'>('cards');

  useEffect(() => {
    fetchPhcs()
      .then((data) => {
        setPhcs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [refreshSignal]);

  const states = Array.from(new Set(phcs.map((p) => p.state)));

  const filteredPhcs = phcs.filter((p) => {
    if (selectedState !== 'ALL' && p.state !== selectedState) return false;
    if (selectedRisk !== 'ALL' && p.overallRisk !== selectedRisk) return false;
    if (selectedArea !== 'ALL' && p.areaType !== selectedArea) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.cityTown.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.dominantDiseaseTrend.disease.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectPhc = (phc: PHC) => {
    setSelectedPhcId(phc.id);
    setActiveView('phcDetail');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-mono text-slate-400">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.nav.phcNetwork}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitoring {phcs.length} tertiary & district medical centers across {states.length} states
          </p>
        </div>

        {/* Layout Switcher (Cards / Map / Split) & Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewLayout('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewLayout === 'cards'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewLayout('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewLayout === 'map'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => setViewLayout('split')}
              className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewLayout === 'split'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold">
              {phcs.filter((p) => p.overallRisk === 'CRITICAL').length} {t.common.critical}
            </span>
            <span className="px-2 py-1 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
              {phcs.filter((p) => p.overallRisk === 'HIGH').length} {t.common.high}
            </span>
            <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
              {phcs.filter((p) => p.overallRisk === 'NORMAL').length} {t.common.normal}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={t.common.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* State Filter */}
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 transition-colors cursor-pointer font-mono"
        >
          <option value="ALL">{t.common.allStates} ({states.length})</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Risk Filter */}
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 transition-colors cursor-pointer font-mono"
        >
          <option value="ALL">{t.common.allRisks}</option>
          <option value="CRITICAL">{t.common.critical}</option>
          <option value="HIGH">{t.common.high}</option>
          <option value="MEDIUM">{t.common.medium}</option>
          <option value="NORMAL">{t.common.normal}</option>
        </select>

        {/* Area Filter */}
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 transition-colors cursor-pointer font-mono"
        >
          <option value="ALL">All Areas (Urban/Rural/Tribal)</option>
          <option value="Urban">Urban</option>
          <option value="Rural">Rural</option>
          <option value="Tribal">Tribal</option>
        </select>
      </div>

      {/* Main View Area */}
      {viewLayout === 'map' && (
        <IndiaPhcMap phcs={filteredPhcs} onSelectPhc={handleSelectPhc} />
      )}

      {viewLayout === 'split' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7">
            <IndiaPhcMap phcs={filteredPhcs} onSelectPhc={handleSelectPhc} />
          </div>
          <div className="xl:col-span-5 space-y-3 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredPhcs.map((phc) => (
              <div
                key={phc.id}
                onClick={() => handleSelectPhc(phc)}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                      {phc.district}, {phc.state}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-0.5">{phc.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{phc.cityTown}</p>
                  </div>
                  <RiskBadge level={phc.overallRisk} size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono text-slate-300">
                  <div className="bg-slate-950/60 p-1.5 rounded">
                    Beds: <strong>{phc.bedOccupancy}/{phc.bedCapacity}</strong>
                  </div>
                  <div className="bg-slate-950/60 p-1.5 rounded">
                    Footfall: <strong>{phc.patientFootfallDaily}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewLayout === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPhcs.map((phc) => (
            <div
              key={phc.id}
              className="group rounded-xl border border-slate-800 bg-slate-900/80 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-200 p-4.5 flex flex-col justify-between shadow-lg"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {phc.state} • {phc.district}
                    </span>
                    <h3 className="font-bold text-white text-base mt-0.5 leading-snug group-hover:text-cyan-300 transition-colors">
                      {phc.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      {phc.code} | {phc.cityTown}
                    </p>
                  </div>
                  <RiskBadge level={phc.overallRisk} size="sm" pulse />
                </div>

                {/* Key Resource Gauges */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">{t.map.footfall}</span>
                    <span className="font-bold text-white text-sm">
                      {phc.patientFootfallDaily}{' '}
                      <span className="text-[10px] text-rose-400">+{phc.patientFootfallTrend}%</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">{t.map.occupancy}</span>
                    <span className="font-bold text-white text-sm">
                      {phc.bedOccupancy}/{phc.bedCapacity}{' '}
                      <span className="text-[10px] text-slate-400">
                        ({Math.round((phc.bedOccupancy / phc.bedCapacity) * 100)}%)
                      </span>
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">{t.kpi.staffPresence}</span>
                    <span className="font-bold text-white text-sm">
                      {phc.staffAvailable}/{phc.staffTotal}
                    </span>
                  </div>
                </div>

                {/* Superintendent & Contact */}
                <div className="mt-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono text-slate-300 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-200 font-medium truncate">
                    <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{phc.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{phc.phone}</span>
                  </div>
                </div>

                {/* Context Intelligence Pills */}
                <div className="mt-3 space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      {t.map.weather}: {phc.weather.condition} ({phc.weather.rainfallMm}mm)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate text-rose-300">
                      {t.map.outbreak}: {phc.dominantDiseaseTrend.disease}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <DataReliabilityBadge
                  score={phc.dataReliabilityScore}
                  status={phc.dataReliabilityStatus}
                  freshnessMinutes={phc.dataFreshnessMinutes}
                  compact
                />

                <button
                  onClick={() => handleSelectPhc(phc)}
                  className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                >
                  <span>{t.common.viewDetails}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
