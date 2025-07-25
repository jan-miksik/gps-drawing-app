export interface Point {
  lat: number;
  lon: number;
  timestamp: number;
}

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export type GPSSignalQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

export interface GPSPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number | null;
    heading?: number | null;
  };
}

export interface AnonymizationOrigin {
  lat: number;
  lon: number;
} 