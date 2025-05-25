let navAids;
let aerodromes;
let obstacles;
let aipInfo;
let ctrInfo;
let eddInfo;
let edrInfo;
let tmzInfo;
let rmzInfo;
let pjeInfo;
let polygonIsBroughtUpToFront = false;
let isCursorOverPolygon = false;
let markers = [];
let polylines = [];
let initialMarkerLat = null; 
let initialMarkerLon = null; 
let distanceMeasurements = [];
let activeMeasurement = null;



function checkCursorOverPolygon() {
    if (!isCursorOverPolygon) {
        polygonIsBroughtUpToFront = false;
    } else {
        polygonIsBroughtUpToFront = true;
    }
}

document.addEventListener('mousemove', () => {
    checkCursorOverPolygon();
});

const customIcon = L.icon({
    iconUrl: './img/mapPin.png',
    iconSize: [48, 48],     
    iconAnchor: [24, 48],   
    popupAnchor: [0, -48]  
});

function createMarker(lat, lng) {
    initialMarkerLat = lat;
    initialMarkerLon = lng;
    if (!markerData.navaid.added) {
        toggleMarkers('navaid');
    }
    const marker = L.marker([lat, lng],{
        icon: customIcon,
    }).addTo(map);
    markers.push(marker);
    map.setView([lat, lng], Math.min(map.getZoom() + 2, map.getMaxZoom()));
    getElevation(lat, lng).then(elevation => {
        marker.bindPopup(`<b>Höhe:</b> ${elevation}FT<br>
            <button class="navAidBtn marginTop16"  onclick="findClosestNavAid(${lat},${lng})">NAV-AID</button>
            <button class="navAidBtn marginTop16" onclick="startDistanceMeasurement(${lat},${lng})">DIST</button>`).openPopup();
    });
}

function startDistanceMeasurement(lat, lng) {
    if (activeMeasurement) return;
    const startPoint = [lat, lng];
    activeMeasurement = {
        id: Date.now(),
        startPoint: startPoint,
        line: L.polyline([startPoint, startPoint], {
            color: 'red',
            weight: 2,
            dashArray: '5, 10'
        }).addTo(map),
        label: createDistanceLabelNavAid()
    };   
    map.on('mousemove', updateActiveDistanceLine);
    map.once('click', finishDistanceMeasurement);
    modifyNavaidMarkers(true);
}

function createDistanceLabelNavAid() {
    const label = L.DomUtil.create('div', 'distance-label');
    document.getElementById('map').appendChild(label);
    return label;
}

function updateActiveDistanceLine(e) {
    if (!activeMeasurement) return;
    const endPoint = [e.latlng.lat, e.latlng.lng];
    activeMeasurement.line.setLatLngs([activeMeasurement.startPoint, endPoint]);
    const distance = calculateDistanceNavAid(
        activeMeasurement.startPoint[0], activeMeasurement.startPoint[1],
        endPoint[0], endPoint[1]
    );
    updateDistanceLabel(activeMeasurement, distance, endPoint);
}

