class PjeAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers) {
        super(geometry, name, ident, map, polygonLayers, null, null, null, null, null, null);
    }

    createPjeTooltip() {
        return L.tooltip({
            permanent: false,
            direction: 'right',
            offset: L.point(20, 0),
            className: 'polygon-label',
        }).setContent(`${this.name}<br>${this.ident}`);
    }

    attachPjeEventListeners(layer, tooltip) {
        layer.on('mouseover', () => {
            this.pjeMouseHover(layer, tooltip);
        });
        layer.on('mouseout', () => {
            this.pjeMouseHoverOut(layer, tooltip);
        });
        layer.on('click', async () => {
            this.pjeMouseClick();
        });
    }

    onEachPjeFeature(feature, layer) {
        const tooltip = this.createPjeTooltip();
        this.attachPjeEventListeners(layer, tooltip);
    }

    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => this.onEachPjeFeature(feature, layer)
        }).addTo(this.map);
    }


    pjeMouseHover(layer, tooltip) {
        isCursorOverPolygon = true;
        layer.bindTooltip(tooltip).openTooltip();
        layer.setStyle({ fillColor: 'white', fillOpacity: 0.8 });
    }

    pjeMouseHoverOut(layer, tooltip) {
        isCursorOverPolygon = false;
        layer.closeTooltip();
        layer.unbindTooltip();
        layer.setStyle({ fillColor: 'orange', fillOpacity: 0.2 }); // Assuming default style
    }

    async pjeMouseClick() {
        currentAirspace = this;
        const id = await this.setAipInfoAirspace(this.ident);
        if (id) {
            this.showInfoPdf(id);
        } else {
            showErrorBanner("Fehler: Keine PDF-ID gefunden.");     }
    }

    getStyle() {
        return {
            color: 'darkorange',
            weight: 2,
            opacity: 1,
            dashArray: '4 4',
            fillColor: 'orange', // Added fillColor to be consistent with pjeMouseHoverOut
            fillOpacity: 0.2
        };
    }
}
