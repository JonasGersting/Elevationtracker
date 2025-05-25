let currentGaforBoundingPolygon = null;

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
        showErrorBanner("Bitte geben Sie gültige GAFOR-Nummern ein.");
        return null;
    }
    return numbers;
}

function filterGaforFeaturesByNumbers(numbers) {
    // Ensure airspaceStates.gafor.airspace is loaded and available
    if (!airspaceStates || !airspaceStates.gafor || !airspaceStates.gafor.airspace) {
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

function findBoundingBox(gaforFeatures) {
    let overallMinLat = Infinity, overallMaxLat = -Infinity, overallMinLon = Infinity, overallMaxLon = -Infinity;
    
    let northMostPoint = null; // Will store [lat, lon]
    let southMostPoint = null; // Will store [lat, lon]
    let eastMostPoint = null;  // Will store [lat, lon]
    let westMostPoint = null;  // Will store [lat, lon]

    let foundAnyCoords = false;

    gaforFeatures.forEach(item => {
        if (!item.geometry || !item.geometry.coordinates) return;

        const type = item.geometry.type;
        const coords = item.geometry.coordinates;

        function processSingleCoordinate(lat, lon) {
            if (!foundAnyCoords) {
                // Initialize with the first valid point
                overallMaxLat = lat; northMostPoint = [lat, lon];
                overallMinLat = lat; southMostPoint = [lat, lon];
                overallMaxLon = lon; eastMostPoint  = [lat, lon];
                overallMinLon = lon; westMostPoint  = [lat, lon];
                foundAnyCoords = true;
            } else {
                // Update overall bounding box extents
                if (lat > overallMaxLat) overallMaxLat = lat;
                if (lat < overallMinLat) overallMinLat = lat;
                if (lon > overallMaxLon) overallMaxLon = lon;
                if (lon < overallMinLon) overallMinLon = lon;

                // Determine extreme points
                // Northernmost: highest latitude. If tie, the first one encountered is kept.
                if (lat > northMostPoint[0]) {
                    northMostPoint = [lat, lon];
                }
                // Southernmost: lowest latitude. If tie, the first one encountered is kept.
                if (lat < southMostPoint[0]) {
                    southMostPoint = [lat, lon];
                }
                // Easternmost: highest longitude. If tie, the first one encountered is kept.
                if (lon > eastMostPoint[1]) { // Compare with longitude (index 1)
                    eastMostPoint = [lat, lon];
                }
                // Westernmost: lowest longitude. If tie, the first one encountered is kept.
                if (lon < westMostPoint[1]) { // Compare with longitude (index 1)
                    westMostPoint = [lat, lon];
                }
            }
        }
        
        function processRing(ring) { // ring is array of [lon, lat]
            ring.forEach(point => {
                const lon = point[0];
                const lat = point[1];
                if (typeof lon === 'number' && typeof lat === 'number' && isFinite(lon) && isFinite(lat)) {
                    processSingleCoordinate(lat, lon); // Pass lat, lon
                }
            });
        }

        function processPolygonCoords(polygonCoords) { // polygonCoords is array of rings
            polygonCoords.forEach(ring => processRing(ring));
        }

        if (type === "Polygon") {
            processPolygonCoords(coords);
        } else if (type === "MultiPolygon") {
            coords.forEach(polygon => processPolygonCoords(polygon));
        }
        // Add other types like Point, LineString if necessary
    });

    if (!foundAnyCoords || !northMostPoint || !southMostPoint || !eastMostPoint || !westMostPoint) {
        console.error("Extrempunkte konnten nicht ermittelt werden oder keine gültigen Koordinaten gefunden.");
        return null;
    }
    
    return { 
        minLat: overallMinLat, maxLat: overallMaxLat, 
        minLon: overallMinLon, maxLon: overallMaxLon,
        northPoint: northMostPoint, 
        southPoint: southMostPoint, 
        eastPoint: eastMostPoint,   
        westPoint: westMostPoint    
    };
}


function calculateAndDisplayGaforElements(gaforFeatures) {
    const boundingBoxData = findBoundingBox(gaforFeatures);
    if (!boundingBoxData) {
        const resetGaforButton = document.getElementById("resetGafor");
        if (resetGaforButton) resetGaforButton.disabled = true;
        showExtremeCoordinates(null, null, null, null);
        return false;
    }
    const { 
        northPoint, southPoint, eastPoint, westPoint 
    } = boundingBoxData;
    const displayPolygonVertices = [
        northPoint,
        eastPoint, 
        southPoint,
        westPoint   
    ];
    if (currentGaforBoundingPolygon) {
        if (typeof L !== 'undefined' && map && map.hasLayer(currentGaforBoundingPolygon)) {
            map.removeLayer(currentGaforBoundingPolygon);
        } else if (currentGaforBoundingPolygon.removeFromMap) { 
             currentGaforBoundingPolygon.removeFromMap();
        }
        currentGaforBoundingPolygon = null;
    }
    if (typeof L !== 'undefined' && map && typeof L.polygon === 'function') {
         currentGaforBoundingPolygon = L.polygon(displayPolygonVertices, { color: 'orange', weight: 2, fillOpacity: 0.1 }).addTo(map);
    } else {
        console.warn("Kartenbibliothek (z.B. Leaflet) nicht verfügbar oder Polygon konnte nicht gezeichnet werden.");
    }
    showExtremeCoordinates(northPoint, eastPoint, southPoint, westPoint);
    const resetGaforButton = document.getElementById("resetGafor");
    if (resetGaforButton) resetGaforButton.disabled = false;

    return true;
}


function processSelectedGaforAreas() {
    setTimeout(() => {
        const numbers = extractGaforNumbers();
        if (!numbers) {
            const resetGaforButton = document.getElementById("resetGafor");
            if (resetGaforButton) resetGaforButton.disabled = true;
            showExtremeCoordinates(null, null, null, null); 
            return;
        }

        const gaforFeatures = filterGaforFeaturesByNumbers(numbers);
        if (!gaforFeatures) {
            const resetGaforButton = document.getElementById("resetGafor");
            if (resetGaforButton) resetGaforButton.disabled = true;
            showExtremeCoordinates(null, null, null, null); 
            return;
        }

        const success = calculateAndDisplayGaforElements(gaforFeatures);
        if (!success) {
             const resetGaforButton = document.getElementById("resetGafor");
             if (resetGaforButton && !currentGaforBoundingPolygon) { 
                resetGaforButton.disabled = true;
             }
             showExtremeCoordinates(null, null, null, null);
        }
    }, 0);
}

function showExtremeCoordinates(north, east, south, west) {
    const gaforDisplayElement = document.getElementById('gaforPolygonInfo'); 
    if (gaforDisplayElement) {
        gaforDisplayElement.innerHTML = ''; 
        if (north && east && south && west) {
            const extremePoints = [
                { label: "N", point: north },
                { label: "E", point: east },
                { label: "S", point: south },
                { label: "W", point: west }
            ];
            const formatCoord = (point) => { 
                const lat = typeof toDMS === 'function' ? toDMS(point[0], true) : `${point[0].toFixed(6)}N`;
                const lon = typeof toDMS === 'function' ? toDMS(point[1], false) : `${point[1].toFixed(6)}E`;
                return `${lat} ${lon}`;
            };
            extremePoints.forEach(item => {
               gaforDisplayElement.innerHTML +=`
               <div class="gaforOrder">
                    <span style="width: 12px;" >${item.label}:</span>
                    <span >${formatCoord(item.point)}</span>
               </div>`;
            });
        } else {
            gaforDisplayElement.innerHTML = '';
        }
    } else {
        console.error("GAFOR Display Element ('gaforPolygonInfo') nicht gefunden.");
    }
    const gaforRadiusDisplay = document.getElementById('gaforRadius');
    if (gaforRadiusDisplay) {
        gaforRadiusDisplay.innerHTML = ''; 
    }
}

function calculateDistance([lat1, lon1], [lat2, lon2]) {
    const toRadians = deg => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const rLat1 = toRadians(lat1);
    const rLat2 = toRadians(lat2);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rLat1) *
        Math.cos(rLat2) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

function validateInput(input) {
    input.value = input.value
        .replace(/[^0-9\s]/g, '')
        .replace(/\s+/g, ' ');    
}

function resetGaforUIElements() {
    const gaforInput = document.getElementById("gaforNumbers");
    if (gaforInput) {
        gaforInput.value = '';
    }
    showExtremeCoordinates(null, null, null, null);
}

function resetGaforPolygonStyles() {
    if (airspaceStates && airspaceStates.gafor && airspaceStates.gafor.airspace && airspaceStates.gafor.airspace.length > 0 && polygonLayers && polygonLayers.gafor) {
        polygonLayers.gafor.forEach(polygon => {
            if (polygon.layer && typeof polygon.layer.setStyle === 'function') {
                polygon.layer.setStyle({ fillColor: 'lightblue', fillOpacity: 0.5 });
            }
            polygon.isSelected = false;
        });
    }
}

function resetGaforVisuals() {
    if (currentGaforBoundingPolygon) {
        if (typeof L !== 'undefined' && map && map.hasLayer(currentGaforBoundingPolygon)) {
            map.removeLayer(currentGaforBoundingPolygon);
        } else if (currentGaforBoundingPolygon.removeFromMap) { 
             currentGaforBoundingPolygon.removeFromMap();
        }
        currentGaforBoundingPolygon = null;
    }

    resetGaforUIElements();
    resetGaforPolygonStyles(); 
    const resetGaforButton = document.getElementById("resetGafor");
    if (resetGaforButton) {
        resetGaforButton.disabled = true;
    }
    const gaforLoaderPos = document.getElementById("loaderGaforPos");
    if (gaforLoaderPos) gaforLoaderPos.style.display = "none";
}

