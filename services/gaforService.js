let currentGaforCircle = null; // Wird nicht mehr verwendet, kann später entfernt werden
let currentGaforBoundingPolygon = null; // To store the new bounding box polygon
// Assume 'map' is a globally available map instance (e.g., Leaflet map)
// Assume 'GaforCircle' class is defined elsewhere and handles its own drawing. // Nicht mehr relevant
// Assume 'toDMS' function is available for formatting coordinates.


function extractGaforNumbers() {
    const inputElement = document.getElementById("gaforNumbers");
    if (!inputElement) {
        console.error("GAFOR Input-Element nicht gefunden.");
        return null;
    }
    const input = inputElement.value.trim();
    inputElement.value = ''; // Clear after reading
    const numbers = input.split(/\s+/).filter(Boolean).map(num => num.padStart(2, "0"));
    if (!numbers.length) {
        console.error("Keine gültigen GAFOR-Nummern eingegeben.");
        // alert("Bitte gültige GAFOR-Nummern eingeben."); // Optional: user feedback
        return null;
    }
    return numbers;
}

function filterGaforFeaturesByNumbers(numbers) {
    // Ensure airspaceStates.gafor.airspace is loaded and available
    if (!airspaceStates || !airspaceStates.gafor || !airspaceStates.gafor.airspace) {
        console.error("GAFOR Airspace-Daten nicht verfügbar.");
        return null;
    }
    const gaforFeatures = airspaceStates.gafor.airspace.filter(item =>
        numbers.includes(item.properties.gafor_nummer)
    );
    if (!gaforFeatures.length) {
        console.error("Keine GAFOR-Daten für die eingegebenen Nummern gefunden.");
        // alert("Keine GAFOR-Daten für die eingegebenen Nummern gefunden."); // Optional
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

// NEUE FUNKTION: Findet den kleinstmöglichen umschließenden Kreis für eine Menge von Punkten
function getMinimumEnclosingCircle(extremePoints) { // extremePoints ist ein Array von 4 [lat, lon] Koordinaten
    let bestCircle = { center: null, radius: Infinity };
    const epsilon = 1e-7; // Kleine Toleranz für Fließkommavergleiche

    if (!extremePoints || extremePoints.length === 0) return null;
    if (extremePoints.length === 1) return { center: extremePoints[0], radius: 0 };

    // Erstelle eine Kopie, um den Algorithmus von Welzl (vereinfacht) nachzuahmen
    let P = [...extremePoints];
    let R = []; // Punkte auf dem Rand des Kreises

    function welzlHelper(points, boundaryPoints) {
        if (points.length === 0 || boundaryPoints.length === 3) {
            return makeCircleFromBoundary(boundaryPoints);
        }

        const p = points[0];
        const remainingPoints = points.slice(1);
        
        const circle = welzlHelper(remainingPoints, [...boundaryPoints]);

        if (circle && circle.center && calculateDistance(p, circle.center) <= circle.radius + epsilon) {
            return circle;
        }
        return welzlHelper(remainingPoints, [...boundaryPoints, p]);
    }

    function makeCircleFromBoundary(boundary) {
        if (boundary.length === 0) {
            return { center: [0,0], radius: 0 }; // Sollte nicht passieren mit initialen Punkten
        }
        if (boundary.length === 1) {
            return { center: boundary[0], radius: 0 };
        }
        if (boundary.length === 2) {
            const p1 = boundary[0];
            const p2 = boundary[1];
            const centerLat = (p1[0] + p2[0]) / 2;
            const centerLon = (p1[1] + p2[1]) / 2;
            const center = [centerLat, centerLon];
            const radius = calculateDistance(p1, center);
            return { center, radius };
        }
        // boundary.length === 3
        const p1 = boundary[0];
        const p2 = boundary[1];
        const p3 = boundary[2];
        return calculateCartesianCircumcircle(p1, p2, p3);
    }
    
    // Um den Welzl-Algorithmus robuster zu machen für kleine N, mischen wir die Punkte initial
    // Für N=4 ist der Effekt gering, aber gute Praxis
    for (let i = P.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [P[i], P[j]] = [P[j], P[i]];
    }

    bestCircle = welzlHelper(P, R);
    
    // Fallback, falls Welzl (mit kartesischer Näherung) kein gültiges Ergebnis liefert oder
    // um sicherzustellen, dass alle Punkte wirklich drin sind.
    // Prüfe alle 2-Punkt-Durchmesser als robusten Fallback/Verbesserung
    for (let i = 0; i < extremePoints.length; i++) {
        for (let j = i + 1; j < extremePoints.length; j++) {
            const p1 = extremePoints[i];
            const p2 = extremePoints[j];
            const centerLat = (p1[0] + p2[0]) / 2;
            const centerLon = (p1[1] + p2[1]) / 2;
            const currentCenter = [centerLat, centerLon];
            const currentRadius = calculateDistance(p1, currentCenter);

            let allEnclosed = true;
            for (const p_other of extremePoints) {
                if (calculateDistance(p_other, currentCenter) > currentRadius + epsilon) {
                    allEnclosed = false;
                    break;
                }
            }
            if (allEnclosed && currentRadius < bestCircle.radius) {
                bestCircle = { center: currentCenter, radius: currentRadius };
            }
        }
    }
     // Prüfe alle 3-Punkt-Umkreise als robusten Fallback/Verbesserung
    if (extremePoints.length >= 3) {
        for (let i = 0; i < extremePoints.length; i++) {
            for (let j = i + 1; j < extremePoints.length; j++) {
                for (let k = j + 1; k < extremePoints.length; k++) {
                    const p1 = extremePoints[i];
                    const p2 = extremePoints[j];
                    const p3 = extremePoints[k];
                    const circum = calculateCartesianCircumcircle(p1, p2, p3);
                    if (circum) {
                        let allEnclosed = true;
                        for (const p_other of extremePoints) {
                            if (calculateDistance(p_other, circum.center) > circum.radius + epsilon) {
                                allEnclosed = false;
                                break;
                            }
                        }
                        if (allEnclosed && circum.radius < bestCircle.radius) {
                            bestCircle = circum;
                        }
                    }
                }
            }
        }
    }


    return bestCircle && bestCircle.center ? bestCircle : null;
}


function calculateAndDisplayGaforElements(gaforFeatures) {
    const boundingBoxData = findBoundingBox(gaforFeatures);
    if (!boundingBoxData) {
        const resetGaforButton = document.getElementById("resetGafor");
        if (resetGaforButton) resetGaforButton.disabled = true;
        // UI-Elemente für Koordinaten leeren
        showExtremeCoordinates(null, null, null, null);
        return false;
    }

    const { 
        northPoint, southPoint, eastPoint, westPoint 
    } = boundingBoxData;
    
    // 1. Definiere Polygon-Eckpunkte aus den vier Extrempunkten für die Anzeige
    const displayPolygonVertices = [
        northPoint, // [lat, lon]
        eastPoint,  // [lat, lon]
        southPoint, // [lat, lon]
        westPoint   // [lat, lon]
    ];

    // 2. Zeichne Polygon
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

    // 3. Kreisberechnung und -zeichnung entfernt

    // 4. Zeige Extremkoordinaten an
    showExtremeCoordinates(northPoint, eastPoint, southPoint, westPoint);
    
    const resetGaforButton = document.getElementById("resetGafor");
    if (resetGaforButton) resetGaforButton.disabled = false;

    return true;
}



// Main function to trigger the GAFOR processing
function processSelectedGaforAreas() {

    // Using a short timeout to allow UI to update (show loaders)
    setTimeout(() => {
        const numbers = extractGaforNumbers();
        if (!numbers) {
            const resetGaforButton = document.getElementById("resetGafor");
            if (resetGaforButton) resetGaforButton.disabled = true;
            showExtremeCoordinates(null, null, null, null); // UI leeren
            return;
        }

        const gaforFeatures = filterGaforFeaturesByNumbers(numbers);
        if (!gaforFeatures) {
            const resetGaforButton = document.getElementById("resetGafor");
            if (resetGaforButton) resetGaforButton.disabled = true;
            showExtremeCoordinates(null, null, null, null); // UI leeren
            return;
        }

        const success = calculateAndDisplayGaforElements(gaforFeatures);
        if (!success) {
             const resetGaforButton = document.getElementById("resetGafor");
             if (resetGaforButton && !currentGaforBoundingPolygon) { 
                resetGaforButton.disabled = true;
             }
             showExtremeCoordinates(null, null, null, null); // UI leeren bei Fehler
        }
    }, 0);
}

// Angepasste Funktion zur Anzeige der Extremkoordinaten
function showExtremeCoordinates(north, east, south, west) {
    const gaforDisplayElement = document.getElementById('gaforPolygonInfo'); 

    if (gaforDisplayElement) {
        // Vorherigen Inhalt löschen
        gaforDisplayElement.innerHTML = ''; 

        if (north && east && south && west) {
            const extremePoints = [
                { label: "N", point: north },
                { label: "E", point: east },
                { label: "S", point: south },
                { label: "W", point: west }
            ];

            const formatCoord = (point) => { // latLabel und lonLabel sind hier nicht mehr nötig
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
            // Standardtext, wenn keine Punkte vorhanden sind
            gaforDisplayElement.innerHTML = '';
        }
    } else {
        console.error("GAFOR Display Element ('gaforPolygonInfo') nicht gefunden.");
    }

    // Das Radius-Display wird nicht mehr benötigt und kann geleert oder ausgeblendet werden
    const gaforRadiusDisplay = document.getElementById('gaforRadius');
    if (gaforRadiusDisplay) {
        gaforRadiusDisplay.innerHTML = ''; // Oder style.display = 'none';
    }
}

// calculateDistance remains crucial
function calculateDistance([lat1, lon1], [lat2, lon2]) {
    const toRadians = deg => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in kilometers

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
    return R * c; // Distance in kilometers
}

function validateInput(input) {
    input.value = input.value
        .replace(/[^0-9\s]/g, '') // Allow only numbers and spaces
        .replace(/\s+/g, ' ');    // Replace multiple spaces with a single one
}

function resetGaforUIElements() {
    const gaforInput = document.getElementById("gaforNumbers");
    if (gaforInput) {
        gaforInput.value = '';
    }
    // UI für Extremkoordinaten zurücksetzen
    showExtremeCoordinates(null, null, null, null);
}

// This function resets the styles of the original GAFOR area polygons
function resetGaforPolygonStyles() {
    if (airspaceStates && airspaceStates.gafor && airspaceStates.gafor.airspace && airspaceStates.gafor.airspace.length > 0 && polygonLayers && polygonLayers.gafor) {
        polygonLayers.gafor.forEach(polygon => {
            if (polygon.layer && typeof polygon.layer.setStyle === 'function') {
                polygon.layer.setStyle({ fillColor: 'lightblue', fillOpacity: 0.5 }); // Reset to default style
            }
            polygon.isSelected = false;
        });
    }
}

// Renamed from resetGaforRadius to be more generic
function resetGaforVisuals() {
    // currentGaforCircle wird nicht mehr verwendet
    // if (currentGaforCircle) {
    //     currentGaforCircle.removeFromMap();
    //     currentGaforCircle = null;
    // }
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

// Zu entfernende Funktionen (oder bereits entfernt):
// - getMinimumEnclosingCircle
// - calculateCartesianCircumcircle
// - GaforCircle Klasseninstanziierung und Methodenaufrufe
// - Alle Logik, die sich auf currentGaforCircle bezieht

// Ensure the main function `processSelectedGaforAreas` is called by your UI,
// for example, by a button click:
// document.getElementById('yourProcessButtonId').addEventListener('click', processSelectedGaforAreas);
// And the reset function:
// document.getElementById('resetGafor').addEventListener('click', resetGaforVisuals);

// Note: The `GaforCircle` class and the global `map` object are assumed to be defined elsewhere.
// The `toDMS` function is also assumed to be available.
// The drawing of `currentGaforBoundingPolygon` uses a Leaflet example; adapt if using another library.
