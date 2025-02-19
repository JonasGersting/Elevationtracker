// Hovervariable
let polygonIsBroughtUpToFront = false;
let isCursorOverPolygon = false;
let searchCat = 'Adresse';
let currentAerodrome;

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
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


let openAIP = L.tileLayer('https://nwy-tiles-api.prod.newaydata.com/tiles/{z}/{x}/{y}.png?path=2501/aero/latest', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});


let icaoCard = L.tileLayer('https://ais.dfs.de/static-maps/icao500/tiles/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var stadiaAlidadeSmooth = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png'
});

var stadiaAlidadeSmoothDark = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png'
});

let topPlusOpen = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    maxZoom: 20,
    tileSize: 256
});

let topPlusOpenGrey = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

let topPlusOpenLight = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_light/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    maxZoom: 20,
});

let topPlusOpenLightGray = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_light_grau/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    maxZoom: 20,
});

let googleSatelite = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl={language}', {
    attribution: 'Map data &copy;2025 Google',
    subdomains: '0123',
    maxZoom: 22,
    language: 'de'
});

let googleMaps = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl={language}', {
    attribution: 'Map data &copy;2025 Google',
    subdomains: '0123',
    maxZoom: 22,
    language: 'de'
});







const mapStates = {
    openAIP: { layer: openAIP, isHidden: true },
    icaoCard: { layer: icaoCard, isHidden: true },
    openTopoMap: { layer: openTopoMap, isHidden: true },
    stadiaAlidadeSmooth: { layer: stadiaAlidadeSmooth, isHidden: true },
    stadiaAlidadeSmoothDark: { layer: stadiaAlidadeSmoothDark, isHidden: true },
    rainviewerWeather: { layer: null, isHidden: true },
    rainviewerClouds: { layer: null, isHidden: true },
    topPlusOpen: { layer: topPlusOpen, isHidden: true },
    topPlusOpenGrey: { layer: topPlusOpenGrey, isHidden: true },
    topPlusOpenLight: { layer: topPlusOpenLight, isHidden: true },
    topPlusOpenLightGray: { layer: topPlusOpenLightGray, isHidden: true },
    googleSatelite: { layer: googleSatelite, isHidden: true },
    googleMaps: { layer: googleMaps, isHidden: true }
};

var osmb = new OSMBuildings(map).load('https://{s}.data.osmbuildings.org/0.2/59fcc2e8/tile/{z}/{x}/{y}.json');



// open flightmaps card
// L.tileLayer('openFlightMapsTiles/clip/merged/256/latest/{z}/{x}/{y}.png', {
//     maxZoom: 11,
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// }).addTo(map);

function toggleMap(mapKey) {
    const mapState = mapStates[mapKey];
    if (mapState.isHidden) {
        mapState.layer.addTo(map);
        mapState.isHidden = false;
    } else {
        map.removeLayer(mapState.layer);
        mapState.isHidden = true;
    }
}



















// Arrays zum Speichern von Markern
let markers = [];

// Array zum Speichern der Polylines
let polylines = [];



// // Event Listener für Mausklicks auf der Karte
// map.on('click', function (e) {
//     const { lat, lng } = e.latlng;
//     createMarker(lat, lng);
// });

// Funktion zum Erstellen des Markers und Abfragen der Höhe
function createMarker(lat, lng) {
    if (!markerData.navaid.added) {
        toggleMarkers('navaid');
    }
    const marker = L.marker([lat, lng]).addTo(map);
    markers.push(marker);

    // Karte auf den Marker zentrieren und näher heranzoomen
    map.setView([lat, lng], Math.min(map.getZoom() + 2, map.getMaxZoom()));

    // Abfrage der Höhe von der Open Elevation API
    getElevation(lat, lng).then(elevation => {
        marker.bindPopup(`<b>Höhe:</b> ${elevation} Fuß`).openPopup();
    });

    findClosestNavAid(marker);
}

