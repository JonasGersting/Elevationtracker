// Hovervariable
let polygonIsBroughtUpToFront = false;
let isCursorOverPolygon = false;
let searchCat = 'Position';
let currentAerodrome;
let currentAirspace;

//current acft variables
let currentTrack;


// Event-Listener, um zu überprüfen, ob der Cursor über keinem Polygon schwebt
function checkCursorOverPolygon() {
    if (!isCursorOverPolygon) {
        polygonIsBroughtUpToFront = false;
    } else {
        polygonIsBroughtUpToFront = true;
    }
}

document.addEventListener('mousemove', () => {
    // Überprüfen, ob der Cursor über keinem Polygon schwebt
    checkCursorOverPolygon();  // Hier die Instanz des EdrAirspace verwenden
});

let weatherPath;
let rainviewerWeather;
let rainviewerClouds;

// Karte initialisieren und auf einen Standardort setzen
var map = L.map('map', {
}).setView([50.505, 12], 9);


// OpenStreetMap-Kacheln hinzufügen
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});


// Aktuelle Hintergrundkarte speichern
var currentTileLayer; // Standard ist OSM

// Add a polygon that covers the entire world with no pointer events
var worldPolygon = L.polygon([
    [-90, -180],
    [-90, 180],
    [90, 180],
    [90, -180]
], {
    className: 'no-pointer-events', // Assign the custom class
    color: 'white', // Set the border color to white
    fillColor: 'white', // Set the fill color to white
    fillOpacity: 0 // Set the fill opacity to 0.4 (standard value)
}).addTo(map).bringToBack();


// Add event listener for the slider
var slider = document.getElementById('opacity-slider');
var sliderValue = document.getElementById('slider-value');

slider.addEventListener('input', setOpacity);

function setOpacity() {
    var opacityValue = slider.value / 100; // Convert to a value between 0 and 1
    worldPolygon.setStyle({ fillOpacity: opacityValue });
    sliderValue.textContent = slider.value + '%'; // Update the displayed value
}


// OpenStreetMap Layer
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// OpenFlightMaps Layer
let openFlightMaps = L.tileLayer('https://nwy-tiles-api.prod.newaydata.com/tiles/{z}/{x}/{y}.png?path=2503/aero/latest', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openflightmaps.org/">OpenFlightMaps</a>'
});

// OpenAIP Layer
let openAIP = L.tileLayer('https://api.tiles.openaip.net/api/data/openaip/{z}/{x}/{y}.png?apiKey=75acf00ad8bb52144424ce0655147c55', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openaip.net/">OpenAIP</a>'
});

// ICAO Card Layer
let icaoCard = L.tileLayer('https://ais.dfs.de/static-maps/icao500/tiles/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.dfs.de">Deutsche Flugsicherung</a>'
});

// OpenTopoMap Layer
var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Stadia Maps Layers
var stadiaAlidadeSmooth = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var stadiaAlidadeSmoothDark = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// TopPlus Open Layers
let topPlusOpen = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.bkg.bund.de">BKG</a>'
});

let topPlusOpenGrey = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.bkg.bund.de">BKG</a>'
});

let topPlusOpenLight = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_light/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.bkg.bund.de">BKG</a>'
});

let topPlusOpenLightGray = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_light_grau/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.bkg.bund.de">BKG</a>'
});

// Google Satellite Layer
let googleSatelite = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl={language}', {
    subdomains: '0123',
    minZoom: 4,
    maxZoom: 22,
    language: 'de',
    attribution: '&copy; Google Maps'
});

// DWD Weather Layer
let dwdWeather = L.tileLayer.wms('https://maps.dwd.de/geoserver/wms', {
    layers: 'dwd:Niederschlagsradar',
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.dwd.de">Deutscher Wetterdienst</a>'
});



const mapStates = {
    backgroundMaps: {
        osm: { layer: osm, isHidden: false, opacity: 0 },
        openTopoMap: { layer: openTopoMap, isHidden: true, opacity: 0 },
        stadiaAlidadeSmooth: { layer: stadiaAlidadeSmooth, isHidden: true, opacity: 0 },
        stadiaAlidadeSmoothDark: { layer: stadiaAlidadeSmoothDark, isHidden: true, opacity: 0 },
        topPlusOpen: { layer: topPlusOpen, isHidden: true, opacity: 0.5 },
        topPlusOpenGrey: { layer: topPlusOpenGrey, isHidden: true, opacity: 0 },
        topPlusOpenLight: { layer: topPlusOpenLight, isHidden: true, opacity: 0.5 },
        topPlusOpenLightGray: { layer: topPlusOpenLightGray, isHidden: true, opacity: 0 },
        googleSatelite: { layer: googleSatelite, isHidden: true, opacity: 0 }
    },
    additionalLayers: {
        openFlightMaps: { layer: openFlightMaps, isHidden: true, opacity: 0 },
        openAIP: { layer: openAIP, isHidden: true, opacity: 0 },
        icaoCard: { layer: icaoCard, isHidden: true, opacity: 0 },

    },
    weatherLayers: {
        dwdWeather: { layer: dwdWeather, isHidden: true, opacity: 0 },
        rainviewerWeather: { layer: null, isHidden: true, opacity: 0 },
        rainviewerClouds: { layer: null, isHidden: true, opacity: 0 }
    }
};

toggleMap('topPlusOpen', 'backgroundMaps'); // Standardkarte setzen

// OSM Buildings Layer
var osmb = new OSMBuildings(map).load('https://{s}.data.osmbuildings.org/0.2/59fcc2e8/tile/{z}/{x}/{y}.json');

function toggleMap(mapKey, category) {
    const categoryStates = mapStates[category];
    const mapState = categoryStates[mapKey];

    // Wenn die Karte bereits sichtbar ist und es sich um eine Hintergrundkarte handelt
    // dann nicht ausblenden (früher Return)
    if (!mapState.isHidden && category === 'backgroundMaps') {
        return;
    }

    toggleActBtn(mapKey);

    if (mapState.isHidden) {
        // Wenn es sich um additionalLayers oder backgroundMaps handelt, andere Layer dieser Kategorie ausblenden
        if (category === 'additionalLayers' || category === 'backgroundMaps') {
            Object.keys(categoryStates).forEach(key => {
                const otherMapState = categoryStates[key];
                if (!otherMapState.isHidden && otherMapState.layer) {
                    map.removeLayer(otherMapState.layer);
                    otherMapState.isHidden = true;
                    const otherMapBtn = document.getElementById(key);
                    if (otherMapBtn) {
                        otherMapBtn.classList.remove('bgMapButtonActive');
                    }
                }
            });
        }

        if (mapState.layer) {
            mapState.layer.addTo(map);
            if (category === 'backgroundMaps' || mapKey === 'icaoCard') {
                slider.value = mapState.opacity * 100;
                setOpacity();
            }
            currentTileLayer = mapState.layer;
        }

        mapState.isHidden = false;

        if (category === 'backgroundMaps') {
            updateAdditionalLayerOrder();
        }
    } else {
        // Nur ausblenden wenn es KEINE Hintergrundkarte ist
        if (category !== 'backgroundMaps') {
            if (mapState.layer) {
                map.removeLayer(mapState.layer);
            }
            mapState.isHidden = true;

            // Wenn eine ICAO-Karte entfernt wird, stelle die Opacity der Hintergrundkarte wieder her
            if (mapKey === 'icaoCard') {
                // Finde die aktive Hintergrundkarte
                const activeBackgroundMap = Object.entries(mapStates.backgroundMaps).find(
                    ([_, state]) => !state.isHidden
                );

                if (activeBackgroundMap) {
                    const [_, bgMapState] = activeBackgroundMap;
                    if (bgMapState.opacity !== undefined) {
                        slider.value = bgMapState.opacity * 100;
                        setOpacity();
                    }
                }
            }
        }
    }
}


// Zusatzlayer aktualisieren
function updateAdditionalLayerOrder() {
    const additionalLayers = mapStates.additionalLayers;
    Object.keys(additionalLayers).forEach(key => {
        const layerState = additionalLayers[key];
        if (!layerState.isHidden && layerState.layer) {
            map.removeLayer(layerState.layer); // Entferne den Layer
            layerState.layer.addTo(map); // Füge ihn wieder hinzu
        }
    });
}














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






async function init() {
    getData('navAids');
    getData('aerodromes');
    getData('obstacles');
    getData('aipInfo');
    showCursorCoordinates(map);
}











// Arrays zum Speichern von Markern
let markers = [];

// Array zum Speichern der Polylines
let polylines = [];
let initialMarkerLat = null; // Speichern der ursprünglichen Marker Latitude
let initialMarkerLon = null; // Speichern der ursprünglichen Marker Longitude


// Funktion zum Erstellen des Markers und Abfragen der Höhe
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
    trackedHex = null;

    currentAddresses = [];
    if (currentTrack) {
        map.removeLayer(currentTrack);
    }
    currentTrack = null;
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






let trackedAcftReg = 'nothing';
let trackedCallsign;
let trackedAcftImg;
let trackedAlt;
let trackedPos;
let trackedType;
let trackedSpeed;
let trackedHeading;
let trackedTrack;
let trackedHex;
let trackedEta = '';
let trackedIcaoDest;
let flightDistLine = null;











let aircraftLayer = L.layerGroup().addTo(map);
// Layer für Flugzeugmarker


