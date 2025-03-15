class GaforCircle {
    constructor(center, radius, map) {
        this.center = center; // Mittelpunkt des Kreises [latitude, longitude]
        this.radius = radius; // Radius des Kreises in Kilometern
        this.map = map;       // Referenz auf die Leaflet-Karte
        this.circle = null;   // Referenz auf das gezeichnete Kreisobjekt
        this.marker = null;   // Referenz auf den Marker
    }

    // Methode zum Hinzufügen des Kreises auf die Karte
    addToMap() {
        if (!this.map) {
            console.error("Karte ist nicht initialisiert.");
            return;
        }

        // Entferne eventuell vorhandenen Kreis und Marker
        if (this.circle) this.map.removeLayer(this.circle);
        if (this.marker) this.map.removeLayer(this.marker);

        // Zeichne den neuen Kreis
        this.circle = L.circle([this.center[0], this.center[1]], {
            ...this.getStyle(),
            radius: this.radius * 1000, // Radius in Metern (intern in km, wird aber in m benötigt)
        }).addTo(this.map);

        // Erstelle den Marker und mache ihn verschiebbar
        this.marker = L.marker(this.circle.getLatLng(), {
            draggable: true, // Macht den Marker verschiebbar
        }).addTo(this.map);

        // Füge Event-Handler hinzu
        this.addEventHandlers();

        console.log("Kreis gezeichnet:", { center: this.center, radius: this.radius });
    }

    // Methode zum Entfernen des Kreises und Markers von der Karte
    removeFromMap() {
        if (this.circle) {
            this.map.removeLayer(this.circle); // Entferne den Kreis
        }
        if (this.marker) {
            this.map.removeLayer(this.marker); // Entferne den Marker
        }
        console.log("Kreis und Marker entfernt von der Karte.");
    }

    // Methode zum Abrufen des Kreisstyles
    getStyle() {
        return {
            color: 'orange',     // Randfarbe
            weight: 2,           // Randdicke
            opacity: 1,          // Randtransparenz
            fillColor: 'none',   // Keine Füllfarbe
            fillOpacity: 0       // Durchlässigkeit innerhalb
        };
    }

    // Methode, um Event-Handler hinzuzufügen
    addEventHandlers() {
        if (!this.marker) return;

        // Aktualisiere die Kreisposition, wenn der Marker verschoben wird
        this.marker.on('drag', (event) => {
            const newLatLng = event.latlng;
            this.center = [newLatLng.lat, newLatLng.lng];
            this.circle.setLatLng(newLatLng); // Aktualisiere die Position des Kreises
            showCenterAndRadius(this.center, this.radius);
        });

        // Zeige ein Popup bei jedem Klick auf den Marker
        this.marker.on('click', () => {
            this.showRadiusPopup();
        });

        // Aktualisiere das Popup, wenn der Marker bewegt wird
        this.marker.on('dragend', () => {
            this.showRadiusPopup();
        });
    }

    // Methode, um das Popup mit Radius-Eingabe zu erstellen
    showRadiusPopup() {
        if (!this.marker) return;

        // Erstelle ein Container-Element für das Popup
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';

        // Erstelle ein Label und Eingabefeld
        const label = document.createElement('label');
        label.textContent = 'Radius (NM):';  // Angezeigt wird nun "NM" (nautische Meilen)
        label.style.marginBottom = '5px';

        const input = document.createElement('input');
        input.type = 'number';
        input.value = this.convertKmToNm(this.radius).toFixed(2);  // Zeige den Radius in nautischen Meilen an
        input.style.width = '100px';
        input.style.marginBottom = '5px';

        // Füge Event-Handler hinzu, um den Radius dynamisch zu ändern
        input.addEventListener('input', () => {
            const newRadiusNM = parseFloat(input.value);
            if (!isNaN(newRadiusNM) && newRadiusNM > 0) {
                this.radius = this.convertNmToKm(newRadiusNM); // Umrechnung in Kilometer
                this.circle.setRadius(this.radius * 1000); // Aktualisiere den Radius des Kreises
                showCenterAndRadius(this.center, this.radius);
            }
        });

        // Füge Label und Eingabefeld in den Container ein
        container.appendChild(label);
        container.appendChild(input);

        // Zeige das Popup dynamisch an der aktuellen Markerposition
        const popup = L.popup({
            offset: [0, -30], // Popup 30 Pixel oberhalb des Markers platzieren
        })
            .setLatLng(this.marker.getLatLng())
            .setContent(container);

        // Öffne das Popup
        popup.openOn(this.map);
    }

    // Methode zur Umrechnung von Kilometer in nautische Meilen
    convertKmToNm(km) {
        return km / 1.852;
    }

    // Methode zur Umrechnung von nautischen Meilen in Kilometer
    convertNmToKm(nm) {
        return nm * 1.852;
    }
}
