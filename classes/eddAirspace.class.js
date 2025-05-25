class EddAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit) {
        super(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit);
        this.labelHighlightColor = 'darkorange';
        this.labelHighlightTextColor = 'white';
    }

    addToMap() {
        const onFeature = (feature, layer) => {
            layer.on('mouseover', () => {
                this.eddHoverOn(layer);
            });
            layer.on('mouseout', () => {
                this.eddHoverOut(layer);
            });
        };
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: onFeature
        }).addTo(this.map);
        super.addToMap();
    }

    eddHoverOn(layer) {
        isCursorOverPolygon = true;
        layer.setStyle(this.getSpecificHoverStyle());
        layer.bringToFront();
    }

    eddHoverOut(layer) {
        isCursorOverPolygon = false;
        layer.setStyle(this.getStyle());
    }

    getSpecificHoverStyle() {
        return { fillColor: 'white', fillOpacity: 0.8 };
    }

    getStyle() {
        return {
            color: 'orange',
            fillColor: 'orange',
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.2,
        };
    }
}