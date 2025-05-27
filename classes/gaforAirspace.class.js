class GaforAirspace extends AirspacePolygon {
    constructor(geometry, name, map, polygonLayers) {
        super(geometry, name, map, polygonLayers);
        this.isSelected = false;
    }

    bindPermanentTooltip(layer) {
        layer.bindTooltip(this.name, {
            permanent: true,
            direction: 'center',
            className: 'gaforArea',
        }).openTooltip();
    }

    attachGaforEventListeners(layer) {
        layer.on('mouseover', () => this.gaforHoverOver(layer));
        layer.on('mouseout', () => this.gaforHoverOut(layer));
        layer.on('click', () => this.gaforClick(layer));
    }

    onEachGaforFeature(feature, layer) {
        this.bindPermanentTooltip(layer);
        this.attachGaforEventListeners(layer);
    }

    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => this.onEachGaforFeature(feature, layer)
        }).addTo(this.map);
    }

    gaforHoverOver(layer) {
        isCursorOverPolygon = true;
        layer.setStyle({ fillColor: 'white', fillOpacity: 0.8 });
    }

    gaforHoverOut(layer) {
        isCursorOverPolygon = false;
        if (!this.isSelected) {
            layer.setStyle({ fillColor: 'lightblue', fillOpacity: 0.5 });
        }
    }

    gaforClick(layer) {
        const inputField = document.getElementById('gaforNumbers');
        const currentValue = inputField.value.trim();
        if (this.isSelected) {
            inputField.value = currentValue.replace(this.name, '').trim();
            layer.setStyle({ fillColor: 'lightblue', fillOpacity: 0.5 });
        } else {
            if (currentValue) {
                if (!currentValue.includes(this.name)) {
                    inputField.value = currentValue + ' ' + this.name;
                }
            } else {
                inputField.value = this.name;
            }
            layer.setStyle({ fillColor: 'white', fillOpacity: 0.8 });
        }
        this.isSelected = !this.isSelected;
    }

    getStyle() {
        return {
            color: 'lightblue',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
        };
    }
}
