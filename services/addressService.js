let currentAdressGeoJSONLayer = null;
let currentAddresses = [];
let searchCat = 'Standort';

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
    displayAddressList();
}

function createAddressButtonHtml(addressObj, index) {
    return `
        <button type="button" class="searchButton" onclick="handleAddressClick(${index})">
            ${addressObj.display_name}
        </button>
    `;
}

function showNoAddressFoundMessage(addressListElement) {
    addressListElement.innerHTML += `<span class="addressError">Es wurde keine Adresse gefunden.</span>`;
    setTimeout(() => {
        addressListElement.style.display = 'none';
    }, 1000);
}

function displayAddressList() {
    const addressListElement = document.getElementById('addressList');
    addressListElement.innerHTML = '';
    addressListElement.style.display = 'flex';
    if (currentAddresses.length > 0) {
        currentAddresses.forEach((addressObj, index) => {
            addressListElement.innerHTML += createAddressButtonHtml(addressObj, index);
        });
    } else {
        showNoAddressFoundMessage(addressListElement);
    }
}

function resetAddressSearchUI() {
    let searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    const addressList = document.getElementById('addressList');
    if (addressList) addressList.style.display = 'none';
    if (currentAdressGeoJSONLayer) {
        map.removeLayer(currentAdressGeoJSONLayer);
        currentAdressGeoJSONLayer = null;
    }
}

function createAndAddAddressGeoJsonLayer(address) {
    const geojson = address.geojson;
    const popupContent = `<strong>Adresse:</strong> ${address.display_name}`;
    function onEachFeatureCallback(feature, layer) {
        layer.bindPopup(popupContent);
    }
    currentAdressGeoJSONLayer = L.geoJSON(geojson, {
        onEachFeature: onEachFeatureCallback
    }).addTo(map);
    return geojson;
}

function setMapViewForAddress(address, geojson) {
    const lat = parseFloat(address.lat);
    const lon = parseFloat(address.lon);
    let zoomLevel = 12;
    if (geojson.type !== 'Polygon' && geojson.type !== 'MultiPolygon') {
        zoomLevel = 18;
        if (currentAdressGeoJSONLayer && currentAdressGeoJSONLayer.getLayers().length > 0) {
             currentAdressGeoJSONLayer.getLayers()[0].openPopup();
        }
    }
    map.setView([lat, lon], zoomLevel);
}

async function handleAddressClick(index) {
    resetAddressSearchUI();
    let address = currentAddresses[index];
    const geojson = createAndAddAddressGeoJsonLayer(address);
    setMapViewForAddress(address, geojson);
}

function setSearchCat(cat) {
    let searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = returnSearchPlaceholder(cat);
        searchInput.value = '';
    }
    let head = document.getElementById('searchCategoryHeadline');
    if (head) head.innerHTML = cat;
    searchCat = cat;
}

function returnSearchPlaceholder(cat) {
    if (cat === 'Standort') {
        return `Suche nach Adresse oder Koordinate`;
    }
    return `Suche nach ${cat}`;
}

function validateTimePart(value, partName, limit) {
    if (value >= limit) {
        alert(`Ungültige ${partName} (muss < ${limit} sein)`);
        return false;
    }
    return true;
}

function validateNorthCoordinate(northPart) {
    if (northPart.length >= 4) {
        const minutes = parseInt(northPart.substr(-4, 2));
        if (!validateTimePart(minutes, "Minuten im Breitengrad", 60)) return false;
    }
    if (northPart.length === 6) {
        const seconds = parseInt(northPart.substr(-2));
        if (!validateTimePart(seconds, "Sekunden im Breitengrad", 60)) return false;
    }
    return true;
}

function validateEastCoordinate(eastPart) {
    if (eastPart.length >= 5) {
        const minutes = parseInt(eastPart.substr(-4, 2));
        if (!validateTimePart(minutes, "Minuten im Längengrad", 60)) return false;
    }
    if (eastPart.length === 7) {
        const seconds = parseInt(eastPart.substr(-2));
        if (!validateTimePart(seconds, "Sekunden im Längengrad", 60)) return false;
    }
    return true;
}

