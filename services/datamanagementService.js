
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
let trackCoordinates = [];
let trackedAcftImgJSON;
let trackedAcftImg = null;
let trackedAcftImgLink = null;
let trackedAcftImgPhotographer = null;
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
let polygonLayers = {};

async function togglePolygons(airspaceKey) {
    let gaforCalc = document.getElementById('calcGaforRadius');
    toggleActBtn(airspaceKey);
    if (polygonLayers[airspaceKey] && polygonLayers[airspaceKey].length > 0) {
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
    if (!polygonLayers[airspaceKey]) {

        polygonLayers[airspaceKey] = [];
    }
    if (airspaceArray === ctrAirspace) {
        processItems(airspaceArray, airspaceKey, map, polygonLayers[airspaceKey]);
    } else {
        processItems([...airspaceArray].reverse(), airspaceKey, map, polygonLayers[airspaceKey]);
    }
}

const DB_NAME = 'cacheDatabase';
const STORE_NAME = 'cacheStore';

async function getDB() {
    return idb.openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        },
    });
}

async function getFromIndexedDB(key, maxAge = 2 * 60 * 60 * 1000) {
    const db = await getDB();
    const cachedItem = await db.get(STORE_NAME, key);
    if (!cachedItem) return null;
    const { data, timestamp } = cachedItem;
    const age = Date.now() - timestamp;
    if (age < maxAge) {
        return data;
    }
    await db.delete(STORE_NAME, key);
    return null;
}

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
    // Überprüfe den Cache
    const cachedData = await getFromIndexedDB(key);
    if (cachedData) {
        console.log(`Daten für ${key} aus dem Cache geladen.`);
        processDataByKey(key, cachedData);
        return cachedData;
    }

    // KEIN manueller Token-Check mehr nötig.
    // Das Firebase SDK sendet Anfragen automatisch als angemeldeter Benutzer (oder nicht).
    // Die Datenbankregeln (auth != null) kümmern sich um die Berechtigung.

    const database = firebase.database();
    const dataRef = database.ref(key);

    try {
        const snapshot = await dataRef.once("value");
        if (snapshot.exists()) {
            let data = snapshot.val();
            if (data !== null) {
                // Daten in den Cache speichern (Logik wie zuvor)
                if (key === 'firAirspace' || key === 'gaforAirspace' || key === 'atzAirspace') {
                    const features = Array.isArray(data) && data.length > 0 && data[0].features ? data[0].features : data;
                    await saveToIndexedDB(key, features);
                    data = features;
                } else if (Array.isArray(data) && data.length > 0 && data[0]?.features) {
                     await saveToIndexedDB(key, data[0].features);
                     data = data[0].features;
                } else {
                    await saveToIndexedDB(key, data);
                }

                console.log(`Daten für ${key} erfolgreich aus Firebase geladen.`);
                processDataByKey(key, data);
                return data;
            }
        }
        console.warn(`Keine Daten für Key: ${key} in Firebase gefunden.`);
        processDataByKey(key, null);
        return null;
    } catch (error) {
        console.error(`Fehler beim Abrufen der Daten für ${key}:`, error);
        // Der Fehler 'PERMISSION_DENIED' sollte jetzt nur auftreten, wenn der Benutzer
        // nicht erfolgreich mit signInWithCustomToken angemeldet wurde.
        if (error.code === 'PERMISSION_DENIED') {
             showErrorBanner("Zugriff auf Datenbank verweigert. Bitte neu anmelden.");
        } else {
             showErrorBanner(`Fehler beim Laden von ${key}.`);
        }
        throw error;
    }
}
function processDataByKey(key, data) {
    // Stelle sicher, dass data nicht null ist, bevor darauf zugegriffen wird
    const safeData = data || ( (key === 'firAirspace' || key === 'gaforAirspace' || key === 'atzAirspace') ? [] : null); // Passe Standardwert an

    if (key === 'aerodromes') {
        aerodromes = safeData;
        markerData.aerodrome.source = safeData || [];
    } else if (key === 'navAids') {
        navAids = safeData;
        markerData.navaid.source = safeData || [];
    } else if (key === 'obstacles') {
        obstacles = safeData;
        markerData.obstacle.source = safeData || [];
    } else if (key === 'fisAirspace') {
        fisAirspace = safeData || [];
    } else if (key === 'edrAirspace') {
        edrAirspace = safeData || [];
    } else if (key === 'eddAirspace') {
        eddAirspace = safeData || [];
    } else if (key === 'ctrAirspace') {
        ctrAirspace = safeData || [];
    } else if (key === 'aipInfo') {
        aipInfo = safeData || {};
    } else if (key === 'rmzAirspace') {
        rmzAirspace = safeData || [];
    } else if (key === 'firAirspace') {
        firAirspace = safeData || []; // Bereits als Array erwartet
    } else if (key === 'gaforAirspace') {
        gaforAirspace = safeData || []; // Bereits als Array erwartet
    } else if (key === 'pjeAirspace') {
        pjeAirspace = safeData || [];
    } else if (key === 'tmzAirspace') {
        tmzAirspace = safeData || [];
    } else if (key === 'atzAirspace') {
        atzAirspace = safeData || []; // Bereits als Array erwartet
    } else if (key === 'ctrInfo') {
        ctrInfo = safeData || {};
    } else if (key === 'eddInfo') {
        eddInfo = safeData || {};
    } else if (key === 'edrInfo') {
        edrInfo = safeData || {};
    } else if (key === 'rmzInfo') {
        rmzInfo = safeData || {};
    } else if (key === 'tmzInfo') {
        tmzInfo = safeData || {};
    } else if (key === 'pjeInfo') {
        pjeInfo = safeData || {};
    }
}


