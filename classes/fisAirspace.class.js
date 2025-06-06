class FisAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers, svsNumber) {
        super(geometry, name, ident, map, polygonLayers);
        this.svsNumber = svsNumber;
    }

    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => {
                const center = layer.getBounds().getCenter();
                const label = this.returnLabel(this.svsNumber);
                this.labelMarker = L.marker(center, {
                    icon: label,
                    interactive: false
                }).addTo(this.map);
            }
        }).addTo(this.map);
    }

    returnLabel(svsNumber) {
        return L.divIcon({
            className: 'fis-label',
            html: `<div>${svsNumber}</div>`,
            iconSize: null
        });
    }

    removeFromMap() {
        if (this.layer) {
            this.layer.remove();
            this.layer = null;
        }
        if (this.labelMarker) {
            this.labelMarker.remove();
            this.labelMarker = null;
        }
    }

    getStyle() {
        return {
            color: 'blue',
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.2
        };
    }
}