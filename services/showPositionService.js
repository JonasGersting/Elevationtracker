//show actual position as coordinate in DMS
// Hilfsfunktion zur Umwandlung von Dezimalgrad in DMS
function toDMS(coordinate, isLatitude) {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    const direction = isLatitude
        ? coordinate >= 0 ? 'N' : 'S'
        : coordinate >= 0 ? 'E' : 'W';

    return `${degrees}° ${minutes}' ${seconds}''${direction}`;
}

// Funktion zum Anzeigen der aktuellen Mauskoordinaten in DMS
function showCursorCoordinates(map) {
    const displayDiv = document.getElementById('showActualPos');
    if (!displayDiv) {
        console.error("Element mit der ID 'showActualPos' nicht gefunden.");
        return;
    }

    map.on('mousemove', function (event) {
        const { lat, lng } = event.latlng;

        // Umwandlung in DMS
        const latitudeDMS = toDMS(lat, true);
        const longitudeDMS = toDMS(lng, false);

        // Koordinaten im Div anzeigen
        displayDiv.textContent = `${latitudeDMS} ${longitudeDMS}`;
    });
}



// Validiert die Eingabe für GAFOR-Nummern
function validateInput(input) {
    input.value = input.value
        .replace(/[^0-9\s]/g, '')    // Entfernt nicht-zulässige Zeichen
        .replace(/\s+/g, ' ')        // Reduziert auf einzelne Leerzeichen
        .trim();                     // Entfernt führende und abschließende Leerzeichen
}