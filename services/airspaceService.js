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

async function init() {
    getData('navAids');
    getData('aerodromes');
    getData('obstacles');
    getData('aipInfo');
    showCursorCoordinates(map);
}


function checkCursorOverPolygon() {
    if (!isCursorOverPolygon) {
        polygonIsBroughtUpToFront = false;
    } else {
        polygonIsBroughtUpToFront = true;
    }
}

document.addEventListener('mousemove', () => {
    checkCursorOverPolygon();
});


// Korrekter Weg, um ein benutzerdefiniertes Icon zu erstellen
const customIcon = L.icon({
    iconUrl: 'img/mapPin.png',
    iconSize: [48, 48],     // Größe des Icons
    iconAnchor: [24, 48],   // Ankerpunkt des Icons (Mitte unten)
    popupAnchor: [0, -48]   // Punkt, von dem aus das Popup geöffnet wird
});


function createMarker(lat, lng) {
    initialMarkerLat = lat;
    initialMarkerLon = lng;
    if (!markerData.navaid.added) {
        toggleMarkers('navaid');
    }
    const marker = L.marker([lat, lng],{
        icon: customIcon,
    }).addTo(map);
    markers.push(marker);

    // Karte auf den Marker zentrieren und näher heranzoomen
    map.setView([lat, lng], Math.min(map.getZoom() + 2, map.getMaxZoom()));

    // Abfrage der Höhe von der Open Elevation API
    getElevation(lat, lng).then(elevation => {
        marker.bindPopup(`<b>Höhe:</b> ${elevation}FT<br>
            <button class="navAidBtn marginTop16"  onclick="findClosestNavAid(${lat},${lng})">NAV-AID</button>
            <button class="navAidBtn marginTop16" onclick="startDistanceMeasurement(${lat},${lng})">DIST</button>`).openPopup();
    });
}

function startDistanceMeasurement(lat, lng) {
    // Nur eine aktive Messung gleichzeitig erlauben
    if (activeMeasurement) return;
    
    const startPoint = [lat, lng];
    
    // Messobjekt erstellen
    activeMeasurement = {
        id: Date.now(),
        startPoint: startPoint,
        line: L.polyline([startPoint, startPoint], {
            color: 'red',
            weight: 2,
            dashArray: '5, 10'
        }).addTo(map),
        label: createDistanceLabel()
    };
    
    // Mousemove-Event für Aktualisierung der Linie
    map.on('mousemove', updateActiveDistanceLine);
    
    // Click-Event für Abschluss der Messung
    map.once('click', finishDistanceMeasurement);
    
    // NavAid-Marker-Popups temporär deaktivieren
    modifyNavaidMarkers(true);
}


function createDistanceLabel() {
    const label = L.DomUtil.create('div', 'distance-label');
    document.getElementById('map').appendChild(label);
    return label;
}


function updateActiveDistanceLine(e) {
    if (!activeMeasurement) return;
    
    const endPoint = [e.latlng.lat, e.latlng.lng];
    activeMeasurement.line.setLatLngs([activeMeasurement.startPoint, endPoint]);
    
    // Distanz berechnen
    const distance = calculateDistanceNavAid(
        activeMeasurement.startPoint[0], activeMeasurement.startPoint[1],
        endPoint[0], endPoint[1]
    );
    
    // Label aktualisieren
    updateDistanceLabel(activeMeasurement, distance, endPoint);
}


function calculateDistanceNavAid(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * (Math.PI / 180);
    const R = 3440; // Erdradius in nautischen Meilen
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Entfernung in nautischen Meilen
}

function updateDistanceLabel(measurement, distance, endPoint) {
    // Mittelpunkt berechnen für Position des Labels
    const midPoint = [
        (measurement.startPoint[0] + endPoint[0]) / 2,
        (measurement.startPoint[1] + endPoint[1]) / 2
    ];
    
    // Position auf dem Bildschirm berechnen
    const point = map.latLngToContainerPoint(midPoint);
    
    // Label Position und Text setzen
    measurement.label.style.left = (point.x - 30) + 'px';
    measurement.label.style.top = (point.y - 10) + 'px';
    measurement.label.textContent = `${distance.toFixed(1)} NM`;
}


