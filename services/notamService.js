let enrouteNotam = [];
let aerodromeNotam = [];
let allNOTAM = [
    {
        "code23": "NM",
        "code34": "CT",
        "endDate": "20250814130000",
        "est": "f",
        "fir": "EDGG",
        "itemA": "EDGG",
        "itemD": "DAILY 0600-1300",
        "itemE": "FULDA DVOR/DME FUL 112.10MHZ/CH58X ON MAINT. DO NOT USE, FALSE \nINDICATIONS POSS.",
        "itemF": "",
        "itemG": "",
        "latitude": "50.6",
        "longitude": "9.566666666666666",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "B0546/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "OBCE",
        "radius": "1",
        "referredNotamId": "",
        "scope": "EN-ROUTE",
        "startDate": "20250813060000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "ND",
        "code34": "AS",
        "endDate": "20250831235900",
        "est": "f",
        "fir": "EDWW",
        "itemA": "EDWW",
        "itemD": "",
        "itemE": "TRENT DME TRT CH21Y/108.45MHZ OUT OF SERVICE.",
        "itemF": "",
        "itemG": "",
        "latitude": "54.516666666666666",
        "longitude": "13.25",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "B0370/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NDAS",
        "radius": "25",
        "referredNotamId": "B0199/25",
        "scope": "EN-ROUTE",
        "startDate": "20250606082500",
        "storeDate": "20250606082000",
        "traffic": "IFR, VFR",
        "type": "R",
        "upper": "999"
    },
    {
        "code23": "NM",
        "code34": "CT",
        "endDate": "20250808120000",
        "est": "f",
        "fir": "EDGG",
        "itemA": "EDLW",
        "itemD": "",
        "itemE": "WICKEDE DVOR/DME DOR 108.65MHZ/CH23Y ON MAINT, DO NOT USE FALSE \nINDICATIONS POSS.",
        "itemF": "",
        "itemG": "",
        "latitude": "51.53333333333333",
        "longitude": "7.633333333333333",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3901/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NMCT",
        "radius": "25",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250804061800",
        "storeDate": "20250804061300",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "NB",
        "code34": "AS",
        "endDate": "20251001235900",
        "est": "f",
        "fir": "EDGG",
        "itemA": "EDFH",
        "itemD": "",
        "itemE": "HAHN NDB HAN 376KHZ U/S.",
        "itemF": "",
        "itemG": "",
        "latitude": "49.96666666666667",
        "longitude": "7.283333333333333",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3873/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NBAS",
        "radius": "25",
        "referredNotamId": "A2214/25",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250801110400",
        "storeDate": "20250801105900",
        "traffic": "IFR, VFR",
        "type": "R",
        "upper": "999"
    },
    {
        "code23": "NM",
        "code34": "CT",
        "endDate": "20250827120000",
        "est": "f",
        "fir": "EDMM",
        "itemA": "EDDN",
        "itemD": "AUG 25 26 DAILY 0600-1400, AUG 27 0600-1200",
        "itemE": "NUERNBERG DVOR/DME NUB 115.75MHZ/CH104Y ON MAINT. DO NOT USE, \nFALSE \nINDICATIONS POSS.",
        "itemF": "",
        "itemG": "",
        "latitude": "49.5",
        "longitude": "11.033333333333333",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3853/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NMCT",
        "radius": "25",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250825060000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "NM",
        "code34": "CT",
        "endDate": "20250829110000",
        "est": "f",
        "fir": "EDGG",
        "itemA": "EDDF",
        "itemD": "28 0630-1300, 29 0630-1100",
        "itemE": "FRANKENSTEIN DVOR/DME FKS 117.50MHZ/CH122X ON MAINT, DO NOT USE, \nFALSE INDICATIONS POSS.",
        "itemF": "",
        "itemG": "",
        "latitude": "49.78333333333333",
        "longitude": "8.55",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3852/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NMCT",
        "radius": "25",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250828063000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "ND",
        "code34": "CT",
        "endDate": "20250820080000",
        "est": "f",
        "fir": "EDGG",
        "itemA": "EDDS",
        "itemD": "",
        "itemE": "LUBURG VOR/DME LBU 109.20MHZ/CH29X, DME PART ON MAINT. \nDO NOT USE, FALSE INDICATIONS POSS.",
        "itemF": "",
        "itemG": "",
        "latitude": "48.916666666666664",
        "longitude": "9.333333333333334",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3851/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NDCT",
        "radius": "25",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250820070000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "ND",
        "code34": "CT",
        "endDate": "20251111235900",
        "est": "t",
        "fir": "EDGG",
        "itemA": "EDDF",
        "itemD": "",
        "itemE": "CHARLIE DME CHA 115.35MHZ/CH100Y, ON MAINT. DO NOT USE, FALSE \nINDICATIONS POSS.",
        "itemF": "",
        "itemG": "",
        "latitude": "49.916666666666664",
        "longitude": "9.033333333333333",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3834/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NDCT",
        "radius": "25",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250811053000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "NM",
        "code34": "CT",
        "endDate": "20250815120000",
        "est": "f",
        "fir": "EDGG",
        "itemA": "EDDL",
        "itemD": "",
        "itemE": "BARMEN DVOR/DME BAM 114.00MHZ/CH87X ON TEST. DO NOT USE, FALSE \nINDICATIONS POSS.",
        "itemF": "",
        "itemG": "",
        "latitude": "51.333333333333336",
        "longitude": "7.183333333333334",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3767/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NMCT",
        "radius": "25",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250811060000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "NM",
        "code34": "CT",
        "endDate": "20250821130000",
        "est": "f",
        "fir": "EDGG",
        "itemA": "EDDR",
        "itemD": "",
        "itemE": "GERMINGHAUSEN DVOR/DME GMH 115.40MHZ/CH101X ON TEST. DO NOT USE, \nFALSE INDICATIONS POSS.",
        "itemF": "",
        "itemG": "",
        "latitude": "51.166666666666664",
        "longitude": "7.9",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3764/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NMCT",
        "radius": "25",
        "referredNotamId": "",
        "scope": "AERODROME",
        "startDate": "20250819060000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "ND",
        "code34": "CT",
        "endDate": "20250929120000",
        "est": "f",
        "fir": "EDGG",
        "itemA": "EDDR",
        "itemD": "",
        "itemE": "SAARBRUECKEN DME DSB CH48X / 111.10MHZ ON MAINTENANCE. DO NOT \nUSE, FALSE INDICATIONS POSSIBLE.",
        "itemF": "",
        "itemG": "",
        "latitude": "49.21666666666667",
        "longitude": "7.116666666666666",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3760/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NDCT",
        "radius": "25",
        "referredNotamId": "",
        "scope": "AERODROME",
        "startDate": "20250818070000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "NM",
        "code34": "AS",
        "endDate": "20250820093000",
        "est": "f",
        "fir": "EDWW",
        "itemA": "EDDH",
        "itemD": "",
        "itemE": "HAMBURG DVOR/DME HAM 113.1MHZ / CH78X U/S.",
        "itemF": "",
        "itemG": "",
        "latitude": "53.68333333333333",
        "longitude": "10.2",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3752/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NMAS",
        "radius": "25",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250820073000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "NM",
        "code34": "CT",
        "endDate": "20250814110000",
        "est": "f",
        "fir": "EDWW",
        "itemA": "EDDV",
        "itemD": "",
        "itemE": "HEHLINGEN DVOR/DME HLZ 117.30MHZ/CH120X ON MAINT. DO NOT USE, \nFALSE INDICATION POSS.",
        "itemF": "",
        "itemG": "",
        "latitude": "52.36666666666667",
        "longitude": "10.8",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3621/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NMCT",
        "radius": "25",
        "referredNotamId": "",
        "scope": "AERODROME",
        "startDate": "20250812073000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "NM",
        "code34": "AS",
        "endDate": "20250806133000",
        "est": "f",
        "fir": "EDWW",
        "itemA": "EDDV",
        "itemD": "",
        "itemE": "NIENBURG DVOR/DME NIE 109.25MHZ/CH29Y OUT OF SERVICE.",
        "itemF": "",
        "itemG": "",
        "latitude": "52.63333333333333",
        "longitude": "9.366666666666667",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "A3613/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "NMAS",
        "radius": "250",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250806073000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    }, {
        "code23": "NM",
        "code34": "AS",
        "endDate": "20250806133000",
        "est": "f",
        "fir": "EDWW",
        "itemA": "EDDV",
        "itemD": "",
        "itemE": "EDR 5 ADD ACT.",
        "itemF": "",
        "itemG": "",
        "latitude": "52.63333333333333",
        "longitude": "9.366666666666667",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "D3678/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "RRCA",
        "radius": "20",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250806073000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "NM",
        "code34": "AS",
        "endDate": "20250806133000",
        "est": "f",
        "fir": "EDWW",
        "itemA": "EDDV",
        "itemD": "",
        "itemE": "NIENBURG DVOR/DME NIE 109.25MHZ/CH29Y OUT OF SERVICE.",
        "itemF": "",
        "itemG": "",
        "latitude": "52.63333333333333",
        "longitude": "9.366666666666667",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "D3613/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "AAXX",
        "radius": "225",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250806073000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "NM",
        "code34": "AS",
        "endDate": "20250806133000",
        "est": "f",
        "fir": "EDWW",
        "itemA": "EDDV",
        "itemD": "",
        "itemE": "DROPPING ZONE ADD ACT.",
        "itemF": "",
        "itemG": "",
        "latitude": "52.63333333333333",
        "longitude": "9.366666666666667",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "D3613/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "WPLW",
        "radius": "3",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250806073000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    },
    {
        "code23": "NM",
        "code34": "AS",
        "endDate": "20250806133000",
        "est": "f",
        "fir": "EDWW",
        "itemA": "EDDV",
        "itemD": "",
        "itemE": "HESSEN NR. 15 OUT OF SERVICE.",
        "itemF": "",
        "itemG": "",
        "latitude": "52.63333333333333",
        "longitude": "9.366666666666667",
        "lower": "0",
        "nof": "EDDZ",
        "notamID": "F3613/25",
        "purpose": "OPERATIONAL SIGNIFICANCE, FLIGHT OPERATIONS",
        "qcode": "OLAS",
        "radius": "1",
        "referredNotamId": "",
        "scope": "AERODROME, EN-ROUTE",
        "startDate": "20250806073000",
        "storeDate": "20250805145500",
        "traffic": "IFR, VFR",
        "type": "N",
        "upper": "999"
    }
];
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
        showErrorBanner('Fehler beim Laden der NOTAM-Daten. Bitte versuchen Sie es später erneut.');
    }
}

