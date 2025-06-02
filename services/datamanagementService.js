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
    edrLower: { name: 'edrAirspace', airspace: edrAirspace, info: 'edrInfo' },
    edrUpper: { name: 'edrAirspace', airspace: edrAirspace, info: 'edrInfo' },
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
const markerData = {
    navaid: { markers: [], added: false, source: navAids },
    aerodrome: { markers: [], added: false, source: aerodromes },
    obstacle: { markers: [], added: false, source: obstacles }
};
let smallAerodromeInstances = [];
let smallAerodromesActive = false;
const DB_NAME = 'cacheDatabase';
const STORE_NAME = 'cacheStore';
let fbAccessData, fbDatabase, fbDbRef, fbDbGet;

function initializeFirebaseDataDependencies() {
    fbAccessData = window.firebaseGlobalAccess;
    if (fbAccessData) {
        fbDatabase = fbAccessData.database;
        fbDbRef = fbAccessData.dbRef;
        fbDbGet = fbAccessData.dbGet;
    } else {
        showErrorBanner("Firebase Global Access ist nicht verfügbar. Bitte neu laden.");
    }
}

function removePolygonsIfExist(airspaceKey, gaforCalc) {
    if (polygonLayers[airspaceKey] && polygonLayers[airspaceKey].length > 0) {
        polygonLayers[airspaceKey].forEach(polygon => polygon.removeFromMap());
        polygonLayers[airspaceKey] = [];
        if (airspaceKey === 'gafor' && gaforCalc) {
            gaforCalc.style.display = 'none';
            if (typeof resetGaforVisuals === 'function') resetGaforVisuals();
        }
        return true;
    }
    return false;
}

function prepareGaforUI(gaforCalc) {
    let gaforInput = document.getElementById('gaforNumbers');
    let gaforDisplay = document.getElementById('gaforPolygonInfo');
    if (gaforInput) gaforInput.value = '';
    if (gaforDisplay) gaforDisplay.innerHTML = '';
    if (gaforCalc) gaforCalc.style.display = 'flex';
}

async function fetchAndSetAirspaceData(airspaceKey) {
    const data = await getData(airspaceStates[airspaceKey].name);
    airspaceStates[airspaceKey].airspace = data;
    return data;
}

async function fetchAdditionalAirspaceInfo(airspaceKey) {
    if (airspaceStates[airspaceKey].info !== 'null') {
        await getData(airspaceStates[airspaceKey].info);
    }
}

function initializePolygonLayerArray(airspaceKey) {
    if (!polygonLayers[airspaceKey]) {
        polygonLayers[airspaceKey] = [];
    }
}

async function togglePolygons(airspaceKey) {
    let gaforCalc = document.getElementById('calcGaforRadius');
    if (typeof toggleActBtn === 'function') toggleActBtn(airspaceKey);
    if (removePolygonsIfExist(airspaceKey, gaforCalc)) return;
    if (airspaceKey === 'gafor') prepareGaforUI(gaforCalc);
    await fetchAndSetAirspaceData(airspaceKey);
    await fetchAdditionalAirspaceInfo(airspaceKey);
    initializePolygonLayerArray(airspaceKey);
    const currentAirspaceData = airspaceStates[airspaceKey].airspace;
    if (!currentAirspaceData) return;
    const itemsToProcess = airspaceKey === 'ctr' ? currentAirspaceData : [...currentAirspaceData].reverse();
    processItems(itemsToProcess, airspaceKey, map, polygonLayers[airspaceKey]);
}

async function getDB() {
    if (typeof idb === 'undefined' || !idb.openDB) {
        showErrorBanner("IndexedDB Library (idb) nicht gefunden. Bitte laden Sie die idb-Bibliothek.");
        throw new Error("IndexedDB Library nicht gefunden.");
    }
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
    if ((Date.now() - timestamp) < maxAge) return data;
    await db.delete(STORE_NAME, key);
    return null;
}

async function saveToIndexedDB(key, data) {
    const db = await getDB();
    await db.put(STORE_NAME, { key, data, timestamp: Date.now() });
}

async function getAndProcessCachedData(key) {
    const cachedData = await getFromIndexedDB(key);
    if (cachedData) {
        assignDataToGlobalVar(key, cachedData);
        return cachedData;
    }
    return null;
}

