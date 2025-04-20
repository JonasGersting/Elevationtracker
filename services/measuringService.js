let measuring = false;
let startPoint = null;
let currentLine = null;
let startMarker = null;
let mouseMoveHandler = null;
let clickHandler = null;
let linePoints = [];
let distanceMarker = null;

// Arrays zum Speichern aller erstellten Objekte
let allLines = [];
let allMarkers = [];
let allLabels = [];

const customIconMarker = L.icon({
    iconUrl: './img/mapPin.png',
    iconSize: [48, 48],     
    iconAnchor: [24, 48],   
    popupAnchor: [0, -48]  
});

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
        // Entferne alle Messobjekte
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
    }
    if (mouseMoveHandler) {
        map.off('mousemove', mouseMoveHandler);
    }
}

function handleMapClick(e) {
    const clickLatLng = e.latlng;

    if (!startPoint) {
        // Erster Klick - setze Startpunkt
        startPoint = clickLatLng;
        linePoints = [clickLatLng, clickLatLng];
        
        // Erstelle Marker für den Startpunkt
        startMarker = L.marker(clickLatLng, {
            icon: customIconMarker,
        }).addTo(map);
        allMarkers.push(startMarker); // Zum Array aller Marker hinzufügen
        
        // Erstelle eine temporäre Linie, die dem Mauszeiger folgt
        currentLine = L.polyline(linePoints, {
            color: 'rgb(40, 40, 126)',
            weight: 2,
            dashArray: '5, 10',
            opacity: 0.7
        }).addTo(map);
        allLines.push(currentLine); // Zum Array aller Linien hinzufügen
        
        // Erstelle ein temporäres Distanz-Label, das mit der Linie aktualisiert wird
        updateDistanceLabel();
        
    } else {
        // Zweiter Klick - vervollständige die Messung
        
        // Aktualisiere den Endpunkt der Linie
        linePoints[1] = clickLatLng;
        currentLine.setLatLngs(linePoints);
        
        // Erstelle Marker für den Endpunkt
        const endMarker = L.marker(clickLatLng, {
            icon: customIconMarker,
        }).addTo(map);
        allMarkers.push(endMarker); // Zum Array aller Marker hinzufügen
        
        // Aktualisiere die Distanzanzeige ein letztes Mal
        updateDistanceLabel();
        
        // Setze alles zurück für die nächste Messung
        startPoint = null;
        currentLine = null;
        distanceMarker = null;
        linePoints = [];
    }
}

function handleMouseMove(e) {
    if (startPoint && currentLine) {
        // Aktualisiere den Endpunkt der Linie mit der Mausposition
        linePoints[1] = e.latlng;
        currentLine.setLatLngs(linePoints);
        
        // Aktualisiere die Distanzanzeige
        updateDistanceLabel();
    }
}

function calculateDistance(point1, point2) {
    // Berechne die Distanz in Metern
    const distanceMeters = point1.distanceTo(point2);
    
    // Konvertiere zu Nautischen Meilen (1 NM = 1852 Meter)
    const distanceNM = distanceMeters / 1852;
    
    // Runde auf 1 Dezimalstelle
    return Math.round(distanceNM * 10) / 10;
}

function updateDistanceLabel() {
    // Entferne das vorherige Label, falls vorhanden
    if (distanceMarker) {
        map.removeLayer(distanceMarker);
        // Entferne aus dem Array, falls vorhanden
        const index = allLabels.indexOf(distanceMarker);
        if (index > -1) {
            allLabels.splice(index, 1);
        }
    }
    
    const distanceNM = calculateDistance(linePoints[0], linePoints[1]);
    
    // Finde den Mittelpunkt der Linie für die Platzierung des Labels
    const midPoint = L.latLng(
        (linePoints[0].lat + linePoints[1].lat) / 2,
        (linePoints[0].lng + linePoints[1].lng) / 2
    );
    
    // Erstelle ein Label
    const distanceLabel = L.divIcon({
        className: 'distance-permanent-label',
        html: `<div class="distance-permanent-label-inner">${distanceNM} NM</div>`,
        iconSize: [80, 20],
        iconAnchor: [40, 10]
    });
    
    // Füge das Label zur Karte hinzu
    distanceMarker = L.marker(midPoint, { icon: distanceLabel }).addTo(map);
    allLabels.push(distanceMarker); // Zum Array aller Labels hinzufügen
}

function resetMeasuring() {
    // Entferne die aktuellen temporären Objekte (während einer aktiven Messung)
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
    linePoints = [];
}

function removeAllMeasurements() {
    // Entferne alle gespeicherten Linien
    allLines.forEach(line => {
        if (line && map.hasLayer(line)) {
            map.removeLayer(line);
        }
    });
    allLines = [];
    
    // Entferne alle gespeicherten Marker
    allMarkers.forEach(marker => {
        if (marker && map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
    allMarkers = [];
    
    // Entferne alle gespeicherten Labels
    allLabels.forEach(label => {
        if (label && map.hasLayer(label)) {
            map.removeLayer(label);
        }
    });
    allLabels = [];
}