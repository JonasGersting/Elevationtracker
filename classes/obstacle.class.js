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
            iconSize: iconSize,
            iconAnchor: [iconSize[0] / 2, iconSize[1]]
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

    getCorrectImg(lightStatus, type) {
        if (type == 'WINDMILL') {
            if (lightStatus == 'Y') {
                return 'img/windmillLighted.svg';
            } else {
                return 'img/windmill.svg';
            }
        } else if (type == 'STACK' || type == 'INDUSTRIAL_SYSTEM') {
            if (lightStatus == 'Y') {
                return 'img/stackLighted.svg';
            } else {
                return 'img/stack.svg';
            }
        } else if (type == 'CABLE ABOVE VALLEY BOTTOM' || type.includes('MAST')) {
            if (lightStatus == 'Y') {
                return 'img/electricitypoleLighted.svg';
            } else {
                return 'img/electricitypole.svg';
            }
        } else if (type == 'BUILDING') {
            if (lightStatus == 'Y') {
                return 'img/buildingLighted.svg';
            } else {
                return 'img/building.svg';
            }
        } else if (type == 'TOWER') {
            if (lightStatus == 'Y') {
                return 'img/towerLighted.svg';
            } else {
                return 'img/tower.svg';
            }
        } else if (type == 'ANTENNA') {
            if (lightStatus == 'Y') {
                return 'img/antennaLighted.svg';
            } else {
                return 'img/antenna.svg';
            }
        } else if (type == 'SPIRE') {
            if (lightStatus == 'Y') {
                return 'img/spireLighted.svg';
            } else {
                return 'img/spire.svg';
            }
        } else if (type == 'NUCLEAR_REACTOR') {
            if (lightStatus == 'Y') {
                return 'img/nuclearReactorLighted.svg';
            } else {
                return 'img/nuclearReactor.svg';
            }
        } else if (type == 'CRANE') {
            if (lightStatus == 'Y') {
                return 'img/craneLighted.svg';
            } else {
                return 'img/crane.svg';
            }
        } else {
            return 'img/pole.svg';
        }
    }
}
