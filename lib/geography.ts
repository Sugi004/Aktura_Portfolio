export type GeographicCoordinate = { lat: number; lon: number };
export type CartesianCoordinate = { x: number; y: number; z: number };

const radians = (degrees: number) => degrees * Math.PI / 180;

/**
 * Converts WGS84-style latitude/longitude to this globe's Three.js local space.
 * North is +Y, 0° longitude faces +X, and positive/east longitude turns toward -Z
 * to match SphereGeometry's equirectangular texture UV orientation.
 */
export function geographicToCartesian({ lat, lon }: GeographicCoordinate, radius = 1): CartesianCoordinate {
  const latitude = radians(lat);
  const longitude = radians(lon);
  const ring = Math.cos(latitude) * radius;
  return {
    x: ring * Math.cos(longitude),
    y: radius * Math.sin(latitude),
    z: -ring * Math.sin(longitude),
  };
}

/** Rotate the globe so the requested longitude faces the camera at +Z. */
export function headingForLongitude(lon: number) {
  return radians(-90 - lon);
}