function findClosestNavAid(markerPoint) {
    // Initialisiere die kürzeste Distanz und das nächste Navaid
    let closestNavAid = null;
    let shortestDistance = Infinity;
    let closestNavAidLatLng = null;

    // Iteriere durch alle Navaids
    navAids.forEach(navaid => {
        if (navaid.Type != 'LOC' && navaid.Type != 'MKR' && navaid.Type != 'DME' && navaid.Type != 'ILS') {
            const distance = haversine(
                markerPoint._latlng.lat, markerPoint._latlng.lng,
                navaid.Latitude, navaid.Longitude
            );

            // Überprüfe, ob die aktuelle Distanz kürzer ist
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestNavAid = navaid;
                closestNavAidLatLng = [navaid.Latitude, navaid.Longitude];
            }
        }
    });

    if (closestNavAid && closestNavAidLatLng) {
        // Berechne den Winkel (Azimut) vom Navaid zum Marker
        const angle = calculateAngle(
            closestNavAidLatLng[0], closestNavAidLatLng[1],
            markerPoint._latlng.lat, markerPoint._latlng.lng
        );

        // Zeichne eine Linie vom MarkerPoint zum nächstgelegenen Navaid
        const line = L.polyline([
            [markerPoint._latlng.lat, markerPoint._latlng.lng],
            closestNavAidLatLng
        ], {
            color: 'blue',
            weight: 2
        }).addTo(map);

        // Füge die Linie zum Array hinzu
        polylines.push(line);

        // Popup mit dem Namen des Navaids, der Distanz und dem Winkel hinzufügen
        line.bindPopup(`${shortestDistance.toFixed(2)}NM ${returnOrientation(angle.toFixed(2))} ${closestNavAid.Name} ${closestNavAid.Type} ${closestNavAid.Designator}`).openPopup();
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

    if (markerData.navaid.added) {
        toggleMarkers('navaid');
    }
    // Entferne alle Marker
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Entferne alle Polylines
    polylines.forEach(line => map.removeLayer(line));
    polylines = [];
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
















let aircraftLayer = L.layerGroup().addTo(map);
// Layer für Flugzeugmarker


function createCustomMarker(aircraftData) {
    const { lat, lon, desc, alt_baro, ias, true_heading, track, r, flight } = aircraftData;

    let rotation = true_heading || track;
    let acftImgColor = returnAircraftImg(alt_baro);
    // Benutzerdefiniertes Icon mit Rotation
    const planeIcon = L.divIcon({
        html: returnCorrectSvgForAcft(rotation, acftImgColor, r, flight),
        className: 'planeIcon',
        iconSize: [30, 30], // Größe des Icons
        iconAnchor: [15, 15], // Ankerpunkt des Icons (Mitte)
        popupAnchor: [0, -15] // Position des Popups relativ zum Icon
    });


    function returnCorrectSvgForAcft(rotation, color, r, flight) {
        if (r && r.startsWith("D-H") || flight && flight.startsWith("DH")) {
            return `
                    <div style="transform: rotate(${rotation}deg);">
            <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg width="100%" height="100%" viewBox="0 0 129 97" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M10.641,51.985l-7.247,-0c-1.608,-0 -2.914,-1.583 -2.914,-3.532c-0,-1.949 1.306,-3.531 2.914,-3.531l7.247,0l-0,-11.939l-2.222,-3.862l10.382,-0l-0,15.801l29.212,0c3.128,-4.619 12.252,-8.389 24.205,-10.161l-23.317,-28.254c-1.137,-1.378 -1.137,-3.615 0,-4.994c1.138,-1.378 2.984,-1.378 4.121,0l26.761,32.428c2.543,-0.18 5.169,-0.275 7.856,-0.275c2.686,0 5.313,0.095 7.855,0.275l26.761,-32.428c1.137,-1.378 2.984,-1.378 4.121,0c1.137,1.379 1.137,3.616 0,4.994l-23.316,28.254c14.881,2.206 25.377,7.509 25.377,13.692c-0,6.184 -10.496,11.486 -25.377,13.693l23.316,28.253c1.137,1.379 1.137,3.616 0,4.994c-1.137,1.378 -2.984,1.378 -4.121,0l-26.761,-32.427c-2.542,0.18 -5.169,0.274 -7.855,0.274c-2.687,0 -5.313,-0.094 -7.856,-0.274l-26.761,32.427c-1.137,1.378 -2.983,1.378 -4.121,0c-1.137,-1.378 -1.137,-3.615 0,-4.994l23.317,-28.253c-11.953,-1.772 -21.077,-5.542 -24.205,-10.161l-29.212,-0l-0,15.801l-10.609,0l2.449,-3.882l-0,-11.919Z" style="fill:${color};stroke:#000;stroke-width:2px;"/></svg>
            </div>
            `
        } else if (r && r.startsWith("A6")) {
            return `
            <div style="transform: rotate(${rotation}deg);">
             <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg width="100%" height="100%" viewBox="0 0 344 344" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M154.91,200.479l-42.092,8.469l-106.729,46.327c-0,-0 -1.083,-15.428 1.162,-17.192c1.957,-1.538 57.124,-36.405 95.786,-61.975c11.126,-7.359 36.039,-27.192 51.873,-42.014l0,-60.961c0.416,-74.74 33.668,-76.238 33.244,-0l-0,60.977c15.835,14.82 40.758,34.644 51.876,41.998c38.663,25.57 93.829,60.437 95.787,61.975c2.244,1.764 1.162,17.192 1.162,17.192l-106.729,-46.327l-42.096,-8.464l-0,21.361c1.254,-3.172 4.226,-5.318 7.579,-5.127l2.413,0.138c4.301,0.245 7.61,4.243 7.385,8.922l-1.569,32.551c-0.059,1.232 -1.265,0.822 -3.05,0.112l-1.732,5.557l-8.423,-0.481l-1.229,-5.918c-0.516,0.14 -0.995,0.273 -1.424,0.375c-0.403,3.144 -3.239,8.131 -6.372,11.254c14.588,11.024 47.275,35.817 49.16,38.062c1.338,1.593 0.641,19.263 0.641,19.263l-55.039,-24.819c-0.625,4.385 -2.611,12.316 -4.96,12.316c-2.302,0 -4.254,-7.611 -4.921,-12.044l-54.436,24.547c0,-0 -0.696,-17.67 0.641,-19.263c1.87,-2.227 34.038,-26.633 48.798,-37.788c-3.23,-3.086 -6.215,-8.247 -6.651,-11.487c-0.473,-0.105 -1.014,-0.256 -1.602,-0.416l-1.23,5.918l-8.422,0.481l-1.732,-5.557c-1.786,0.71 -2.992,1.12 -3.051,-0.112l-1.568,-32.551c-0.226,-4.679 3.083,-8.677 7.384,-8.922l2.413,-0.138c3.519,-0.2 6.619,2.173 7.753,5.606l0,-21.845Z" style="fill:${color};stroke:#000;stroke-width:8px;"/><rect x="0" y="-0" width="343.068" height="343.068" style="fill:none;"/></svg>
            
            </div>
            `
        } else if (r && r.startsWith("D-E")){
            return `
            <div style="transform: rotate(${rotation + 90}deg);">
            <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg width="100%" height="100%" viewBox="0 0 375 375" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M59.724,188.988l-3.537,-0.97l3.535,-0.969c0.006,-27.991 2.095,-50.692 4.668,-50.692c2.493,-0 4.532,21.331 4.661,48.134l3.149,-0.863l0,-8.239l40.291,-6.337l8.621,0l0,-69.706l5.796,-88.053c0,0 0.611,-5.314 6.809,-5.83c8.604,-0.717 30.721,-0.426 30.721,-0.426l10.863,94.309l0,69.706l8.621,0l79.836,11.278l8.537,-51.482l25.727,-0.016l8.651,51.758l-14.048,3.818l25.563,3.61l-25.079,3.543l13.564,3.686l-8.651,51.758l-25.727,-0.016l-8.505,-51.286l-79.868,11.281l-8.621,0l0,69.707l-10.676,92.682c0,-0 -22.304,0.191 -30.908,-0.526c-6.198,-0.517 -6.915,-5.713 -6.915,-5.713l-5.69,-86.443l0,-69.707l-8.621,0l-40.291,-6.336l0,-8.239l-3.159,-0.866c-0.204,26.018 -2.21,46.475 -4.651,46.475c-2.521,-0 -4.578,-21.808 -4.666,-49.03Z" style="fill:${color};stroke:#000;stroke-width:8px;"/><rect x="0" y="0" width="374.375" height="374.375" style="fill:none;"/></svg>
             </div>
            
            `
        } else if (r && (r.startsWith("D-I") || r.startsWith("D-G"))){
            return `
            <div style="transform: rotate(${rotation + 90}deg);">
            <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg width="100%" height="100%" viewBox="0 0 373 373" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M175.148,206.165l0,69.599l-10.676,92.682c0,0 -22.304,0.191 -30.907,-0.526c-6.199,-0.517 -6.915,-5.713 -6.915,-5.713l-5.69,-86.443l-0,-0.227l-10.657,-0c-2.434,-0 -5.724,-0.647 -9.14,-1.771c-0.747,15.047 -2.758,25.836 -5.119,25.836c-2.615,-0 -4.8,-13.236 -5.315,-30.834c-3.651,-2.49 -6.239,-5.466 -6.239,-8.576c-0,-3.118 2.6,-5.92 6.265,-8.19c0.559,-17.175 2.716,-29.989 5.289,-29.989c2.347,0 4.348,10.664 5.106,25.575c3.42,-0.972 6.716,-1.509 9.153,-1.509l10.657,-0l-0,-40.021l-8.621,-0l-31.987,-5.031c-2.572,-0.5 -5.454,-1.257 -8.305,-2.22c-1.83,-0.618 -3.646,-1.321 -5.359,-2.097c-1.889,-0.856 -3.652,-1.799 -5.166,-2.813c-2.993,-2.005 -5.014,-4.285 -5.12,-6.705c-0.003,-0.066 -0.004,-0.133 -0.004,-0.2c-0,-2.495 2.049,-4.846 5.126,-6.906c1.513,-1.013 3.274,-1.956 5.162,-2.811c1.713,-0.776 3.53,-1.48 5.361,-2.098c1.768,-0.598 3.548,-1.115 5.259,-1.542l35.033,-5.509l8.621,-0l-0,-40.221l-10.657,0c-2.434,0 -5.724,-0.646 -9.14,-1.771c-0.747,15.048 -2.758,25.837 -5.119,25.837c-2.615,-0 -4.8,-13.236 -5.315,-30.834c-3.651,-2.49 -6.239,-5.466 -6.239,-8.576c-0,-3.118 2.6,-5.92 6.265,-8.19c0.559,-17.175 2.716,-29.989 5.289,-29.989c2.347,0 4.348,10.664 5.106,25.575c3.42,-0.972 6.716,-1.51 9.153,-1.51l10.657,0l-0,-0.028l5.795,-88.052c0,-0 0.611,-5.314 6.81,-5.831c8.603,-0.717 30.72,-0.425 30.72,-0.425l10.863,94.308l0,69.357l7.978,0c5.903,0 46.523,2.45 81.337,6.453l7.679,-46.308l25.061,-0.016c-0.486,16.789 -0.722,33.766 -0.701,50.935c11.826,2.246 19.621,4.747 19.621,7.421c0,0.182 -0.036,0.364 -0.107,0.545c-0.082,0.209 -0.211,0.417 -0.384,0.625c-1.876,2.252 -8.998,4.432 -19.046,6.459c0.17,17.203 0.596,34.598 1.283,52.189l-25.727,-0.017l-7.821,-47.163c-34.783,4.383 -75.3,7.266 -81.195,7.266l-7.978,0Z" style="fill:${color};stroke:#000;stroke-width:8px;"/><rect x="0" y="0" width="372.521" height="372.521" style="fill:none;"/></svg>
             </div>
            
            `
        }
        
        
        
        else {
            return `
                        <div style="transform: rotate(${rotation - 90}deg);">
            <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
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

    // Tooltip-Inhalt erstellen
    const tooltipContent = `
        <div>
            <strong>registration:</strong> ${r || 'Unknown'}<br>
            <strong>Description:</strong> ${desc || 'Unknown'}<br>
            <strong>Callsign:</strong> ${flight}<br>
            <strong>Altitude:</strong> ${alt_baro || 'N/A'} ft<br>
            <strong>Speed:</strong> ${ias || 'N/A'} kn<br>
            <strong>Heading:</strong> ${true_heading}°<br>
            <strong>Lat:</strong> ${lat}<br>
            <strong>Lon:</strong> ${lon}<br>
            <strong>Rotation:</strong> ${rotation}<br>
            <strong>Track:</strong> ${track}
        </div>
    `;

    // Marker erstellen
    const planeMarker = L.marker([lat, lon], { icon: planeIcon });

    // Tooltip hinzufügen
    planeMarker.bindTooltip(tooltipContent, { direction: 'top', offset: [0, -15] });

    // Klick-Event hinzufügen
    planeMarker.on('click', () => {
        trackedAcftReg = flight; // Ändere trackedAcftReg auf den flight-Wert
        // Aktualisiere das Bild des Markers
        const updatedPlaneIcon = L.divIcon({
            html: `
                <img src="img/trackedPlane.png" style="transform: rotate(${rotation}deg); width: 30px; height: 30px;" alt="Tracked Plane">
            `,
            className: 'planeIcon',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });

        planeMarker.setIcon(updatedPlaneIcon); // Setze das neue Icon
        console.log(`Tracked Aircraft Registration geändert: ${trackedAcftReg}`);
    });

    return planeMarker;
}

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

    if (radarActive) {
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
        checkTrackedAircraft(data);

    } catch (error) {
        console.error("Fehler beim API-Abruf:", error);
    }
}


function checkTrackedAircraft(data) {
    let found = false; // Standardwert setzen

    if (trackedAcftReg != null) {
        console.log(trackedAcftReg);

        // Überprüfen, ob der aktuelle Wert von trackedAcftReg im Array data.ac vorkommt
        found = data.ac.some(acft => acft.flight.trim().toUpperCase() === trackedAcftReg.trim().toUpperCase());
    }

    // Wenn der Wert nicht gefunden wurde, setze trackedAcftReg auf ''
    if (!found && trackedAcftReg != null) {
        console.log(`Tracked Aircraft (${trackedAcftReg}) nicht mehr gefunden. Zurücksetzen.`);
        trackedAcftReg = null;
    }
}



let trackedAcftReg = null;




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


// API-Abruf Registration
async function fetchAircraftDataReg(reg) {
    const apiUrl = `https://api.adsb.one/v2/reg/${reg}`;
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

    } catch (error) {
        console.error("Fehler beim API-Abruf:", error);
    }
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
            trackedAcftReg = callsign;
            const marker = createCustomMarker(acft);
            aircraftLayer.addLayer(marker);

            // Setze die Ansicht auf die Position des Objekts
            map.setView([acft.lat, acft.lon], 10); // 10 ist die Zoom-Stufe
            radarActive = true;
            // Starte Radar nach dem Timeout
            setTimeout(() => {
                startRadarInterval();
            }, 1000);
        } else {
            alert('Es wurde kein ACFT gefunden')

            startRadarInterval();


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
















const airspaceStates = {
    fis: fisAirspace,
    edr: edrAirspace,
    edd: eddAirspace,
    ctr: ctrAirspace
};

// Objekt zum Speichern der Polygone nach AirspaceKey
let polygonLayers = {};

// Toggle-Funktion zum Hinzufügen und Entfernen von Polygonen
function togglePolygons(airspaceKey) {
    const airspaceState = airspaceStates[airspaceKey];

    // Prüfen, ob es Polygone für den aktuellen Key gibt
    if (polygonLayers[airspaceKey] && polygonLayers[airspaceKey].length > 0) {
        // Entferne bestehende Polygone für diesen Key
        polygonLayers[airspaceKey].forEach(polygon => polygon.removeFromMap());
        polygonLayers[airspaceKey] = [];
        return;
    }

    // Initialisiere, falls noch nicht vorhanden
    if (!polygonLayers[airspaceKey]) {
        polygonLayers[airspaceKey] = [];
    }

    if (airspaceState === ctrAirspace) {
        processItems(airspaceState, airspaceKey, map, polygonLayers[airspaceKey]);
    } else {
        processItems([...airspaceState].reverse(), airspaceKey, map, polygonLayers[airspaceKey]);
    }
}

function processItems(items, airspaceKey, map, layerArray) {
    items.forEach(item => {
        if (item.geometry && item.geometry.type === "Polygon") {
            let polygon;
            switch (airspaceKey) {
                case 'fis':
                    polygon = new FisAirspace(item.geometry, item.name, map, layerArray);
                    break;
                case 'edr':
                    polygon = new EdrAirspace(item.geometry, item.name, map, layerArray);
                    break;
                case 'edd':
                    polygon = new EddAirspace(item.geometry, item.name, map, layerArray);
                    break;
                case 'ctr':
                    polygon = new CtrAirspace(item.geometry, item.name, map, layerArray);
                    break;
            }
            polygon.addToMap();
            layerArray.push(polygon);
        }
    });
}





// Arrays und Statusvariablen für Marker
const markerData = {
    navaid: { markers: [], added: false, source: navAids },
    aerodrome: { markers: [], added: false, source: aerodromes },
    obstacle: { markers: [], added: false, source: obstacles }
};


function toggleMarkers(key) {
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
                        item = new Navaid(data.Latitude, data.Longitude, data.Name, map, data.Type, data.Designator);
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
        // API-Endpunkt
        const apiUrl = "https://api.rainviewer.com/public/weather-maps.json";
        // Fetch-Daten abrufen
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der API: ${response.statusText}`);
        }
        const data = await response.json();
        // Wetter-Pfad basierend auf dem Wettertyp auslesen
        if (weatherType === 'weather') {
            weatherPath = data.radar.nowcast.at(-1).path;
            console.log(weatherPath);
        } else if (weatherType === 'clouds') {
            weatherPath = data.satellite.infrared.at(-1).path;

        } else {
            throw new Error(`Ungültiger Wettertyp oder Daten fehlen für: ${weatherType}`);
        }

        // Layer für Weather oder Clouds erstellen
        if (weatherType === 'weather' && !rainviewerWeather) {
            rainviewerWeather = L.tileLayer(`https://tilecache.rainviewer.com${weatherPath}/512/{z}/{x}/{y}/2/1_1.png`, {
                minZoom: 0,
                maxZoom: 20,
                ext: 'png',
            });

            // Layer in mapStates aktualisieren
            mapStates.rainviewerWeather.layer = rainviewerWeather;
        } else if (weatherType === 'clouds' && !rainviewerClouds) {
            rainviewerClouds = L.tileLayer(`https://tilecache.rainviewer.com${weatherPath}/256/{z}/{x}/{y}/0/1_0.png`, {
                minZoom: 0,
                maxZoom: 20,
                ext: 'png',
            });

            // Layer in mapStates aktualisieren
            mapStates.rainviewerClouds.layer = rainviewerClouds;
        } else {
            // Aktualisiere die URL des bestehenden Layers, falls nötig
            if (weatherType === 'weather') {
                rainviewerWeather.setUrl(`https://tilecache.rainviewer.com${weatherPath}/512/{z}/{x}/{y}/2/1_1.png`);
            } else if (weatherType === 'clouds') {
                rainviewerClouds.setUrl(`https://tilecache.rainviewer.com${weatherPath}/256/{z}/{x}/{y}/0/1_0.png`);
            }
        }
        toggleMap(weatherType === 'weather' ? 'rainviewerWeather' : 'rainviewerClouds');
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
    // let searchInput = document.getElementById('searchInput');
    // searchInput.value = '';
    searchInput.placeholder = `Suche nach ${cat}`;
    let head = document.getElementById('searchCategoryHeadline');
    head.innerHTML = cat;
    searchCat = cat;
}



function search() {
    if (searchCat == 'Adresse') {
        searchAdress();
    }
    if (searchCat == 'Callsign') {
        searchAcft();
    }
    if (searchCat == 'Koordinate') {
        searchCoordinate();
    }
    else {
        console.log('Suche nicht erfolgreich');

    }

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