async function revealEnrouteNotam() {
    // if (allNOTAM.length === 0) {
    //     await getNotam('enroute');
    //     setLastNotamCheck();
    // } else {
    //     let now = new Date();
    //     if (lastNotamCheck.getTime() - now.getTime() > 5 * 60 * 1000) {
    //         await getNotam('enroute');
    //         setLastNotamCheck();
    //     }
    // }
    toggleNotamBtnStatus();
    toggleNotamFilter();
    if (notamIsActive) {
        removeNotam();
        notamIsActive = false;
    } else {
        notamIsActive = true;
        document.getElementById('allQcodes').checked = true;
        document.getElementById('Sperrgebiete').checked = true;
        document.getElementById('Warnings').checked = true;
        document.getElementById('NAV-Anlagen').checked = true;
        document.getElementById('Hindernisse').checked = true;
        document.getElementById('excWideArea').checked = true;
        splitAllNotam(allNOTAM, 'enroute');
    }
}

function toggleNotamFilter() {
    const notamFilter = document.getElementById('notamFilter');
    if (notamFilter.style.display === 'none' || notamFilter.style.display === '') {
        notamFilter.style.display = 'flex';
    } else {
        notamFilter.style.display = 'none';
    }
}

function setLastNotamCheck() {
    const now = new Date();
    lastNotamCheck = now;
}

