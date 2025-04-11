
let currentGaforCircle = null;  // Variable, die die aktuelle GaforCircle-Instanz speichert



// Berechnet den GAFOR-Radius basierend auf den Eingaben
function calcGaforRadius() {
    const input = document.getElementById("gaforNumbers").value;
    const numbers = input
        .split(/\s+/)
        .filter(Boolean)
        .map(num => num.padStart(2, "0")); // Führende Nullen hinzufügen

    document.getElementById("gaforNumbers").value = '';

    if (!numbers.length) {
        console.error("Keine gültigen GAFOR-Nummern eingegeben.");
        return;
    }

    const gaforRadius = airspaceStates.gafor.airspace.filter(item =>
        numbers.includes(item.properties.gafor_nummer)
    );

    if (!gaforRadius.length) {
        console.error("Keine GAFOR-Daten für die eingegebenen Nummern gefunden.");
        return;
    }

    const extremePoints = findFurthestPoints(gaforRadius);
    if (!extremePoints) return;

    const center = findMiddle(extremePoints);
    if (!center) return;

    const radius = calculateDistance(extremePoints.point1, extremePoints.point2) / 2;

    if (radius > 0) {
        // Überprüfen, ob bereits eine Instanz von GaforCircle existiert
        if (currentGaforCircle) {
            // Lösche den vorherigen GaforCircle (falls vorhanden)
            currentGaforCircle.removeFromMap();
        }

        // Erstelle eine neue Instanz von GaforCircle
        currentGaforCircle = new GaforCircle(center, radius, map);

        // Füge den neuen Kreis der Karte hinzu
        currentGaforCircle.addToMap();

        console.log('Das ist der Radius:', radius);
    } else {
        console.error("Radius konnte nicht berechnet werden.");
    }
    showCenterAndRadius(center, radius);
}


function showCenterAndRadius(center, radius) {
    let gaforRadius = document.getElementById('gaforRadius');
    let gaforCenter = document.getElementById('gaforCenter');
    let DMSCenterLat = toDMS(center[0], true);
    let DMSCenterLon = toDMS(center[1], false);
    let radiusNM = (radius / 1.852).toFixed(2);
    gaforRadius.innerHTML = `<span id="gaforRadius">Radius:${radiusNM} NM</span>`;
    gaforCenter.innerHTML = `<span id="gaforRadius">Center:${DMSCenterLat} ${DMSCenterLon}</span>`;
}

// Findet die zwei Punkte, die am weitesten voneinander entfernt sind
function findFurthestPoints(polygon) {
    const allCoordinates = polygon.flatMap(item => item.geometry.coordinates.flat(Infinity));

    if (allCoordinates.length < 2) {
        console.error("Nicht genügend Koordinaten für die Berechnung gefunden.");
        return null;
    }

    let maxDistance = 0;
    let point1 = null;
    let point2 = null;

    for (let i = 0; i < allCoordinates.length; i += 2) {
        for (let j = i + 2; j < allCoordinates.length; j += 2) {
            const p1 = [allCoordinates[i + 1], allCoordinates[i]];
            const p2 = [allCoordinates[j + 1], allCoordinates[j]];

            const distance = calculateDistance(p1, p2);
            if (distance > maxDistance) {
                maxDistance = distance;
                point1 = p1;
                point2 = p2;
            }
        }
    }

    if (!point1 || !point2) {
        console.error("Keine gültigen Punkte gefunden.");
        return null;
    }

    console.log("Am weitesten entfernte Punkte:", { point1, point2 });
    return { point1, point2 };
}

// Berechnet die Entfernung zwischen zwei Punkten in Kilometern
function calculateDistance([lat1, lon1], [lat2, lon2]) {
    const toRadians = deg => (deg * Math.PI) / 180;
    const R = 6371; // Erdradius in Kilometern

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Entfernung in Kilometern
}

// Berechnet den Mittelpunkt zwischen zwei Punkten
function findMiddle({ point1, point2 }) {
    if (!point1 || !point2) {
        console.error("Ungültige Punkte übergeben.");
        return null;
    }

    const middleLatitude = (point1[0] + point2[0]) / 2;
    const middleLongitude = (point1[1] + point2[1]) / 2;

    const middlePoint = [middleLatitude, middleLongitude];
    console.log("Mittelpunkt:", middlePoint);
    return middlePoint;
}

// Zeichnet einen Kreis mit Leaflet auf der Karte
function drawCircle(center, radius) {
    if (!center || radius <= 0) {
        console.error("Ungültige Eingaben für den Kreis:", { center, radius });
        return;
    }

    if (!map) {
        console.error("Karte ist nicht initialisiert.");
        return;
    }

    // Erstelle eine neue Instanz der GaforCircle-Klasse
    const gaforCircle = new GaforCircle(center, radius, map);
    gaforCircle.addToMap();
}

