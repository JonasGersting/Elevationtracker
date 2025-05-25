class EdrAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit) {
        super(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit);
        this.labelHighlightColor = 'darkred';
        this.labelHighlightTextColor = 'white';
    }

    addToMap() {
        const onFeature = (feature, layer) => {
            layer.on('mouseover', () => {
                this.edrHoverOn(layer);
            });
            layer.on('mouseout', () => {
                this.edrHoverOut(layer);
            });
        };
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: onFeature
        }).addTo(this.map);
        super.addToMap();
    }

    edrHoverOn(layer) {
        isCursorOverPolygon = true;
        layer.setStyle(this.getSpecificHoverStyle());
        layer.bringToFront();
    }

    edrHoverOut(layer) {
        isCursorOverPolygon = false;
        layer.setStyle(this.getStyle());
    }

    getSpecificHoverStyle() {
        return { fillColor: 'white', fillOpacity: 0.8 };
    }

    getStyle() {
        return {
            color: 'red',
            fillColor: 'red',
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.2,
            zIndexOffset: 402
        };
    }
}