class TmzAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit) {
        super(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit);
        this.labelHighlightColor = 'navy';
        this.labelHighlightTextColor = 'white';
    }

    attachTmzEventHandlers(feature, layer) {
        layer.on('mouseover', () => {
            this.tmzHover(layer);
        });

        layer.on('mouseout', () => {
            this.tmzHoverOut(layer);
        });
    }

    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => this.attachTmzEventHandlers(feature, layer)
        }).addTo(this.map);

        super.addToMap();
    }

    tmzHover(layer) {
        isCursorOverPolygon = true;
        layer.setStyle(this.getSpecificHoverStyle());
        layer.bringToFront();
    }

    tmzHoverOut(layer) {
        isCursorOverPolygon = false;
        layer.setStyle(this.getStyle());
    }

    getSpecificHoverStyle() {
        return { color: 'white', dashArray: '4 4', fillOpacity: 0.6, fillColor: 'darkblue' };
    }

    getStyle() {
        return {
            color: 'darkblue',
            fillColor: 'darkblue',
            weight: 2,
            opacity: 1,
            dashArray: '4 4',
            fillOpacity: 0
        };
    }
}