function removeNotam() {
    notamInstances.forEach(notam => notam.removeFromMap());
}

function splitAllNotam(data, status) {
    enrouteNotam = [];
    aerodromeNotam = [];
    // Assuming data is an array of NOTAM objects
    // Uncomment the next line if data is structured differently
    // data = data[0].all_NOTAM.notams;
    // data[0].all_NOTAM.notams.forEach(notam => {
    data.forEach(notam => {
        if (notam.scope === 'AERODROME') {
            aerodromeNotam.push(notam);
        } else {
            enrouteNotam.push(notam);
        }
    });
    if (status === 'enroute') {
        createNotamInstances();
        redrawAllNotams();
    }
}


function createNotamInstances() {
    notamInstances = [];
    enrouteNotam.forEach(notam => {
        const notamInstance = new Notam(
            map,
            notam.code23, notam.code34, notam.endDate, notam.est, notam.fir,
            notam.itemA, notam.itemD, notam.itemE, notam.itemF, notam.itemG,
            parseFloat(notam.latitude), parseFloat(notam.longitude), notam.lower, notam.nof,
            notam.notamID, notam.purpose, notam.qcode, parseInt(notam.radius, 10),
            notam.referredNotamId, notam.scope, notam.startDate,
            notam.sotreDate, notam.traffic, notam.type, notam.upper
        );
        notamInstances.push(notamInstance);
    });
}

