let navAids;
let aerodromes;
let obstacles;
let aipInfo;
let ctrInfo;
let eddInfo;
let edrInfo;
let tmzInfo;
let rmzInfo;
let pjeInfo;
let polygonIsBroughtUpToFront = false;
let isCursorOverPolygon = false;
let markers = [];
let polylines = [];
let initialMarkerLat = null;
let initialMarkerLon = null;
let distanceMeasurements = [];
let activeMeasurement = null;

function checkCursorOverPolygon() {
    polygonIsBroughtUpToFront = !!isCursorOverPolygon;
}

document.addEventListener('mousemove', () => {
    checkCursorOverPolygon();
});

const customIcon = L.icon({
    iconUrl: './img/mapPin.png',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
});

function bindMarkerPopupWithElevation(marker, lat, lng) {
    getElevation(lat, lng).then(elevation => {
        const popupContent = `<b>Höhe:</b> ${elevation}FT<br>
            <button class="navAidBtn marginTop16" onclick="findClosestNavAid(${lat},${lng})">NAV-AID</button>
            <button class="navAidBtn marginTop16" onclick="startDistanceMeasurement(${lat},${lng})">DIST</button>`;
        marker.bindPopup(popupContent).openPopup();
    });
}

function createMarker(lat, lng) {
    initialMarkerLat = lat;
    initialMarkerLon = lng;
    if (typeof markerData !== 'undefined' && markerData.navaid && !markerData.navaid.added) {
        toggleMarkers('navaid');
    }
    const markerInstance = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    markers.push(markerInstance);
    map.setView([lat, lng], Math.min(map.getZoom() + 2, map.getMaxZoom()));
    bindMarkerPopupWithElevation(markerInstance, lat, lng);
}

function startDistanceMeasurement(lat, lng) {
    if (activeMeasurement) return;
    const startPoint = [lat, lng];
    activeMeasurement = {
        id: Date.now(),
        startPoint: startPoint,
        line: L.polyline([startPoint, startPoint], { color: 'red', weight: 2, dashArray: '5, 10' }).addTo(map),
        label: createDistanceLabelNavAid()
    };
    map.on('mousemove', updateActiveDistanceLine);
    map.once('click', finishDistanceMeasurement);
    modifyNavaidMarkersForMeasurement(true);
}

function createDistanceLabelNavAid() {
    const label = L.DomUtil.create('div', 'distance-label');
    document.getElementById('map').appendChild(label);
    return label;
}

function updateActiveDistanceLine(e) {
    if (!activeMeasurement) return;
    const endPoint = [e.latlng.lat, e.latlng.lng];
    activeMeasurement.line.setLatLngs([activeMeasurement.startPoint, endPoint]);
    const distance = calculateDistanceNavAid(activeMeasurement.startPoint[0], activeMeasurement.startPoint[1], endPoint[0], endPoint[1]);
    updateDistanceLabel(activeMeasurement, distance, endPoint);
}

function calculateDistanceNavAid(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * (Math.PI / 180);
    const R = 3440; // Nautical miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function updateDistanceLabel(measurement, distance, endPoint) {
    if (!measurement || !measurement.label) return;
    const midPoint = [(measurement.startPoint[0] + endPoint[0]) / 2, (measurement.startPoint[1] + endPoint[1]) / 2];
    const point = map.latLngToContainerPoint(midPoint);
    measurement.label.style.left = (point.x - 30) + 'px';
    measurement.label.style.top = (point.y - 10) + 'px';
    measurement.label.textContent = `${distance.toFixed(1)} NM`;
}

function determineFinalEndpoint(event) {
    const clickTarget = event.target;
    const clickLatLng = event.latlng;
    if (clickTarget instanceof L.Marker) {
        return [clickTarget.getLatLng().lat, clickTarget.getLatLng().lng];
    }
    return [clickLatLng.lat, clickLatLng.lng];
}

function updateFinishedDistanceLineAndLabel(measurement, finalEndPoint) {
    measurement.line.setLatLngs([measurement.startPoint, finalEndPoint]);
    const distance = calculateDistanceNavAid(measurement.startPoint[0], measurement.startPoint[1], finalEndPoint[0], finalEndPoint[1]);
    updateDistanceLabel(measurement, distance, finalEndPoint);
}

