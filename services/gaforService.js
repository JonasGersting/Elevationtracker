
let currentGaforCircle = null;

function initializeGaforControls() {
    const gaforLoaderRadius = document.getElementById("loaderGaforRadius");
    const gaforLoaderPos = document.getElementById("loaderGaforPos");
    const resetGafor = document.getElementById("resetGafor");
    if (!gaforLoaderRadius || !gaforLoaderPos || !resetGafor) {
        console.error("Eines der GAFOR UI-Elemente wurde nicht im DOM gefunden.");
        return null;
    }
    resetGafor.disabled = false;
    gaforLoaderRadius.style.display = "inline-block";
    gaforLoaderPos.style.display = "inline-block";
    return { gaforLoaderRadius, gaforLoaderPos };
}

function extractGaforNumbers() {
    const inputElement = document.getElementById("gaforNumbers");
    if (!inputElement) {
        console.error("GAFOR Input-Element nicht gefunden.");
        return null;
    }
    const input = inputElement.value.trim();
    inputElement.value = '';
    const numbers = input.split(/\s+/).filter(Boolean).map(num => num.padStart(2, "0"));
    if (!numbers.length) {
        console.error("Keine gültigen GAFOR-Nummern eingegeben.");
        return null;
    }
    return numbers;
}

function filterGaforFeaturesByNumbers(numbers) {
    const gaforFeatures = airspaceStates.gafor.airspace.filter(item =>
        numbers.includes(item.properties.gafor_nummer)
    );
    if (!gaforFeatures.length) {
        console.error("Keine GAFOR-Daten für die eingegebenen Nummern gefunden.");
        return null;
    }
    return gaforFeatures;
}

function computeAndDisplayGaforCircle(gaforFeatures) {
    const extremePoints = findFurthestPoints(gaforFeatures);
    if (!extremePoints) return false;
    const center = findMiddle(extremePoints);
    if (!center) return false;
    const radius = calculateDistance(extremePoints.point1, extremePoints.point2) / 2;
    if (radius > 0) {
        if (currentGaforCircle) currentGaforCircle.removeFromMap();
        currentGaforCircle = new GaforCircle(center, radius, map);
        currentGaforCircle.addToMap();
        showCenterAndRadius(center, radius);
        return true;
    }
    console.error("Radius konnte nicht berechnet werden oder ist null.");
    return false;
}

function hideGaforLoaders(loaders) {
    if (loaders && loaders.gaforLoaderRadius) loaders.gaforLoaderRadius.style.display = "none";
    if (loaders && loaders.gaforLoaderPos) loaders.gaforLoaderPos.style.display = "none";
}

function calcGaforRadius() {
    const loaders = initializeGaforControls();
    if (!loaders) return;

    setTimeout(() => {
        const numbers = extractGaforNumbers();
        if (!numbers) { hideGaforLoaders(loaders); return; }

        const gaforFeatures = filterGaforFeaturesByNumbers(numbers);
        if (!gaforFeatures) { hideGaforLoaders(loaders); return; }

        computeAndDisplayGaforCircle(gaforFeatures);
        hideGaforLoaders(loaders);
    }, 0);
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
        .replace(/\s+/g, ' ');
}

function resetGaforCircle() {
    if (currentGaforCircle) {
        currentGaforCircle.removeFromMap();
        currentGaforCircle = null;
    }
}

function resetGaforUIElements() {
    const gaforInput = document.getElementById("gaforNumbers");
    if (gaforInput) {
        gaforInput.value = '';
    }
    const gaforRadiusDisplay = document.getElementById('gaforRadius');
    const gaforCenterDisplay = document.getElementById('gaforCenter');
    if (gaforRadiusDisplay) {
        gaforRadiusDisplay.innerHTML = 'Radius:';
    }
    if (gaforCenterDisplay) {
        gaforCenterDisplay.innerHTML = 'Center:';
    }
}

function resetGaforPolygonStyles() {
    if (airspaceStates.gafor.airspace.length > 0 && polygonLayers.gafor) {
        polygonLayers.gafor.forEach(polygon => {
            polygon.layer.setStyle({ fillColor: 'lightblue', fillOpacity: 0.5 });
            polygon.isSelected = false;
        });
    }
}

function resetGaforRadius() {
    resetGaforCircle();
    resetGaforUIElements();
    resetGaforPolygonStyles();
    const resetGaforButton = document.getElementById("resetGafor");
    if (resetGaforButton) {
        resetGaforButton.disabled = true;
    }
}