function createCustomMarker(aircraftData) {
    const { lat, lon, t, alt_baro, ias, true_heading, track, r, flight, hex, gs } = aircraftData;
    let acftImgColor;
    let rotation = true_heading || track;
    if (trackedHex == hex) {
        setTrackingDetails(r, t, flight, alt_baro, gs, true_heading, lat, lon, track, hex);
        showAcftDetails(hex);
        if (trackedIcaoDest) {
            calcEta(trackedPos, trackedSpeed, trackedIcaoDest);
        }
    }

    if (trackedHex == hex) {
        acftImgColor = 'rgb(181 117 33)'
    } else {
        acftImgColor = returnAircraftImg(alt_baro);
    }


    // Benutzerdefiniertes Icon mit Rotation
    const planeIcon = L.divIcon({
        html: returnCorrectSvgForAcft(rotation, acftImgColor, r, t),
        className: 'planeIcon',
        iconSize: [30, 30], // Größe des Icons
        iconAnchor: [15, 15], // Ankerpunkt des Icons (Mitte)
        popupAnchor: [0, -15] // Position des Popups relativ zum Icon
    });




    // Tooltip-Inhalt erstellen
    const tooltipContent = `
        <div>
            <strong>registration:</strong> ${r || 'Unknown'}<br>
            <strong>Callsign:</strong> ${flight}<br>
            <strong>Altitude:</strong> ${alt_baro || 'N/A'} ft<br>
        </div>
    `;

    // Marker erstellen
    const planeMarker = L.marker([lat, lon], { icon: planeIcon });

    // Tooltip hinzufügen
    planeMarker.bindTooltip(tooltipContent, { direction: 'top', offset: [0, -15] });

    // Klick-Event hinzufügen
    planeMarker.on('click', () => {
        setTrackingDetails(r, t, flight, alt_baro, ias, true_heading, lat, lon, track, hex);
        showAcftDetails(hex);
        handleTrack(hex);


        trackedAcftReg = flight; // Ändere trackedAcftReg auf den flight-Wert
        // Aktualisiere das Bild des Markers
        const updatedPlaneIcon = L.divIcon({
            html: returnCorrectSvgForAcft(rotation, 'rgb(181 117 33)', r, t),
            className: 'planeIcon',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
        planeMarker.setIcon(updatedPlaneIcon); // Setze das neue Icon
        console.log(`Tracked Aircraft Registration geändert: ${trackedAcftReg}`);
        console.log(track);
    });
    return planeMarker;
}

function setTrackingDetails(r, t, flight, alt_baro, ias, true_heading, lat, lon, track, hex) {
    trackedAcftReg = r;
    trackedCallsign = flight;
    trackedAlt = alt_baro;
    const roundedLat = lat.toFixed(2);
    const roundedLon = lon.toFixed(2);
    trackedPos = [roundedLat, roundedLon];
    trackedType = t;
    trackedSpeed = ias;
    trackedHeading = true_heading;
    trackedTrack = track;
    trackedHex = hex;
}

async function showAcftDetails(hex) {
    let trackedAcftDiv = document.getElementById('trackedAcft')
    let callsignDiv = document.getElementById('trackedCallsign');
    let regDiv = document.getElementById('trackedReg');
    let img = document.getElementById('trackedImg');
    let altDiv = document.getElementById('trackedAltitude');
    let posDiv = document.getElementById('trackedPos');
    let typeDiv = document.getElementById('trackedType');
    let speedDiv = document.getElementById('trackedIas');
    let headingDiv = document.getElementById('trackedHeading');
    let trackDiv = document.getElementById('trackedTrack');
    let eta = document.getElementById('ETA');
    trackedAcftDiv.classList.remove('hiddenTrackedAcft');
    callsignDiv.innerHTML = trackedCallsign;
    regDiv.innerHTML = trackedAcftReg;
    img.src = await getImgSrc(hex);
    altDiv.innerHTML = `${trackedAlt}FT`;
    posDiv.innerHTML = `${trackedPos[0]}N, ${trackedPos[1]}E`;
    typeDiv.innerHTML = trackedType;
    speedDiv.innerHTML = `${trackedSpeed}kts`;
    headingDiv.innerHTML = `${trackedHeading}°`;
    trackDiv.innerHTML = `${trackedTrack}°`;
    eta.innerHTML = `${trackedEta}min`;
}

async function getImgSrc(hex) {
    const apiUrl = `https://api.planespotters.net/pub/photos//hex/${hex}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            return 'img/acftWhite.png'
        }
        const data = await response.json();
        return data.photos[0].thumbnail.src
    } catch (error) {
        return 'img/acftWhite.png'
    }
}

async function handleTrack(hex) {
    const track = await getAcftTrack(hex); // Auf das Promise warten
    drawTrack(map, track); // Jetzt ist `track` ein Array
}

async function getAcftTrack(hex) {
    const apiUrl = `https://opensky-network.org/api/tracks/?icao24=${hex}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`no tracks found`);
        }
        const data = await response.json();
        return data.path || []; // Falls `path` nicht existiert, gib ein leeres Array zurück
    } catch (error) {
        console.error("Fehler beim API-Abruf:", error);
        return []; // Gib ein leeres Array zurück, um Fehler zu vermeiden
    }
}

function drawTrack(map, track) {
    if (!Array.isArray(track)) {
        console.error("Track-Daten sind kein Array");
        return;
    }

    // Entferne die aktuelle Linie, falls vorhanden
    if (currentTrack) {
        map.removeLayer(currentTrack);
    }

    // Extrahiere die Koordinaten aus dem Array
    const coordinates = track.map(item => [item[1], item[2]]); // [Latitude, Longitude]

    // Erstelle eine Polyline mit den Koordinaten und einem grünen Stil
    currentTrack = L.polyline(coordinates, {
        color: 'green',
        weight: 3, // Linienstärke
        opacity: 1, // Transparenz
    });

    // Füge die Linie zur Karte hinzu
    currentTrack.addTo(map);
}

function showETA() {
    let dest = document.getElementById('icaoDest').value.toUpperCase();
    trackedIcaoDest = dest;
    calcEta(trackedPos, trackedSpeed, dest);
}

function validateLength(input) {
    if (input.value.length < 4 && trackedIcaoDest) {
        trackedIcaoDest = '';
        let icaoDestInput = document.getElementById('icaoDest');
        icaoDestInput.value = '';
        flightDistLine.remove();
    }
}


function calcEta(trackedPos, trackedSpeed, dest) {
    for (let i = 0; i < aerodromes.length; i++) {
        const ad = aerodromes[i]
        if (dest == ad.icaoCode) {
            const distMeters = calcDistance(ad.geometry.coordinates, trackedPos).toFixed(2);
            const distNm = distMeters / 1852;
            const flightTimeHours = distNm / trackedSpeed;
            const flightTimeMin = (flightTimeHours * 60).toFixed(0);
            trackedEta = flightTimeMin;
        }
    }
}

function drawDist(acftPos, adPos) {
    if (flightDistLine) {
        flightDistLine.remove();
    }
    flightDistLine = L.polyline(
        [acftPos, adPos], // Die Koordinaten der Linie (Start- und Endpunkt)
        {
            color: 'black', // Farbe der Linie
            weight: 3,         // Dicke der Linie
            dashArray: '5, 5', // Strichmuster: gestrichelt
        }
    );
    flightDistLine.addTo(map);
}


function calcDistance(adPos, trackedPos) {
    const adPosition = L.latLng(adPos[1], adPos[0]); // [longitude, latitude]
    const acftPosition = L.latLng(trackedPos[0], trackedPos[1]); // acftLat, acftLon
    const distance = acftPosition.distanceTo(adPosition);
    drawDist(acftPosition, adPosition);
    return distance;
}