function addMoveListenerToMeasurement(measurement) {
    const moveListener = () => {
        const latLngs = measurement.line.getLatLngs();
        if (!latLngs || latLngs.length < 2) return;
        const mid = [(latLngs[0].lat + latLngs[1].lat) / 2, (latLngs[0].lng + latLngs[1].lng) / 2];
        const newPoint = map.latLngToContainerPoint(mid);
        measurement.label.style.left = (newPoint.x - 30) + 'px';
        measurement.label.style.top = (newPoint.y - 10) + 'px';
    };
    map.on('move', moveListener);
    measurement.moveListener = moveListener;
}

function finishDistanceMeasurement(e) {
    if (!activeMeasurement) return;
    const measurementToFinish = activeMeasurement;
    const finalEndPoint = determineFinalEndpoint(e);
    updateFinishedDistanceLineAndLabel(measurementToFinish, finalEndPoint);
    map.off('mousemove', updateActiveDistanceLine);
    addMoveListenerToMeasurement(measurementToFinish);
    distanceMeasurements.push(measurementToFinish);
    modifyNavaidMarkersForMeasurement(false);
    activeMeasurement = null;
}

function enableNavaidMarkerForMeasurement(navaidMarker) {
    navaidMarker._originalPopup = navaidMarker.getPopup();
    navaidMarker.unbindPopup();
    navaidMarker.on('click', finishDistanceMeasurement);
}

function disableNavaidMarkerForMeasurement(navaidMarker) {
    navaidMarker.off('click', finishDistanceMeasurement);
    if (navaidMarker._originalPopup) {
        navaidMarker.bindPopup(navaidMarker._originalPopup);
        delete navaidMarker._originalPopup;
    }
}

function modifyNavaidMarkersForMeasurement(isStartingMeasurement) {
    if (typeof markerData === 'undefined' || !markerData.navaid || !markerData.navaid.markers) return;
    markerData.navaid.markers.forEach(navaid => {
        if (!navaid.marker) return;
        if (isStartingMeasurement) {
            enableNavaidMarkerForMeasurement(navaid.marker);
        } else {
            disableNavaidMarkerForMeasurement(navaid.marker);
        }
    });
}

function clearActiveDistanceMeasurementState() {
    if (!activeMeasurement) return;
    map.off('mousemove', updateActiveDistanceLine);
    map.off('click', finishDistanceMeasurement);
    if (activeMeasurement.line) activeMeasurement.line.remove();
    if (activeMeasurement.label) activeMeasurement.label.remove();
    activeMeasurement = null;
    modifyNavaidMarkersForMeasurement(false);
}

function clearSavedDistanceMeasurementsState() {
    distanceMeasurements.forEach(measurement => {
        if (measurement.line) measurement.line.remove();
        if (measurement.label) measurement.label.remove();
        if (measurement.moveListener) map.off('move', measurement.moveListener);
    });
    distanceMeasurements = [];
}

function clearAllDistanceMeasurements() {
    clearActiveDistanceMeasurementState();
    clearSavedDistanceMeasurementsState();
}

let closestNavAid = null;
let foundNavAids = [];
let foundNavaidId = 0;
let currentSequenceFoundNavAidNames = [];

function validateNavAidDataForSearch() {
    if (!navAids || navAids.length === 0) {
        console.error("NavAids-Daten sind nicht verfügbar oder leer.");
        alert("Navigationshilfen-Daten nicht geladen.");
        return false;
    }
    return true;
}

function isNavAidAlreadyFoundInSequence(navaidName) {
    return currentSequenceFoundNavAidNames.includes(navaidName);
}

function checkNavAidFilterCriteria(navaidProperties) {
    const charted = navaidProperties.charted;
    const dmeCharted = navaidProperties.dme_charted;
    const icaoCode = navaidProperties.icaocode;
    const isIcao500 = (charted && charted.includes('ICAO500')) || (dmeCharted && (dmeCharted.includes('ICAO500') || dmeCharted.includes('NN')));
    const isGerman = (icaoCode === 'ED' || icaoCode === 'ET');
    return isIcao500 && isGerman;
}

function processFoundClosestNavAid(data, latLng, markerLat, markerLon, distance) {
    currentSequenceFoundNavAidNames.push(data.properties.txtname);
    const angle = calculateAngle(latLng[0], latLng[1], markerLat, markerLon);
    const line = L.polyline([[markerLat, markerLon], latLng], { color: 'red', weight: 2, dashArray: '5, 10' }).addTo(map);
    polylines.push(line);
    const type = data.properties.type || data.properties['select-source-layer'];
    const popupContent = `<div>
        <p>${distance.toFixed(2)}NM ${getOrientationFromDegrees(angle.toFixed(2))} ${data.properties.txtname} ${type} ${data.properties.ident}</p>
        <button class="navAidBtn" onclick="findClosestNavAid(${markerLat}, ${markerLon})">Finde nächstes Navaid</button>
        </div>`;
    line.bindPopup(popupContent).openPopup();
    console.log('Nächstes NavAid:', data.properties.txtname, 'Distanz:', distance);
}

