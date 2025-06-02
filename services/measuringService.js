let measuring = false;
let startPoint = null;
let currentLine = null;
let startMarker = null;
let distanceMarker = null;
let mouseMoveHandler = null;
let clickHandler = null;
let allMeasurements = [];

const customIconMarker = L.icon({
    iconUrl: './img/mapPin.png',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
});

function toDMSDist(coordinate, isLatitude) {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    const direction = isLatitude
        ? coordinate >= 0 ? 'N' : 'S'
        : coordinate >= 0 ? 'E' : 'W';
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    return `${degrees}° ${minutesStr}' ${secondsStr}'' ${direction}`;
}

function toggleMeasuringService() {
    measuring = !measuring;
    const measuringBtn = document.getElementById('measuring');
    if (measuring) {
        measuringBtn.classList.add('measuringBtn-active');
        enableMeasuring();
    } else {
        measuringBtn.classList.remove('measuringBtn-active');
        disableMeasuring();
        resetMeasuring();
        removeAllMeasurements();
    }
}

function enableMeasuring() {
    map.getContainer().style.cursor = 'crosshair';
    clickHandler = handleMapClick;
    map.on('click', clickHandler);
    mouseMoveHandler = handleMouseMove;
    map.on('mousemove', mouseMoveHandler);
}

function disableMeasuring() {
    map.getContainer().style.cursor = '';
    if (clickHandler) {
        map.off('click', clickHandler);
        clickHandler = null;
    }
    if (mouseMoveHandler) {
        map.off('mousemove', mouseMoveHandler);
        mouseMoveHandler = null;
    }
}

function initializeNewMeasurement(clickLatLng) {
    startPoint = clickLatLng;
    startMarker = L.marker(clickLatLng, { icon: customIconMarker }).addTo(map);
    currentLine = L.polyline([clickLatLng, clickLatLng], {
        color: 'rgb(40, 40, 126)', weight: 2, dashArray: '5, 10', opacity: 0.7
    }).addTo(map);
    distanceMarker = createDistanceLabel([clickLatLng, clickLatLng]);
}

function createAndBindPopups(currentStartMarker, currentEndMarker, measurementId) {
    const startCoords = currentStartMarker.getLatLng();
    const endCoords = currentEndMarker.getLatLng();
    const startPopupContent = `<b>Startpunkt:</b><br>${toDMSDist(startCoords.lat, true)}<br>${toDMSDist(startCoords.lng, false)}<br><button class="delete-measurement-btn" onclick="deleteMeasurement(${measurementId})">Löschen</button>`;
    currentStartMarker.bindPopup(startPopupContent);
    const endPopupContent = `<b>Endpunkt:</b><br>${toDMSDist(endCoords.lat, true)}<br>${toDMSDist(endCoords.lng, false)}<br><button class="delete-measurement-btn" onclick="deleteMeasurement(${measurementId})">Löschen</button>`;
    currentEndMarker.bindPopup(endPopupContent);
}

function finalizeMeasurement(endPoint) {
    currentLine.setLatLngs([startPoint, endPoint]);
    currentLine.setStyle({ dashArray: null, opacity: 1.0 });
    const endMarker = L.marker(endPoint, { icon: customIconMarker }).addTo(map);
    if (distanceMarker) map.removeLayer(distanceMarker);
    const finalLabel = createDistanceLabel([startPoint, endPoint]);
    const measurementId = Date.now();
    allMeasurements.push({ id: measurementId, startMarker, endMarker, line: currentLine, label: finalLabel });
    createAndBindPopups(startMarker, endMarker, measurementId);
    startPoint = null;
    currentLine = null;
    startMarker = null;
    distanceMarker = null;
}

function handleMapClick(e) {
    const clickLatLng = e.latlng;
    if (!startPoint) {
        initializeNewMeasurement(clickLatLng);
    } else {
        finalizeMeasurement(clickLatLng);
    }
}

function handleMouseMove(e) {
    if (startPoint && currentLine) {
        const currentPoints = [startPoint, e.latlng];
        currentLine.setLatLngs(currentPoints);
        if (distanceMarker) {
            map.removeLayer(distanceMarker);
        }
        distanceMarker = createDistanceLabel(currentPoints);
    }
}

function calculateDistanceMeasuring(point_1, point_2) {
    const distanceMeters = point_1.distanceTo(point_2);
    const distanceNM = distanceMeters / 1852;
    return Math.round(distanceNM * 10) / 10;
}

function createDistanceLabel(points) {
    if (!points || points.length < 2) return null;
    const distanceNM = calculateDistanceMeasuring(points[0], points[1]);
    const midPoint = L.latLng(
        (points[0].lat + points[1].lat) / 2,
        (points[0].lng + points[1].lng) / 2
    );
    const distanceLabelIcon = L.divIcon({
        className: 'distance-permanent-label',
        html: `<div class="distance-permanent-label-inner">${distanceNM} NM</div>`,
        iconSize: [80, 20],
        iconAnchor: [40, 10]
    });
    return L.marker(midPoint, { icon: distanceLabelIcon }).addTo(map);
}

function deleteMeasurement(id) {
    const measurementIndex = allMeasurements.findIndex(m => m.id === id);
    if (measurementIndex > -1) {
        const measurement = allMeasurements[measurementIndex];
        if (measurement.startMarker) map.removeLayer(measurement.startMarker);
        if (measurement.endMarker) map.removeLayer(measurement.endMarker);
        if (measurement.line) map.removeLayer(measurement.line);
        if (measurement.label) map.removeLayer(measurement.label);
        allMeasurements.splice(measurementIndex, 1);
    } else {
        showErrorBanner(`Messung mit ID ${id} konnte nicht gelöscht werden.`);
    }
}

function resetMeasuring() {
    if (currentLine) {
        map.removeLayer(currentLine);
        currentLine = null;
    }
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    if (distanceMarker) {
        map.removeLayer(distanceMarker);
        distanceMarker = null;
    }
    startPoint = null;
}

function removeAllMeasurements() {
    allMeasurements.forEach(measurement => {
        if (measurement.startMarker && map.hasLayer(measurement.startMarker)) map.removeLayer(measurement.startMarker);
        if (measurement.endMarker && map.hasLayer(measurement.endMarker)) map.removeLayer(measurement.endMarker);
        if (measurement.line && map.hasLayer(measurement.line)) map.removeLayer(measurement.line);
        if (measurement.label && map.hasLayer(measurement.label)) map.removeLayer(measurement.label);
    });
    allMeasurements = [];
}