function returnCorrectSvgForAcft(rotation, color, r, t) {
    if (helAcft.includes(t)) {
        return `
                <div style="transform: rotate(${rotation - 90}deg);">
       <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg height="24pt" width="24pt" viewBox="0 0 129 97" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M10.641,51.985l-7.247,-0c-1.608,-0 -2.914,-1.583 -2.914,-3.532c-0,-1.949 1.306,-3.531 2.914,-3.531l7.247,0l-0,-11.939l-2.222,-3.862l10.382,-0l-0,15.801l29.212,0c3.128,-4.619 12.252,-8.389 24.205,-10.161l-23.317,-28.254c-1.137,-1.378 -1.137,-3.615 0,-4.994c1.138,-1.378 2.984,-1.378 4.121,0l26.761,32.428c2.543,-0.18 5.169,-0.275 7.856,-0.275c2.686,0 5.313,0.095 7.855,0.275l26.761,-32.428c1.137,-1.378 2.984,-1.378 4.121,0c1.137,1.379 1.137,3.616 0,4.994l-23.316,28.254c14.881,2.206 25.377,7.509 25.377,13.692c-0,6.184 -10.496,11.486 -25.377,13.693l23.316,28.253c1.137,1.379 1.137,3.616 0,4.994c-1.137,1.378 -2.984,1.378 -4.121,0l-26.761,-32.427c-2.542,0.18 -5.169,0.274 -7.855,0.274c-2.687,0 -5.313,-0.094 -7.856,-0.274l-26.761,32.427c-1.137,1.378 -2.983,1.378 -4.121,0c-1.137,-1.378 -1.137,-3.615 0,-4.994l23.317,-28.253c-11.953,-1.772 -21.077,-5.542 -24.205,-10.161l-29.212,-0l-0,15.801l-10.609,0l2.449,-3.882l-0,-11.919Z" style="fill:${color};stroke:#000;stroke-width:0.96px;"/></svg>
        </div>
        `
    } else if (businessAcft.includes(t)) {
        return `
        <div style="transform: rotate(${rotation}deg);">
         <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg height="28pt" width="28pt" viewBox="0 0 344 344" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M154.91,200.479l-42.092,8.469l-106.729,46.327c-0,-0 -1.083,-15.428 1.162,-17.192c1.957,-1.538 57.124,-36.405 95.786,-61.975c11.126,-7.359 36.039,-27.192 51.873,-42.014l0,-60.961c0.416,-74.74 33.668,-76.238 33.244,-0l-0,60.977c15.835,14.82 40.758,34.644 51.876,41.998c38.663,25.57 93.829,60.437 95.787,61.975c2.244,1.764 1.162,17.192 1.162,17.192l-106.729,-46.327l-42.096,-8.464l-0,21.361c1.254,-3.172 4.226,-5.318 7.579,-5.127l2.413,0.138c4.301,0.245 7.61,4.243 7.385,8.922l-1.569,32.551c-0.059,1.232 -1.265,0.822 -3.05,0.112l-1.732,5.557l-8.423,-0.481l-1.229,-5.918c-0.516,0.14 -0.995,0.273 -1.424,0.375c-0.403,3.144 -3.239,8.131 -6.372,11.254c14.588,11.024 47.275,35.817 49.16,38.062c1.338,1.593 0.641,19.263 0.641,19.263l-55.039,-24.819c-0.625,4.385 -2.611,12.316 -4.96,12.316c-2.302,0 -4.254,-7.611 -4.921,-12.044l-54.436,24.547c0,-0 -0.696,-17.67 0.641,-19.263c1.87,-2.227 34.038,-26.633 48.798,-37.788c-3.23,-3.086 -6.215,-8.247 -6.651,-11.487c-0.473,-0.105 -1.014,-0.256 -1.602,-0.416l-1.23,5.918l-8.422,0.481l-1.732,-5.557c-1.786,0.71 -2.992,1.12 -3.051,-0.112l-1.568,-32.551c-0.226,-4.679 3.083,-8.677 7.384,-8.922l2.413,-0.138c3.519,-0.2 6.619,2.173 7.753,5.606l0,-21.845Z" style="fill:${color};stroke:#000;stroke-width:8px;"/><rect x="0" y="-0" width="343.068" height="343.068" style="fill:none;"/></svg>
        
        </div>
        `
    } else if (pistonAcft.includes(t)) {
        return `
        <div style="transform: rotate(${rotation + 90}deg);">
        <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg height="28pt" width="28pt" viewBox="0 0 375 375" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M59.724,188.988l-3.537,-0.97l3.535,-0.969c0.006,-27.991 2.095,-50.692 4.668,-50.692c2.493,-0 4.532,21.331 4.661,48.134l3.149,-0.863l0,-8.239l40.291,-6.337l8.621,0l0,-69.706l5.796,-88.053c0,0 0.611,-5.314 6.809,-5.83c8.604,-0.717 30.721,-0.426 30.721,-0.426l10.863,94.309l0,69.706l8.621,0l79.836,11.278l8.537,-51.482l25.727,-0.016l8.651,51.758l-14.048,3.818l25.563,3.61l-25.079,3.543l13.564,3.686l-8.651,51.758l-25.727,-0.016l-8.505,-51.286l-79.868,11.281l-8.621,0l0,69.707l-10.676,92.682c0,-0 -22.304,0.191 -30.908,-0.526c-6.198,-0.517 -6.915,-5.713 -6.915,-5.713l-5.69,-86.443l0,-69.707l-8.621,0l-40.291,-6.336l0,-8.239l-3.159,-0.866c-0.204,26.018 -2.21,46.475 -4.651,46.475c-2.521,-0 -4.578,-21.808 -4.666,-49.03Z" style="fill:${color};stroke:#000;stroke-width:8px;"/><rect x="0" y="0" width="374.375" height="374.375" style="fill:none;"/></svg>
         </div>
        
        `
    } else if (turboAcft.includes(t)) {
        return `
        <div style="transform: rotate(${rotation + 90}deg);">
        <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg height="28pt" width="28pt" viewBox="0 0 373 373" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M175.148,206.165l0,69.599l-10.676,92.682c0,0 -22.304,0.191 -30.907,-0.526c-6.199,-0.517 -6.915,-5.713 -6.915,-5.713l-5.69,-86.443l-0,-0.227l-10.657,-0c-2.434,-0 -5.724,-0.647 -9.14,-1.771c-0.747,15.047 -2.758,25.836 -5.119,25.836c-2.615,-0 -4.8,-13.236 -5.315,-30.834c-3.651,-2.49 -6.239,-5.466 -6.239,-8.576c-0,-3.118 2.6,-5.92 6.265,-8.19c0.559,-17.175 2.716,-29.989 5.289,-29.989c2.347,0 4.348,10.664 5.106,25.575c3.42,-0.972 6.716,-1.509 9.153,-1.509l10.657,-0l-0,-40.021l-8.621,-0l-31.987,-5.031c-2.572,-0.5 -5.454,-1.257 -8.305,-2.22c-1.83,-0.618 -3.646,-1.321 -5.359,-2.097c-1.889,-0.856 -3.652,-1.799 -5.166,-2.813c-2.993,-2.005 -5.014,-4.285 -5.12,-6.705c-0.003,-0.066 -0.004,-0.133 -0.004,-0.2c-0,-2.495 2.049,-4.846 5.126,-6.906c1.513,-1.013 3.274,-1.956 5.162,-2.811c1.713,-0.776 3.53,-1.48 5.361,-2.098c1.768,-0.598 3.548,-1.115 5.259,-1.542l35.033,-5.509l8.621,-0l-0,-40.221l-10.657,0c-2.434,0 -5.724,-0.646 -9.14,-1.771c-0.747,15.048 -2.758,25.837 -5.119,25.837c-2.615,-0 -4.8,-13.236 -5.315,-30.834c-3.651,-2.49 -6.239,-5.466 -6.239,-8.576c-0,-3.118 2.6,-5.92 6.265,-8.19c0.559,-17.175 2.716,-29.989 5.289,-29.989c2.347,0 4.348,10.664 5.106,25.575c3.42,-0.972 6.716,-1.51 9.153,-1.51l10.657,0l-0,-0.028l5.795,-88.052c0,-0 0.611,-5.314 6.81,-5.831c8.603,-0.717 30.72,-0.425 30.72,-0.425l10.863,94.308l0,69.357l7.978,0c5.903,0 46.523,2.45 81.337,6.453l7.679,-46.308l25.061,-0.016c-0.486,16.789 -0.722,33.766 -0.701,50.935c11.826,2.246 19.621,4.747 19.621,7.421c0,0.182 -0.036,0.364 -0.107,0.545c-0.082,0.209 -0.211,0.417 -0.384,0.625c-1.876,2.252 -8.998,4.432 -19.046,6.459c0.17,17.203 0.596,34.598 1.283,52.189l-25.727,-0.017l-7.821,-47.163c-34.783,4.383 -75.3,7.266 -81.195,7.266l-7.978,0Z" style="fill:${color};stroke:#000;stroke-width:8px;"/><rect x="0" y="0" width="372.521" height="372.521" style="fill:none;"/></svg>
         </div>
        
        `
    } else if (fourEngAcft.includes(t)) {
        return `
        <div style="transform: rotate(${rotation - 90}deg);">
        <?xml version="1.0" standalone="no"?>
        <svg xmlns="http://www.w3.org/2000/svg" height="32pt" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1920 1664" width="32pt">
        <path d="m6759 16622c-118-31-179-92-164-162 14-64 90-130 342-299 84-57 169-121 189-144s70-103 111-177c76-136 818-1504 1323-2440 150-278 314-577 365-665 146-253 327-589 461-857 139-278 169-342 179-387 4-17 10-31 14-31 16 0 161-383 161-425 0-11 6-29 14-40 22-33 426-1268 530-1620 43-147 86-314 86-334 0-12-68-13-512-9-708 8-2000-7-2745-32-343-11-710-21-817-23-107-1-198-5-202-10-11-11-104-9-104 3 0 6-20 10-45 10-31 0-45-4-45-14 0-8-15-16-37-20-57-9-63-8-63 14 0 17-7 20-50 20-47 0-50-2-50-25 0-21-5-25-27-25-16 0-38-3-50-6-20-5-23-2-23 20s-4 26-27 26c-51 0-73-11-73-35s-22-35-72-35c-24 0-28 4-28 26s-3 25-22 20c-13-3-35-6-50-6-24 0-28-4-28-30 0-25-4-30-35-36-45-8-65 0-65 26 0 19-4 20-37 15-61-10-63-12-57-43 6-27 4-29-33-35-57-10-63-9-63 12 0 27-12 32-60 25-39-6-41-9-38-37l3-31-175-38c-96-21-185-38-198-38-31 0-371 266-832 651-565 472-984 870-1277 1214-137 160-330 322-411 345-20 5-136 10-257 10-190 0-225-2-254-18-56-28-76-64-75-135 1-90 22-149 145-414 159-341 406-902 584-1323 43-102 120-279 170-395l92-210-66-7c-36-3-208-11-381-18-822-29-1514-84-1794-141-174-35-200-68-86-106 128-42 469-84 1125-138 139-11 942-55 1013-55 51 0 72-4 72-12 0-7-12-38-26-68s-79-179-144-330c-218-506-445-1009-585-1290-132-267-163-379-131-464 31-80 36-81 321-81 239 0 252 1 291 22 77 41 188 139 334 293 370 391 538 556 850 829 397 348 1111 921 1148 921 9 0 121-23 247-51 127-27 245-53 263-56 31-5 33-9 28-33-5-26-2-29 39-39 56-14 55-14 55 8 0 27 12 32 59 25 37-6 41-9 41-36 0-31 7-36 60-40 30-3 35 0 38 20 4 23 17 26 72 16 28-6 31-10 26-34-5-25-2-28 32-34 56-9 62-8 62 13 0 28 15 34 60 26 36-6 40-10 40-36 0-25 4-29 28-29 15 0 37-3 49-6 18-5 22-1 25 23 3 26 5 28 43 25 51-5 55-8 55-38 0-22 4-24 50-24 43 0 50 3 50 20s7 20 50 20 50-3 50-20 7-20 50-20c39 0 50 3 50 16 0 14 8 15 48 9 26-4 49-11 50-16 4-11 102-12 102-1 0 5 28 5 63 1 34-4 121-8 192-8 72-1 155-3 185-6 30-2 129-7 220-10s359-15 595-25c237-11 478-20 538-20 59 0 107-3 107-7 0-5 109-8 242-8 134 1 421-2 638-6s612-8 878-9c265-1 482-5 482-10 0-63-606-1883-633-1901-5-4-13-28-18-53-11-60-115-308-183-436-7-14-41-83-76-155-109-229-346-662-540-990-43-71-137-238-210-370s-139-244-146-248-18-25-24-46c-5-21-19-48-30-61-11-12-22-32-26-44-7-22-72-140-570-1034-175-315-328-589-338-610-55-107-452-812-472-839-14-18-123-98-243-178-121-80-237-165-259-189-69-75-66-132 10-189 83-62 214-79 368-47 181 37 688 216 803 283 110 65 363 340 484 525 194 300 654 876 1294 1622 130 151 245 285 256 298 26 29 123 33 123 5 0-19 39-55 125-116l60-42 472-3 472-3 35 32 36 31v295 295l-31 29-31 29-388 2-389 3 97 110c352 398 929 1045 1208 1355l330 365 127 3c106 2 127 0 127-12 0-19 119-120 173-148 42-21 47-21 482-15 242 4 453 7 468 7 17 0 37 10 52 26l25 27v299 300l-31 29-31 29h-450-450l109 118c59 64 308 335 553 602 584 638 666 719 855 852 83 58 169 117 191 132l42 27 1188-2c805-1 1252 2 1384 10 641 38 1148 105 1555 205 265 65 423 125 599 225 164 93 306 244 306 325 0 112-176 275-435 401-296 145-800 257-1500 334-449 50-853 64-2135 77-459 4-712 10-725 17-39 20-382 261-532 374-147 109-165 127-455 446-397 436-972 1077-976 1088-2 5 198 9 456 9h460l26 31 26 31v285 285l-29 29-29 29h-480-480l-58-44c-33-24-76-60-97-80l-38-36h-119-120l-197 223c-243 272-877 997-1192 1362l-234 270 391 3 391 2 30 31 31 31v290 290l-29 29-29 29h-469c-459 0-469 0-503-21-58-36-160-122-160-136 0-9-16-13-54-13h-54l-184 218c-639 756-1122 1369-1337 1697-137 209-323 425-458 532-98 77-656 292-875 337-97 20-155 19-239-2z" transform="matrix(.1 0 0 -.1 0 1664)" fill="${color}" stroke="black" stroke-width="2" vector-effect="non-scaling-stroke"/>
        </svg>
        </div>
        `
    }
    else {
        return `
                    <div style="transform: rotate(${rotation - 90}deg);">
        <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" height="28pt" width="28pt" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="135 0 798 768" enable-background="new 135 0 798 768" xml:space="preserve">
        <path fill="${color}" stroke="#000000" stroke-width="30" stroke-miterlimit="10" d="M151.7,388c0,1.6,30.9,9.5,30.9,9.5l-29.8,100.3
        c-1.2,5.2,4.9,6.4,4.9,6.4l17.2-0.4c9.2-1.6,15.6-8.4,15.6-8.4l59.2-86.4c15.3,7.7,169.7,13.4,240.6,16c33.2,1.2,34.8,3.6,34.8,3.6
        c0.7,4-2.8,35-4,44.9c-0.1,0-0.2,0.4-0.3,0.4h-14.2c-2.7,0-4.9,2.2-4.9,4.9c0,2.7,2.2,4.9,4.9,4.9h12.2c-2.7,8.7-7.3,22-11.9,34.8
        c-0.7-0.6-1.6-1-2.5-1h-8.7c-2.1,0-3.8,1.7-3.8,3.8c0,2.1,1.7,3.8,3.8,3.8h8.7c0.1,0,0.1,0,0.2,0c-5.4,14.8-10.2,28.3-11.2,30.5
        h-11.8c-2.7,0-4.9,2.2-4.9,4.9s2.2,4.9,4.9,4.9h8.4c-3.5,9.8-7.6,21.1-12.1,32.9c-0.4-0.2-0.8-0.2-1.2-0.2h-8.7
        c-1.8,0-3.3,1.5-3.3,3.3c0,1.8,1.5,3.3,3.3,3.3h7.5c-2.5,6.5-5,13.1-7.6,19.6h-7c-2.7,0-4.9,2.2-4.9,4.9s2.2,4.9,4.9,4.9h3.1
        C440.3,694,414,754.4,414,754.4c-5.2,12.4,11.6,8.3,11.6,8.3c22.4-9.2,34.5-22.4,34.5-22.4l143-228.6c0.7,0.9,5.6,7.3,8.6,7.9
        l48.3,0.3c0,0,5.2-3.2,5.2-4.8l-0.3-27.7c0,0-3.9-3.5-6.1-4.2l-37.1-1.2l31.2-49.9c6.8-6.8,14.2-6.8,14.2-6.8l171.7-1.1
        c75.3-11.1,84.8-35.3,84.8-35.3c2-7.5,0-9.5,0-9.5s-9.5-24.2-84.8-35.3L667,343c0,0-7.4,0-14.2-6.8l-31.2-49.9l37.1-1.2
        c2.3-0.6,6.1-4.2,6.1-4.2l0.3-27.7c0-1.6-5.2-4.8-5.2-4.8l-48.3,0.3c-3,0.6-7.9,7-8.6,7.9L460.1,28c0,0-12.1-13-34.5-22.2
        c0,0-16.8-3.5-11.6,8.9c0,0,26.3,61.4,49.9,121.3h-3.1c-2.7,0-4.9,2.2-4.9,4.9c0,2.7,2.2,4.9,4.9,4.9h7c2.6,6.5,5.2,13.1,7.6,19.6
        h-7.5c-1.8,0-3.3,1.5-3.3,3.3s1.5,3.3,3.3,3.3h8.7c0.4,0,0.8-0.1,1.2-0.2c4.5,11.9,8.7,22,12.1,32.9h-8.4c-2.7,0-4.9,2.2-4.9,4.9
        s2.2,4.9,4.9,4.9h11.8c1,2.2,5.9,15.7,11.2,30.5c-0.1,0-0.1,0-0.2,0h-8.7c-2.1,0-3.8,1.7-3.8,3.8s1.7,3.8,3.8,3.8h8.7
        c1,0,1.9-0.4,2.5-1c4.6,12.8,9.2,26.1,11.9,34.8h-12.2c-2.7,0-4.9,2.2-4.9,4.9s2.2,4.9,4.9,4.9h14.2c0.1,0,0.2-0.6,0.3-0.6
        c1.2,9.9,4.7,40.2,4,44.2c0,0-1.6,2.3-34.8,3.5c-71,2.6-225.3,8.3-240.6,15.9l-59.2-86.4c0,0-6.4-6.8-15.6-8.4l-17.2-0.4
        c0,0-6,1.2-4.8,6.4l29.7,100.3c0,0-35.1,10.4-35.1,12L151.7,388z"/>
        </svg>
    </div>
        
        `
    }
}