function validateCoordinates(northPart, eastPart) {
    if (!validateNorthCoordinate(northPart)) return false;
    if (!validateEastCoordinate(eastPart)) return false;
    return true;
}

const searchConfig = {
    'Flugplatz': {
        dataGetter: async () => (!aerodromes || aerodromes.length === 0) ? await getData('aerodromes') : null,
        filter: (item, searchTerm) => {
            const name = item.name ? item.name.toUpperCase() : '';
            const icao = item.icaoCode ? item.icaoCode.toUpperCase() : '';
            return name.includes(searchTerm) || icao.includes(searchTerm);
        },
        display: (items) => displaySearchResults(items, 'Flugplatz')
    },
    'ED-R': {
        dataGetter: async () => { if (!edrAirspace || edrAirspace.length === 0) { await getData('edrAirspace'); await getData('edrInfo'); } },
        filter: (item, searchTerm) => (item.properties.Ident ? item.properties.Ident.toUpperCase() : '').includes(searchTerm),
        display: (items) => displaySearchResults(items, 'ED-R')
    },
    'ED-D': {
        dataGetter: async () => { if (!eddAirspace || eddAirspace.length === 0) { await getData('eddAirspace'); await getData('eddInfo'); } },
        filter: (item, searchTerm) => (item.properties.Ident ? item.properties.Ident.toUpperCase() : '').includes(searchTerm),
        display: (items) => displaySearchResults(items, 'ED-D')
    },
    'RMZ': {
        dataGetter: async () => { if (!rmzAirspace || rmzAirspace.length === 0) { await getData('rmzAirspace'); await getData('rmzInfo'); } },
        filter: (item, searchTerm) => (item.properties.Name ? item.properties.Name.toUpperCase() : '').includes(searchTerm),
        display: (items) => displaySearchResults(items, 'RMZ')
    },
    'CTR': {
        dataGetter: async () => { if (!ctrAirspace || ctrAirspace.length === 0) { await getData('ctrAirspace'); await getData('ctrInfo'); } },
        filter: (item, searchTerm) => (item.properties.nam ? item.properties.nam.toUpperCase() : '').includes(searchTerm),
        display: (items) => displaySearchResults(items, 'CTR')
    },
    'TMZ': {
        dataGetter: async () => { if (!tmzAirspace || tmzAirspace.length === 0) { await getData('tmzAirspace'); await getData('tmzInfo'); } },
        filter: (item, searchTerm) => (item.properties.Name ? item.properties.Name.toUpperCase() : '').includes(searchTerm),
        display: (items) => displaySearchResults(items, 'TMZ')
    },
    'PJE': {
        dataGetter: async () => { if (!pjeAirspace || pjeAirspace.length === 0) { await getData('pjeAirspace'); await getData('pjeInfo'); } },
        filter: (item, searchTerm) => {
            const name = item.properties.Name ? item.properties.Name.toUpperCase() : '';
            const ident = item.properties.Ident ? item.properties.Ident.toUpperCase() : '';
            return name.includes(searchTerm) || ident.includes(searchTerm);
        },
        display: (items) => displaySearchResults(items, 'PJE')
    },
    'Hinderniss': {
        dataGetter: async () => { if (!obstacles || obstacles.length === 0) await getData('obstacles'); },
        filter: (item, searchTerm) => (item['Parent Designator'] ? item['Parent Designator'].toUpperCase() : '').includes(searchTerm),
        display: (items) => displaySearchResults(items, 'Hinderniss')
    },
    'NAV-Aid': {
        dataGetter: async () => { if (!navAids || navAids.length === 0) await getData('navAids'); },
        filter: (item, searchTerm) => {
            const name = item.properties.txtname ? item.properties.txtname.toUpperCase() : '';
            const ident = item.properties.ident ? item.properties.ident.toUpperCase() : '';
            return name.includes(searchTerm) || ident.includes(searchTerm);
        },
        display: (items) => displaySearchResults(items, 'NAV-Aid')
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && searchInput.value.trim() !== '') {
                event.preventDefault();
                search();
            }
        });
    }
});

