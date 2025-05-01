

let currentAerodrome;
let currentAirspace;
let weatherPath;
let rainviewerWeather;
let rainviewerClouds;
let currentTileLayer;
let osmb;
const monitorWarningDiv = document.getElementById('monitorToSmall');






// function checkScreenSize() {
//     if (!monitorWarningDiv) {
//         console.error("Element mit ID 'monitorToSmall' nicht gefunden.");
//         return;
//     }
//     const minWidth = 450;
//     if (window.innerWidth < minWidth) {
//         monitorWarningDiv.classList.remove('d-none');
//         document.getElementById('searchBtnWithLoader').classList.add('d-none');

//     } else {
//         monitorWarningDiv.classList.add('d-none');
//         document.getElementById('searchBtnWithLoader').classList.remove('d-none');
//     }
// }

// document.addEventListener('DOMContentLoaded', checkScreenSize);
// window.addEventListener('resize', checkScreenSize);

var slider = document.getElementById('opacity-slider');
var sliderValue = document.getElementById('slider-value');
slider.addEventListener('input', setOpacity);

var map = L.map('map', {
    zoomControl: false
}).setView([50.8, 10], 7);

var worldPolygon = L.polygon([
    [-90, -180],
    [-90, 180],
    [90, 180],
    [90, -180]
], {
    className: 'no-pointer-events',
    color: 'white',
    fillColor: 'white',
    fillOpacity: 0
}).addTo(map).bringToBack();

const buildingsCheckbox = document.getElementById('buildings-checkbox');
buildingsCheckbox.addEventListener('change', toggleBuildings);

function toggleBuildings() {
    if (buildingsCheckbox.checked) {
        try {
            osmb = new OSMBuildings(map);
            osmb.load('https://{s}.data.osmbuildings.org/0.2/59fcc2e8/tile/{z}/{x}/{y}.json');
            console.log("OSM Buildings aktiviert");
        } catch (e) {
            console.error("Fehler beim Aktivieren von OSM Buildings:", e);
        }
    } else {
        if (osmb) {
            console.log("Setze OSM Buildings-Referenz zurück");
            map.removeLayer(osmb);
            osmb = null;
        }
    }
}

function setOpacity() {
    var opacityValue = slider.value / 100;
    worldPolygon.setStyle({ fillOpacity: opacityValue });
    sliderValue.textContent = slider.value + '%';
}

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let openFlightMaps = L.tileLayer('https://nwy-tiles-api.prod.newaydata.com/tiles/{z}/{x}/{y}.png?path=2503/aero/latest', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openflightmaps.org/">OpenFlightMaps</a>'
});

let openAIP = L.tileLayer('https://api.tiles.openaip.net/api/data/openaip/{z}/{x}/{y}.png?apiKey=75acf00ad8bb52144424ce0655147c55', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openaip.net/">OpenAIP</a>'
});

let icaoCard = L.tileLayer('https://ais.dfs.de/static-maps/icao500/tiles/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.dfs.de">Deutsche Flugsicherung</a>'
});

var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

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

let googleSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    minZoom: 4,
    maxZoom: 22,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

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

toggleMap('topPlusOpen', 'backgroundMaps');

function toggleMap(mapKey, category) {
    const categoryStates = mapStates[category];
    const mapState = categoryStates[mapKey];
    if (!mapState.isHidden && category === 'backgroundMaps') {
        return;
    }
    toggleActBtn(mapKey);
    showMap(mapKey, category, mapState, categoryStates);
}

function showMap(mapKey, category, mapState, categoryStates) {
    if (mapState.isHidden) {
        handleShowLayer(mapKey, category, mapState, categoryStates);
    } else {
        handleHideLayer(mapKey, category, mapState);
    }
}

function handleShowLayer(mapKey, category, mapState, categoryStates) {
    if (isExclusiveLayer(category)) {
        hideOtherLayers(categoryStates);
    }
    addLayerToMap(mapKey, category, mapState);
    updateLayerVisibility(category, mapState);
}

function isExclusiveLayer(category) {
    return category === 'additionalLayers' || category === 'backgroundMaps';
}

function hideOtherLayers(categoryStates) {
    Object.keys(categoryStates).forEach(key => {
        const state = categoryStates[key];
        if (!state.isHidden && state.layer) {
            removeLayerAndUpdateButton(state, key);
        }
    });
}

