class Obstacle extends AirspacePolygon {
    constructor(lat, long, name, location, type, lighted, daymarking, elev, height, map) {
        super(lat, long, name, location, type, lighted, daymarking, elev, height);
        this.lat = lat;
        this.long = long;
        this.name = name;
        this.location = location;
        this.type = type;
        this.lighted = lighted;
        this.daymarking = daymarking;
        this.elev = elev;
        this.height = height;
        this.map = map;

        // Marker wird hier vorbereitet, aber nicht hinzugefügt
        const iconUrl = this.getCorrectImg(this.lighted); // Platzhalter für die URL des Bildes
        const iconSize = [120, 120];
        const customIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: iconSize
        });

        // Marker wird erstellt
        this.marker = L.marker([this.lat, this.long], { icon: customIcon });

        // Popup wird an den Marker gebunden
        this.marker.bindPopup(
            `ENR-Nummer: ${this.location}<br>Name: ${this.name}<br>Type: ${this.type}<br>ELEV: ${this.elev}FT<br>Height: ${this.height}FT`
        );
    }

    // Methode zum Hinzufügen des Markers zur Karte
    addToMap() {
        this.marker.addTo(this.map);
    }

    // Methode zum Hinzufügen des Markers zu einem Cluster-Layer
    addToCluster(clusterGroup) {
        clusterGroup.addLayer(this.marker);
    }

    getCorrectImg(lightStatus){
        if (lightStatus == 'Y') {
            return 'img/Windkraftanlage quadratisch.png';
        } else {
            return 'img/windmillLightOut.png';
        }
    }
}
