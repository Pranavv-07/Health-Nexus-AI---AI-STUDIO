import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchResources, fetchPhcs } from '../services/api.ts';
import { ResourceCategory, ResourceItem, PHC } from '../types.ts';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import {
  Bed,
  Box,
  Layers,
  Pill,
  Search,
  ShieldAlert,
  Stethoscope,
  Syringe,
  TestTube2,
  TrendingDown,
  Wind
} from 'lucide-react';

export const ResourceIntelligenceView: React.FC = () => {
  const { setSelectedPhcId, setActiveView, refreshSignal, t } = useApp();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchResources(), fetchPhcs()])
      .then(([resList, phcList]) => {
        setResources(resList);
        setPhcs(phcList);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [refreshSignal]);

  const categories: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'ALL', label: 'All Resources', icon: Layers },
    { id: 'medicines', label: 'Medicines & ORS', icon: Pill },
    { id: 'beds', label: 'Inpatient Beds', icon: Bed },
    { id: 'staff', label: 'Medical Staff', icon: Stethoscope },
    { id: 'diagnostics', label: 'Diagnostic Kits', icon: TestTube2 },
    { id: 'emergency', label: 'Emergency & O2', icon: Wind }
  ];

  const filteredResources = resources.filter((r) => {
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (selectedRisk !== 'ALL' && r.riskLevel !== selectedRisk) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const phc = phcs.find((p) => p.id === r.phcId);
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        (phc && phc.name.toLowerCase().includes(q)) ||
        (phc && phc.district.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.nav.resourceIntelligence}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking medicines, inpatient beds, clinical staff, rapid diagnostics, and emergency life support across all nodes
          </p>
        </div>

        {/* Quick Category Tab Strip */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={t.common.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 transition-colors font-mono cursor-pointer"
        >
          <option value="ALL">{t.common.allRisks}</option>
          <option value="CRITICAL">{t.common.critical}</option>
          <option value="HIGH">{t.common.high}</option>
          <option value="NORMAL">{t.common.normal}</option>
        </select>
      </div>

      {/* Resource Table / Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase text-slate-400 font-bold">
              <tr>
                <th className="py-3.5 px-4">{t.table.resource}</th>
                <th className="py-3.5 px-4">{t.table.hospital}</th>
                <th className="py-3.5 px-4">{t.table.stock}</th>
                <th className="py-3.5 px-4">{t.table.projectedDemand}</th>
                <th className="py-3.5 px-4">{t.table.riskLevel}</th>
                <th className="py-3.5 px-4">{t.table.daysLeft}</th>
                <th className="py-3.5 px-4 text-right">{t.table.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredResources.map((res) => {
                const phc = phcs.find((p) => p.id === res.phcId);
                const isCritical = res.riskLevel === 'CRITICAL';
                return (
                  <tr
                    key={res.id}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isCritical ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-sans text-sm">{res.name}</div>
                      <span className="text-[10px] text-slate-500">{res.code} • {res.category}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {phc ? (
                        <div>
                          <span className="font-semibold text-slate-200 block font-sans">{phc.name}</span>
                          <span className="text-[10px] text-cyan-400">{phc.state} • {phc.district}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Unknown PHC</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold text-white">{res.currentStock}</span>{' '}
                      <span className="text-slate-400 text-[10px]">{res.unit}</span>
                      <span className="block text-[10px] text-slate-500">Safety: {res.safetyStockLevel}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold text-rose-300">{res.predictedDemand7d}</span>{' '}
                      <span className="text-slate-400 text-[10px]">{res.unit}</span>
                      <span className="block text-[10px] text-slate-500">
                        Range: {res.predictedRange7d ? `${res.predictedRange7d[0]}-${res.predictedRange7d[1]}` : 'N/A'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-rose-400 text-sm">{res.shortageProbability}%</div>
                      <span className="text-[10px] text-amber-300">
                        {res.daysUntilShortage <= 3 ? `Depletes in ~${res.daysUntilShortage}d` : `${res.daysUntilShortage}d buffer`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge level={res.riskLevel} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          if (phc) {
                            setSelectedPhcId(phc.id);
                            setActiveView('phcDetail');
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-[11px] font-semibold transition-colors"
                      >
                        Forecast & Plan →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