let pistonAcft = ['C172', 'C182', 'C152', 'P28A', 'SR20', 'H47', 'C150', 'PA22', 'C82R', 'AP32', 'C208', 'LA4', 'AA5', 'DV20', 'P28S', 'SR22', 'M20T', 'C42', 'TB20', 'VL3', 'ULAC', 'B36T', 'P32R', 'DIMO', 'PC12',
    'M20P', 'EFOX', 'PNR3', 'RV9', 'PIVI', 'NG5', 'SIRA', 'SHRK', 'RV14', 'S22T', 'SF25', 'DA40', 'A210', 'DR40', 'DIAMO02', 'AC11', 'B209', 'WT9', 'BW6T', 'DG80', 'BR23', 'PC9', 'TL30',
    'P208', 'P28T', 'PC21', 'TL20', 'BU31', 'GLID', 'F260', 'PRIM', 'PC7', 'Z42', 'DA50', 'TOBA', 'HR20', 'BREZ', 'TBM9', 'PA32', 'G115', 'BDOG', 'JAB4', 'SKRA', 'RV10', 'PA24', 'CRUZ', 'RV8', 'BE36', 'PA11',
    'AUJ2', 'G109', 'PA46', 'BE33', 'RV4', 'DR10', 'P28R', 'SUBA', 'P210', 'TWEN', 'YK52', 'RF6',         
];
let turboAcft = ['B350', 'L2T', 'F406', 'SF34', 'V22', 'BE30', 'C414', 'DA62', 'AT76', 'SW4', 'DA42', 'SC7', 'PA34', 'DA42', 'P68', 'BE9L', 'DHC6', 'AT75', 'AN30', 'C212', 'D228', 'C310', 'AT45',
    'PA31', 
];
let helAcft = ['EC35', 'EC45', 'EC30', 'EC55', 'H60', 'R44', 'MI8', 'A139', 'AS32', 'G2CA', 'EC20', 'B505', 'EC75', 'A169', 'A109', 'AS55', 'R22', 'AS3B', 'LYNX' ];
let twoEngAcft = ['B738', 'B737', 'A321', 'B752', 'A320', 'A333', 'B38M', 'A20N', 'B789', 'B77W', 'A21N', 'B789', 'B38M', 'B739', 'BCS3', 'B762', 'B763', 'A332', 'A319', 'B734', 'A359', 'B788', 'B77W', 'B77L', 'B763', 'A339',
    'B734', 'B78X', 'A35K', 'A332', 'E75L', 'E190', 'B753', 'E190', 'E295', 'B78X', 'E190',
];
let fourEngAcft = ['C17', 'A388', 'B748', 'B744', 'A343', 'A400'];
let businessAcft = ['LJ45', 'GL5T', 'CL60', 'GL7T', 'GLF5', 'GA6C', 'GLEX', 'C525', 'PRM1', 'F900', 'C700', 'C550', 'E55P', 'C56X', 'E55P', 'LJ35', 'PC24', 'C25C', 'C25A', 'CRJX', 'SF50', 'C680',
    'CRJ9', 'E145', 'E50P', 
]

