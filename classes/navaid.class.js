class Navaid extends AirspacePolygon {
    constructor(lat, long, name, map, type, designator, charted, icaoCode) {
        super(lat, long, name, map, type, designator, charted);
        this.lat = lat;
        this.long = long;
        this.name = name;
        this.map = map;
        this.type = type;
        this.designator = designator;
        this.charted = charted;
        this.icaoCode = icaoCode;
    }

    addToMap() {
        const iconUrl = this.returnCorrectIcon(this.type);
        let iconSize = [];
        if (iconUrl == 'img/antenna.png') {
            iconSize = [8, 8];
        } else {
            iconSize = [16, 16];
        }
        const customIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: iconSize,
        });
        this.marker = L.marker([this.lat, this.long], { icon: customIcon }).addTo(this.map);
        this.marker.bindPopup(`Name: ${this.name}<br>Type: ${this.type}<br>Designator: ${this.designator}<br>charted: ${this.charted}<br>ICAO: ${this.icaoCode}`);
    }

    returnCorrectIcon(type) {
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