function processItems(items, airspaceKey, map, layerArray) {
    if (airspaceKey === 'edr' || airspaceKey === 'edd' || airspaceKey === 'ctr') {
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
            const markerClusterGroup = L.markerClusterGroup();
            markerClusterGroup.on('clustermouseover', function (e) {
                const cluster = e.layer; 
                const markers = cluster.getAllChildMarkers();
                const parentDesignators = [...new Set(markers.map(marker => marker.options.parentDesignator))];
                const tooltipContent = parentDesignators.join('<br>');
                cluster.bindTooltip(tooltipContent).openTooltip();
            });

            markerData[key].markers = source
                .filter(data => data.geoLat && data.geoLong)
                .map(data => {
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
                    obstacle.marker.options.parentDesignator = data['Parent Designator'];
                    obstacle.addToCluster(markerClusterGroup);
                    return obstacle;
                });
            map.addLayer(markerClusterGroup); 
            markerData[key].clusterLayer = markerClusterGroup; 
        } else {
            markerData[key].markers = source
                .filter(data => key !== "aerodrome" || data.icaoCode) 
                .map(data => {
                    let item;
                    if (key === "aerodrome") {
                        item = new Aerodrome(data.geometry, data.name, map, data.icaoCode, data.runways);
                    } else if (key === "navaid") {
                        item = new Navaid(data.geometry.coordinates[1], data.geometry.coordinates[0], data.properties.txtname, map, data.properties['select-source-layer'], data.properties.ident, data.properties.charted || data.properties.dme_charted, data.properties.icaocode);
                    }
                    item.addToMap(); 
                    return item;
                });
        }
    } else {
        if (key === "obstacle") {
            map.removeLayer(markerData[key].clusterLayer);
            markerData[key].markers = [];
        } else {
            markers.forEach(item => item.marker && map.removeLayer(item.marker));
            markerData[key].markers = [];
        }
    }
    markerData[key].added = !added;
}


function resetMap() {
    let trackedAcftDiv = document.getElementById('trackedAcft');
    trackedAcftDiv.classList.add('hiddenTrackedAcft');
    currentAddresses = [];
    if (trackedAcft) {
        if (currentTrackLine) {
            map.removeLayer(currentTrackLine);
            currentTrackLine = null;
        }
        trackedAcft.isTracked = false;
        trackedAcft.updateMarkerStyle();
        trackedAcft = null;
    }
    if (flightDistLine) {
        map.removeLayer(flightDistLine);
        flightDistLine = null;
    }
    if (trackedIcaoDest) {
        trackedIcaoDest = null;
        trackedEta = '';
        let icaoDestInput = document.getElementById('icaoDest');
        icaoDestInput.value = '';
    }
    if (currentAdressGeoJSONLayer) {
        map.removeLayer(currentAdressGeoJSONLayer);
    }
    currentAdressGeoJSONLayer = null;
    trackedAcftReg = 'nothing';
    if (markerData.navaid.added) {
        toggleMarkers('navaid');
    }
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    polylines.forEach(line => map.removeLayer(line));
    polylines = [];
    clearAllDistanceMeasurements();
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
    foundNavAids = []; 
    foundNavaidId = 0;
}