function removeLayerAndUpdateButton(state, key) {
    map.removeLayer(state.layer);
    state.isHidden = true;
    const button = document.getElementById(key);
    if (button) {
        button.classList.remove('bgMapButtonActive');
    }
}

function addLayerToMap(mapKey, category, mapState) {
    if (mapState.layer) {
        mapState.layer.addTo(map);
        updateOpacityIfNeeded(mapKey, category, mapState);
        currentTileLayer = mapState.layer;
    }
}

function updateOpacityIfNeeded(mapKey, category, mapState) {
    if (category === 'backgroundMaps' || mapKey === 'icaoCard') {
        slider.value = mapState.opacity * 100;
        setOpacity();
    }
}

function updateLayerVisibility(category, mapState) {
    mapState.isHidden = false;
    if (category === 'backgroundMaps') {
        updateAdditionalLayerOrder();
    }
}

function handleHideLayer(mapKey, category, mapState) {
    if (category !== 'backgroundMaps') {
        map.removeLayer(mapState.layer);
        mapState.isHidden = true;
        handleIcaoCardRemoval(mapKey);
    }
}

function handleIcaoCardRemoval(mapKey) {
    if (mapKey === 'icaoCard') {
        const activeMap = findActiveBackgroundMap();
        updateOpacityFromActiveMap(activeMap);
    }
}

function findActiveBackgroundMap() {
    return Object.entries(mapStates.backgroundMaps)
        .find(([_, state]) => !state.isHidden);
}

function updateOpacityFromActiveMap(activeMap) {
    if (activeMap) {
        const [_, bgMapState] = activeMap;
        if (bgMapState.opacity !== undefined) {
            slider.value = bgMapState.opacity * 100;
            setOpacity();
        }
    }
}

function updateAdditionalLayerOrder() {
    const additionalLayers = mapStates.additionalLayers;
    Object.keys(additionalLayers).forEach(key => {
        const layerState = additionalLayers[key];
        if (!layerState.isHidden && layerState.layer) {
            map.removeLayer(layerState.layer);
            layerState.layer.addTo(map);
        }
    });
}

async function getWeather(weatherType) {
    try {
        const data = await fetchWeatherData();
        updateWeatherPath(weatherType, data);
        await updateWeatherLayer(weatherType);
        toggleWeatherMap(weatherType);
    } catch (error) {
        console.error(`Fehler: ${error.message}`);
    }
}

async function fetchWeatherData() {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
}

function updateWeatherPath(weatherType, data) {
    if (weatherType === 'weather') {
        weatherPath = data.radar.past[data.radar.past.length - 1].path;
    } else {
        weatherPath = data.satellite.infrared[data.satellite.infrared.length - 1].path;
    }
}

function updateWeatherLayer(weatherType) {
    if (weatherType === 'weather') {
        updateRainLayer();
    } else {
        updateCloudLayer();
    }
}

function updateRainLayer() {
    const url = `https://tilecache.rainviewer.com${weatherPath}/512/{z}/{x}/{y}/2/1_1.png`;
    if (!rainviewerWeather) {
        createRainLayer(url);
    } else {
        rainviewerWeather.setUrl(url);
    }
}

function updateCloudLayer() {
    const url = `https://tilecache.rainviewer.com${weatherPath}/256/{z}/{x}/{y}/0/1_0.png`;
    if (!rainviewerClouds) {
        createCloudLayer(url);
    } else {
        rainviewerClouds.setUrl(url);
    }
}

function createRainLayer(url) {
    rainviewerWeather = createWeatherLayer(url);
    mapStates.weatherLayers.rainviewerWeather.layer = rainviewerWeather;
}

function createCloudLayer(url) {
    rainviewerClouds = createWeatherLayer(url);
    mapStates.weatherLayers.rainviewerClouds.layer = rainviewerClouds;
}

function createWeatherLayer(url) {
    return L.tileLayer(url, {
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'
    });
}

function toggleWeatherMap(weatherType) {
    const layerKey = weatherType === 'weather' ? 'rainviewerWeather' : 'rainviewerClouds';
    toggleMap(layerKey, 'weatherLayers');
}

function toggleActBtn(id) {
    let button = document.getElementById(id);
    button.classList.toggle('bgMapButtonActive');
}

function toggleActBtnRadar() {
    let button = document.getElementById('radar');
    button.classList.toggle('radarBtnActive');
    let radarAttribution = document.getElementById('adsb-one-attribution');
    radarAttribution.classList.toggle('d-none');
}


