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
        const iconUrl = this.getCorrectImg(this.lighted, this.type);
        const iconSize = [120, 120];
        const customIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: iconSize
        });
        this.marker = L.marker([this.lat, this.long], { icon: customIcon });
        this.marker.bindPopup(
            `ENR-Nummer: ${this.location}<br>Name: ${this.name}<br>Type: ${this.type}<br>ELEV: ${this.elev}FT<br>Height: ${this.height}FT`
        );
    }

    addToMap() {
        this.marker.addTo(this.map);
    }

    
    addToCluster(clusterGroup) {
        clusterGroup.addLayer(this.marker);
    }

    getCorrectImg(lightStatus, type){
        if (type == 'WINDMILL') {
            if (lightStatus == 'Y') {
                return 'img/windmillLighted.svg';
            } else {
                return 'img/windmillLightOut.svg';
            }
        } else if (type == 'STACK') {
            if (lightStatus == 'Y') {
                return 'img/stackLighted.svg';
            } else {
                return 'img/stack.svg';
            }
        } else if (type == 'CABLE ABOVE VALLEY BOTTOM') {
            if (lightStatus == 'Y') {
                return 'img/electricitypoleLighted.svg';
            } else {
                return 'img/electricitypole.svg';
            }
        }  else if (type == 'BUILDING') {
            if (lightStatus == 'Y') {
                return 'img/AKWLighted.svg';
            } else {
                return 'img/AKW.svg';
            }
        }else {
            return 'img/windmillLighted.svg';
        }
    }
}
