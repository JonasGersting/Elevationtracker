let currentGaforBoundingPolygon = null;

function extractGaforNumbers() {
    const inputElement = document.getElementById("gaforNumbers");
    const input = inputElement.value.trim();
    inputElement.value = '';
    const numbers = input.split(/\s+/).filter(Boolean).map(num => num.padStart(2, "0"));
    if (!numbers.length) { showErrorBanner("Bitte geben Sie gültige GAFOR-Nummern ein."); return null; }
    return numbers;
}

function filterGaforFeaturesByNumbers(numbers) {
    if (!airspaceStates?.gafor?.airspace) {
        showErrorBanner("GAFOR Airspace-Daten sind nicht verfügbar.");
        return null;
    }
    const gaforFeatures = airspaceStates.gafor.airspace.filter(item =>
        numbers.includes(item.properties.gafor_nummer)
    );
    if (!gaforFeatures.length) {
        showErrorBanner("Keine GAFOR-Daten für die eingegebenen Nummern gefunden.");
        return null;
    }
    return gaforFeatures;
}

function initializeBoundingData() {
    return {
        minLat: Infinity, maxLat: -Infinity, minLon: Infinity, maxLon: -Infinity,
        northPoint: null, southPoint: null, eastPoint: null, westPoint: null,
        foundAnyCoords: false
    };
}

function updateBoundingExtremes(lat, lon, data) {
    if (!data.foundAnyCoords) {
        data.maxLat = lat; data.northPoint = [lat, lon];
        data.minLat = lat; data.southPoint = [lat, lon];
        data.maxLon = lon; data.eastPoint = [lat, lon];
        data.minLon = lon; data.westPoint = [lat, lon];
        data.foundAnyCoords = true;
    } else {
        if (lat > data.maxLat) data.maxLat = lat;
        if (lat < data.minLat) data.minLat = lat;
        if (lon > data.maxLon) data.maxLon = lon;
        if (lon < data.minLon) data.minLon = lon;
        if (lat > data.northPoint[0]) data.northPoint = [lat, lon];
        if (lat < data.southPoint[0]) data.southPoint = [lat, lon];
        if (lon > data.eastPoint[1]) data.eastPoint = [lat, lon];
        if (lon < data.westPoint[1]) data.westPoint = [lat, lon];
    }
}

function processSingleCoordinateForBoundingBox(lat, lon, boundingData) {
    if (typeof lon === 'number' && typeof lat === 'number' && isFinite(lon) && isFinite(lat)) {
        updateBoundingExtremes(lat, lon, boundingData);
    }
}

function processRingForBoundingBox(ring, boundingData) {
    ring.forEach(point => processSingleCoordinateForBoundingBox(point[1], point[0], boundingData)); // lon, lat -> lat, lon
}

function processPolygonCoordsForBoundingBox(polygonCoords, boundingData) {
    polygonCoords.forEach(ring => processRingForBoundingBox(ring, boundingData));
}

function findBoundingBox(gaforFeatures) {
    const boundingData = initializeBoundingData();
    gaforFeatures.forEach(item => {
        if (!item.geometry || !item.geometry.coordinates) return;
        const type = item.geometry.type;
        const coords = item.geometry.coordinates;
        if (type === "Polygon") processPolygonCoordsForBoundingBox(coords, boundingData);
        else if (type === "MultiPolygon") coords.forEach(polygon => processPolygonCoordsForBoundingBox(polygon, boundingData));
    });
    if (!boundingData.foundAnyCoords) {
        showErrorBanner("Keine gültigen GAFOR-Koordinaten gefunden.");
        return null;
    }
    return boundingData;
}

function removeCurrentGaforDisplayPolygon() {
    if (currentGaforBoundingPolygon) {
        if (typeof L !== 'undefined' && map && map.hasLayer(currentGaforBoundingPolygon)) {
            map.removeLayer(currentGaforBoundingPolygon);
        } else if (currentGaforBoundingPolygon.removeFromMap) { // Fallback for non-Leaflet
            currentGaforBoundingPolygon.removeFromMap();
        }
        currentGaforBoundingPolygon = null;
    }
}

function createAndDisplayGaforPolygon(vertices) {
    if (typeof L !== 'undefined' && map && typeof L.polygon === 'function') {
        currentGaforBoundingPolygon = L.polygon(vertices, { color: 'orange', weight: 2, fillOpacity: 0.1 }).addTo(map);
    } else {
        showErrorBanner("Polygon konnte nicht gezeichnet werden.");
    }
}

function updateGaforDisplayButtonState(enable) {
    const resetGaforButton = document.getElementById("resetGafor");
    if (resetGaforButton) resetGaforButton.disabled = !enable;
}

