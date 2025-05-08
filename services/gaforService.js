
let currentGaforCircle = null;

function calcGaforRadius() {
    const gaforLoaderRadius = document.getElementById("loaderGaforRadius");
    const gaforLoaderPos = document.getElementById("loaderGaforPos");
    const resetGafor = document.getElementById("resetGafor");

    // Stelle sicher, dass die Elemente existieren, bevor auf .style oder .disabled zugegriffen wird
    if (!gaforLoaderRadius || !gaforLoaderPos || !resetGafor) {
        console.error("Eines der GAFOR UI-Elemente wurde nicht im DOM gefunden.");
        return;
    }

    resetGafor.disabled = false;
    gaforLoaderRadius.style.display = "inline-block";
    gaforLoaderPos.style.display = "inline-block";

    // Gib dem Browser Zeit, die Loader anzuzeigen, bevor die Berechnungen starten
    setTimeout(() => {
        const inputElement = document.getElementById("gaforNumbers");
        if (!inputElement) {
            console.error("GAFOR Input-Element nicht gefunden.");
            gaforLoaderRadius.style.display = "none";
            gaforLoaderPos.style.display = "none";
            return;
        }
        const input = inputElement.value;
        const numbers = input
            .split(/\s+/)
            .filter(Boolean)
            .map(num => num.padStart(2, "0"));

        // Leere das Input-Feld hier, nachdem der Wert gelesen wurde
        inputElement.value = '';

        if (!numbers.length) {
            console.error("Keine gültigen GAFOR-Nummern eingegeben.");
            gaforLoaderRadius.style.display = "none";
            gaforLoaderPos.style.display = "none";
            return;
        }

        const gaforFeatures = airspaceStates.gafor.airspace.filter(item =>
            numbers.includes(item.properties.gafor_nummer)
        );

        if (!gaforFeatures.length) {
            console.error("Keine GAFOR-Daten für die eingegebenen Nummern gefunden.");
            gaforLoaderRadius.style.display = "none";
            gaforLoaderPos.style.display = "none";
            return;
        }

        const extremePoints = findFurthestPoints(gaforFeatures);
        if (!extremePoints) {
            gaforLoaderRadius.style.display = "none";
            gaforLoaderPos.style.display = "none";
            return;
        }

        const center = findMiddle(extremePoints);
        if (!center) {
            gaforLoaderRadius.style.display = "none";
            gaforLoaderPos.style.display = "none";
            return;
        }

        const radius = calculateDistance(extremePoints.point1, extremePoints.point2) / 2;

        if (radius > 0) {
            if (currentGaforCircle) {
                currentGaforCircle.removeFromMap();
            }
            currentGaforCircle = new GaforCircle(center, radius, map);
            currentGaforCircle.addToMap();
            showCenterAndRadius(center, radius);
        } else {
            console.error("Radius konnte nicht berechnet werden oder ist null.");
        }

        gaforLoaderRadius.style.display = "none";
        gaforLoaderPos.style.display = "none";
    }, 0); // Verzögerung von 0ms
}

function showCenterAndRadius(center, radius) {
    let gaforRadius = document.getElementById('gaforRadius');
    let gaforCenter = document.getElementById('gaforCenter');
    let DMSCenterLat = toDMS(center[0], true);
    let DMSCenterLon = toDMS(center[1], false);
    let radiusNM = (radius / 1.852).toFixed(2);
    gaforRadius.innerHTML = `<span id="gaforRadius">Radius: ${radiusNM}NM</span>`;
    gaforCenter.innerHTML = `<span id="gaforRadius">Center: ${DMSCenterLat} ${DMSCenterLon}</span>`;
}

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
    return { point1, point2 };
}


function calculateDistance([lat1, lon1], [lat2, lon2]) {
    const toRadians = deg => (deg * Math.PI) / 180;
    const R = 6371;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


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

function drawCircle(center, radius) {
    if (!center || radius <= 0) {
        console.error("Ungültige Eingaben für den Kreis:", { center, radius });
        return;
    }

    if (!map) {
        console.error("Karte ist nicht initialisiert.");
        return;
    }
    const gaforCircle = new GaforCircle(center, radius, map);
    gaforCircle.addToMap();
}


function validateInput(input) {
    input.value = input.value
        .replace(/[^0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function resetGaforRadius() {
    // Bestehenden Kreis von der Karte entfernen
    if (currentGaforCircle) {
        currentGaforCircle.removeFromMap();
        currentGaforCircle = null;
    }

    // Eingabefeld für GAFOR-Nummern leeren
    const gaforInput = document.getElementById("gaforNumbers");
    if (gaforInput) {
        gaforInput.value = '';
    }

    // Anzeige für Radius und Zentrum leeren
    const gaforRadiusDisplay = document.getElementById('gaforRadius');
    const gaforCenterDisplay = document.getElementById('gaforCenter');
    if (gaforRadiusDisplay) {
        gaforRadiusDisplay.innerHTML = 'Radius:';
    }
    if (gaforCenterDisplay) {
        gaforCenterDisplay.innerHTML = 'Center:';
    }

    // Alle GAFOR-Polygone auf Standardfarbe zurücksetzen
    // Annahme: 'airspaceStates.gafor.polygons' enthält die Leaflet-Layer der GAFOR-Polygone
    // und 'getDefaultGaforStyle' ist eine Funktion, die das Standard-Styling zurückgibt.
    if (airspaceStates.gafor.airspace.length > 0) {
        console.log('I tried painting the polygons back to default color');

        polygonLayers.gafor.forEach(polygon => {
            // Überprüfen, ob das Polygon eine setStyle Methode hat (typisch für L.Polygon, L.GeoJSON Layer)

            polygon.layer.setStyle({ fillColor: 'lightblue', fillOpacity: 0.5 }); // Standard-Style anwenden
            polygon.isSelected = false; // Auswahl zurücksetzen
        });
    }
    const resetGafor = document.getElementById("resetGafor");
    resetGafor.disabled = true;
}