function formatAndPrepareDmsInput(input) {
    let cleanInput = input.replace(/\s/g, '');
    let northPart = cleanInput.match(/(\d{4,6})[NSns]/)[1];
    let eastPart = cleanInput.match(/(\d{5,7})[EWew]/)[1];
    if (!validateCoordinates(northPart, eastPart)) return null;

    while (northPart.length < 6) northPart += '0';
    while (eastPart.length < 7) eastPart += '0';

    const formatted = `${northPart}${cleanInput.match(/[NSns]/)[0].toUpperCase()}${eastPart}${cleanInput.match(/[EWew]/)[0].toUpperCase()}`;
    return formatted;
}

async function performCategorySearch(category, searchTerm) {
    const config = searchConfig[category];
    if (!config) return;
    await config.dataGetter();
    let sourceData;
    switch (category) {
        case 'Flugplatz': sourceData = aerodromes; break;
        case 'ED-R': sourceData = edrAirspace; break;
        case 'ED-D': sourceData = eddAirspace; break;
        case 'RMZ': sourceData = rmzAirspace; break;
        case 'CTR': sourceData = ctrAirspace; break;
        case 'TMZ': sourceData = tmzAirspace; break;
        case 'PJE': sourceData = pjeAirspace; break;
        case 'Hinderniss': sourceData = obstacles; break;
        case 'NAV-Aid': sourceData = navAids; break;
        default: sourceData = [];
    }
    const matchingItems = sourceData.filter(item => config.filter(item, searchTerm));
    config.display(matchingItems);
}

async function search() {
    const deleteSearchBtn = document.getElementById('deleteSearch');
    if (deleteSearchBtn) deleteSearchBtn.disabled = false;
    const searchInputElem = document.getElementById('searchInput');
    const searchInputValue = searchInputElem.value.toUpperCase();
    const dmsPattern = /^(\d{4,6})[NSns](\d{5,7})[EWew]$/;

    if (dmsPattern.test(searchInputValue.replace(/\s/g, ''))) {
        const formattedDms = formatAndPrepareDmsInput(searchInputValue);
        if (formattedDms) {
            searchInputElem.value = formattedDms;
            searchCoordinate(); 
        }
    } else if (searchCat === 'Callsign') {
        searchAcft();
    } else if (searchConfig[searchCat]) {
        await performCategorySearch(searchCat, searchInputValue);
    } else {
        searchAdress();
    }
}

function searchAcft() {
    let input = document.getElementById('searchInput').value;
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'inline-block';
    stopRadarInterval();
    setTimeout(() => {
        fetchAircraftDataCallsign(input); 
        if (loader) loader.style.display = 'none';
    }, 1000);
}