async function fetchProcessAndCacheFirebaseData(key) {
    // Prüfe, ob der Token global verfügbar ist
    const globalAccess = window.firebaseGlobalAccess;
    if (!globalAccess || !globalAccess.token) {
        showErrorBanner("Kein Token verfügbar. Bitte einloggen.");
        throw new Error("Kein Token verfügbar.");
    }

    const token = globalAccess.token;
    console.log(`Token für ${key} verwendet:`, token);
    
    const databaseURL = "https://aromaps-3b242-default-rtdb.europe-west1.firebasedatabase.app";

    // URL für die Anfrage
    const url = `${databaseURL}/${key}.json?auth=${token}`;

    try {
        // HTTP-GET-Anfrage an die Firebase REST-API
        const response = await fetch(url);
        if (!response.ok) {
            showErrorBanner(`Fehler beim Abrufen der Daten für ${key}: ${response.statusText}`);
            throw new Error(`Fehler beim Abrufen der Daten: ${response.statusText}`);
        }

        let data = await response.json();
        if (data === null) {
            showErrorBanner(`Keine Daten für ${key} gefunden.`);
            return null;
        }

        // Falls die Daten ein bestimmtes Format haben, verarbeite sie entsprechend
        if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0].features !== 'undefined') {
            data = data[0].features;
        }

        // Daten im Cache speichern
        await saveToIndexedDB(key, data);
        assignDataToGlobalVar(key, data);
        return data;
    } catch (error) {
        console.error(`Fehler beim Abrufen der Daten für ${key}:`, error);
        throw error;
    }
}

function handleGetDataError(error, key) {
    const message = error.code === 'PERMISSION_DENIED' ? "Zugriff auf Datenbank verweigert. Bitte neu anmelden." : `Fehler beim Laden von ${key}.`;
    showErrorBanner(message);
    throw error;
}

async function getData(key) {
    // Versuche, die Daten aus dem Cache zu laden
    let data = await getAndProcessCachedData(key);
    if (data) return data;

    // Falls keine Daten im Cache vorhanden sind, lade sie über die REST-API
    try {
        return await fetchProcessAndCacheFirebaseData(key);
    } catch (error) {
        handleGetDataError(error, key);
    }
}

const dataAssignments = {
    aerodromes: (data) => { aerodromes = data; markerData.aerodrome.source = data; },
    navAids: (data) => { navAids = data; markerData.navaid.source = data; },
    obstacles: (data) => { obstacles = data; markerData.obstacle.source = data; },
    fisAirspace: (data) => { fisAirspace = data; airspaceStates.fis.airspace = data; },
    edrAirspace: (data) => { edrAirspace = data; airspaceStates.edrLower.airspace = data; airspaceStates.edrUpper.airspace = data; },
    eddAirspace: (data) => { eddAirspace = data; airspaceStates.edd.airspace = data; },
    ctrAirspace: (data) => { ctrAirspace = data; airspaceStates.ctr.airspace = data; },
    aipInfo: (data) => aipInfo = data,
    rmzAirspace: (data) => { rmzAirspace = data; airspaceStates.rmz.airspace = data; },
    firAirspace: (data) => { firAirspace = data; airspaceStates.fir.airspace = data; },
    gaforAirspace: (data) => { gaforAirspace = data; airspaceStates.gafor.airspace = data; },
    pjeAirspace: (data) => { pjeAirspace = data; airspaceStates.pje.airspace = data; },
    tmzAirspace: (data) => { tmzAirspace = data; airspaceStates.tmz.airspace = data; },
    atzAirspace: (data) => { atzAirspace = data; airspaceStates.atz.airspace = data; },
    ctrInfo: (data) => ctrInfo = data,
    eddInfo: (data) => eddInfo = data,
    edrInfo: (data) => edrInfo = data,
    rmzInfo: (data) => rmzInfo = data,
    tmzInfo: (data) => tmzInfo = data,
    pjeInfo: (data) => pjeInfo = data,
};

function assignDataToGlobalVar(key, data) {
    if (dataAssignments[key]) {
        dataAssignments[key](data);
    }
}