function handleNoFurtherNavAidsFound() {
    const message = currentSequenceFoundNavAidNames.length > 0 ? "Keine weiteren passenden NavAids für diesen Punkt gefunden." : "Es wurde kein passendes Navaid gefunden.";
    alert(message);
    console.log('Kein (weiteres) passendes NavAid gefunden.');
}

function findClosestNavAid(markerLat, markerLon) {
    if (!validateNavAidDataForSearch()) return;
    let closestData = null;
    let shortestDist = Infinity;
    let closestLatLng = null;

    navAids.forEach(navaid => {
        const name = navaid.properties.txtname;
        if (isNavAidAlreadyFoundInSequence(name) || !checkNavAidFilterCriteria(navaid.properties)) return;
        const nLat = navaid.geometry.coordinates[1];
        const nLon = navaid.geometry.coordinates[0];
        const dist = haversine(markerLat, markerLon, nLat, nLon);
        if (dist < shortestDist) { shortestDist = dist; closestData = navaid; closestLatLng = [nLat, nLon]; }
    });

    if (closestData && closestLatLng) {
        processFoundClosestNavAid(closestData, closestLatLng, markerLat, markerLon, shortestDist);
    } else {
        handleNoFurtherNavAidsFound();
    }
}

function getOrientationFromDegrees(deg) {
    const directions = [
        { limit: 22.5, name: 'N' }, { limit: 45, name: 'NNE' }, { limit: 67.5, name: 'NE' },
        { limit: 90, name: 'ENE' }, { limit: 112.5, name: 'E' }, { limit: 135, name: 'ESE' },
        { limit: 157.5, name: 'SE' }, { limit: 180, name: 'SSE' }, { limit: 202.5, name: 'S' },
        { limit: 225, name: 'SW' }, { limit: 247.5, name: 'WSW' }, { limit: 270, name: 'W' },
        { limit: 292.5, name: 'WNW' }, { limit: 315, name: 'NW' }, { limit: 337.5, name: 'NNW' },
        { limit: 360, name: 'N' }
    ];
    const normalizedDeg = ((parseFloat(deg) % 360) + 360) % 360;
    for (const dir of directions) {
        if (normalizedDeg < dir.limit) return dir.name;
    }
    return 'N';
}

function returnOrientation(deg) {
    return getOrientationFromDegrees(deg);
}

function haversine(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * (Math.PI / 180);
    const R = 3440;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateAngle(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * (Math.PI / 180);
    const toDeg = rad => rad * (180 / Math.PI);
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaLambda = toRad(lon2 - lon1);
    const x = Math.sin(deltaLambda) * Math.cos(phi2);
    const y = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
    let angle = toDeg(Math.atan2(x, y));
    return (angle < 0) ? angle + 360 : angle;
}

async function getElevation(lat, lng) {
    const response = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`);
    if (!response.ok) {
        console.error('Fehler beim Abrufen der Höhe:', response.statusText);
        return 'Unbekannt';
    }
    const data = await response.json();
    return (data.elevation * 3.28084).toFixed(2);
}

function parseDMS(dms) {
    const latPattern = /(\d{2})(\d{2})(\d{2})([NS])/;
    const lngPattern = /(\d{3})(\d{2})(\d{2})([EW])/;
    const latMatch = dms.match(latPattern);
    const lngMatch = dms.match(lngPattern);
    if (latMatch && lngMatch) {
        const latDeg = parseInt(latMatch[1], 10) + parseInt(latMatch[2], 10) / 60 + parseInt(latMatch[3], 10) / 3600;
        const lngDeg = parseInt(lngMatch[1], 10) + parseInt(lngMatch[2], 10) / 60 + parseInt(lngMatch[3], 10) / 3600;
        const lat = latMatch[4] === 'N' ? latDeg : -latDeg;
        const lng = lngMatch[4] === 'E' ? lngDeg : -lngDeg;
        return [lat, lng];
    }
    return [null, null];
}

function searchCoordinate() {
    const searchInput = document.getElementById('searchInput').value;
    let latLng = parseDMS(searchInput);
    if (latLng[0] !== null && latLng[1] !== null) createMarker(latLng[0], latLng[1]);
    else alert("Ungültiges Koordinatenformat.");
}