function redrawAllNotams() {
    removeNotam();
    const allQcodesChecked = document.getElementById('allQcodes').checked;
    const excludeWideArea = document.getElementById('excWideArea').checked;
    let qCodeFilteredInstances;
    if (allQcodesChecked) {
        qCodeFilteredInstances = notamInstances;
    } else {
        const activeQCodePrefixes = [];
        const filterCheckboxes = document.querySelectorAll('#notamFilter input[type="checkbox"]:checked:not([id="allQcodes"]):not([id="excWideArea"])');
        filterCheckboxes.forEach(cb => {
            activeQCodePrefixes.push(cb.dataset.qcode);
        });
        if (activeQCodePrefixes.length > 0) {
            qCodeFilteredInstances = notamInstances.filter(notam =>
                activeQCodePrefixes.some(prefix => notam.qcode.startsWith(prefix))
            );
        } else {
            qCodeFilteredInstances = [];
        }
    }
    let finalFilteredInstances;
    if (excludeWideArea) {
        finalFilteredInstances = qCodeFilteredInstances.filter(notam => notam.radius <= 25);
    } else {
        finalFilteredInstances = qCodeFilteredInstances;
    }
    finalFilteredInstances.sort((a, b) => b.radius - a.radius);
    finalFilteredInstances.forEach(notam => notam.addToMap());
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

function filterNotam(cat) {
    const checkbox = document.getElementById(cat);
    if (!checkbox) return;
    if (cat === 'allQcodes') {
        const state = checkbox.checked ? 'checked' : 'unchecked';
        setStateSimpleCheckbox('Sperrgebiete', state);
        setStateSimpleCheckbox('Warnings', state);
        setStateSimpleCheckbox('NAV-Anlagen', state);
        setStateSimpleCheckbox('Hindernisse', state);
    } else if (cat !== 'excWideArea') {
        setAllQcodesCheckboxState();
    }
    redrawAllNotams();
}

function setCorrectCheckboxes(cat, state) {
    if (cat == 'all Notam') {
        setStateAllCheckboxes(state);
    } else {
        setStateSimpleCheckbox(cat, state);
    }
}

function setStateAllCheckboxes(state) {
    if (state === 'checked') {
        const checkboxes = document.querySelectorAll('#notamFilter input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
    } else if (state === 'unchecked') {
        const checkboxes = document.querySelectorAll('#notamFilter input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}

function setStateSimpleCheckbox(cat, state) {
    if (state === 'checked') {
        const checkbox = document.getElementById(cat);
        if (checkbox) {
            checkbox.checked = true;
        }
    } else if (state === 'unchecked') {
        const checkbox = document.getElementById(cat);
        if (checkbox) {
            checkbox.checked = false;
        }
    }
}

function setAllQcodesCheckboxState() {
    const allQcodesCheckbox = document.getElementById('allQcodes');
    const otherQcodeCheckboxes = document.querySelectorAll('#notamFilter input[type="checkbox"][data-qcode]:not([data-qcode="exc"])');
    const allOthersAreChecked = Array.from(otherQcodeCheckboxes).every(cb => cb.checked);
    allQcodesCheckbox.checked = allOthersAreChecked;
}

function setAllNotamCheckboxState() {
    const allNotamCheckbox = document.getElementById('all Notam');
    const otherCheckboxes = document.querySelectorAll('#notamFilter input[type="checkbox"]:not([id="all Notam"])');
    const allOthersAreChecked = Array.from(otherCheckboxes).every(cb => cb.checked);
    allNotamCheckbox.checked = allOthersAreChecked;
}