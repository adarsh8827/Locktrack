export interface ETACalculation {
  estimatedTimeMinutes: number;
  estimatedArrival: Date;
  locksRequired: number;
}

export const calculateETA = (
  distanceKm: number,
  averageSpeedKmh: number = 50
): ETACalculation => {
  const estimatedTimeMinutes = Math.round((distanceKm / averageSpeedKmh) * 60);
  const estimatedArrival = new Date(Date.now() + estimatedTimeMinutes * 60 * 1000);
  
  return {
    estimatedTimeMinutes,
    estimatedArrival,
    locksRequired: 0, // Will be calculated separately
  };
};

export const calculateLocksRequired = (
  numberOfTrips: number,
  safetyBuffer: number = 0.2
): number => {
  const baseRequired = numberOfTrips;
  const withBuffer = Math.ceil(baseRequired * (1 + safetyBuffer));
  return withBuffer;
};

export const formatETA = (estimatedArrival: Date): string => {
  const now = new Date();
  const diff = estimatedArrival.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const getSpeedRecommendation = (
  distanceKm: number,
  targetTimeMinutes: number
): number => {
  const requiredSpeedKmh = (distanceKm / targetTimeMinutes) * 60;
  return Math.round(requiredSpeedKmh);
};