function finishDistanceMeasurement(e) {
    // Überprüfen, ob die Messung noch aktiv ist
    if (!activeMeasurement) return;
    
    // Speichere eine lokale Referenz, um sicherzustellen, dass sie nicht null wird
    const measurement = activeMeasurement;
    
    // Endpunkt setzen
    const endPoint = [e.latlng.lat, e.latlng.lng];
    
    // Bestimme den tatsächlichen Endpunkt (Check ob auf Marker geklickt wurde)
    const finalEndPoint = (e.target instanceof L.Marker) ? 
        [e.target.getLatLng().lat, e.target.getLatLng().lng] : endPoint;
    
    // Linie aktualisieren - nutze die lokale Referenz
    measurement.line.setLatLngs([measurement.startPoint, finalEndPoint]);
    
    // Distanz berechnen
    const distance = calculateDistanceNavAid(
        measurement.startPoint[0], measurement.startPoint[1],
        finalEndPoint[0], finalEndPoint[1]
    );
    
    // Label aktualisieren - nutze die lokale Referenz
    updateDistanceLabel(measurement, distance, finalEndPoint);
    
    // Event-Handler entfernen
    map.off('mousemove', updateActiveDistanceLine);
    
    // Map-Move-Listener hinzufügen für Label-Aktualisierung beim Zoomen/Verschieben
    const moveListener = () => {
        const latLngs = measurement.line.getLatLngs();
        if (!latLngs || latLngs.length < 2) return;
        
        const mid = [
            (latLngs[0].lat + latLngs[1].lat) / 2,
            (latLngs[0].lng + latLngs[1].lng) / 2
        ];
        const newPoint = map.latLngToContainerPoint(mid);
        
        measurement.label.style.left = (newPoint.x - 30) + 'px';
        measurement.label.style.top = (newPoint.y - 10) + 'px';
    };
    map.on('move', moveListener);
    
    // Messung speichern
    measurement.moveListener = moveListener;
    distanceMeasurements.push(measurement);
    
    // NavAid-Marker-Popups wiederherstellen
    modifyNavaidMarkers(false);
    
    // Aktive Messung zurücksetzen - erst NACHDEM wir alle Operationen abgeschlossen haben
    activeMeasurement = null;
}


function modifyNavaidMarkers(isForMeasurement) {
    if (!markerData.navaid.markers) return;
    
    markerData.navaid.markers.forEach(navaid => {
        if (!navaid.marker) return;
        
        if (isForMeasurement) {
            // Für Messung vorbereiten
            // Popup speichern und entfernen
            navaid.marker._originalPopup = navaid.marker.getPopup();
            navaid.marker.unbindPopup();
            
            // Click-Event für Messung (kein Popup)
            navaid.marker.on('click', finishDistanceMeasurement);
        } else {
            // Normalen Zustand wiederherstellen
            navaid.marker.off('click', finishDistanceMeasurement);
            
            // Popup wiederherstellen
            if (navaid.marker._originalPopup) {
                navaid.marker.bindPopup(navaid.marker._originalPopup);
                delete navaid.marker._originalPopup;
            }
        }
    });
}


function clearAllDistanceMeasurements() {
    // Aktive Messung abbrechen
    if (activeMeasurement) {
        map.off('mousemove', updateActiveDistanceLine);
        map.off('click', finishDistanceMeasurement);
        
        activeMeasurement.line.remove();
        activeMeasurement.label.remove();
        activeMeasurement = null;
        
        modifyNavaidMarkers(false);
    }
    
    // Bestehende Messungen entfernen
    distanceMeasurements.forEach(measurement => {
        measurement.line.remove();
        measurement.label.remove();
        
        if (measurement.moveListener) {
            map.off('move', measurement.moveListener);
        }
    });
    
    distanceMeasurements = [];
}

