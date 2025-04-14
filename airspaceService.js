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





function createMarker(lat, lng) {
    initialMarkerLat = lat;
    initialMarkerLon = lng;
    if (!markerData.navaid.added) {
        toggleMarkers('navaid');
    }
    const marker = L.marker([lat, lng]).addTo(map);
    markers.push(marker);

    // Karte auf den Marker zentrieren und näher heranzoomen
    map.setView([lat, lng], Math.min(map.getZoom() + 2, map.getMaxZoom()));

    // Abfrage der Höhe von der Open Elevation API
    getElevation(lat, lng).then(elevation => {
        marker.bindPopup(`<b>Höhe:</b> ${elevation}FT<br>
            <button onclick="findClosestNavAid(${lat},${lng})">NAV-AID</button>`).openPopup();
    });
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
            color: 'blue',
            weight: 2
        }).addTo(map);

        // Füge die Linie zum Array hinzu
        polylines.push(line);

        // Popup-Inhalt mit Button hinzufügen
        const popupContent = `
            <div>
                <p>${shortestDistance.toFixed(2)}NM ${returnOrientation(angle.toFixed(2))} ${closestNavAid.properties.txtname} ${closestNavAid.properties['select-source-layer']} ${closestNavAid.properties.ident}</p>
                <button id="nextNavAidBtn${foundNavaidId}">Finde nächstes Navaid</button>
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



// Funktion zum Reset der Karte
function resetMap() {
    let trackedAcftDiv = document.getElementById('trackedAcft');
    trackedAcftDiv.classList.add('hiddenTrackedAcft');

    currentAddresses = [];
    if (trackedAcft) {
        if (currentTrackLine) {
            map.removeLayer(currentTrackLine);
            currentTrackLine = null;
        }
        trackedAcft.isTracked = false;
        trackedAcft.updateMarkerStyle();
        trackedAcft = null;
    }

    // Reset destination and flight line
    if (flightDistLine) {
        map.removeLayer(flightDistLine);
        flightDistLine = null;
    }
    if (trackedIcaoDest) {
        trackedIcaoDest = null;
        trackedEta = '';
        let icaoDestInput = document.getElementById('icaoDest');
        icaoDestInput.value = '';
    }
    if (currentAdressGeoJSONLayer) {
        map.removeLayer(currentAdressGeoJSONLayer);
    }
    currentAdressGeoJSONLayer = null;

    trackedAcftReg = 'nothing';
    if (markerData.navaid.added) {
        toggleMarkers('navaid');
    }
    // Entferne alle Marker
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Entferne alle Polylines
    polylines.forEach(line => map.removeLayer(line));
    polylines = [];
    if (flightDistLine) {
        flightDistLine.remove();
    }
    if (trackedIcaoDest) {
        trackedIcaoDest = '';
        let icaoDestInput = document.getElementById('icaoDest');
        icaoDestInput.value = '';
    }
    initialMarkerLat = null;
    initialMarkerLon = null;
    closestNavAid = null;
    foundNavAids = []; // Array zum Speichern bereits gefundener Navaids
    foundNavaidId = 0;
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


