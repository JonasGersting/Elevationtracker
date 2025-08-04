let enrouteNotam = [];
let aerodromeNotam = [];
let bigRadiusNotam = [];
let allNOTAM = [];
let notamInstances = [];
let notamIsActive = false;
let lastNotamCheck;

async function getNotam(status) {

    try {
        const response = await fetch('https://lgnfme01.prod.bk.dfs/fmedatastreaming/NOTAM_TO_JSON/NOTAM_TO_JSON.fmw?SourceDataset_POSTGIS=notam_db%40adspg-azure&PARAMETER=%3CUnused%3E&DestDataset_JSON=notam.json&token=3deda2e16921c7ec22c8dc3a41b5c11a24daa577');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        allNOTAM = await response.json();
        splitAllNotam(allNOTAM, status);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function checkNotamAvailability() {
    if (allNOTAM.length === 0) {
        await getNotam('enroute');
        setLastNotamCheck();
    } else {
        let now = new Date();
        if (lastNotamCheck - now > 5 * 60 * 1000) {
            await getNotam('enroute');
            setLastNotamCheck();
        }
    }
    toggleNotamBtnStatus();
    if (notamIsActive) {
        removeNotams();
        notamIsActive = false;
    } else {
        notamIsActive = true;
        splitAllNotam(allNOTAM, 'enroute')
    }
}

function setLastNotamCheck() {
    const now = new Date();
    lastNotamCheck = now;
}

function removeNotams() {
    notamInstances.forEach(notam => notam.removeFromMap());
    notamInstances = [];
    enrouteNotam = [];
    aerodromeNotam = [];
    bigRadiusNotam = [];
}

function splitAllNotam(data, status) {
    data[0].all_NOTAM.notams.forEach(notam => {
        if (notam.radius > 25) {
            bigRadiusNotam.push(notam);
        } else if (notam.scope === 'AERODROME') {
            aerodromeNotam.push(notam);
        } else {
            enrouteNotam.push(notam);
        }
    });
    if (status === 'enroute') {
        showEnrouteNotam();
    }
}


function showEnrouteNotam() {
    enrouteNotam.forEach(notam => {
        const notamInstance = new Notam(
            map,
            notam.code23, notam.code34, notam.endDate, notam.est, notam.fir,
            notam.itemA, notam.itemD, notam.itemE, notam.itemF, notam.itemG,
            notam.latitude, notam.longitude, notam.lower, notam.nof,
            notam.notamID, notam.purpose, notam.qcode, notam.radius,
            notam.referredNotamId, notam.scope, notam.startDate,
            notam.sotreDate, notam.traffic, notam.type, notam.upper
        );
        notamInstances.push(notamInstance);
        notamInstance.addToMap();
    });
}

function toggleNotamBtnStatus() {
    const notamBtn = document.getElementById('notam');
    if (notamBtn.classList.contains('notamBtn-active')) {
        notamBtn.classList.remove('notamBtn-active');
    } else {
        notamBtn.classList.add('notamBtn-active');
    }

}


function convertToDMS(lat, lon) {
    const latAbs = Math.abs(lat);
    const latDeg = Math.floor(latAbs);
    const latMin = Math.round((latAbs - latDeg) * 60);
    const latDir = lat >= 0 ? 'N' : 'S';
    const latFormatted = String(latDeg).padStart(2, '0') + String(latMin).padStart(2, '0') + latDir;

    const lonAbs = Math.abs(lon);
    const lonDeg = Math.floor(lonAbs);
    const lonMin = Math.round((lonAbs - lonDeg) * 60);
    const lonDir = lon >= 0 ? 'E' : 'W';
    const lonFormatted = String(lonDeg).padStart(3, '0') + String(lonMin).padStart(2, '0') + lonDir;

    return latFormatted + lonFormatted;
}

function returnCorrectNOTAM(endDate, est, fir,
    itemA, itemD, itemE, itemF, itemG,
    latitude, longitude, lower, nof, notamID, purpose, qcode, radius,
    referredNotamId, scope, startDate, traffic, type, upper) {

    const notamType = type === 'R' ? `R <strong>${referredNotamId}</strong>` : type;

    let trafficType = '';
    if (traffic.includes('IFR')) trafficType += 'I';
    if (traffic.includes('VFR')) trafficType += 'V';

    let scopeType = '';
    if (scope.includes('AERODROME')) scopeType += 'A';
    if (scope.includes('EN-ROUTE')) scopeType += 'E';
    if (scope.includes('NAV WARNING')) scopeType += 'W';

    let purposeAbbr = '';
    if (purpose.includes('MISC')) purposeAbbr += 'M';
    if (purpose.includes('IMMEDIATE ATTENTION')) purposeAbbr += 'N';
    if (purpose.includes('OPERATIONAL SIGNIFICANCE')) purposeAbbr += 'B';
    if (purpose.includes('FLIGHT OPERATIONS')) purposeAbbr += 'O';


    const dmsCoords = convertToDMS(latitude, longitude);
    const paddedLower = String(lower).padStart(3, '0');
    const paddedUpper = String(upper).padStart(3, '0');
    const paddedRadius = String(radius).padStart(3, '0');
    const estStatus = est === 't' ? 'EST' : '';

    const formattedStartDate = startDate.slice(0, -2);
    const formattedEndDate = endDate.slice(0, -2);

    const itemDContent = itemD ? `<strong>D)</strong> ${itemD}<br>` : '';

    const itemFContent = itemF ? `<strong>F)</strong> ${itemF}` : '';
    const itemGContent = itemG ? `<strong>G)</strong> ${itemG}` : '';
    const itemFGLine = itemF || itemG ? `${itemFContent} ${itemGContent}<br>` : '';


    return `
    (<strong>${notamID}</strong> NOTAM${notamType}<br>
    <strong>Q)</strong> ${fir}/Q${qcode}/${trafficType}/${purposeAbbr}/${scopeType}/${paddedLower}/${paddedUpper}/${dmsCoords}${paddedRadius}<br>
    <strong>A)</strong> ${itemA} <strong>B)</strong> ${formattedStartDate} <strong>C)</strong> ${formattedEndDate} ${estStatus}<br>
    ${itemDContent}<strong>E)</strong> ${itemE}<br>
    ${itemFGLine}<strong>NOF:</strong> ${nof})
            
        `;
}