function returnAircraftImg(alt) {
    if (alt === 'ground') {
        return '#454545';
    }
    if (alt <= 10000) {
        return '#75930F';
    }
    if (alt > 10000) {
        return '#08387F';
    }
}


function returnRotation(track, true_heading) {
    if (!true_heading == 'undefined°') {
        return true_heading;
    } else {
        return track;
    }
}


function toggleRadar() {
    toggleActBtnRadar();

    if (radarActive) {
        let trackedAcftDiv = document.getElementById('trackedAcft');
        trackedAcftDiv.classList.add('hiddenTrackedAcft');
        trackedHex = null;
        if (currentTrack) {
            map.removeLayer(currentTrack);
        }
        currentTrack = null;
        trackedAcftReg = 'nothing';
        if (flightDistLine) {
            flightDistLine.remove();
        }
        if (trackedIcaoDest) {
            trackedIcaoDest = '';
            let icaoDestInput = document.getElementById('icaoDest');
            icaoDestInput.value = '';
        }
        radarActive = false;
        aircraftLayer.clearLayers();
        stopRadarInterval();

    }
    else if (!radarActive) {
        radarActive = true;
        startRadarInterval();
    }


}

//flightradar24 Klon
let radarTimer = null; // Timer für das Radar-Intervall
let intervalId = null; // ID für setInterval
let startTime = null;  // Zeitstempel, wann die Karte bewegt oder gezoomt wurde
let radarActive = false;

// Startet das Radar-Intervall
function startRadarInterval() {
    if (radarActive) {
        if (!intervalId) {
            intervalId = setInterval(() => {
                updateAPIRequest();
            }, 1100);
        }
    }

}

// Stoppt das Radar-Intervall
function stopRadarInterval() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

// Hauptfunktion, die das Radar-Intervall behandelt
function radarInterval() {
    startRadarInterval();
}

// Funktion zur Kreisberechnung
function calculateCircle(lat1, lon1, lat2, lon2) {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const earthRadiusNM = 3440.065;

    const haversineDistance = (latA, lonA, latB, lonB) => {
        const dLat = toRadians(latB - latA);
        const dLon = toRadians(lonB - lonA);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(latA)) * Math.cos(toRadians(latB)) *
            Math.sin(dLon / 2) ** 2;
        return 2 * earthRadiusNM * Math.asin(Math.sqrt(a));
    };

    const centerLat = (lat1 + lat2) / 2;
    const centerLon = (lon1 + lon2) / 2;

    const distances = [
        haversineDistance(centerLat, centerLon, lat1, lon1),
        haversineDistance(centerLat, centerLon, lat1, lon2),
        haversineDistance(centerLat, centerLon, lat2, lon1),
        haversineDistance(centerLat, centerLon, lat2, lon2),
    ];

    let radius = Math.max(...distances);
    radius = Math.min(radius, 250);

    return { centerLat, centerLon, radius };
}

// API-Abruf
async function fetchAircraftData(centerLat, centerLon, radius) {
    const apiUrl = `https://api.adsb.one/v2/point/${centerLat}/${centerLon}/${radius}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API-Fehler: ${response.statusText}`);
        }
        const data = await response.json();

        // Entferne alte Marker
        aircraftLayer.clearLayers();
        console.log(data);

        // Füge neue Marker hinzu
        data.ac.forEach(acft => {
            const marker = createCustomMarker(acft);
            aircraftLayer.addLayer(marker);
        });
        if (trackedHex) {
            handleTrack(trackedHex);
        }
    } catch (error) {
        console.error("Fehler beim API-Abruf:", error);
    }
}








// Suche nach einem speziellen ACFT
function searchAcft() {
    let input = document.getElementById('searchInput').value;
    const loader = document.getElementById('loader');
    // Zeige den Loader an
    loader.style.display = 'inline-block';
    stopRadarInterval();
    // Timeout für die Suche
    setTimeout(() => {
        fetchAircraftDataCallsign(input);
        // Verstecke den Loader, wenn die Anfrage abgeschlossen ist
        loader.style.display = 'none';
    }, 1000);

}


// API-Abruf Callsign
async function fetchAircraftDataCallsign(callsign) {
    const apiUrl = `https://api.adsb.one/v2/callsign/${callsign}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API-Fehler: ${response.statusText}`);
        }
        const data = await response.json();

        // Entferne alte Marker
        aircraftLayer.clearLayers();
        console.log(data);

        // Hole das erste (und einzige) Flugzeug aus dem Array
        const acft = data.ac[0];
        if (acft) {
            trackedAcftReg = acft.flight;
            handleTrack(acft.hex);
            trackedHex = acft.hex;
            const marker = createCustomMarker(acft);
            aircraftLayer.addLayer(marker);

            // Setze die Ansicht auf die Position des Objekts
            map.setView([acft.lat, acft.lon], 10); // 10 ist die Zoom-Stufe
            radarActive = true;
            toggleActBtnRadar();
            // Starte Radar nach dem Timeout
            setTimeout(() => {
                startRadarInterval();
            }, 1000);
        } else {
            alert('Es wurde kein ACFT gefunden')

            setTimeout(() => {
                startRadarInterval();
            }, 1000);


        }
    } catch (error) {
        console.error("Fehler beim API-Abruf:", error);
    }
}


// Aktualisiere die API-Anfrage
function updateAPIRequest() {
    const bounds = map.getBounds(); // Grenzen der aktuellen Ansicht abrufen
    const { lat: lat1, lng: lon1 } = bounds.getSouthWest(); // Südwest-Ecke
    const { lat: lat2, lng: lon2 } = bounds.getNorthEast(); // Nordost-Ecke

    const { centerLat, centerLon, radius } = calculateCircle(lat1, lon1, lat2, lon2);

    // Führe die API-Anfrage aus
    fetchAircraftData(centerLat, centerLon, radius);
}

// Event: Karte wird verschoben
map.on('move', () => {
    stopRadarInterval(); // Radar-Intervall stoppen

    if (startTime === null) {
        startTime = Date.now(); // Startzeit setzen, wenn die Bewegung beginnt
    }

    if (radarTimer) {
        clearTimeout(radarTimer); // Timer zurücksetzen, wenn die Karte verschoben wird
    }
});

// Event: Verschieben der Karte beendet
map.on('moveend', () => {
    const elapsedTime = Date.now() - startTime; // Berechne die vergangene Zeit
    startTime = null; // Reset der Startzeit, damit sie für zukünftige Bewegungen bereit ist

    const adjustedTimeout = Math.max(0, 1000 - elapsedTime); // Timeout anpassen (maximale Wartezeit: 1 Sekunde)

    // Timer starten, der das Radar-Intervall nach der berechneten Zeit neu startet
    radarTimer = setTimeout(() => {
        startRadarInterval();
    }, adjustedTimeout);
});

// Event: Zoom wird verändert
map.on('zoom', () => {
    stopRadarInterval(); // Radar-Intervall stoppen

    if (startTime === null) {
        startTime = Date.now(); // Startzeit setzen, wenn der Zoom beginnt
    }

    if (radarTimer) {
        clearTimeout(radarTimer); // Timer zurücksetzen, wenn der Zoom verändert wird
    }
});

// Event: Zoom beendet
map.on('zoomend', () => {
    const elapsedTime = Date.now() - startTime; // Berechne die vergangene Zeit
    startTime = null; // Reset der Startzeit, damit sie für zukünftige Zooms bereit ist
    const adjustedTimeout = Math.max(0, 1000 - elapsedTime); // Timeout anpassen (maximale Wartezeit: 1 Sekunde)

    // Timer starten, der das Radar-Intervall nach der berechneten Zeit neu startet
    radarTimer = setTimeout(() => {
        startRadarInterval();
    }, adjustedTimeout);
});












let fisAirspace = [];
let edrAirspace = [];
let eddAirspace = [];
let ctrAirspace = [];
let rmzAirspace = [];
let firAirspace = [];
let gaforAirspace = [];
let pjeAirspace = [];
let tmzAirspace = [];
let atzAirspace = [];

const airspaceStates = {
    fis: { name: 'fisAirspace', airspace: fisAirspace, info: 'null' },
    edr: { name: 'edrAirspace', airspace: edrAirspace, info: 'edrInfo' },
    edd: { name: 'eddAirspace', airspace: eddAirspace, info: 'eddInfo' },
    ctr: { name: 'ctrAirspace', airspace: ctrAirspace, info: 'ctrInfo' },
    rmz: { name: 'rmzAirspace', airspace: rmzAirspace, info: 'rmzInfo' },
    fir: { name: 'firAirspace', airspace: firAirspace, info: 'null' },
    gafor: { name: 'gaforAirspace', airspace: gaforAirspace, info: 'null' },
    pje: { name: 'pjeAirspace', airspace: pjeAirspace, info: 'pjeInfo' },
    tmz: { name: 'tmzAirspace', airspace: tmzAirspace, info: 'tmzInfo' },
    atz: { name: 'atzAirspace', airspace: atzAirspace, info: 'null' },
};

// Objekt zum Speichern der Polygone nach AirspaceKey
let polygonLayers = {};