function createEdrPolygon(item, mapInstance, layerArray, isUpper) {
    const lowerLimit = item.properties['Lower Limit'];
    const lowerUnit = item.properties['Lower Limit Unit'];
    const condition = (lowerUnit === 'FL' && lowerLimit < 100) || (lowerUnit === 'FT' && lowerLimit < 10000);
    if (isUpper ? !condition : condition) {
        return new EdrAirspace(item.geometry, item.properties.Name, item.properties.Ident, mapInstance, layerArray, item.properties['Center Latitude'], item.properties['Center Longitude'], lowerLimit, lowerUnit, item.properties['Upper Limit'], item.properties['Upper Limit Unit']);
    }
    return null;
}

function createCtrPolygon(item, mapInstance, layerArray) {
    return new CtrAirspace(item.geometry, item.properties.nam, item.properties.Ident, mapInstance, layerArray, item.properties.latitude, item.properties.longitude, item.properties.lowerlimit, item.properties.lowerlimitunit, item.properties.upperlimit, item.properties.uplimitunit);
}

function createFisPolygon(item, mapInstance, layerArray) {
    return new FisAirspace(item.geometry, item.properties.Ident, 'null', mapInstance, layerArray, item.properties.SVS);
}

function createRmzPolygon(item, mapInstance, layerArray) {
    return new RmzAirspace(item.geometry, item.properties.Name, item.properties.Ident, mapInstance, layerArray, item.properties['Center Latitude'], item.properties['Center Longitude'], item.properties['Lower Limit'], item.properties['Lower Limit Unit'], item.properties['Upper Limit'], item.properties['Upper Limit Unit']);
}

function createFirPolygon(item, mapInstance, layerArray) {
    return new FirAirspace(item.geometry, item.properties.Ident, 'null', mapInstance, layerArray);
}

function createEddPolygon(item, mapInstance, layerArray) {
    return new EddAirspace(item.geometry, item.properties.Name, item.properties.Ident, mapInstance, layerArray, item.properties['Center Latitude'], item.properties['Center Longitude'], item.properties['Lower Limit'], item.properties['Lower Limit Unit'], item.properties['Upper Limit'], item.properties['Upper Limit Unit']);
}

function createGaforPolygon(item, mapInstance, layerArray) {
    return new GaforAirspace(item.geometry, item.properties.gafor_nummer, 'null', mapInstance, layerArray);
}

function createPjePolygon(item, mapInstance, layerArray) {
    return new PjeAirspace(item.geometry, item.properties.Name, item.properties.Ident, mapInstance, layerArray);
}

function createTmzPolygon(item, mapInstance, layerArray) {
    return new TmzAirspace(item.geometry, item.properties.Name, item.properties.Ident, mapInstance, layerArray, item.properties['Center Latitude'], item.properties['Center Longitude'], item.properties['Lower Limit'], item.properties['Lower Limit Unit'], item.properties['Upper Limit'], item.properties['Upper Limit Unit']);
}

function createAtzPolygon(item, mapInstance, layerArray) {
    return new AtzAirspace(item.geometry, item.properties.Name, item.properties.Ident, mapInstance, layerArray);
}

const polygonConstructors = {
    edrLower: (item, map, layers) => createEdrPolygon(item, map, layers, false),
    edrUpper: (item, map, layers) => createEdrPolygon(item, map, layers, true),
    ctr: createCtrPolygon, fis: createFisPolygon, rmz: createRmzPolygon,
    fir: createFirPolygon, edd: createEddPolygon, gafor: createGaforPolygon,
    pje: createPjePolygon, tmz: createTmzPolygon, atz: createAtzPolygon,
};

function processItems(items, airspaceKey, mapInstance, layerArray) {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.geometry && (item.geometry.type === "Polygon" || item.geometry.type === "MultiPolygon")) {
            const constructor = polygonConstructors[airspaceKey];
            if (constructor) {
                const polygon = constructor(item, mapInstance, layerArray);
                if (polygon) {
                    polygon.addToMap();
                    layerArray.push(polygon);
                }
            }
        }
    }
}

function initializeSmallAerodromeEventHandler() {
    if (map) map.on('zoomend', handleSmallAerodromeVisibilityBasedOnZoom);
    else showErrorBanner("Karte ist nicht initialisiert. Bitte neu laden.");
}

function addMarkersToMap(key) {
    const source = markerData[key].source;
    if (key === "obstacle") showObstacleMarkers(source, key);
    else showGenericMarkers(source, key);
    markerData[key].added = true;
}

