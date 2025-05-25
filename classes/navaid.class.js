class Navaid extends AirspacePolygon {
    constructor(lat, long, name, map, type, designator, charted, icaoCode, correctType) {
        super(lat, long, name, map, type, designator, charted, correctType);
        this.lat = lat;
        this.long = long;
        this.name = name;
        this.map = map;
        this.type = type;
        this.designator = designator;
        this.charted = charted;
        this.icaoCode = icaoCode;
        this.correctType = correctType;
    }

    addToMap() {
        const iconUrl = this.returnCorrectIcon(this.type);
        let iconSize = [];
        if (iconUrl == 'img/antenna.png') {
            iconSize = [8, 8];
        } else {
            iconSize = [24, 24];
        }
        const customIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: iconSize,
        });
        this.marker = L.marker([this.lat, this.long], { icon: customIcon }).addTo(this.map);
        const popupContent = this.returnPopUpContent(this.name, this.type, this.designator, this.charted, this.icaoCode, this.correctType);
        this.marker.bindPopup(popupContent);
    }

    returnPopUpContent(name, type, designator, charted, icaoCode, correctType) {
       return `
            <div style="word-wrap: break-word;">
                <b>Name:</b> ${name}<br>
                <b>Type:</b> ${type}<br>
                <b>Designator:</b> ${designator}<br>
                <b>Charted:</b> ${charted}<br>
                <b>ICAO:</b> ${icaoCode}<br>
                <b>Correct Type:</b> ${correctType}<br>
            </div>
        `;
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