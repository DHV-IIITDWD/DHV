/**
 * Canonical names used to join NIRF state values to India GeoJSON regions.
 * The boundary file is sourced from DataMeet via GeoDataViewer.
 */
export const INDIA_REGIONS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
] as const;

export type IndiaRegion = typeof INDIA_REGIONS[number];

const key = (value: string): string => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const lookup = new Map<string, IndiaRegion>(
  INDIA_REGIONS.map(region => [key(region), region] as const)
);

const aliases: Record<string, IndiaRegion> = {
  'orissa': 'Odisha',
  'uttaranchal': 'Uttarakhand',
  'pondicherry': 'Puducherry',
  'nct of delhi': 'Delhi',
  'national capital territory of delhi': 'Delhi',
  'jammu kashmir': 'Jammu and Kashmir',
  'j and k': 'Jammu and Kashmir',
  'andaman nicobar islands': 'Andaman and Nicobar Islands',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu'
};

/** Return a canonical state/UT name, or an empty string for unknown values. */
export function normalizeIndiaStateName(value: string): string {
  const normalized = key(String(value ?? ''));
  if (!normalized || normalized === 'unknown' || normalized === 'na' || normalized === 'n a') {
    return '';
  }
  return aliases[normalized] ?? lookup.get(normalized) ?? '';
}


/**
 * Normalize a GeoJSON FeatureCollection for Apache ECharts.
 * Repeated features for islands/disconnected pieces are merged into one
 * MultiPolygon per canonical state/UT name.
 */
export function normalizeIndiaGeoJson(source: any): any {
  if (source?.type !== 'FeatureCollection' || !Array.isArray(source.features) || source.features.length === 0) {
    throw new Error('Invalid India GeoJSON FeatureCollection.');
  }

  const regions = new Map<string, { properties: Record<string, any>; coordinates: any[] }>();

  for (const feature of source.features) {
    const properties = feature?.properties ?? {};
    const rawName = properties.shapeName
      ?? properties.ST_NM
      ?? properties.NAME_1
      ?? properties.name
      ?? properties.NAME
      ?? properties.State_Name;
    const name = normalizeIndiaStateName(String(rawName ?? ''));
    if (!name) continue;

    const geometry = feature?.geometry;
    if (!geometry?.coordinates) continue;
    const polygons = geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : [];
    if (!polygons.length) continue;

    const current: { properties: Record<string, any>; coordinates: any[] } =
      regions.get(name) ?? { properties: { ...properties, name }, coordinates: [] };
    current.coordinates.push(...polygons);
    regions.set(name, current);
  }

  if (regions.size < 25) {
    throw new Error(`Only ${regions.size} named India regions were found in the GeoJSON; expected a state/UT boundary layer.`);
  }

  return {
    type: 'FeatureCollection',
    features: [...regions.entries()].map(([name, region]) => ({
      type: 'Feature',
      properties: { ...region.properties, name },
      geometry: { type: 'MultiPolygon', coordinates: region.coordinates }
    }))
  };
}