// Toggle-Funktion zum Hinzufügen und Entfernen von Polygonen
async function togglePolygons(airspaceKey) {
    let gaforCalc = document.getElementById('calcGaforRadius');
    toggleActBtn(airspaceKey);
    // Prüfen, ob es Polygone für den aktuellen Key gibt
    if (polygonLayers[airspaceKey] && polygonLayers[airspaceKey].length > 0) {
        // Entferne bestehende Polygone für diesen Key
        polygonLayers[airspaceKey].forEach(polygon => polygon.removeFromMap());
        polygonLayers[airspaceKey] = [];
        if (airspaceKey === 'gafor') {
            gaforCalc.style.display = 'none';
            if (currentGaforCircle) {
                currentGaforCircle.removeFromMap();
            }
        }
        return;
    }


    if (airspaceKey === 'gafor') {
        let gaforInput = document.getElementById('gaforNumbers');
        gaforInput.value = '';
        let gaforRadius = document.getElementById('gaforRadius');
        gaforRadius.innerHTML = `<span id="gaforRadius">Radius:</span>`;
        let gaforCenter = document.getElementById('gaforCenter');
        gaforCenter.innerHTML = `<span id="gaforCenter">Center:</span>`;
        gaforCalc.style.display = 'flex';
    }

    let airspaceArray = airspaceStates[airspaceKey].airspace;
    let data = await getData(airspaceStates[airspaceKey].name);


    airspaceStates[airspaceKey].airspace = data;
    airspaceArray = data;

    if (airspaceStates[airspaceKey].info !== 'null') {
        let info = airspaceStates[airspaceKey].info;
        await getData(info);
    }




    // Initialisiere, falls noch nicht vorhanden
    if (!polygonLayers[airspaceKey]) {

        polygonLayers[airspaceKey] = [];
    }

    if (airspaceArray === ctrAirspace) {
        processItems(airspaceArray, airspaceKey, map, polygonLayers[airspaceKey]);
    } else {
        processItems([...airspaceArray].reverse(), airspaceKey, map, polygonLayers[airspaceKey]);
    }
}

function toggleActBtn(id) {
    let button = document.getElementById(id);
    button.classList.toggle('bgMapButtonActive');
}

function toggleActBtnRadar() {
    let button = document.getElementById('radar');
    button.classList.toggle('radarBtnActive');
}

const DB_NAME = 'cacheDatabase';
const STORE_NAME = 'cacheStore';

// IndexedDB initialisieren
async function getDB() {
    return idb.openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        },
    });
}

// Daten aus IndexedDB abrufen
async function getFromIndexedDB(key, maxAge = 2 * 60 * 60 * 1000) {
    const db = await getDB();
    const cachedItem = await db.get(STORE_NAME, key);

    if (!cachedItem) return null;

    const { data, timestamp } = cachedItem;
    const age = Date.now() - timestamp;

    if (age < maxAge) {
        return data;
    }

    // Cache ist abgelaufen
    await db.delete(STORE_NAME, key);
    return null;
}

// Daten in IndexedDB speichern
async function saveToIndexedDB(key, data) {
    const db = await getDB();
    const payload = {
        key,
        data,
        timestamp: Date.now(),
    };
    await db.put(STORE_NAME, payload);
}

async function getData(key) {
    const cachedData = await getFromIndexedDB(key);
    if (cachedData) {
        console.log(`Daten für ${key} aus dem Cache geladen.`);

        // Verarbeite die gecachten Daten, um die Variablen entsprechend zu setzen
        processDataByKey(key, cachedData);
        return cachedData;
    }

    const firebaseURL = 'https://aromaps-3b242-default-rtdb.europe-west1.firebasedatabase.app/';
    const url = `${firebaseURL}/${key}.json`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
        }
        let data = await response.json();

        if (data !== null) {
            if (data[0]?.features) {
                await saveToIndexedDB(key, data[0].features);
                data = data[0].features;
            } else {
                await saveToIndexedDB(key, data);
            }

            // Verarbeite die Daten entsprechend dem Key
            processDataByKey(key, data);
            return data;
        }

        throw `Keine Daten für Key: ${key} gefunden.`;
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
        throw error;
    }
}

function processDataByKey(key, data) {
    if (key === 'aerodromes') {
        aerodromes = data;
        markerData.aerodrome.source = data;
    } else if (key === 'navAids') {
        navAids = data;
        markerData.navaid.source = data;
    } else if (key === 'obstacles') {
        obstacles = data;
        markerData.obstacle.source = data;
    } else if (key === 'fisAirspace') {
        fisAirspace = data;
    } else if (key === 'edrAirspace') {
        edrAirspace = data;
    } else if (key === 'eddAirspace') {
        eddAirspace = data;
    } else if (key === 'ctrAirspace') {
        ctrAirspace = data;
    } else if (key === 'aipInfo') {
        aipInfo = data;
    } else if (key === 'rmzAirspace') {
        rmzAirspace = data[0]?.features;
    } else if (key === 'firAirspace') {
        firAirspace = data[0]?.features;
    } else if (key === 'gaforAirspace') {
        gaforAirspace = data[0]?.features;
    } else if (key === 'pjeAirspace') {
        pjeAirspace = data[0]?.features;
    } else if (key === 'tmzAirspace') {
        tmzAirspace = data[0]?.features;
    } else if (key === 'atzAirspace') {
        atzAirspace = data[0]?.features;
    } else if (key === 'ctrInfo') {
        ctrInfo = data;
        console.log(data);

    } else if (key === 'eddInfo') {
        eddInfo = data;
        console.log(data);

    } else if (key === 'edrInfo') {
        edrInfo = data;
        console.log(data);

    } else if (key === 'rmzInfo') {
        rmzInfo = data;
        console.log(data);

    } else if (key === 'tmzInfo') {
        tmzInfo = data;
        console.log(data);

    } else if (key === 'pjeInfo') {
        pjeInfo = data;
        console.log(data);

    }
}




function processItems(items, airspaceKey, map, layerArray) {
    if (airspaceKey === 'edr' || airspaceKey === 'edd' || airspaceKey === 'ctr') {
        // Normales Durchiterieren von vorne
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.geometry && (item.geometry.type === "Polygon" || item.geometry.type === "MultiPolygon")) {
                let polygon;
                if (airspaceKey === 'edr') {
                    polygon = new EdrAirspace(item.geometry, item.name, 'null', map, layerArray);
                } else if (airspaceKey === 'edd') {
                    polygon = new EddAirspace(item.geometry, item.name, 'null', map, layerArray);
                } else if (airspaceKey === 'ctr') {
                    polygon = new CtrAirspace(item.geometry, item.name, 'null', map, layerArray);
                }
                polygon.addToMap();
                layerArray.push(polygon);
            }
        }
    } else {
        // Rückwärts Durchiterieren
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];

            if (item.geometry && (item.geometry.type === "Polygon" || item.geometry.type === "MultiPolygon")) {
                let polygon;
                switch (airspaceKey) {
                    case 'fis':
                        polygon = new FisAirspace(item.geometry, item.name, 'null', map, layerArray);
                        break;
                    case 'ctr':
                        polygon = new CtrAirspace(item.geometry, item.name, 'null', map, layerArray);
                        break;
                    case 'rmz':
                        polygon = new RmzAirspace(item.geometry, item.properties.Name, item.properties.Ident, map, layerArray);
                        break;
                    case 'fir':
                        polygon = new FirAirspace(item.geometry, item.properties.Ident, 'null', map, layerArray);
                        break;
                    case 'gafor':
                        polygon = new GaforAirspace(item.geometry, item.properties.gafor_nummer, 'null', map, layerArray);
                        break;
                    case 'pje':
                        polygon = new PjeAirspace(item.geometry, item.properties.Name, item.properties.Ident, map, layerArray);
                        break;
                    case 'tmz':
                        polygon = new TmzAirspace(item.geometry, item.properties.Name, item.properties.Ident, map, layerArray);
                        break;
                    case 'atz':
                        polygon = new AtzAirspace(item.geometry, item.properties.Name, item.properties.Ident, map, layerArray);
                        break;
                }
                polygon.addToMap();
                layerArray.push(polygon);
            }
        }
    }
}







// Arrays und Statusvariablen für Marker
const markerData = {
    navaid: { markers: [], added: false, source: navAids },
    aerodrome: { markers: [], added: false, source: aerodromes },
    obstacle: { markers: [], added: false, source: obstacles }
};


function toggleMarkers(key) {
    toggleActBtn(key);
    if (!markerData[key]) {
        console.warn(`Unbekannter Schlüssel: ${key}`);
        return;
    }

    const { markers, added, source } = markerData[key];

    if (!added) {
        if (key === "obstacle") {
            // Cluster-Layer nur für Obstacle erstellen
            const markerClusterGroup = L.markerClusterGroup();

            // Events für Tooltips hinzufügen
            markerClusterGroup.on('clustermouseover', function (e) {
                const cluster = e.layer; // Aktueller Cluster
                const markers = cluster.getAllChildMarkers(); // Alle Marker im Cluster
                const parentDesignators = [...new Set(markers.map(marker => marker.options.parentDesignator))]; // Einzigartige Parent Designators

                // Tooltip mit Parent Designators
                const tooltipContent = parentDesignators.join('<br>');
                cluster.bindTooltip(tooltipContent).openTooltip();
            });

            markerData[key].markers = source
                .filter(data => data.geoLat && data.geoLong) // Sicherstellen, dass Koordinaten vorhanden sind
                .map(data => {
                    // Obstacle-Objekt erstellen
                    const obstacle = new Obstacle(
                        data.geoLat,
                        data.geoLong,
                        data.txtName,
                        data['Parent Designator'],
                        data['Type of Obstacle'],
                        data.LIGHTED,
                        data.DayMarking,
                        data['ValElev (ft)'],
                        data['valHgt (ft)'],
                        map
                    );

                    // Marker-Eigenschaften erweitern (für Tooltip)
                    obstacle.marker.options.parentDesignator = data['Parent Designator'];

                    // Marker zum Cluster-Layer hinzufügen
                    obstacle.addToCluster(markerClusterGroup);

                    return obstacle;
                });

            map.addLayer(markerClusterGroup); // Cluster-Layer zur Karte hinzufügen
            markerData[key].clusterLayer = markerClusterGroup; // Cluster-Layer speichern
        } else {


            // Standard-Logik für Navaid und Aerodrome
            markerData[key].markers = source
                .filter(data => key !== "aerodrome" || data.icaoCode) // Filter für Aerodromes mit icaoCode
                .map(data => {
                    let item;
                    if (key === "aerodrome") {
                        item = new Aerodrome(data.geometry, data.name, map, data.icaoCode, data.runways);
                    } else if (key === "navaid") {
                        item = new Navaid(data.geometry.coordinates[1], data.geometry.coordinates[0], data.properties.txtname, map, data.properties['select-source-layer'], data.properties.ident, data.properties.charted || data.properties.dme_charted, data.properties.icaocode);
                    }
                    item.addToMap(); // Marker wird direkt zur Karte hinzugefügt

                    return item;
                });
        }
    } else {
        if (key === "obstacle") {
            // Cluster-Layer entfernen
            map.removeLayer(markerData[key].clusterLayer);
            markerData[key].markers = [];
        } else {
            // Marker für Navaid und Aerodrome entfernen
            markers.forEach(item => item.marker && map.removeLayer(item.marker));
            markerData[key].markers = [];
        }
    }

    markerData[key].added = !added;
}









