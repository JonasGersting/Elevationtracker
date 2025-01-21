class Navaid extends AirspacePolygon {
    constructor(lat, long, name, map, type, designator) {
        super(lat, long, name, map, type, designator);
        this.lat = lat;
        this.long = long;
        this.name = name;
        this.map = map;
        this.type = type;
        this.designator = designator;
    }

    // Methode zum Hinzufügen des Markers zur Karte mit benutzerdefiniertem Icon
addToMap() {
    const iconUrl = this.returnCorrectIcon(this.type); // Platzhalter für die URL des Bildes
    let iconSize = [];
    if (iconUrl == 'img/antenna.png') {
        iconSize = [8, 8];
    } else{
        iconSize = [16, 16];
    }
    // Definiere das benutzerdefinierte Icon
    const customIcon = L.icon({
        iconUrl: iconUrl,  // Hier wird die Bild-URL verwendet
        iconSize: iconSize,  // Größe des Icons (optional)
    });

    // Erstelle den Marker mit dem benutzerdefinierten Icon
    this.marker = L.marker([this.lat, this.long], { icon: customIcon }).addTo(this.map);

    // Binde ein Popup an den Marker
    this.marker.bindPopup(`Name: ${this.name}<br>Type: ${this.type}<br>Designator: ${this.designator}`);
}

returnCorrectIcon(type){
    if (type == 'VOR_DME') {
        return 'img/VORDME.png'
    }
    if (type == 'VOR') {
        return 'img/VOR.png'
    }
    if (type == 'DME') {
        return 'img/DME.png'
    }
    if (type == 'NDB') {
        return 'img/NDB.png'
    }
    if (type == 'TACAN') {
        return 'img/TACAN.png'
    }
    if (type == 'VORTAC') {
        return 'img/VORTAC.png'
    }
    else {
        return 'img/antenna.png'
    }
}




}