function removeMarkersFromMap(key) {
    if (key === "obstacle") removeObstacleClusterLayer(key);
    else if (key === "aerodrome") removeAerodromeMarkersFromMap(key);
    else markerData[key].markers.forEach(item => item.marker && map.removeLayer(item.marker));

    markerData[key].markers = [];
    markerData[key].added = false;
}

function toggleMarkers(key) {
    if (typeof toggleActBtn === 'function') toggleActBtn(key);
    if (!markerData[key]) { showErrorBanner(`Unbekannter Schlüssel: ${key}`); return; }
    if (!markerData[key].added) addMarkersToMap(key);
    else removeMarkersFromMap(key);
}

function removeObstacleClusterLayer(key) {
    if (markerData[key].clusterLayer) map.removeLayer(markerData[key].clusterLayer);
    markerData[key].clusterLayer = null;
}

function removeAerodromeMarkersFromMap(key) {
    if (smallAerodromesActive) {
        smallAerodromeInstances.forEach(saItem => map.removeLayer(saItem.marker));
        smallAerodromesActive = false;
    }
    smallAerodromeInstances = [];
    markerData[key].markers.forEach(item => {
        if (item && item.marker && !(item instanceof SmallAerodrome)) map.removeLayer(item.marker);
    });
}

function createAndAddObstacleMarker(data, clusterGroup) {
    const obstacle = new Obstacle(data.geoLat, data.geoLong, data.txtName, data['Parent Designator'], data['Type of Obstacle'], data.LIGHTED, data.DayMarking, data['ValElev (ft)'], data['valHgt (ft)'], map);
    obstacle.marker.options.parentDesignator = data['Parent Designator'];
    obstacle.addToCluster(clusterGroup);
    return obstacle;
}

function setupObstacleClusterTooltip(clusterGroup) {
    clusterGroup.on('clustermouseover', function (e) {
        const markersInCluster = e.layer.getAllChildMarkers();
        const designators = [...new Set(markersInCluster.map(m => m.options.parentDesignator))];
        e.layer.bindTooltip(designators.join('<br>')).openTooltip();
    });
}

function showObstacleMarkers(source, key) {
    const markerClusterGroup = L.markerClusterGroup();
    setupObstacleClusterTooltip(markerClusterGroup);
    markerData[key].markers = source
        .filter(data => data.geoLat && data.geoLong)
        .map(data => createAndAddObstacleMarker(data, markerClusterGroup));
    map.addLayer(markerClusterGroup);
    markerData[key].clusterLayer = markerClusterGroup;
}

function createAerodromeMarker(data) {
    if (data.icaoCode) return new Aerodrome(data.geometry, data.name, map, data.icaoCode, data.runways);
    const smallAero = new SmallAerodrome(data.geometry, data.name, map, data.runways);
    smallAerodromeInstances.push(smallAero);
    return smallAero;
}

function createNavaidMarker(data) {
    return new Navaid(data.geometry.coordinates[1], data.geometry.coordinates[0], data.properties.txtname, map, data.properties['select-source-layer'], data.properties.ident, data.properties.charted || data.properties.dme_charted, data.properties.icaocode, data.properties.type || 'unknown');
}

function showGenericMarkers(source, key) {
    markerData[key].markers = source.map(data => {
        let item;
        if (key === "aerodrome") {
            initializeSmallAerodromeEventHandler();
            item = createAerodromeMarker(data);
        } else if (key === "navaid") {
            item = createNavaidMarker(data);
        }
        if (item && !(item instanceof SmallAerodrome)) item.addToMap();
        return item;
    });
    if (key === "aerodrome") checkSmallAerodromeVisibilityBasedOnZoom();
}

function updateSmallAerodromeVisibility(show) {
    smallAerodromeInstances.forEach(saItem => {
        if (show) saItem.addToMap();
        else map.removeLayer(saItem.marker);
    });
    smallAerodromesActive = show;
}

function checkSmallAerodromeVisibilityBasedOnZoom() {
    if (!map || !markerData.aerodrome.added) return;
    const currentZoom = map.getZoom();
    if (currentZoom >= 9 && !smallAerodromesActive) updateSmallAerodromeVisibility(true);
    else if (currentZoom < 9 && smallAerodromesActive) updateSmallAerodromeVisibility(false);
}

function handleSmallAerodromeVisibilityBasedOnZoom() {
    checkSmallAerodromeVisibilityBasedOnZoom();
}


