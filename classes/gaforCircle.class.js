class GaforCircle {
    constructor(center, radius, map) {
        this.center = center;
        this.radius = radius;
        this.map = map;
        this.circle = null;
        this.marker = null;
    }

    addToMap() {
        if (!this.map) {
            console.error("Karte ist nicht initialisiert.");
            return;
        }
        if (this.circle) this.map.removeLayer(this.circle);
        if (this.marker) this.map.removeLayer(this.marker);
        this.circle = L.circle([this.center[0], this.center[1]], {
            ...this.getStyle(),
            radius: this.radius * 1000,
        }).addTo(this.map);
        this.marker = L.marker(this.circle.getLatLng(), {
            draggable: true,
        }).addTo(this.map);
        this.addEventHandlers();
    }

    removeFromMap() {
        if (this.circle) {
            this.map.removeLayer(this.circle);
        }
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }
    }

    getStyle() {
        return {
            color: 'orange',
            weight: 2,
            opacity: 1,
            fillColor: 'none',
            fillOpacity: 0
        };
    }

    addEventHandlers() {
        if (!this.marker) return;
        this.marker.on('drag', (event) => {
            const newLatLng = event.latlng;
            this.center = [newLatLng.lat, newLatLng.lng];
            this.circle.setLatLng(newLatLng);
            showCenterAndRadius(this.center, this.radius);
        });
        this.marker.on('click', () => {
            this.showRadiusPopup();
        });
        this.marker.on('dragend', () => {
            this.showRadiusPopup();
        });
    }

    showRadiusPopup() {
        if (!this.marker) return;
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        const label = document.createElement('label');
        label.textContent = 'Radius (NM):';
        label.style.marginBottom = '5px';
        const input = document.createElement('input');
        input.type = 'number';
        input.value = this.convertKmToNm(this.radius).toFixed(2);
        input.style.width = '100px';
        input.style.marginBottom = '5px';
        input.addEventListener('input', () => {
            const newRadiusNM = parseFloat(input.value);
            if (!isNaN(newRadiusNM) && newRadiusNM > 0) {
                this.radius = this.convertNmToKm(newRadiusNM);
                this.circle.setRadius(this.radius * 1000);
                showCenterAndRadius(this.center, this.radius);
            }
        });
        container.appendChild(label);
        container.appendChild(input);
        const popup = L.popup({
            offset: [0, -30],
        })
            .setLatLng(this.marker.getLatLng())
            .setContent(container);
        popup.openOn(this.map);
    }
    convertKmToNm(km) {
        return km / 1.852;
    }
    convertNmToKm(nm) {
        return nm * 1.852;
    }
}