async function getWeather(weatherType) {
    try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Setze den korrekten Pfad je nach Wettertyp
        if (weatherType === 'weather') {
            weatherPath = data.radar.past[data.radar.past.length - 1].path;
        } else if (weatherType === 'clouds') {
            weatherPath = data.satellite.infrared[data.satellite.infrared.length - 1].path;
        }

        // Layer für Weather oder Clouds erstellen
        if (weatherType === 'weather' && !rainviewerWeather) {
            rainviewerWeather = L.tileLayer('https://tilecache.rainviewer.com' + weatherPath + '/512/{z}/{x}/{y}/2/1_1.png', {
                minZoom: 0,
                maxZoom: 20,
                ext: 'png',
            });

            // Layer in mapStates aktualisieren
            mapStates.weatherLayers.rainviewerWeather.layer = rainviewerWeather;
        } else if (weatherType === 'clouds' && !rainviewerClouds) {
            rainviewerClouds = L.tileLayer('https://tilecache.rainviewer.com' + weatherPath + '/256/{z}/{x}/{y}/0/1_0.png', {
                minZoom: 0,
                maxZoom: 20,
                ext: 'png',
            });

            // Layer in mapStates aktualisieren
            mapStates.weatherLayers.rainviewerClouds.layer = rainviewerClouds;
        } else {
            // Aktualisiere die URL des bestehenden Layers, falls nötig
            if (weatherType === 'weather') {
                rainviewerWeather.setUrl('https://tilecache.rainviewer.com' + weatherPath + '/512/{z}/{x}/{y}/2/1_1.png');
            } else if (weatherType === 'clouds') {
                rainviewerClouds.setUrl('https://tilecache.rainviewer.com' + weatherPath + '/256/{z}/{x}/{y}/0/1_0.png');
            }
        }
        toggleMap((weatherType === 'weather' ? 'rainviewerWeather' : 'rainviewerClouds'), 'weatherLayers');
    } catch (error) {
        console.error(`Fehler: ${error.message}`);
    }
}
let currentAdressGeoJSONLayer = null;
let currentAddresses = [];

