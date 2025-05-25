
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


function removePolygonsIfExist(airspaceKey, gaforCalc) {
    if (polygonLayers[airspaceKey] && polygonLayers[airspaceKey].length > 0) {
        polygonLayers[airspaceKey].forEach(polygon => polygon.removeFromMap());
        polygonLayers[airspaceKey] = [];
        if (airspaceKey === 'gafor') {
            gaforCalc.style.display = 'none';
            resetGaforVisuals();
        }
        return true;
    }
    return false;
}

function prepareGaforUI(gaforCalc) {
    let gaforInput = document.getElementById('gaforNumbers');
    let gaforDisplay = document.getElementById('gaforPolygonInfo');
    gaforInput.value = '';
    gaforDisplay.innerHTML = '';
    gaforCalc.style.display = 'flex';
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

function initializeAndProcessPolygons(airspaceKey, airspaceData, mapInstance) {
    if (!polygonLayers[airspaceKey]) {
        polygonLayers[airspaceKey] = [];
    }
    if (!airspaceData) return;
    const itemsToProcess = airspaceData === ctrAirspace ? airspaceData : [...airspaceData].reverse();
    processItems(itemsToProcess, airspaceKey, mapInstance, polygonLayers[airspaceKey]);
}

async function togglePolygons(airspaceKey) {
    let gaforCalc = document.getElementById('calcGaforRadius');
    toggleActBtn(airspaceKey);

    if (removePolygonsIfExist(airspaceKey, gaforCalc)) {
        return;
    }

    if (airspaceKey === 'gafor') {
        prepareGaforUI(gaforCalc);
    }

    let airspaceData = await fetchAndSetAirspaceData(airspaceKey);
    await fetchAdditionalAirspaceInfo(airspaceKey);
    initializeAndProcessPolygons(airspaceKey, airspaceData, map);
}



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

async function saveToIndexedDB(key, data) {
    const db = await getDB();
    const payload = {
        key,
        data,
        timestamp: Date.now(),
    };
    await db.put(STORE_NAME, payload);
}

async function getAndProcessCachedData(key) {
    const cachedData = await getFromIndexedDB(key);
    if (cachedData) {
        processDataByKey(key, cachedData);
        return cachedData;
    }
    return null;
}

async function fetchProcessAndCacheFirebaseData(key) {
    const database = firebase.database();
    const dataRef = database.ref(key);
    const snapshot = await dataRef.once("value");

    if (snapshot.exists()) {
        let data = snapshot.val();
        if (data !== null) {
            if (Array.isArray(data) && data.length > 0 && data[0]?.features) {
                data = data[0].features;
            }
            await saveToIndexedDB(key, data);
            processDataByKey(key, data);
            return data;
        }
    }
    showErrorBanner(`Keine Daten für ${key} gefunden.`);
    return null;
}

function handleGetDataError(error, key) {
    if (error.code === 'PERMISSION_DENIED') {
        showErrorBanner("Zugriff auf Datenbank verweigert. Bitte neu anmelden.");
    } else {
        showErrorBanner(`Fehler beim Laden von ${key}.`);
    }
    throw error;
}

async function getData(key) {
    let data = await getAndProcessCachedData(key);
    if (data) {
        return data;
    }
    try {
        data = await fetchProcessAndCacheFirebaseData(key);
        return data;
    } catch (error) {
        handleGetDataError(error, key);
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
        rmzAirspace = data;
    } else if (key === 'firAirspace') {
        firAirspace = data;
    } else if (key === 'gaforAirspace') {
        gaforAirspace = data;
    } else if (key === 'pjeAirspace') {
        pjeAirspace = data;
    } else if (key === 'tmzAirspace') {
        tmzAirspace = data;
    } else if (key === 'atzAirspace') {
        atzAirspace = data;
    } else if (key === 'ctrInfo') {
        ctrInfo = data;
    } else if (key === 'eddInfo') {
        eddInfo = data;
    } else if (key === 'edrInfo') {
        edrInfo = data;
    } else if (key === 'rmzInfo') {
        rmzInfo = data;
    } else if (key === 'tmzInfo') {
        tmzInfo = data;
    } else if (key === 'pjeInfo') {
        pjeInfo = data;
    }
}


function processItems(items, airspaceKey, map, layerArray) {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.geometry && (item.geometry.type === "Polygon" || item.geometry.type === "MultiPolygon")) {
            let polygon;
            switch (airspaceKey) {
                case 'edrLower':
                    if ((item.properties['Lower Limit Unit'] == 'FL' && item.properties['Lower Limit'] < 100) || (item.properties['Lower Limit Unit'] == 'FT' && item.properties['Lower Limit'] < 10000)) {
                        polygon = new EdrAirspace(item.geometry, item.properties.Name, item.properties.Ident, map, layerArray, item.properties['Center Latitude'], item.properties['Center Longitude'], item.properties['Lower Limit'], item.properties['Lower Limit Unit'], item.properties['Upper Limit'], item.properties['Upper Limit Unit']);
                    }
                    break;
                case 'edrUpper':
                    if ((item.properties['Lower Limit Unit'] == 'FL' && item.properties['Lower Limit'] >= 100) || (item.properties['Lower Limit Unit'] == 'FT' && item.properties['Lower Limit'] >= 10000)) {

                        polygon = new EdrAirspace(item.geometry, item.properties.Name, item.properties.Ident, map, layerArray, item.properties['Center Latitude'], item.properties['Center Longitude'], item.properties['Lower Limit'], item.properties['Lower Limit Unit'], item.properties['Upper Limit'], item.properties['Upper Limit Unit']);

                    }
                    break;
                case 'ctr':
                    polygon = new CtrAirspace(item.geometry, item.properties.nam, item.properties.Ident, map, layerArray, item.properties.latitude, item.properties.longitude, item.properties.lowerlimit, item.properties.lowerlimitunit, item.properties.upperlimit, item.properties.uplimitunit);
                    break;
                case 'fis':
                    polygon = new FisAirspace(item.geometry, item.properties.Ident, 'null', map, layerArray, item.properties.SVS);
                    break;
                case 'rmz':
                    polygon = new RmzAirspace(item.geometry, item.properties.Name, item.properties.Ident, map, layerArray, item.properties['Center Latitude'], item.properties['Center Longitude'], item.properties['Lower Limit'], item.properties['Lower Limit Unit'], item.properties['Upper Limit'], item.properties['Upper Limit Unit']);
                    break;
                case 'fir':
                    polygon = new FirAirspace(item.geometry, item.properties.Ident, 'null', map, layerArray);
                    break;
                case 'edd':
                    polygon = new EddAirspace(item.geometry, item.properties.Name, item.properties.Ident, map, layerArray, item.properties['Center Latitude'], item.properties['Center Longitude'], item.properties['Lower Limit'], item.properties['Lower Limit Unit'], item.properties['Upper Limit'], item.properties['Upper Limit Unit']);
                    break;
                case 'gafor':
                    polygon = new GaforAirspace(item.geometry, item.properties.gafor_nummer, 'null', map, layerArray);
                    break;
                case 'pje':
                    polygon = new PjeAirspace(item.geometry, item.properties.Name, item.properties.Ident, map, layerArray);
                    break;
                case 'tmz':
                    polygon = new TmzAirspace(item.geometry, item.properties.Name, item.properties.Ident, map, layerArray, item.properties['Center Latitude'], item.properties['Center Longitude'], item.properties['Lower Limit'], item.properties['Lower Limit Unit'], item.properties['Upper Limit'], item.properties['Upper Limit Unit']);
                    break;
                case 'atz':
                    polygon = new AtzAirspace(item.geometry, item.properties.Name, item.properties.Ident, map, layerArray);
                    break;
            }
            if (polygon) {
                polygon.addToMap();
                layerArray.push(polygon);
            }
        }
    }
}

