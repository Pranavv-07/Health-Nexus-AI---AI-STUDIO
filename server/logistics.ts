import {
  LogisticsRouteOption,
  LogisticsTransferDetail,
  RoadCondition,
  VehicleType
} from '../src/types.ts';
import { db } from './db.ts';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(10, Math.round(R * c * 1.25));
}

export function simulateLogisticsTransfer(
  originId: string,
  destinationId: string,
  resourceName: string = 'ORS & Rehydration Salts',
  quantity: number = 500,
  vehicleType: VehicleType = 'TEMPERATURE_CONTROLLED_VAN',
  roadCondition: RoadCondition = 'NORMAL'
): LogisticsTransferDetail {
  const origin = db.phcs.find((p) => p.id === originId) || db.phcs[1]; // default Vijayawada
  const dest = db.phcs.find((p) => p.id === destinationId) || db.phcs[0]; // default Guntur

  const baseDistance = calculateDistanceKm(origin.lat, origin.lng, dest.lat, dest.lng);

  // Speed multiplier based on vehicle
  let vehicleSpeedKmh = 50;
  if (vehicleType === 'DRONE') vehicleSpeedKmh = 80;
  if (vehicleType === 'AMBULANCE_4X4') vehicleSpeedKmh = 60;
  if (vehicleType === 'TEMPERATURE_CONTROLLED_VAN') vehicleSpeedKmh = 48;
  if (vehicleType === 'STANDARD_TRUCK') vehicleSpeedKmh = 40;

  // Road condition delay multiplier
  let roadDelayMultiplier = 1.0;
  let roadRisk = 'LOW';
  if (roadCondition === 'HEAVY_RAIN') {
    roadDelayMultiplier = 1.35;
    roadRisk = 'MEDIUM';
  } else if (roadCondition === 'TRAFFIC_CONGESTION') {
    roadDelayMultiplier = 1.5;
    roadRisk = 'MEDIUM';
  } else if (roadCondition === 'FLOODED') {
    roadDelayMultiplier = 2.2;
    roadRisk = 'HIGH';
  } else if (roadCondition === 'ROAD_CLOSED') {
    roadDelayMultiplier = 9.9; // impassable
    roadRisk = 'CRITICAL';
  }

  const baseMinutesA = Math.round((baseDistance / vehicleSpeedKmh) * 60);
  const adjustedMinutesA = Math.round(baseMinutesA * roadDelayMultiplier);

  // Route A (Direct Expressway / Highway Corridor)
  const isPrimaryBlocked = roadCondition === 'ROAD_CLOSED' || roadCondition === 'FLOODED';
  const routeA: LogisticsRouteOption = {
    id: 'route-opt-a',
    name: 'National Highway Corridor (Primary Direct)',
    distanceKm: baseDistance,
    baselineTransitMinutes: baseMinutesA,
    adjustedTransitMinutes: adjustedMinutesA,
    roadCondition,
    feasibilityScore: isPrimaryBlocked ? 25 : roadCondition === 'HEAVY_RAIN' ? 74 : 94,
    riskLevel: isPrimaryBlocked ? 'CRITICAL' : roadCondition === 'HEAVY_RAIN' ? 'MEDIUM' : 'NORMAL',
    checkpoints: [`${origin.cityTown} Gate`, 'Toll Plaza Alpha', 'River Krishna Bridge', `${dest.cityTown} Receiving Hub`],
    isRecommended: !isPrimaryBlocked,
    rationale: !isPrimaryBlocked
      ? 'Primary high-throughput expressway with active emergency siren escort authorization.'
      : 'Primary corridor compromised by inundation or closure; detour required.'
  };

  // Route B (State Highway Bypass Corridor)
  const distB = Math.round(baseDistance * 1.35);
  const baseMinutesB = Math.round((distB / vehicleSpeedKmh) * 60);
  const conditionB: RoadCondition = roadCondition === 'FLOODED' ? 'HEAVY_RAIN' : 'NORMAL';
  const adjustedMinutesB = Math.round(baseMinutesB * (conditionB === 'HEAVY_RAIN' ? 1.25 : 1.0));
  const routeB: LogisticsRouteOption = {
    id: 'route-opt-b',
    name: 'State Highway Bypass (Elevated Ridge Corridor)',
    distanceKm: distB,
    baselineTransitMinutes: baseMinutesB,
    adjustedTransitMinutes: adjustedMinutesB,
    roadCondition: conditionB,
    feasibilityScore: isPrimaryBlocked ? 88 : 78,
    riskLevel: 'LOW',
    checkpoints: [`${origin.cityTown} Ring Road`, 'Elevated Rural Bypass', 'District Perimeter Checkpoint', dest.name],
    isRecommended: isPrimaryBlocked && vehicleType !== 'DRONE',
    rationale: 'Elevated terrain corridor resistant to seasonal flash flooding. Feasible backup route with reliable transit time.'
  };

  // Route C (Inter-District Arterial Link)
  const distC = Math.round(baseDistance * 1.6);
  const baseMinutesC = Math.round((distC / vehicleSpeedKmh) * 60);
  const routeC: LogisticsRouteOption = {
    id: 'route-opt-c',
    name: 'Inter-District Arterial Link (Southern Perimeter)',
    distanceKm: distC,
    baselineTransitMinutes: baseMinutesC,
    adjustedTransitMinutes: baseMinutesC + 15,
    roadCondition: 'NORMAL',
    feasibilityScore: 72,
    riskLevel: 'LOW',
    checkpoints: [`${origin.cityTown} South Link`, 'Interstate Feeder Line', 'Secondary Storage Depot', dest.name],
    isRecommended: false,
    rationale: 'Longer perimeter route; optimal when both primary and secondary corridors experience heavy disruption.'
  };

  const selectedRoute = routeA.isRecommended ? routeA : routeB;
  const alternativeRoutes = [routeA, routeB, routeC].filter((r) => r.id !== selectedRoute.id);

  const deliveryWindowHours = Math.round((selectedRoute.adjustedTransitMinutes / 60) * 10) / 10 + 0.5;

  return {
    id: `log-xfer-${Date.now()}`,
    originPhcId: origin.id,
    originName: origin.name,
    originDistrict: origin.district,
    destinationPhcId: dest.id,
    destinationName: dest.name,
    destinationDistrict: dest.district,
    resourceName,
    quantity,
    unit: 'units',
    urgency: dest.overallRisk,
    vehicleType,
    selectedRoute,
    alternativeRoutes,
    deliveryWindowHours,
    coldChainCompliant: vehicleType === 'TEMPERATURE_CONTROLLED_VAN' || vehicleType === 'DRONE',
    transitStatus: 'READY'
  };
}
