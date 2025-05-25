class CtrAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit) {
        super(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit);
        this.labelHighlightColor = '#8B0000'; // Dunkelrot, aber etwas anders als EDR für Unterscheidung
        this.labelHighlightTextColor = 'white';
    }

    addToMap() {
        const onFeature = (feature, layer) => {
            layer.on('mouseover', () => {
                this.ctrHoverOn(layer);
            });
            layer.on('mouseout', () => {
                this.ctrHoverOut(layer);
            });
        };
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: onFeature
        }).addTo(this.map);
        super.addToMap();
    }

    ctrHoverOn(layer) {
        isCursorOverPolygon = true;
        layer.setStyle(this.getSpecificHoverStyle());
        layer.bringToFront();
    }

    ctrHoverOut(layer) {
        isCursorOverPolygon = false;
        layer.setStyle(this.getStyle());
    }

    getSpecificHoverStyle() {
        return { fillColor: 'white', fillOpacity: 0.8 };
    }

    getStyle() {
        return {
            color: 'darkred',
            fillColor: 'darkred',
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.2
        };
    }
}