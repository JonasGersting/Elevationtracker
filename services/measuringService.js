let measuring = false;
let startPoint = null; // Temporärer Startpunkt für die aktuelle Messung
let currentLine = null; // Temporäre Linie für die aktuelle Messung
let startMarker = null; // Temporärer Startmarker für die aktuelle Messung
let distanceMarker = null; // Temporäres Distanzlabel für die aktuelle Messung
let mouseMoveHandler = null;
let clickHandler = null;

// Array zum Speichern aller abgeschlossenen Messungen
let allMeasurements = []; // Format: [{ id: number, startMarker: L.Marker, endMarker: L.Marker, line: L.Polyline, label: L.Marker }]

const customIconMarker = L.icon({
    iconUrl: './img/mapPin.png',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48] // Popup etwas über dem Ankerpunkt
});

// --- NEU: Hilfsfunktion zur Umwandlung von Dezimalgrad in DMS ---
function toDMSDist(coordinate, isLatitude) {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    const direction = isLatitude
        ? coordinate >= 0 ? 'N' : 'S'
        : coordinate >= 0 ? 'E' : 'W';

    // Führende Nullen für Minuten und Sekunden hinzufügen
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    return `${degrees}° ${minutesStr}' ${secondsStr}'' ${direction}`;
}
// --- Ende DMS Funktion ---

function toggleMeasuringService() {
    measuring = !measuring;
    const measuringBtn = document.getElementById('measuring');

    if (measuring) {
        measuringBtn.classList.add('measuringBtn-active');
        enableMeasuring();
    } else {
        measuringBtn.classList.remove('measuringBtn-active');
        disableMeasuring();
        resetMeasuring(); // Aktuelle, nicht abgeschlossene Messung zurücksetzen
        // Entferne alle abgeschlossenen Messungen nur, wenn der Service komplett deaktiviert wird
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
        clickHandler = null; // Wichtig: Handler entfernen
    }
    if (mouseMoveHandler) {
        map.off('mousemove', mouseMoveHandler);
        mouseMoveHandler = null; // Wichtig: Handler entfernen
    }
}

function handleMapClick(e) {
    const clickLatLng = e.latlng;

    if (!startPoint) {
        // Erster Klick - setze Startpunkt
        startPoint = clickLatLng;

        // Erstelle temporären Marker für den Startpunkt (noch ohne Popup)
        startMarker = L.marker(clickLatLng, {
            icon: customIconMarker,
        }).addTo(map);

        // Erstelle eine temporäre Linie
        currentLine = L.polyline([clickLatLng, clickLatLng], {
            color: 'rgb(40, 40, 126)',
            weight: 2,
            dashArray: '5, 10',
            opacity: 0.7
        }).addTo(map);

        // Erstelle ein temporäres Distanz-Label
        distanceMarker = createDistanceLabel([clickLatLng, clickLatLng]); // Erstellt und fügt hinzu

    } else {
        // Zweiter Klick - vervollständige die Messung
        const endPoint = clickLatLng;

        // Linie finalisieren (Koordinaten setzen)
        currentLine.setLatLngs([startPoint, endPoint]);
        // Optional: Linienstil ändern für abgeschlossene Messung
        currentLine.setStyle({ dashArray: null, opacity: 1.0 });

        // Endmarker erstellen
        const endMarker = L.marker(endPoint, {
            icon: customIconMarker,
        }).addTo(map);

        // Label finalisieren (Position und Text aktualisieren)
        if (distanceMarker) {
            map.removeLayer(distanceMarker); // Entferne temporäres Label
        }
        const finalLabel = createDistanceLabel([startPoint, endPoint]); // Erstellt und fügt finales Label hinzu

        // Eindeutige ID für diese Messung generieren
        const measurementId = Date.now();

        // Messungsobjekt erstellen und speichern
        const measurement = {
            id: measurementId,
            startMarker: startMarker,
            endMarker: endMarker,
            line: currentLine,
            label: finalLabel // Das finale Label speichern
        };
        allMeasurements.push(measurement);

        // --- NEU: Popup für Start- und Endmarker hinzufügen ---
        const startCoords = startMarker.getLatLng();
        const endCoords = endMarker.getLatLng();

        const startPopupContent = `
            <b>Startpunkt:</b><br>
            ${toDMSDist(startCoords.lat, true)}<br>
            ${toDMSDist(startCoords.lng, false)}<br>
            <button class="delete-measurement-btn" onclick="deleteMeasurement(${measurementId})">Löschen</button>
        `;
        startMarker.bindPopup(startPopupContent);

        const endPopupContent = `
            <b>Endpunkt:</b><br>
            ${toDMSDist(endCoords.lat, true)}<br>
            ${toDMSDist(endCoords.lng, false)}<br>
            <button class="delete-measurement-btn" onclick="deleteMeasurement(${measurementId})">Löschen</button>
        `;
        endMarker.bindPopup(endPopupContent);
        // --- Ende Popup ---

        // Temporäre Variablen für die nächste Messung zurücksetzen
        startPoint = null;
        currentLine = null;
        startMarker = null;
        distanceMarker = null; // Auch das temporäre Label zurücksetzen
    }
}

function handleMouseMove(e) {
    if (startPoint && currentLine) {
        // Aktualisiere den Endpunkt der temporären Linie mit der Mausposition
        const currentPoints = [startPoint, e.latlng];
        currentLine.setLatLngs(currentPoints);

        // Aktualisiere das temporäre Distanzlabel
        if (distanceMarker) {
            map.removeLayer(distanceMarker); // Entferne altes temporäres Label
        }
        distanceMarker = createDistanceLabel(currentPoints); // Erstelle neues temporäres Label
    }
}

function calculateDistanceMeasuring(point_1, point_2) {
    const distanceMeters = point_1.distanceTo(point_2);
    const distanceNM = distanceMeters / 1852;
    return Math.round(distanceNM * 10) / 10;
}

// Erstellt ein Distanzlabel und fügt es zur Karte hinzu
function createDistanceLabel(points) {
    if (!points || points.length < 2) return null;

    const distanceNM = calculateDistanceMeasuring(points[0], points[1]);

    const midPoint = L.latLng(
        (points[0].lat + points[1].lat) / 2,
        (points[0].lng + points[1].lng) / 2
    );

    const distanceLabelIcon = L.divIcon({
        className: 'distance-permanent-label', // CSS-Klasse für Styling
        html: `<div class="distance-permanent-label-inner">${distanceNM} NM</div>`,
        iconSize: [80, 20], // Größe anpassen nach Bedarf
        iconAnchor: [40, 10] // Zentriert über dem Mittelpunkt
    });

    // Füge das Label zur Karte hinzu und gib es zurück
    return L.marker(midPoint, { icon: distanceLabelIcon }).addTo(map);
}

window.deleteMeasurement = function(id) {
    const measurementIndex = allMeasurements.findIndex(m => m.id === id);
    if (measurementIndex > -1) {
        const measurement = allMeasurements[measurementIndex];
        if (measurement.startMarker) map.removeLayer(measurement.startMarker);
        if (measurement.endMarker) map.removeLayer(measurement.endMarker);
        if (measurement.line) map.removeLayer(measurement.line);
        if (measurement.label) map.removeLayer(measurement.label);
        allMeasurements.splice(measurementIndex, 1);
    } else {
        console.warn(`Messung mit ID ${id} nicht gefunden.`);
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