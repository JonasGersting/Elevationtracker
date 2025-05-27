function toDMS(coordinate, isLatitude) {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    const direction = isLatitude
        ? coordinate >= 0 ? 'N' : 'S'
        : coordinate >= 0 ? 'E' : 'W';
    const degreesStr = String(degrees).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    return `${degreesStr}° ${minutesStr}' ${secondsStr}''${direction}`;
}

function showCursorCoordinates(map) {
    const displayDiv = document.getElementById('showActualPos');
    if (!displayDiv) {
        console.error("Element mit der ID 'showActualPos' nicht gefunden.");
        return;
    }
    map.on('mousemove', function (event) {
        const { lat, lng } = event.latlng;
        const latitudeDMS = toDMS(lat, true);
        const longitudeDMS = toDMS(lng, false);
        displayDiv.textContent = `${latitudeDMS} ${longitudeDMS}`;
    });
}