function calculateAndDisplayGaforElements(gaforFeatures) {
    const boundingBoxData = findBoundingBox(gaforFeatures);
    if (!boundingBoxData) {
        updateGaforDisplayButtonState(false);
        showExtremeCoordinates(null, null, null, null);
        return false;
    }
    const { northPoint, eastPoint, southPoint, westPoint } = boundingBoxData;
    const displayPolygonVertices = [northPoint, eastPoint, southPoint, westPoint];
    removeCurrentGaforDisplayPolygon();
    createAndDisplayGaforPolygon(displayPolygonVertices);
    showExtremeCoordinates(northPoint, eastPoint, southPoint, westPoint);
    updateGaforDisplayButtonState(true);
    return true;
}

function processSelectedGaforAreas() {
    setTimeout(() => {
        const numbers = extractGaforNumbers();
        if (!numbers) { updateGaforDisplayButtonState(false); showExtremeCoordinates(null, null, null, null); return; }

        const gaforFeatures = filterGaforFeaturesByNumbers(numbers);
        if (!gaforFeatures) { updateGaforDisplayButtonState(false); showExtremeCoordinates(null, null, null, null); return; }

        const success = calculateAndDisplayGaforElements(gaforFeatures);
        if (!success) {
            updateGaforDisplayButtonState(!!currentGaforBoundingPolygon); // Disable if no polygon
            showExtremeCoordinates(null, null, null, null);
        }
    }, 0);
}

function formatCoordinateForDisplay(point) {
    const lat = typeof toDMS === 'function' ? toDMS(point[0], true) : `${point[0].toFixed(6)}N`;
    const lon = typeof toDMS === 'function' ? toDMS(point[1], false) : `${point[1].toFixed(6)}E`;
    return `${lat} ${lon}`;
}

function createHtmlForExtremePoint(label, point) {
    return `
        <div class="gaforOrder">
            <span style="width: 12px;">${label}:</span>
            <span>${formatCoordinateForDisplay(point)}</span>
        </div>`;
}

function showExtremeCoordinates(north, east, south, west) {
    const gaforDisplayElement = document.getElementById('gaforPolygonInfo');
    gaforDisplayElement.innerHTML = '';
    if (north && east && south && west) {
        const extremePoints = [
            { label: "N", point: north }, { label: "E", point: east },
            { label: "S", point: south }, { label: "W", point: west }
        ];
        extremePoints.forEach(item => gaforDisplayElement.innerHTML += createHtmlForExtremePoint(item.label, item.point));
    }
    const gaforRadiusDisplay = document.getElementById('gaforRadius');
    if (gaforRadiusDisplay) gaforRadiusDisplay.innerHTML = '';
}

function calculateDistance([lat1, lon1], [lat2, lon2]) {
    const toRadians = deg => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const rLat1 = toRadians(lat1);
    const rLat2 = toRadians(lat2);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function validateInput(input) {
    input.value = input.value.replace(/[^0-9\s]/g, '').replace(/\s+/g, ' ');
    const numbersInput = input.value.trim().split(/\s+/).filter(Boolean).map(num => num.padStart(2, "0"));
    changeClickedGaforArea(numbersInput);
}

function changeClickedGaforArea(numbersInput) {
    if (polygonLayers?.gafor) {
        polygonLayers.gafor.forEach(polygon => {
            const isSelectedNow = numbersInput.includes(polygon.name);
            polygon.isSelected = isSelectedNow;

            if (polygon.layer && typeof polygon.layer.setStyle === 'function') {
                if (isSelectedNow) {
                    polygon.layer.setStyle({ fillColor: 'white', fillOpacity: 0.8 });
                } else {
                    polygon.layer.setStyle({ fillColor: 'lightblue', fillOpacity: 0.5 });
                }
            }
        });
    }
}

function resetGaforUIElements() {
    const gaforInput = document.getElementById("gaforNumbers");
    if (gaforInput) gaforInput.value = '';
    showExtremeCoordinates(null, null, null, null);
}

function resetGaforPolygonStyles() {
    if (airspaceStates?.gafor?.airspace?.length > 0 && polygonLayers?.gafor) {
        polygonLayers.gafor.forEach(polygon => {
            if (polygon.layer && typeof polygon.layer.setStyle === 'function') {
                polygon.layer.setStyle({ fillColor: 'lightblue', fillOpacity: 0.5 });
            }
            polygon.isSelected = false;
        });
    }
}

function resetGaforVisuals() {
    removeCurrentGaforDisplayPolygon();
    resetGaforUIElements();
    resetGaforPolygonStyles();
    updateGaforDisplayButtonState(false);
    const gaforLoaderPos = document.getElementById("loaderGaforPos");
    if (gaforLoaderPos) gaforLoaderPos.style.display = "none";
}

