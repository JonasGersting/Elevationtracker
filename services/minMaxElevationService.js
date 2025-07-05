const NM_TO_METER = 1852;

function generateGridPoints(stepsPerSide, radius, step, earthRadius, CenterLat, CenterLng, center) {
  const points = [];
  for (let i = 0; i <= stepsPerSide; i++) {
    for (let j = 0; j <= stepsPerSide; j++) {
      const dx = -radius + i * step;
      const dy = -radius + j * step;
      const latOffset = (dy / earthRadius) * (180 / Math.PI);
      const lngOffset = (dx / earthRadius) * (180 / Math.PI) / Math.cos(CenterLat * Math.PI / 180);
      const lat = CenterLat + latOffset;
      const lng = CenterLng + lngOffset;
      const p = { lat, lng };
      if (haversineDistance(center, p) <= radius) {
        points.push(p);
      }
    }
  }
  return points;
}

function generatePoints(CenterLat, CenterLng, radiusNM, step) {
  const radius = radiusNM * NM_TO_METER;
  const earthRadius = 6371000;
  const center = { lat: CenterLat, lng: CenterLng };
  const stepsPerSide = Math.ceil((2 * radius) / step);
  return generateGridPoints(stepsPerSide, radius, step, earthRadius, CenterLat, CenterLng, center);
}


function haversineDistance(p1, p2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lng - p1.lng);
  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function chunkArray(arr, size = 100) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function fetchElevationsAndFindMinMax(points) {
  const chunks = chunkArray(points, 100);
  const results = await fetchAllChunks(chunks);
  if (!results.length) throw new Error("Keine Elevationsdaten");
  const { minPoint, maxPoint } = findMinMax(results);
  return formatResult(minPoint, maxPoint);
}

async function fetchAllChunks(chunks) {
  const results = [];
  for (let i = 0; i < chunks.length; i++) {
    if (i && i % 6 === 0) await delay(3000);
    const data = await fetchChunk(chunks[i]);
    if (validData(data, chunks[i])) {
      results.push(...mapResults(chunks[i], data.elevation));
    } else {
      console.warn("Fehlerhafte Daten:", chunks[i]);
    }
  }
  return results;
}

const delay = ms => new Promise(r => setTimeout(r, ms));

const fetchChunk = async chunk => {
  const lat = chunk.map(p => p.lat.toFixed(6)).join(",");
  const lng = chunk.map(p => p.lng.toFixed(6)).join(",");
  const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`;
  return fetch(url).then(r => r.json());
};

const validData = (data, chunk) =>
  data?.elevation?.length === chunk.length;

const mapResults = (chunk, elevations) =>
  chunk.map((p, i) => ({ lat: p.lat, lng: p.lng, elevation: elevations[i] }));

const findMinMax = arr =>
  arr.reduce((a, p) => {
    if (p.elevation < a.minPoint.elevation) a.minPoint = p;
    if (p.elevation > a.maxPoint.elevation) a.maxPoint = p;
    return a;
  }, { minPoint: arr[0], maxPoint: arr[0] });

const formatResult = (min, max) => ({
  minElevation: toFeet(min.elevation),
  minCoord: { lat: min.lat, lng: min.lng },
  maxElevation: toFeet(max.elevation),
  maxCoord: { lat: max.lat, lng: max.lng }
});

const toFeet = m => (m * 3.28084).toFixed(2);

