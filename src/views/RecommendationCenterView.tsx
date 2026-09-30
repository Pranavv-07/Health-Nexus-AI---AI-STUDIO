import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchRecommendations, approveRecommendation, rejectRecommendation } from '../services/api.ts';
import { Recommendation, UserRole } from '../types.ts';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { ConfidenceIndicator } from '../components/common/ConfidenceIndicator.tsx';
import { Modal } from '../components/common/Modal.tsx';
import {
  ArrowRight,
  CheckCircle,
  CheckSquare,
  Clock,
  HelpCircle,
  MapPin,
  Route,
  ShieldCheck,
  Truck,
  UserCheck,
  XCircle,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RecommendationCenterView: React.FC = () => {
  const { role, refreshSignal, triggerRefresh, showDemoToast, setSelectedPhcId, setActiveView, t } = useApp();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval / Rejection Modal states
  const [activeRecForAction, setActiveRecForAction] = useState<Recommendation | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRecommendations()
      .then((data) => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [refreshSignal]);

  const handleOpenActionModal = (rec: Recommendation, type: 'APPROVE' | 'REJECT') => {
    setActiveRecForAction(rec);
    setActionType(type);
    setActionNotes(
      type === 'APPROVE'
        ? 'Authorized for immediate dispatch via district medical courier network.'
        : 'Sufficient local buffer exists from state central medical store shipment.'
    );
  };

  const handleConfirmAction = async () => {
    if (!activeRecForAction || !actionType) return;
    setProcessing(true);

    try {
      if (actionType === 'APPROVE') {
        await approveRecommendation(
          activeRecForAction.id,
          'Dr. K. V. Sharma (District Health Officer)',
          role,
          actionNotes
        );
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showDemoToast(`🎉 Transfer #${activeRecForAction.id.toUpperCase()} Approved & Recorded to Audit Log!`);
      } else {
        await rejectRecommendation(
          activeRecForAction.id,
          'Dr. K. V. Sharma (District Health Officer)',
          role,
          actionNotes
        );
        showDemoToast(`Transfer #${activeRecForAction.id.toUpperCase()} Rejected with rationale.`);
      }

      setActiveRecForAction(null);
      setActionType(null);
      triggerRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.nav.recommendations}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t.kpi.humanInLoop} — AI proposes optimal transfers; authorized healthcare officers verify and sign.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-amber-300">
            {recommendations.filter((r) => r.status === 'PENDING').length} {t.common.pending}
          </span>
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400">
            {recommendations.filter((r) => r.status === 'APPROVED').length} {t.common.approved}
          </span>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-6">
        {recommendations.map((rec) => {
          const isPending = rec.status === 'PENDING';
          const isApproved = rec.status === 'APPROVED';
          const isRejected = rec.status === 'REJECTED';

          return (
            <div
              key={rec.id}
              className={`rounded-2xl border p-6 transition-all shadow-xl ${
                isPending
                  ? 'border-cyan-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30'
                  : isApproved
                  ? 'border-emerald-500/30 bg-slate-900/80'
                  : 'border-slate-800 bg-slate-950/60 opacity-80'
              }`}
            >
              {/* Top Meta & Status */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
                      RECOMMENDATION #{rec.id.toUpperCase()}
                    </span>
                    <RiskBadge level={rec.riskLevel} size="sm" />
                    <ConfidenceIndicator level={rec.confidence} />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white font-sans mt-1">
                    Redistribute {rec.requiredQuantity} {rec.unit} of {rec.resourceName}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Generated: {new Date(rec.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-amber-300 font-semibold">Requires {rec.requiredApprovalRole} Approval</span>
                  </div>
                </div>

                {/* Status or Action Buttons */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => handleOpenActionModal(rec, 'APPROVE')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Authorize Transfer</span>
                      </button>

                      <button
                        onClick={() => handleOpenActionModal(rec, 'REJECT')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 border border-slate-700 transition-colors font-semibold"
                      >
                        Reject
                      </button>
                    </>
                  ) : isApproved ? (
                    <div className="text-right font-mono">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/40">
                        <CheckCircle className="w-4 h-4" />
                        <span>APPROVED BY {rec.approvedBy?.toUpperCase()}</span>
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Note: "{rec.decisionNotes}" • {new Date(rec.decisionTimestamp || '').toLocaleTimeString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-right font-mono">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-950/80 px-3 py-1.5 rounded-lg border border-rose-500/40">
                        <XCircle className="w-4 h-4" />
                        <span>REJECTED</span>
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">Reason: "{rec.decisionNotes}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Source vs Target Node Logistics Bar */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                {/* Target PHC */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-rose-400 text-[10px] uppercase font-bold block mb-1">
                    Target Deficit Facility (Receiver)
                  </span>
                  <div className="font-bold text-white text-sm font-sans">{rec.targetPhcName}</div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {rec.targetDistrict}, {rec.targetState} • Stockout in {rec.daysUntilShortage}d ({rec.shortageProbability}% risk)
                  </span>
                </div>

                {/* Logistics Corridor */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-center items-center text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Logistics Road Corridor
                  </span>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Truck className="w-4 h-4" />
                    <span>{rec.selectedSource.distanceKm} km (~{rec.selectedSource.estimatedTransitHours} hrs)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    Feasibility Score: {rec.selectedSource.feasibilityScore}/100 ({rec.selectedSource.transferFeasibility})
                  </span>
                </div>

                {/* Source PHC */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-emerald-400 text-[10px] uppercase font-bold block mb-1">
                    Optimal Surplus Provider (Source)
                  </span>
                  <div className="font-bold text-white text-sm font-sans">{rec.selectedSource.sourcePhcName}</div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {rec.selectedSource.sourceDistrict} • Surplus buffer: {rec.selectedSource.surplusAvailable} units (Risk: {rec.selectedSource.sourceRiskLevel})
                  </span>
                </div>
              </div>

              {/* 6-Point Explainable AI Architecture Box (As demanded by section 18) */}
              <div className="mt-5 rounded-xl border border-cyan-500/20 bg-slate-950/90 p-4.5 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-cyan-400 font-bold uppercase text-[11px]">
                  <HelpCircle className="w-4 h-4" />
                  <span>Structured 6-Point AI Clinical Decision Justification:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <strong className="text-cyan-300 uppercase text-[10px] block">1. WHY? (Root Cause)</strong>
                    <p className="mt-0.5 text-slate-300 leading-relaxed">{rec.whyExplanation}</p>
                  </div>

                  <div>
                    <strong className="text-cyan-300 uppercase text-[10px] block">2. WHAT? (Clinical Deficit)</strong>
                    <p className="mt-0.5 text-slate-300 leading-relaxed">{rec.whatExplanation}</p>
                  </div>

                  <div>
                    <strong className="text-cyan-300 uppercase text-[10px] block">3. WHEN? (Timeline)</strong>
                    <p className="mt-0.5 text-amber-300 leading-relaxed font-semibold">{rec.whenExplanation}</p>
                  </div>

                  <div>
                    <strong className="text-cyan-300 uppercase text-[10px] block">4. HOW CERTAIN? (Uncertainty & Data)</strong>
                    <p className="mt-0.5 text-slate-300 leading-relaxed">{rec.certaintyExplanation}</p>
                  </div>

                  <div>
                    <strong className="text-cyan-300 uppercase text-[10px] block">5. SOURCE SELECTION? (Surplus Buffer)</strong>
                    <p className="mt-0.5 text-slate-300 leading-relaxed">{rec.sourceExplanation}</p>
                  </div>

                  <div>
                    <strong className="text-cyan-300 uppercase text-[10px] block">6. WHY THIS SOURCE? (Feasibility & Distance)</strong>
                    <p className="mt-0.5 text-emerald-300 leading-relaxed font-semibold">{rec.whyThisSourceExplanation}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Approve / Reject Modal Dialog */}
      <Modal
        isOpen={!!activeRecForAction}
        onClose={() => setActiveRecForAction(null)}
        title={
          actionType === 'APPROVE'
            ? `Authorize Clinical Resource Transfer #${activeRecForAction?.id.toUpperCase()}`
            : `Reject Recommendation #${activeRecForAction?.id.toUpperCase()}`
        }
        subtitle="This action is permanently recorded in the immutable GovTech Audit Log."
      >
        {activeRecForAction && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Resource:</span>
                <span className="font-bold text-white">{activeRecForAction.requiredQuantity} {activeRecForAction.unit} of {activeRecForAction.resourceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">From (Source):</span>
                <span className="text-emerald-300">{activeRecForAction.selectedSource.sourcePhcName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">To (Target):</span>
                <span className="text-rose-300">{activeRecForAction.targetPhcName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transit Distance:</span>
                <span className="text-cyan-300">{activeRecForAction.selectedSource.distanceKm} km (~{activeRecForAction.selectedSource.estimatedTransitHours} hrs)</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                {actionType === 'APPROVE' ? 'Official Dispatch Authorization Notes:' : 'Reason for Rejection / Deferred Action:'}
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-white font-sans text-xs outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveRecForAction(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmAction}
                disabled={processing}
                className={`px-4 py-2 rounded-lg font-bold text-white shadow-lg transition-all ${
                  actionType === 'APPROVE'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {processing ? 'Processing...' : actionType === 'APPROVE' ? 'Sign & Authorize Transfer' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
