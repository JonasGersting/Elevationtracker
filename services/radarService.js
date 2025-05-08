

let trackedAcft = null;
let flightDistLine = null;
let currentTrackLine = null;
let aircraftLayer = L.layerGroup().addTo(map);
//current acft variables
let trackedIcaoDest;
let trackedEta = '';

async function showAcftDetails() {
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
    callsignDiv.innerHTML = trackedAcft.callsign || 'Unknown';
    regDiv.innerHTML = trackedAcft.registration || 'Unknown';
    img.src = await getImgSrc(trackedAcft.hex);
    altDiv.innerHTML = `${trackedAcft.altitude}FT`;
    posDiv.innerHTML = `${trackedAcft.position[0]}N, ${trackedAcft.position[1]}E`;
    typeDiv.innerHTML = trackedAcft.type || 'Unknown';
    speedDiv.innerHTML = `${trackedAcft.speed}kt`;
    headingDiv.innerHTML = `${trackedAcft.heading}°`;
    trackDiv.innerHTML = `${trackedAcft.track}°`;
    eta.innerHTML = `${trackedAcft.eta}min`;
}


function showETA() {
    let dest = document.getElementById('icaoDest').value.toUpperCase();
    trackedAcft.calcEta(dest);
}

function validateLength(input) {
    if (input.value.length < 4 && trackedIcaoDest) {
        trackedIcaoDest = null;
        trackedEta = '';
        let icaoDestInput = document.getElementById('icaoDest');
        icaoDestInput.value = '';
        flightDistLine.remove();
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


function toggleRadar() {
    toggleActBtnRadar();

    if (radarActive) {
        cleanupRadar();
        stopRadarInterval();
        radarActive = false;
    } else {
        radarActive = true;
        startRadarInterval();
    }
}

function cleanupRadar() {
    // Hide aircraft details
    const trackedAcftDiv = document.getElementById('trackedAcft');
    trackedAcftDiv.classList.add('hiddenTrackedAcft');

    // Clear tracked aircraft
    if (trackedAcft) {
        if (currentTrackLine) {
            map.removeLayer(currentTrackLine);
            currentTrackLine = null;
        }
        if (flightDistLine) {
            map.removeLayer(flightDistLine);
            flightDistLine = null;
        }
        trackedAcft = null;
    }

    // Clear destination input
    const icaoDestInput = document.getElementById('icaoDest');
    if (icaoDestInput) {
        icaoDestInput.value = '';
    }

    // Reset variables
    trackedIcaoDest = null;
    trackedEta = '';

    // Clear map layers
    aircraftLayer.clearLayers();
    aircraftInstances = [];
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
// Array für Aircraft Instanzen
let aircraftInstances = [];

async function fetchAircraftData(centerLat, centerLon, radius) {
    try {
        const response = await fetch(`https://api.adsb.one/v2/point/${centerLat}/${centerLon}/${radius}`);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        const data = await response.json();
        console.log(data);
        aircraftLayer.clearLayers();
        aircraftInstances = [];
        data.ac.forEach(acftData => {
            const aircraft = new Aircraft(acftData, map, aircraftLayer);
            if (trackedAcft && aircraft.hex === trackedAcft.hex) {
                aircraft.isTracked = true;
                aircraft.updateMarkerStyle();
                trackedAcft = aircraft;
                trackedAcft.updateData();
            }
            aircraftInstances.push(aircraft);
        });
    } catch (error) {
        console.error("API fetch error:", error);
    }
}

async function fetchAircraftDataCallsign(callsign) {
    const apiUrl = `https://api.adsb.one/v2/callsign/${callsign}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API-Fehler: ${response.statusText}`);
        }
        const data = await response.json();
        aircraftLayer.clearLayers();
        aircraftInstances = [];
        const acft = data.ac[0];
        if (acft) {
            const aircraft = new Aircraft(acft, map, aircraftLayer);
            aircraftInstances.push(aircraft);
            trackedAcft = aircraft;
            aircraft.isTracked = true;
            aircraft.updateMarkerStyle();
            trackedAcftImgJSON = await aircraft.getImage();
            if (trackedAcftImgJSON != undefined) {
                trackedAcftImg = trackedAcftImgJSON.thumbnail.src;
                trackedAcftImgLink = trackedAcftImgJSON.link;
                trackedAcftImgPhotographer = `Photo © ${trackedAcftImgJSON.photographer}`;
            } else {
                trackedAcftImg = 'img/acftWhite.png';
                trackedAcftImgLink = '';
                trackedAcftImgPhotographer = '';
            }
            await aircraft.showDetails();
            await aircraft.fetchInitialTrack();
            map.setView([acft.lat, acft.lon], 10);
            if (!radarActive) {
                radarActive = true;
                toggleActBtnRadar();
            }

            setTimeout(() => startRadarInterval(), 1000);
        } else {
            alert('Es wurde kein ACFT gefunden');
            setTimeout(() => startRadarInterval(), 1000);
        }
    } catch (error) {
        console.error("Fehler beim API-Abruf:", error);
    }
}

function updateAPIRequest() {
    const bounds = map.getBounds();
    const { lat: lat1, lng: lon1 } = bounds.getSouthWest();
    const { lat: lat2, lng: lon2 } = bounds.getNorthEast();
    const { centerLat, centerLon, radius } = calculateCircle(lat1, lon1, lat2, lon2);
    fetchAircraftData(centerLat, centerLon, radius);
}
map.on('move', () => {
    stopRadarInterval();
    if (startTime === null) {
        startTime = Date.now();
    }
    if (radarTimer) {
        clearTimeout(radarTimer);
    }
});
map.on('moveend', () => {
    const elapsedTime = Date.now() - startTime;
    startTime = null;
    const adjustedTimeout = Math.max(0, 1000 - elapsedTime);
    radarTimer = setTimeout(() => {
        startRadarInterval();
    }, adjustedTimeout);
});
map.on('zoom', () => {
    stopRadarInterval();
    if (startTime === null) {
        startTime = Date.now();
    }
    if (radarTimer) {
        clearTimeout(radarTimer);
    }
});
map.on('zoomend', () => {
    const elapsedTime = Date.now() - startTime;
    startTime = null;
    const adjustedTimeout = Math.max(0, 1000 - elapsedTime);
    radarTimer = setTimeout(() => {
        startRadarInterval();
    }, adjustedTimeout);
});
