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


function displayAddressList() {
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = ''; 
    addressList.style.display = 'flex'; 
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

async function handleAddressClick(index) {
    let searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    const addressList = document.getElementById('addressList');
    addressList.style.display = 'none';
    if (currentAdressGeoJSONLayer) {
        map.removeLayer(currentAdressGeoJSONLayer);
    }
    let address = currentAddresses[index];
    const geojson = address.geojson;
    const lat = parseFloat(address.lat); 
    const lon = parseFloat(address.lon);
    const popupContent = `<strong>Adresse:</strong> ${address.display_name}`;
    function onEachFeature(feature, layer) {
        layer.bindPopup(popupContent); 
    }
    currentAdressGeoJSONLayer = L.geoJSON(geojson, {
        onEachFeature: onEachFeature
    }).addTo(map);
    let zoomLevel = 12; 
    if (geojson.type !== 'Polygon' && geojson.type !== 'MultiPolygon') {
        zoomLevel = 18; 
        currentAdressGeoJSONLayer.getLayers()[0].openPopup();
    }
    map.setView([lat, lon], zoomLevel);
}

function setSearchCat(cat) {
    let searchInput = document.getElementById('searchInput');
    searchInput.placeholder = returnSearchPlaceholder(cat);
    searchInput.value = '';
    let head = document.getElementById('searchCategoryHeadline');
    head.innerHTML = cat;
    searchCat = cat;
}

function returnSearchPlaceholder(cat) {
    if (cat === 'Standort') {
        return `Suche nach Adresse oder Koordinate`;
    } else {
        return `Suche nach ${cat}`;

    }
}

function validateCoordinates(northPart, eastPart) {
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
        dataGetter: async () => {
            if (!edrAirspace || edrAirspace.length === 0) {
                await getData('edrAirspace');
                await getData('edrInfo');
            }
        },
        filter: (item, searchTerm) => {
            const name = item.name ? item.name.toUpperCase() : '';
            return name.includes(searchTerm);
        },
        display: (items) => displaySearchResults(items, 'ED-R')
    },
    'ED-D': {
        dataGetter: async () => {
            if (!eddAirspace || eddAirspace.length === 0) {
                await getData('eddAirspace');
                await getData('eddInfo');
            }
        },
        filter: (item, searchTerm) => {
            const name = item.name ? item.name.toUpperCase() : '';
            return name.includes(searchTerm);
        },
        display: (items) => displaySearchResults(items, 'ED-D')
    },
    'RMZ': {
        dataGetter: async () => {
            if (!rmzAirspace || rmzAirspace.length === 0) {
                await getData('rmzAirspace');
                await getData('rmzInfo');
            }
        },
        filter: (item, searchTerm) => {
            const name = item.properties.Name ? item.properties.Name.toUpperCase() : '';
            return name.includes(searchTerm);
        },
        display: (items) => displaySearchResults(items, 'RMZ')
    },
    'CTR': {
        dataGetter: async () => {
            if (!ctrAirspace || ctrAirspace.length === 0) {
                await getData('ctrAirspace');
                await getData('ctrInfo');
            }
        },
        filter: (item, searchTerm) => {
            const name = item.name ? item.name.toUpperCase() : '';
            return name.includes(searchTerm);
        },
        display: (items) => displaySearchResults(items, 'CTR')
    },
    'TMZ': {
        dataGetter: async () => {
            if (!tmzAirspace || tmzAirspace.length === 0) {
                await getData('tmzAirspace');
                await getData('tmzInfo');
            }
        },
        filter: (item, searchTerm) => {
            const name = item.properties.Name ? item.properties.Name.toUpperCase() : '';
            return name.includes(searchTerm);
        },
        display: (items) => displaySearchResults(items, 'TMZ')
    },
    'PJE': {
        dataGetter: async () => {
            if (!pjeAirspace || pjeAirspace.length === 0) {
                await getData('pjeAirspace');
                await getData('pjeInfo');
            }
        },
        filter: (item, searchTerm) => {
            const name = item.properties.Name ? item.properties.Name.toUpperCase() : '';
            const ident = item.properties.Ident ? item.properties.Ident.toUpperCase() : '';
            return name.includes(searchTerm) || ident.includes(searchTerm);
        },
        display: (items) => displaySearchResults(items, 'PJE')
    },
    'Hinderniss': {
        dataGetter: async () => {
            if (!obstacles || obstacles.length === 0) {
                await getData('obstacles');
            }
        },
        filter: (item, searchTerm) => {
            const parentDesignator = item['Parent Designator'] ? item['Parent Designator'].toUpperCase() : '';
            return parentDesignator.includes(searchTerm);
        },
        display: (items) => displaySearchResults(items, 'Hinderniss')
    },
    'NAV-Aid': {
        dataGetter: async () => {
            if (!navAids || navAids.length === 0) {
                await getData('navAids');
            }
        },
        filter: (item, searchTerm) => {
            const name = item.properties.txtname ? item.properties.txtname.toUpperCase() : '';
            const ident = item.properties.ident ? item.properties.ident.toUpperCase() : '';
            return name.includes(searchTerm) || ident.includes(searchTerm);
        },
        display: (items) => displaySearchResults(items, 'NAV-Aid')
    }
};

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
    } else if (searchConfig[searchCat]) {
        const config = searchConfig[searchCat];
        await config.dataGetter();
        let sourceData;
        switch (searchCat) {
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
        const matchingItems = sourceData.filter(item => config.filter(item, input));
        config.display(matchingItems);
    } else {
        searchAdress();
    }
}

