class GaforAirspace extends AirspacePolygon {
    constructor(geometry, name, map, polygonLayers) {
        super(geometry, name, map, polygonLayers);
        this.isSelected = false; // Zustand für die Auswahl des Polygons
    }

    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => {
                layer.bindTooltip(this.name, {
                    permanent: true,
                    direction: 'center',
                    className: 'gaforArea',
                }).openTooltip();

                layer.on('mouseover', () => {
                    isCursorOverPolygon = true;
                    layer.setStyle({fillColor: 'white', fillOpacity: 0.8});
                });

                layer.on('mouseout', () => {
                    isCursorOverPolygon = false;  // Setze den globalen Zustand zurück
                    if (!this.isSelected) {
                        layer.setStyle({fillColor: 'lightblue', fillOpacity: 0.5});
                    }
                });

                layer.on('click', () => {
                    const inputField = document.getElementById('gaforNumbers');
                    const currentValue = inputField.value.trim();

                    if (this.isSelected) {
                        // Wenn das Polygon bereits ausgewählt ist, entferne den Namen aus dem Input-Feld und setze die Fill-Color zurück
                        inputField.value = currentValue.replace(this.name, '').trim();
                        layer.setStyle({fillColor: 'lightblue', fillOpacity: 0.5});
                    } else {
                        // Wenn das Polygon noch nicht ausgewählt ist, füge den Namen zum Input-Feld hinzu
                        if (currentValue) {
                            // Überprüfen, ob der Name bereits im Input-Feld existiert
                            if (!currentValue.includes(this.name)) {
                                inputField.value = currentValue + ' ' + this.name; // Füge den Namen hinzu (mit einem Leerzeichen getrennt)
                            }
                        } else {
                            inputField.value = this.name; // Wenn kein Wert da ist, setze den Namen als Wert
                        }
                        layer.setStyle({fillColor: 'white', fillOpacity: 0.8}); // Setze die Farbe auf weiß, wenn ausgewählt
                    }
                    // Toggle den Zustand von isSelected
                    this.isSelected = !this.isSelected;
                });
            }
        }).addTo(this.map);
    }

    getStyle() {
        return {
            color: 'lightblue',  // Randfarbe
            weight: 2,            // Randdicke
            opacity: 1,          // Randtransparenz
            fillOpacity: 0.5     // Fülltransparenz
        };
    }
}
