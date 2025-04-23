
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
let trackedAcftImg = '';
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
    const cachedData = await getFromIndexedDB(key);
    if (cachedData) {
        console.log(`Daten für ${key} aus dem Cache geladen.`);
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
        rmzAirspace = data;
    } else if (key === 'firAirspace') {
        firAirspace = data[0]?.features;
    } else if (key === 'gaforAirspace') {
        gaforAirspace = data[0]?.features;
    } else if (key === 'pjeAirspace') {
        pjeAirspace = data;
    } else if (key === 'tmzAirspace') {
        tmzAirspace = data;
    } else if (key === 'atzAirspace') {
        atzAirspace = data[0]?.features;
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