function calculateDistanceNavAid(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * (Math.PI / 180);
    const R = 3440; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

function updateDistanceLabel(measurement, distance, endPoint) {
    if (!measurement || !measurement.label) {
        console.error("Fehler: updateDistanceLabel wurde ohne gültiges Label aufgerufen.", measurement);
        return; // Funktion sicher beenden
    }
    const midPoint = [
        (measurement.startPoint[0] + endPoint[0]) / 2,
        (measurement.startPoint[1] + endPoint[1]) / 2
    ];
    const point = map.latLngToContainerPoint(midPoint);
    measurement.label.style.left = (point.x - 30) + 'px';
    measurement.label.style.top = (point.y - 10) + 'px';
    measurement.label.textContent = `${distance.toFixed(1)} NM`;
}


function finishDistanceMeasurement(e) {
    if (!activeMeasurement) return;
    const measurement = activeMeasurement;
    const endPoint = [e.latlng.lat, e.latlng.lng];
    const finalEndPoint = (e.target instanceof L.Marker) ? 
        [e.target.getLatLng().lat, e.target.getLatLng().lng] : endPoint;
    measurement.line.setLatLngs([measurement.startPoint, finalEndPoint]);
    const distance = calculateDistanceNavAid(
        measurement.startPoint[0], measurement.startPoint[1],
        finalEndPoint[0], finalEndPoint[1]
    );
    updateDistanceLabel(measurement, distance, finalEndPoint);
    map.off('mousemove', updateActiveDistanceLine);
    const moveListener = () => {
        const latLngs = measurement.line.getLatLngs();
        if (!latLngs || latLngs.length < 2) return;
        const mid = [
            (latLngs[0].lat + latLngs[1].lat) / 2,
            (latLngs[0].lng + latLngs[1].lng) / 2
        ];
        const newPoint = map.latLngToContainerPoint(mid);
        
        measurement.label.style.left = (newPoint.x - 30) + 'px';
        measurement.label.style.top = (newPoint.y - 10) + 'px';
    };
    map.on('move', moveListener);
    measurement.moveListener = moveListener;
    distanceMeasurements.push(measurement);
    modifyNavaidMarkers(false);
    activeMeasurement = null;
}

function modifyNavaidMarkers(isForMeasurement) {
    if (!markerData.navaid.markers) return;
    markerData.navaid.markers.forEach(navaid => {
        if (!navaid.marker) return;
        if (isForMeasurement) {
            navaid.marker._originalPopup = navaid.marker.getPopup();
            navaid.marker.unbindPopup();
            navaid.marker.on('click', finishDistanceMeasurement);
        } else {
            navaid.marker.off('click', finishDistanceMeasurement);
            if (navaid.marker._originalPopup) {
                navaid.marker.bindPopup(navaid.marker._originalPopup);
                delete navaid.marker._originalPopup;
            }
        }
    });
}


function clearAllDistanceMeasurements() {
    if (activeMeasurement) {
        map.off('mousemove', updateActiveDistanceLine);
        map.off('click', finishDistanceMeasurement);
        activeMeasurement.line.remove();
        activeMeasurement.label.remove();
        activeMeasurement = null;
        modifyNavaidMarkers(false);
    }
    distanceMeasurements.forEach(measurement => {
        measurement.line.remove();
        measurement.label.remove();
        if (measurement.moveListener) {
            map.off('move', measurement.moveListener);
        }
    });
    distanceMeasurements = [];
}

let closestNavAid = null;
let foundNavAids = []; 
let foundNavaidId = 0;


let currentSequenceFoundNavAidNames = [];


function findClosestNavAid(markerLat, markerLon) {

    let closestNavAidData = null;
    let shortestDistance = Infinity;
    let closestNavAidLatLng = null;

    if (!navAids || navAids.length === 0) {
        console.error("NavAids-Daten sind nicht verfügbar oder leer.");
        alert("Navigationshilfen-Daten nicht geladen.");
        return;
    }

    navAids.forEach(navaid => {
        const navAidName = navaid.properties.txtname;

        // Überspringe NavAids, die in dieser Sequenz bereits gefunden wurden
        if (currentSequenceFoundNavAidNames.includes(navAidName)) {
            return;
        }

        // Anwenden der Filterkriterien
        if (((navaid.properties.charted && navaid.properties.charted.includes('ICAO500')) ||
            (navaid.properties.dme_charted && (navaid.properties.dme_charted.includes('ICAO500') || navaid.properties.dme_charted.includes('NN')))) && (navaid.properties.icaocode == 'ED' || navaid.properties.icaocode == 'ET')) {

            const navaidLat = navaid.geometry.coordinates[1];
            const navaidLon = navaid.geometry.coordinates[0];
            const distance = haversine(markerLat, markerLon, navaidLat, navaidLon);

            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestNavAidData = navaid;
                closestNavAidLatLng = [navaidLat, navaidLon];
            }
        }
    });

    if (closestNavAidData && closestNavAidLatLng) {
        console.log('Nächstes NavAid gefunden:', closestNavAidData.properties.txtname, 'Distanz:', shortestDistance);
        currentSequenceFoundNavAidNames.push(closestNavAidData.properties.txtname);
        const angle = calculateAngle(
            closestNavAidLatLng[0], closestNavAidLatLng[1],
            markerLat, markerLon
        );
        const line = L.polyline([
            [markerLat, markerLon],
            closestNavAidLatLng
        ], {
            color: 'red',
            weight: 2,
            dashArray: '5, 10'
        }).addTo(map);
        polylines.push(line);
        const popupContent = `
            <div>
                <p>${shortestDistance.toFixed(2)}NM ${returnOrientation(angle.toFixed(2))} ${closestNavAidData.properties.txtname} ${closestNavAidData.properties.type || closestNavAidData.properties['select-source-layer']} ${closestNavAidData.properties.ident}</p>
                <button class="navAidBtn" onclick="findClosestNavAid(${markerLat}, ${markerLon})" >Finde nächstes Navaid</button>
            </div>
        `;
        line.bindPopup(popupContent).openPopup();
    } else {
        console.log('Kein (weiteres) passendes NavAid gefunden.');
        if (currentSequenceFoundNavAidNames.length > 0) {
            alert("Keine weiteren passenden NavAids für diesen Punkt gefunden.");
        } else {
            alert("Es wurde kein passendes Navaid gefunden.");
        }
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

function haversine(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * (Math.PI / 180);
    const R = 3440; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

function calculateAngle(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * (Math.PI / 180);
    const toDeg = rad => rad * (180 / Math.PI);
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaLambda = toRad(lon2 - lon1);
    const x = Math.sin(deltaLambda) * Math.cos(phi2);
    const y = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
    let angle = toDeg(Math.atan2(x, y));
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}

async function getElevation(lat, lng) {
    const response = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`);
    if (!response.ok) {
        console.error('Fehler beim Abrufen der Höhe:', response.statusText);
        return 'Unbekannt';
    }
    const data = await response.json();
    return (data.elevation * 3.28084).toFixed(2); 
}

function parseDMS(dms) {
    const latPattern = /(\d{2})(\d{2})(\d{2})([NS])/; 
    const lngPattern = /(\d{3})(\d{2})(\d{2})([EW])/; 
    const latMatch = dms.match(latPattern);
    const lngMatch = dms.match(lngPattern);
    if (latMatch && lngMatch) {
        const latDegrees = parseInt(latMatch[1], 10) + parseInt(latMatch[2], 10) / 60 + parseInt(latMatch[3], 10) / 3600;
        const lngDegrees = parseInt(lngMatch[1], 10) + parseInt(lngMatch[2], 10) / 60 + parseInt(lngMatch[3], 10) / 3600;
        const lat = latMatch[4] === 'N' ? latDegrees : -latDegrees;
        const lng = lngMatch[4] === 'E' ? lngDegrees : -lngDegrees;
        return [lat, lng];
    }
    return [null, null]; 
}

function searchCoordinate() {
    const searchInput = document.getElementById('searchInput').value;
    let latLng = parseDMS(searchInput);
    createMarker(latLng[0], latLng[1]);
}


