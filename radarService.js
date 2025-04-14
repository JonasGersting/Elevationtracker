

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


let pistonAcft = ['C172', 'C182', 'C152', 'P28A', 'SR20', 'H47', 'C150', 'PA22', 'C82R', 'AP32', 'C208', 'LA4', 'AA5', 'DV20', 'P28S', 'SR22', 'M20T', 'C42', 'TB20', 'VL3', 'ULAC', 'B36T', 'P32R', 'DIMO', 'PC12',
    'M20P', 'EFOX', 'PNR3', 'RV9', 'PIVI', 'NG5', 'SIRA', 'SHRK', 'RV14', 'S22T', 'SF25', 'DA40', 'A210', 'DR40', 'DIAMO02', 'AC11', 'B209', 'WT9', 'BW6T', 'DG80', 'BR23', 'PC9', 'TL30',
    'P208', 'P28T', 'PC21', 'TL20', 'BU31', 'GLID', 'F260', 'PRIM', 'PC7', 'Z42', 'DA50', 'TOBA', 'HR20', 'BREZ', 'TBM9', 'PA32', 'G115', 'BDOG', 'JAB4', 'SKRA', 'RV10', 'PA24', 'CRUZ', 'RV8', 'BE36', 'PA11',
    'AUJ2', 'G109', 'PA46', 'BE33', 'RV4', 'DR10', 'P28R', 'SUBA', 'P210', 'TWEN', 'YK52', 'RF6', 'G3', 'AS31', 'BE35', 'ALTO', 'EV97', 'FK9', 'NIMB', 'EB29', 'ARCP', 'CH60', 'GX', 'E500', 'PA18', 'S10S',
    'RALL', 'PA44', 'C206', 'PNR2', 'C10T', 'EVSS', 'FDCT', 'STRE', 'SLG2', 'TAMP', 'SLG2', 'DG40', 'AS02', 'C82T', 'C177', 'C210', 'OSCR', 'RV12', 'P46T', 'TEX2', 'M7', 'C72R', 'BT36', 'T206', 'CH2T', 'AA5',
    'GC1', 'C82S', 'C77R', 'BL8', 'C180', 'COL4', 'COL3', 'T210', 'GLST', 'PIAT', 'RV7', 'K100', 'IR23', 'D253', 'MCR1', 'ECHO', 'HUSK', 'S12S', 'LGND', 'IMPU', 'FAET', 'PULS', 'AS25', 'A32E', 'VNTR', 'P28B',
    'AAT3', 'TB21', 'LNCE', 'DG50', 'DISC', 'BE18', 'DUOD', 'AP22', 'S05R', 'PA38', 'CH75', 'P28U', 'WAIX', 'SV4', 'CRES', 'C170', 'TBM7', 'MOR2', 'TBM7', 'FBA2', 'BOLT', 'SAVG', 'RISN', 'R90R', 'ALSL', 'R200',               

];
let turboAcft = ['B350', 'L2T', 'F406', 'SF34', 'V22', 'BE30', 'C414', 'DA62', 'AT76', 'SW4', 'DA42', 'SC7', 'PA34', 'DA42', 'P68', 'BE9L', 'DHC6', 'AT75', 'AN30', 'C212', 'D228', 'C310', 'AT45',
    'PA31', 'C404', 'P06T', 'DH8A', 'P3', 'BN2P', 'C425', 'P180', 'C441', 'CN35', 'AT72', 'BE20', 'B190', 'BE58', 'C421', 'BE60', 'SW3', 'C340', 'BE99', 'DH8D', 'D328', 'P212', 'DH8B', 'L410', 'M28',
    'DC3', 'PA27',  
];
let helAcft = ['EC35', 'EC45', 'EC30', 'EC55', 'H60', 'R44', 'MI8', 'A139', 'AS32', 'G2CA', 'EC20', 'B505', 'EC75', 'A169', 'A109', 'AS55', 'R22', 'AS3B', 'LYNX', 'AS65', 'B407', 'H53S', 'AS50', 'B429',
    'B06', 'H500', 'H64', 'NH90', 'R66', 'S92', 'MM16', 'CDUS', 'A189', 'MT',     
   ];
let twoEngAcft = ['B738', 'B737', 'A321', 'B752', 'A320', 'A333', 'B38M', 'A20N', 'B789', 'B77W', 'A21N', 'B789', 'B38M', 'B739', 'BCS3', 'B762', 'B763', 'A332', 'A319', 'B734', 'A359', 'B788', 'B77W', 'B77L', 'B763', 'A339',
    'B734', 'B78X', 'A35K', 'A332', 'E75L', 'E190', 'B753', 'E190', 'E295', 'B78X', 'E190', 'A30B', 'B39M', 'B772', 'E170', 'B764', 'E195', 'E290', 'A306', 'BCS1',       
];
let fourEngAcft = ['C17', 'A388', 'B748', 'B744', 'A343', 'A400', 'A346', 'A124', 'K35R', 'C5M',  ];
let businessAcft = ['LJ45', 'GL5T', 'CL60', 'GL7T', 'GLF5', 'GA6C', 'GLEX', 'C525', 'PRM1', 'F900', 'C700', 'C550', 'E55P', 'C56X', 'E55P', 'LJ35', 'PC24', 'C25C', 'C25A', 'CRJX', 'SF50', 'C680',
    'CRJ9', 'E145', 'E50P', 'C68A', 'GLF6', 'CL35', 'G550', 'CRJ7', 'E45X', 'BE40', 'C130', 'C30J', 'CL30', 'GLF4', 'F2TH', 'C25B', 'G280', 'C510', 'LJ60', 'CRJ2', 'HDJT', 'C750', 'C560', 'WW24',
    'C25M', 'E3TF'              
]

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
        
        // Lösche alle alten Aircraft von der Karte
        aircraftLayer.clearLayers();
        aircraftInstances = [];

        // Erstelle neue Aircraft Instanzen
        data.ac.forEach(acftData => {
            const aircraft = new Aircraft(acftData, map, aircraftLayer);
            
            // Wenn dies das vorher getrackte Flugzeug war, stelle Tracking wieder her
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

async function fetchAircraftDataCallsign(callsign) {
    const apiUrl = `https://api.adsb.one/v2/callsign/${callsign}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API-Fehler: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Clear old aircraft
        aircraftLayer.clearLayers();
        aircraftInstances = [];

        const acft = data.ac[0];
        if (acft) {
            // Create new Aircraft instance
            const aircraft = new Aircraft(acft, map, aircraftLayer);
            aircraftInstances.push(aircraft);
            
            // Set as tracked aircraft
            trackedAcft = aircraft;
            aircraft.isTracked = true;
            aircraft.updateMarkerStyle();
            await aircraft.showDetails();
            await aircraft.fetchAndDrawTrack();

            // Center map on aircraft
            map.setView([acft.lat, acft.lon], 10);
            
            // Enable radar
            radarActive = true;
            toggleActBtnRadar();
            setTimeout(() => startRadarInterval(), 1000);
        } else {
            alert('Es wurde kein ACFT gefunden');
            setTimeout(() => startRadarInterval(), 1000);
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