let closestNavAid = null;
let foundNavAids = []; // Array zum Speichern bereits gefundener Navaids
let foundNavaidId = 0;

function findClosestNavAid(markerLat, markerLon, isNext = false) {
    console.log('ich werde ausgeführt');
    foundNavaidId++;
    // Speichere die ursprünglichen Koordinaten beim ersten Aufruf
    if (!initialMarkerLat || !initialMarkerLon) {
        initialMarkerLat = markerLat;
        initialMarkerLon = markerLon;
    }

    // Zurücksetzen des gefundenen Navaids für die neue Suche
    closestNavAid = null;

    // Initialisiere die kürzeste Distanz und das nächste Navaid
    let shortestDistance = Infinity;
    let closestNavAidLatLng = null;

    // Iteriere durch alle Navaids
    navAids.forEach(navaid => {
        // Wenn isNext true ist, überspringe Navaids, die bereits gefunden wurden
        if (isNext && foundNavAids.includes(navaid.properties.txtname)) {
            return; // Überspringe dieses Navaid, wenn es bereits gefunden wurde
        }

        // Bedingungen für das Auswählen des richtigen Navaids
        if (((navaid.properties.charted && navaid.properties.charted.includes('ICAO500')) ||
            (navaid.properties.dme_charted && (navaid.properties.dme_charted.includes('ICAO500') || navaid.properties.dme_charted.includes('NN')))) && navaid.properties.icaocode == 'ED') {

            const distance = haversine(
                initialMarkerLat, initialMarkerLon, // Benutze die ursprünglichen Koordinaten
                navaid.geometry.coordinates[1], navaid.geometry.coordinates[0]
            );

            // Überprüfe, ob die aktuelle Distanz kürzer ist
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestNavAid = navaid;
                closestNavAidLatLng = [navaid.geometry.coordinates[1], navaid.geometry.coordinates[0]];
            }
        }
    });

    // Wenn ein nächstes Navaid gefunden wurde
    if (closestNavAid && closestNavAidLatLng) {
        // Berechne den Winkel (Azimut) vom Navaid zum Marker
        const angle = calculateAngle(
            closestNavAidLatLng[0], closestNavAidLatLng[1],
            initialMarkerLat, initialMarkerLon // Benutze die ursprünglichen Koordinaten
        );

        // Zeichne eine Linie vom MarkerPoint zum nächstgelegenen Navaid
        const line = L.polyline([
            [initialMarkerLat, initialMarkerLon], // Benutze die ursprünglichen Koordinaten
            closestNavAidLatLng
        ], {
            color: 'red',
            weight: 2,
            dashArray: '5, 10'
        }).addTo(map);

        // Füge die Linie zum Array hinzu
        polylines.push(line);

        // Popup-Inhalt mit Button hinzufügen
        const popupContent = `
            <div>
                <p>${shortestDistance.toFixed(2)}NM ${returnOrientation(angle.toFixed(2))} ${closestNavAid.properties.txtname} ${closestNavAid.properties['select-source-layer']} ${closestNavAid.properties.ident}</p>
                <button class="navAidBtn" id="nextNavAidBtn${foundNavaidId}">Finde nächstes Navaid</button>
            </div>
        `;
        line.bindPopup(popupContent).openPopup();
        // Event-Handler für den Button hinzufügen
        document.getElementById(`nextNavAidBtn${foundNavaidId}`).addEventListener('click', () => {
            // Speichern des Namens des gefundenen Navaids
            foundNavAids.push(closestNavAid.properties.txtname); // Speichere den Namen des gefundenen Navaids

            findClosestNavAid(initialMarkerLat, initialMarkerLon, true); // isNext = true

        });
    } else {
        alert("Es wurde kein Navaid gefunden.");
    }
}




