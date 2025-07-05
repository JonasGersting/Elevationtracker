const NM_TO_METER = 1852;

// Radius in NM → Meter umrechnen und Punkte generieren
function generatePoints(CenterLat, CenterLng, radiusNM, step) {
  const radius = radiusNM * NM_TO_METER;
  const earthRadius = 6371000;
  const points = [];
  const center = { lat: CenterLat, lng: CenterLng };

  const stepsPerSide = Math.ceil((2 * radius) / step);

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

// Haversine-Distanz in Meter
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

// Array in Päckchen (≤100) teilen
function chunkArray(arr, size = 100) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// Elevations von der API abfragen & min/max finden
async function fetchElevationsAndFindMinMax(points) {
  const apiBase = "https://api.open-meteo.com/v1/elevation";
  const chunks = chunkArray(points, 100);

  const allResults = []; // { lat, lng, elevation }
  let chunkCounter = 0;

  for (const chunk of chunks) {
    if (chunkCounter > 0 && chunkCounter % 6 === 0) {
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const lats = chunk.map(p => p.lat.toFixed(6)).join(",");
    const lngs = chunk.map(p => p.lng.toFixed(6)).join(",");
    const url = `${apiBase}?latitude=${lats}&longitude=${lngs}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data && data.elevation && data.elevation.length === chunk.length) {
      for (let i = 0; i < chunk.length; i++) {
        allResults.push({
          lat: chunk[i].lat,
          lng: chunk[i].lng,
          elevation: data.elevation[i]
        });
      }
    } else {
      console.warn("Keine oder fehlerhafte Elevationsdaten für Chunk:", chunk);
    }
    chunkCounter++;
  }

  if (allResults.length === 0) {
    throw new Error("Keine Elevationsdaten erhalten");
  }

  let minPoint = allResults[0];
  let maxPoint = allResults[0];

  for (const pt of allResults) {
    if (pt.elevation < minPoint.elevation) minPoint = pt;
    if (pt.elevation > maxPoint.elevation) maxPoint = pt;
  }

  return {
    minElevation: (minPoint.elevation * 3.28084).toFixed(2),
    minCoord: { lat: minPoint.lat, lng: minPoint.lng },
    maxElevation: (maxPoint.elevation * 3.28084).toFixed(2),
    maxCoord: { lat: maxPoint.lat, lng: maxPoint.lng }
  };
}