function createSearchResultButtonHtml(type, lat, lon, name, buttonText, edrTypeInfo) {
    const escapedName = name ? name.replace(/"/g, '&quot;') : '';
    let clickActionType = type;
    if (type === 'ED-R' && edrTypeInfo) clickActionType = edrTypeInfo;

    const clickFunctionCall = `goToLocation('${clickActionType}', ${lat}, ${lon}, '${escapedName}')`;
    return `<button class="searchButton" onclick="${clickFunctionCall}">${buttonText}</button>`;
}

function displaySearchResults(items, type) {
    const addressListElement = document.getElementById('addressList');
    addressListElement.innerHTML = '';
    addressListElement.style.display = 'flex';
    if (items.length > 0) {
        const limitedResults = items.slice(0, 10);
        limitedResults.forEach((item) => {
            const displayParams = getDisplayParams(item, type);
            let edrTypeDetail = (type === 'ED-R') ? findEdrType(displayParams) : null;
            if (displayParams.shouldDisplay) {
                addressListElement.innerHTML += createSearchResultButtonHtml(
                    type, displayParams.lat, displayParams.lon,
                    displayParams.name, displayParams.buttonText, edrTypeDetail
                );
            }
        });
    } else {
        showNoResults(type);
    }
}

function findEdrType(displayParams) {
    if (!displayParams) return 'edrUpper';
    if ((displayParams.lowerLimitUnit === 'FL' && displayParams.lowerLimit < 100) ||
        (displayParams.lowerLimitUnit === 'FT' && displayParams.lowerLimit < 10000)) {
        return 'edrLower';
    }
    return 'edrUpper';
}

function getFlugplatzDisplayParams(item) {
    return {
        shouldDisplay: true, lat: item.geometry.coordinates[1],
        lon: item.geometry.coordinates[0], name: item.icaoCode || item.name,
        buttonText: item.icaoCode ? `${item.name} - ${item.icaoCode}` : item.name
    };
}

function getNavAidDisplayParams(item) {
    return {
        shouldDisplay: true, lat: item.geometry.coordinates[1],
        lon: item.geometry.coordinates[0], name: item.properties.txtname,
        buttonText: `${item.properties.txtname} - ${item.properties.ident} (${item.properties['select-source-layer']})`
    };
}

function getHindernissDisplayParams(item) {
    return {
        shouldDisplay: true, lat: item.geoLat, lon: item.geoLong,
        name: item['Parent Designator'], buttonText: item['Parent Designator']
    };
}

function getEdrDisplayParams(item) {
    return {
        shouldDisplay: true, lat: item.properties['Center Latitude'],
        lon: item.properties['Center Longitude'], name: item.properties.Name,
        buttonText: `${item.properties.Ident} - ${item.properties.Name}`,
        lowerLimit: item.properties['Lower Limit'],
        lowerLimitUnit: item.properties['Lower Limit Unit']
    };
}

function getEddDisplayParams(item) {
    return {
        shouldDisplay: true, lat: item.properties['Center Latitude'],
        lon: item.properties['Center Longitude'], name: item.properties.Name,
        buttonText: `${item.properties.Ident} - ${item.properties.Name}`
    };
}

function getCtrDisplayParams(item) {
    return {
        shouldDisplay: true, lat: item.properties.latitude,
        lon: item.properties.longitude, name: item.properties.nam,
        buttonText: item.properties.nam
    };
}

function getDefaultAirspaceDisplayParams(item) {
    return {
        shouldDisplay: true, lat: item.properties['Center Latitude'],
        lon: item.properties['Center Longitude'], name: item.properties.Name,
        buttonText: item.properties.Name
    };
}

function getDisplayParams(item, type) {
    switch (type) {
        case 'Flugplatz': return getFlugplatzDisplayParams(item);
        case 'NAV-Aid': return getNavAidDisplayParams(item);
        case 'Hinderniss': return getHindernissDisplayParams(item);
        case 'ED-R': return getEdrDisplayParams(item);
        case 'ED-D': return getEddDisplayParams(item);
        case 'CTR': return getCtrDisplayParams(item);
        case 'RMZ': case 'TMZ': case 'PJE': return getDefaultAirspaceDisplayParams(item);
        default: return { shouldDisplay: false };
    }
}

function toggleMapLayerForLocation(typeConfigEntry, isMarkerType) {
    if (isMarkerType) {
        if (markerData && markerData[typeConfigEntry.markerKey] && !markerData[typeConfigEntry.markerKey].added) {
            toggleMarkers(typeConfigEntry.markerKey);
        }
    } else {
        if (polygonLayers && (!polygonLayers[typeConfigEntry.polygonKey] || polygonLayers[typeConfigEntry.polygonKey].length === 0)) {
            togglePolygons(typeConfigEntry.polygonKey);
        }
    }
}

function goToLocation(type, lat, lon, name) {
    const addressList = document.getElementById('addressList');
    if (addressList) addressList.style.display = 'none';
    const typeConfigMap = {
        'Flugplatz': { markerKey: 'aerodrome', zoom: 13, isMarker: true },
        'NAV-Aid': { markerKey: 'navaid', zoom: 13, isMarker: true },
        'Hinderniss': { markerKey: 'obstacle', zoom: 14, isMarker: true },
        'edrLower': { polygonKey: 'edrLower', zoom: 11, isMarker: false },
        'edrUpper': { polygonKey: 'edrUpper', zoom: 11, isMarker: false },
        'ED-D': { polygonKey: 'edd', zoom: 9, isMarker: false },
        'RMZ': { polygonKey: 'rmz', zoom: 11, isMarker: false },
        'CTR': { polygonKey: 'ctr', zoom: 11, isMarker: false },
        'TMZ': { polygonKey: 'tmz', zoom: 11, isMarker: false },
        'PJE': { polygonKey: 'pje', zoom: 11, isMarker: false }
    };
    const config = typeConfigMap[type];
    if (config) {
        toggleMapLayerForLocation(config, config.isMarker);
        map.setView([lat, lon], config.zoom);
    }
}

function showNoResults(type) {
    const addressList = document.getElementById('addressList');
    if (addressList) {
        addressList.innerHTML = `<span class="addressError">Es wurde kein ${type} gefunden.</span>`;
        setTimeout(() => {
            addressList.style.display = 'none';
        }, 1000);
    }
}

function resetSearchUIElements() {
    const searchInput = document.getElementById('searchInput');
    const addressList = document.getElementById('addressList');
    const deleteSearchBtn = document.getElementById('deleteSearch');
    if (addressList) addressList.style.display = 'none';
    if (searchInput) searchInput.value = '';
    if (deleteSearchBtn) deleteSearchBtn.disabled = true;
    let trackedAcftDiv = document.getElementById('trackedAcft');
    if (trackedAcftDiv) trackedAcftDiv.classList.add('hiddenTrackedAcft');
}

function resetTrackedAircraftFullState() {
    if (trackedAcft) {
        if (currentTrackLine) { map.removeLayer(currentTrackLine); currentTrackLine = null; }
        trackedAcft.isTracked = false;
        trackedAcft.updateMarkerStyle();
        trackedAcft = null;
    }
    if (flightDistLine) { map.removeLayer(flightDistLine); flightDistLine = null; }
    if (trackedIcaoDest) {
        trackedIcaoDest = null; trackedEta = '';
        let icaoDestInput = document.getElementById('icaoDest');
        if (icaoDestInput) icaoDestInput.value = '';
    }
    trackedAcftReg = 'nothing';
}

function resetMapOverlaysAndSelections() {
    if (currentAdressGeoJSONLayer) { map.removeLayer(currentAdressGeoJSONLayer); currentAdressGeoJSONLayer = null; }
    if (typeof markerData !== 'undefined' && markerData.navaid && markerData.navaid.added) toggleMarkers('navaid');
    if (typeof markers !== 'undefined' && markers) { markers.forEach(marker => map.removeLayer(marker)); markers = []; }
    if (typeof polylines !== 'undefined' && polylines) { polylines.forEach(line => map.removeLayer(line)); polylines = []; }
}

function resetNavaidAndDistanceState() {
    initialMarkerLat = null; initialMarkerLon = null; closestNavAid = null;
    foundNavAids = []; currentSequenceFoundNavAidNames = []; foundNavaidId = 0;
    clearAllDistanceMeasurements();
}

function resetSearch() {
    resetSearchUIElements();
    currentAddresses = [];
    resetTrackedAircraftFullState();
    resetMapOverlaysAndSelections();
    resetNavaidAndDistanceState();
}