function searchAcft() {
    let input = document.getElementById('searchInput').value;
    const loader = document.getElementById('loader');
    loader.style.display = 'inline-block';
    stopRadarInterval();
    setTimeout(() => {
        fetchAircraftDataCallsign(input);
        loader.style.display = 'none';
    }, 1000);
}

function displaySearchResults(items, type) {
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = '';
    addressList.style.display = 'flex';
    if (items.length > 0) {
        const limitedResults = items.slice(0, 10);
        limitedResults.forEach((item) => {
            const displayParams = getDisplayParams(item, type);
            if (displayParams.shouldDisplay) {
                addressList.innerHTML += `
                <button class="searchButton" onclick="goToLocation('${type}', ${displayParams.lat}, ${displayParams.lon}, '${displayParams.name}')">
                     ${displayParams.buttonText}
                </button>
                `;
            }
        });
    } else {
        showNoResults(type);
    }
}

function getDisplayParams(item, type) {
    switch(type) {
        case 'Flugplatz':
            return {
                shouldDisplay: true,
                lat: item.geometry.coordinates[1],
                lon: item.geometry.coordinates[0],
                name: item.icaoCode || item.name,
                buttonText: item.icaoCode ? `${item.name} - ${item.icaoCode}` : item.name
            };
        case 'NAV-Aid':
            return {
                shouldDisplay: true,
                lat: item.geometry.coordinates[1],
                lon: item.geometry.coordinates[0],
                name: item.properties.txtname,
                buttonText: `${item.properties.txtname} - ${item.properties.ident} (${item.properties['select-source-layer']})`
            };
        case 'Hinderniss':
            return {
                shouldDisplay: true,
                lat: item.geoLat,
                lon: item.geoLong,
                name: item['Parent Designator'],
                buttonText: item['Parent Designator']
            };
        default: 
            return {
                shouldDisplay: true,
                lat: item.geometry.coordinates[0][0][1],
                lon: item.geometry.coordinates[0][0][0],
                name: item.name || item.properties.Name,
                buttonText: item.name || item.properties.Name
            };
    }
}

function goToLocation(type, lat, lon, name) {
    const addressList = document.getElementById('addressList');
    addressList.style.display = 'none';
    const typeConfig = {
        'Flugplatz': { markerKey: 'aerodrome', zoom: 13, isMarker: true },
        'NAV-Aid': { markerKey: 'navaid', zoom: 13, isMarker: true },
        'Hinderniss': { markerKey: 'obstacle', zoom: 14, isMarker: true },
        'ED-R': { polygonKey: 'edr', zoom: 11, isMarker: false },
        'ED-D': { polygonKey: 'edd', zoom: 9, isMarker: false },
        'RMZ': { polygonKey: 'rmz', zoom: 11, isMarker: false },
        'CTR': { polygonKey: 'ctr', zoom: 11, isMarker: false },
        'TMZ': { polygonKey: 'tmz', zoom: 11, isMarker: false },
        'PJE': { polygonKey: 'pje', zoom: 11, isMarker: false }
    };
    const config = typeConfig[type];
    if (config.isMarker) {
        if (!markerData[config.markerKey].added) {
            toggleMarkers(config.markerKey);
        }
    } else {
        if (!polygonLayers[config.polygonKey] || polygonLayers[config.polygonKey].length === 0) {
            togglePolygons(config.polygonKey);
        }
    }
    map.setView([lat, lon], config.zoom);
}

function showNoResults(type) {
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = `
        <span class="addressError">Es wurde kein ${type} gefunden.</span>
    `;
    setTimeout(() => {
        addressList.style.display = 'none';
    }, 1000);
}