function returnOrientation(deg) {
    if (deg >= 0 && deg < 22.5) {
        return 'N';
    }
    if (deg >= 22.5 && deg < 45) {
        return 'NNE';
    }
    if (deg >= 45 && deg < 67.5) {
        return 'NE';
    }
    if (deg >= 67.5 && deg < 90) {
        return 'ENE';
    }
    if (deg >= 90 && deg < 112.5) {
        return 'E';
    }
    if (deg >= 112.5 && deg < 135) {
        return 'ESE';
    }
    if (deg >= 135 && deg < 157.5) {
        return 'SE';
    }
    if (deg >= 157.5 && deg < 180) {
        return 'SSE';
    }
    if (deg >= 180 && deg < 202.5) {
        return 'S';
    }
    if (deg >= 202.5 && deg < 225) {
        return 'SW';
    }
    if (deg >= 225 && deg < 247.5) {
        return 'WSW';
    }
    if (deg >= 247.5 && deg < 270) {
        return 'W';
    }
    if (deg >= 270 && deg < 292.5) {
        return 'WNW';
    }
    if (deg >= 292.5 && deg < 315) {
        return 'NW';
    }
    if (deg >= 315 && deg < 337.5) {
        return 'NNW';
    }
    if (deg >= 337.5 && deg < 360) {
        return 'N';
    }
}


// Funktion zur Berechnung der Distanz zwischen zwei Punkten (Haversine-Formel) in nautischen Meilen
function haversine(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * (Math.PI / 180);
    const R = 3440; // Erdradius in nautischen Meilen
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Entfernung in nautischen Meilen
}

// Funktion zur Berechnung des Winkels (Azimut) zwischen zwei Punkten
function calculateAngle(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * (Math.PI / 180);
    const toDeg = rad => rad * (180 / Math.PI);

    // Umrechnung der Koordinaten in Bogenmaß
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaLambda = toRad(lon2 - lon1);

    // Berechnung des Azimuts
    const x = Math.sin(deltaLambda) * Math.cos(phi2);
    const y = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    let angle = toDeg(Math.atan2(x, y)); // Azimut in Grad

    // Stelle sicher, dass der Winkel zwischen 0° und 360° liegt
    if (angle < 0) {
        angle += 360;
    }

    return angle;
}





// Funktion zur Abfrage der Höhe von der Open Elevation API
async function getElevation(lat, lng) {
    const response = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`);
    if (!response.ok) {
        console.error('Fehler beim Abrufen der Höhe:', response.statusText);
        return 'Unbekannt';
    }
    const data = await response.json();
    return (data.elevation * 3.28084).toFixed(2); // Meter in Fuß umrechnen
}

// Funktion zum Parsen von DMS-Koordinaten
function parseDMS(dms) {
    const latPattern = /(\d{2})(\d{2})(\d{2})([NS])/; // 2 Grad, 2 Minuten, 2 Sekunden
    const lngPattern = /(\d{3})(\d{2})(\d{2})([EW])/; // 3 Grad, 2 Minuten, 2 Sekunden

    const latMatch = dms.match(latPattern);
    const lngMatch = dms.match(lngPattern);

    if (latMatch && lngMatch) {
        const latDegrees = parseInt(latMatch[1], 10) + parseInt(latMatch[2], 10) / 60 + parseInt(latMatch[3], 10) / 3600;
        const lngDegrees = parseInt(lngMatch[1], 10) + parseInt(lngMatch[2], 10) / 60 + parseInt(lngMatch[3], 10) / 3600;

        const lat = latMatch[4] === 'N' ? latDegrees : -latDegrees;
        const lng = lngMatch[4] === 'E' ? lngDegrees : -lngDegrees;

        return [lat, lng];
    }
    return [null, null]; // Ungültige Koordinaten
}

function searchCoordinate() {
    const searchInput = document.getElementById('searchInput').value;
    let latLng = parseDMS(searchInput);
    createMarker(latLng[0], latLng[1]);
}