function initializeSmallAerodromeEventHandler() {
    if (map) {
        map.on('zoomend', handleSmallAerodromeVisibilityBasedOnZoom);
    } else {
        console.error("Karte nicht initialisiert, bevor initializeMapEventHandlers aufgerufen wurde.");
    }
}

function toggleMarkers(key) {
    toggleActBtn(key);
    if (!markerData[key]) {
        console.warn(`Unbekannter Schlüssel: ${key}`);
        return;
    }
    const { markers, added, source } = markerData[key];
    if (!added) {
        if (key === "obstacle") {
            showObstacleMarkers(source, key);
        } else {
            showMarkers(source, key);
        }
    } else {
        if (key === "obstacle") {
            removeObstaceMarkers(key);
        } else {
            if (key === "aerodrome") {
                removeAerodromeMarkers(key);
            }
            markers.forEach(item => item.marker && map.removeLayer(item.marker));
            markerData[key].markers = [];
        }
    }
    markerData[key].added = !added;
}

function removeObstaceMarkers(key) {
    map.removeLayer(markerData[key].clusterLayer);
    markerData[key].markers = [];

}

function removeAerodromeMarkers(key) {
    if (smallAerodromesActive) {
        smallAerodromeInstances.forEach(saItem => {
            map.removeLayer(saItem.marker);

        });
        smallAerodromesActive = false;
    }
    smallAerodromeInstances = [];
}

function showObstacleMarkers(source, key) {
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
}


function showMarkers(source, key) {
    markerData[key].markers = source
        .map(data => {
            let item;
            if (key === "aerodrome") {
                initializeSmallAerodromeEventHandler();
                if (data.icaoCode) {
                    item = new Aerodrome(data.geometry, data.name, map, data.icaoCode, data.runways);
                } else {
                    item = new SmallAerodrome(data.geometry, data.name, map, data.runways);
                    smallAerodromeInstances.push(item);
                }
            } else if (key === "navaid") {
                item = new Navaid(data.geometry.coordinates[1], data.geometry.coordinates[0], data.properties.txtname, map, data.properties['select-source-layer'], data.properties.ident, data.properties.charted || data.properties.dme_charted, data.properties.icaocode, data.properties.type || 'unknown');
            }
            if (item && !(item instanceof SmallAerodrome)) {
                item.addToMap();
            }
            return item;
        });
    checkSmallAerodromeVisibilityBasedOnZoom(key);
}


function checkSmallAerodromeVisibilityBasedOnZoom(key) {
    if (map.getZoom() >= 9 && key === "aerodrome") {
        smallAerodromeInstances.forEach(saItem => {
            saItem.addToMap();
            smallAerodromesActive = true;
        })
    }
}


function handleSmallAerodromeVisibilityBasedOnZoom() {
    if (!map) {
        return;
    }
    const currentZoom = map.getZoom();
    if (currentZoom >= 9 && !smallAerodromesActive) {
        smallAerodromeInstances.forEach(saItem => {
            saItem.addToMap();
            smallAerodromesActive = true;
        })
    }
    if (currentZoom < 9 && smallAerodromesActive) {
        smallAerodromeInstances.forEach(saItem => {
            map.removeLayer(saItem.marker);
            smallAerodromesActive = false;
        })
    }
}