// Adress API
async function searchAdress() {
    currentAddresses = [];
    const searchQuery = document.getElementById('searchInput').value;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&addressdetails=1&limit=5&polygon_geojson=1`);
    if (!response.ok) {
        console.error('Fehler beim Abrufen der Adresse', response.statusText);
        return;
    }
    const data = await response.json();
    currentAddresses = data;
    displayAddressList(); // Ergebnisse anzeigen

}

// Liste der Adressen unter dem Inputfeld anzeigen
function displayAddressList() {
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = ''; // Vorherige Ergebnisse löschen
    addressList.style.display = 'flex'; // Liste sichtbar machen
    if (currentAddresses.length > 0) {
        currentAddresses.forEach((addressObj, index) => {
            addressList.innerHTML += `
            <button class="searchButton" onclick="handleAddressClick(${index})">
                ${addressObj.display_name}
            </button>
            `;
        });
    } else {
        addressList.innerHTML += `
        <span class="addressError">Es wurde keine Adresse gefunden.</span>
        `
        setTimeout(() => {
            addressList.style.display = 'none';
        }, 1000);
    }


}

// Wenn auf eine Adresse geklickt wird
async function handleAddressClick(index) {
    let searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    const addressList = document.getElementById('addressList');
    addressList.style.display = 'none';
    // Wenn es einen aktuellen GeoJSON-Layer oder Marker gibt, diesen entfernen
    if (currentAdressGeoJSONLayer) {
        map.removeLayer(currentAdressGeoJSONLayer);
    }
    let address = currentAddresses[index];
    // Geodaten aus der Antwort
    const geojson = address.geojson;
    const lat = parseFloat(address.lat); // Sicherstellen, dass es als Zahl behandelt wird
    const lon = parseFloat(address.lon); // Sicherstellen, dass es als Zahl behandelt wird

    // Popup-Inhalt
    const popupContent = `<strong>Adresse:</strong> ${address.display_name}`;

    // Funktion, um Popups an GeoJSON-Features zu binden
    function onEachFeature(feature, layer) {
        layer.bindPopup(popupContent); // Popup direkt an das GeoJSON-Feature binden
    }

    // Neuen GeoJSON-Layer zur Karte hinzufügen
    currentAdressGeoJSONLayer = L.geoJSON(geojson, {
        onEachFeature: onEachFeature
    }).addTo(map);

    // Zoom-Level je nach GeoJSON-Typ anpassen
    let zoomLevel = 12; // Standard Zoom-Level
    if (geojson.type !== 'Polygon' && geojson.type !== 'MultiPolygon') {
        zoomLevel = 18; // Wenn es kein Polygon ist, Zoom-Level auf 15 setzen

        // Popup nach dem Hinzufügen des GeoJSON-Layers öffnen
        currentAdressGeoJSONLayer.getLayers()[0].openPopup();
    }
    map.setView([lat, lon], zoomLevel); // Karte zentrieren und Zoom-Level setzen
}







function setSearchCat(cat) {
    let searchInput = document.getElementById('searchInput');
    searchInput.placeholder = returnSearchPlaceholder(cat);
    let head = document.getElementById('searchCategoryHeadline');
    head.innerHTML = cat;
    searchCat = cat;
}


function returnSearchPlaceholder(cat) {
    if (cat === 'Position') {
        return `Suche nach Adresse oder Koordinate`;
    } else {
        return `Suche nach ${cat}`;

    }
}


function validateCoordinates(northPart, eastPart) {
    // Prüfen und korrigieren von Minuten und Sekunden für den nördlichen Teil
    if (northPart.length >= 4) {
        const minutes = parseInt(northPart.substr(-4, 2));
        if (minutes >= 60) {
            alert("Ungültige Minuten im Breitengrad (muss < 60 sein)");
            return false;
        }
    }
    if (northPart.length === 6) {
        const seconds = parseInt(northPart.substr(-2));
        if (seconds >= 60) {
            alert("Ungültige Sekunden im Breitengrad (muss < 60 sein)");
            return false;
        }
    }

    // Prüfen und korrigieren von Minuten und Sekunden für den östlichen Teil
    if (eastPart.length >= 5) {
        const minutes = parseInt(eastPart.substr(-4, 2));
        if (minutes >= 60) {
            alert("Ungültige Minuten im Längengrad (muss < 60 sein)");
            return false;
        }
    }
    if (eastPart.length === 7) {
        const seconds = parseInt(eastPart.substr(-2));
        if (seconds >= 60) {
            alert("Ungültige Sekunden im Längengrad (muss < 60 sein)");
            return false;
        }
    }

    return true;
}

async function search() {
    const input = document.getElementById('searchInput').value.toUpperCase();
    const dmsPattern = /^(\d{4,6})[NSns](\d{5,7})[EWew]$/;

    if (dmsPattern.test(input.replace(/\s/g, ''))) {
        let cleanInput = input.replace(/\s/g, '');
        let northPart = cleanInput.match(/(\d{4,6})[NSns]/)[1];
        let eastPart = cleanInput.match(/(\d{5,7})[EWew]/)[1];

        if (!validateCoordinates(northPart, eastPart)) {
            return;
        }

        while (northPart.length < 6) {
            northPart += '0';
        }
        while (eastPart.length < 7) {
            eastPart += '0';
        }

        const formattedInput = `${northPart}${cleanInput.match(/[NSns]/)[0].toUpperCase()}${eastPart}${cleanInput.match(/[EWew]/)[0].toUpperCase()}`;
        document.getElementById('searchInput').value = formattedInput;

        searchCoordinate();
    } else if (searchCat === 'Callsign') {
        searchAcft();
    } else if (searchCat === 'Flugplatz') {
        // Prüfen ob Flugplatzdaten geladen sind
        if (!aerodromes || aerodromes.length === 0) {
            await getData('aerodromes');
        }

        // Suche nach passenden Flugplätzen
        const matchingAerodromes = aerodromes.filter(ad => {
            const name = ad.name ? ad.name.toUpperCase() : '';
            const icao = ad.icaoCode ? ad.icaoCode.toUpperCase() : '';
            const searchTerm = input.toUpperCase();
            return name.includes(searchTerm) || icao.includes(searchTerm);
        });

        // Anzeigen der Ergebnisse
        displayAerodromeList(matchingAerodromes);
    } else if (searchCat === 'ED-R') {
        // Prüfen ob ED-R Daten geladen sind
        if (!edrAirspace || edrAirspace.length === 0) {
            await getData('edrAirspace');
            await getData('edrInfo');
        }

        // Suche nach passenden ED-Rs
        const matchingEdrs = edrAirspace.filter(edr => {
            const name = edr.name ? edr.name.toUpperCase() : '';
            const searchTerm = input.toUpperCase();
            return name.includes(searchTerm);
        });

        // Anzeigen der Ergebnisse
        displayEdrList(matchingEdrs);
    }  else if (searchCat === 'ED-D') {
        // Prüfen ob ED-D Daten geladen sind
        if (!eddAirspace || eddAirspace.length === 0) {
            await getData('eddAirspace');
            await getData('eddInfo');
        }

        // Suche nach passenden ED-Ds
        const matchingEdds = eddAirspace.filter(edd => {
            const name = edd.name ? edd.name.toUpperCase() : '';
            const searchTerm = input.toUpperCase();
            return name.includes(searchTerm);
        });

        // Anzeigen der Ergebnisse
        displayEddList(matchingEdds);
    } else if (searchCat === 'RMZ') {
        // Prüfen ob RMZ Daten geladen sind
        if (!rmzAirspace || rmzAirspace.length === 0) {
            await getData('rmzAirspace');
            await getData('rmzInfo');
        }
    
        // Suche nach passenden RMZs
        const matchingRmzs = rmzAirspace.filter(rmz => {
            const name = rmz.properties.Name ? rmz.properties.Name.toUpperCase() : '';
            const searchTerm = input.toUpperCase();
            return name.includes(searchTerm);
        });
    
        // Anzeigen der Ergebnisse
        displayRmzList(matchingRmzs);
    } else {
        searchAdress();
    }
}

function displayAerodromeList(matchingAerodromes) {
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = '';
    addressList.style.display = 'flex';

    if (matchingAerodromes.length > 0) {
        const limitedResults = matchingAerodromes.slice(0, 10);

        limitedResults.forEach((aerodrome) => {
            if (!aerodrome.icaoCode) {
                addressList.innerHTML += `
                <button class="searchButton">
                     ${aerodrome.name}
                </button>
                `;
            } else {
                addressList.innerHTML += `
                <button class="searchButton" onclick="goToAd('${aerodrome.icaoCode}', ${aerodrome.geometry.coordinates[1]}, ${aerodrome.geometry.coordinates[0]})">
                     ${aerodrome.name} - ${aerodrome.icaoCode}
                </button>
                `;
            }
        });
    } else {
        addressList.innerHTML += `
        <span class="addressError">Es wurde kein Flugplatz gefunden.</span>
        `;
        setTimeout(() => {
            addressList.style.display = 'none';
        }, 1000);
    }
}

function goToAd(icaoCode, lat, lon) {
    const addressList = document.getElementById('addressList');
    addressList.style.display = 'none';

    // Prüfe ob der Aerodrome Layer aktiv ist
    if (!markerData.aerodrome.added) {
        toggleMarkers('aerodrome');
    }

    // Setze die Kartenansicht auf die Position des Flugplatzes
    map.setView([lat, lon], 13);
}



function displayEdrList(matchingEdrs) {
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = '';
    addressList.style.display = 'flex';

    if (matchingEdrs.length > 0) {
        const limitedResults = matchingEdrs.slice(0, 10);

        limitedResults.forEach((edr) => {
            addressList.innerHTML += `
            <button class="searchButton" onclick="goToEdr('${edr.name}', ${edr.geometry.coordinates[0][0][1]}, ${edr.geometry.coordinates[0][0][0]})">
                 ${edr.name}
            </button>
            `;
        });
    } else {
        addressList.innerHTML += `
        <span class="addressError">Es wurde kein ED-R gefunden.</span>
        `;
        setTimeout(() => {
            addressList.style.display = 'none';
        }, 1000);
    }
}

function goToEdr(name, lat, lon) {
    const addressList = document.getElementById('addressList');
    addressList.style.display = 'none';

    // Prüfe ob der ED-R Layer aktiv ist
    if (!polygonLayers['edr'] || polygonLayers['edr'].length === 0) {
        togglePolygons('edr');
    }

    // Setze die Kartenansicht auf die Position des ED-R
    map.setView([lat, lon], 11);
}


function displayEddList(matchingEdds) {
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = '';
    addressList.style.display = 'flex';

    if (matchingEdds.length > 0) {
        const limitedResults = matchingEdds.slice(0, 10);

        limitedResults.forEach((edd) => {
            addressList.innerHTML += `
            <button class="searchButton" onclick="goToEdd('${edd.name}', ${edd.geometry.coordinates[0][0][1]}, ${edd.geometry.coordinates[0][0][0]})">
                 ${edd.name}
            </button>
            `;
        });
    } else {
        addressList.innerHTML += `
        <span class="addressError">Es wurde kein ED-D gefunden.</span>
        `;
        setTimeout(() => {
            addressList.style.display = 'none';
        }, 1000);
    }
}

function goToEdd(name, lat, lon) {
    const addressList = document.getElementById('addressList');
    addressList.style.display = 'none';

    // Prüfe ob der ED-D Layer aktiv ist
    if (!polygonLayers['edd'] || polygonLayers['edd'].length === 0) {
        togglePolygons('edd');
    }

    // Setze die Kartenansicht auf die Position des ED-D
    map.setView([lat, lon], 9);
}

function displayRmzList(matchingRmzs) {
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = '';
    addressList.style.display = 'flex';

    if (matchingRmzs.length > 0) {
        const limitedResults = matchingRmzs.slice(0, 10);

        limitedResults.forEach((rmz) => {
            addressList.innerHTML += `
            <button class="searchButton" onclick="goToRmz('${rmz.properties.Name}', ${rmz.geometry.coordinates[0][0][1]}, ${rmz.geometry.coordinates[0][0][0]})">
                 ${rmz.properties.Name}
            </button>
            `;
        });
    } else {
        addressList.innerHTML += `
        <span class="addressError">Es wurde keine RMZ gefunden.</span>
        `;
        setTimeout(() => {
            addressList.style.display = 'none';
        }, 1000);
    }
}

function goToRmz(name, lat, lon) {
    const addressList = document.getElementById('addressList');
    addressList.style.display = 'none';

    // Prüfe ob der RMZ Layer aktiv ist
    if (!polygonLayers['rmz'] || polygonLayers['rmz'].length === 0) {
        togglePolygons('rmz');
    }

    // Setze die Kartenansicht auf die Position der RMZ
    map.setView([lat, lon], 11);
}




function initializeImageInteractions() {
    const img = document.querySelector('#currentAipImg'); // Finde das Bild, nachdem es geladen wurde

    if (!img) {
        console.error('Das Bild wurde nicht gefunden. Event-Listener konnten nicht hinzugefügt werden.');
        return;
    }

    let scale = 1;
    let isDragging = false;
    let startX, startY;
    let translateX = 0;
    let translateY = 0;

    // Standard-Drag-and-Drop-Verhalten des Browsers deaktivieren
    img.addEventListener('dragstart', (event) => {
        event.preventDefault();
    });

    // Zoom in/out on scroll
    img.addEventListener('wheel', (event) => {
        event.preventDefault();
        const zoomFactor = 0.1;
        const maxScale = 5;
        const minScale = 0.1;

        // Berechne neuen Zoom
        scale += event.deltaY > 0 ? -zoomFactor : zoomFactor;
        scale = Math.min(maxScale, Math.max(minScale, scale));

        // Wende Zoom auf das Bild an
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    });

    // Drag and drop functionality
    img.addEventListener('mousedown', (event) => {
        isDragging = true;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;
        img.style.cursor = 'grabbing';
    });

    img.addEventListener('mousemove', (event) => {
        if (!isDragging) return;

        // Berechne neue Position
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;

        // Wende Position auf das Bild an
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    });

    img.addEventListener('mouseup', () => {
        isDragging = false;
        img.style.cursor = 'grab';
    });

    img.addEventListener('mouseleave', () => {
        isDragging = false;
        img.style.cursor = 'grab';
    });

    // Funktion zum Zurücksetzen des Zooms und der Position
    function resetImageState() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        img.style.transform = `translate(0px, 0px) scale(1)`;
    }

    // Exponiere die Reset-Funktion für externe Nutzung
    window.resetImageState = resetImageState;
}



//show actual position as coordinate in DMS
// Hilfsfunktion zur Umwandlung von Dezimalgrad in DMS
function toDMS(coordinate, isLatitude) {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    const direction = isLatitude
        ? coordinate >= 0 ? 'N' : 'S'
        : coordinate >= 0 ? 'E' : 'W';

    return `${degrees}° ${minutes}' ${seconds}''${direction}`;
}

// Funktion zum Anzeigen der aktuellen Mauskoordinaten in DMS
function showCursorCoordinates(map) {
    const displayDiv = document.getElementById('showActualPos');
    if (!displayDiv) {
        console.error("Element mit der ID 'showActualPos' nicht gefunden.");
        return;
    }

    map.on('mousemove', function (event) {
        const { lat, lng } = event.latlng;

        // Umwandlung in DMS
        const latitudeDMS = toDMS(lat, true);
        const longitudeDMS = toDMS(lng, false);

        // Koordinaten im Div anzeigen
        displayDiv.textContent = `${latitudeDMS} ${longitudeDMS}`;
    });
}



// Validiert die Eingabe für GAFOR-Nummern
function validateInput(input) {
    input.value = input.value
        .replace(/[^0-9\s]/g, '')    // Entfernt nicht-zulässige Zeichen
        .replace(/\s+/g, ' ')        // Reduziert auf einzelne Leerzeichen
        .trim();                     // Entfernt führende und abschließende Leerzeichen
}

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























