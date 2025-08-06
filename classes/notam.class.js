class Notam {
    constructor(map, code23, code34, endDate, est, fir, itemA, itemD, itemE, itemF, itemG, latitude, longitude, lower, nof, notamID, purpose, qcode, radius, referredNotamId, scope, startDate, sotreDate, traffic, type, upper) {
        this.map = map;
        this.code23 = code23;
        this.code34 = code34;
        this.endDate = endDate;
        this.est = est;
        this.fir = fir;
        this.itemA = itemA;
        this.itemD = itemD;
        this.itemE = itemE;
        this.itemF = itemF;
        this.itemG = itemG;
        this.latitude = latitude;
        this.longitude = longitude;
        this.lower = lower;
        this.nof = nof;
        this.notamID = notamID;
        this.purpose = purpose;
        this.qcode = qcode;
        this.radius = radius;
        this.referredNotamId = referredNotamId;
        this.scope = scope;
        this.startDate = startDate;
        this.sotreDate = sotreDate;
        this.traffic = traffic;
        this.type = type;
        this.upper = upper;
        this.idLabel = null; 
    }

    addToMap() {
        this.layer = L.circle([this.latitude, this.longitude], {
            radius: this.notamRadiusToMeters(),
            color: 'blue',
            fillColor: 'white',
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0
        });

        this.layer.on('mouseover', (e) => {
            this.notamHoverOn(this.layer);
            this.showIdLabel(e.latlng);
        });
        this.layer.on('mousemove', (e) => {
            if (this.idLabel) {
                this.idLabel.setLatLng(e.latlng);
            }
        });
        this.layer.on('mouseout', () => {
            this.notamHoverOut(this.layer);
            this.hideIdLabel();
        });
        this.layer.on('click', () => {
            this.showNotamPopup();
        });

        this.layer.addTo(this.map);
    }

    showIdLabel(position) {
        if (this.idLabel) return;

        const content = `<div class="notam-id-label">${this.notamID}</div>`;
        const icon = L.divIcon({
            html: content,
            className: 'notam-label',
            iconSize: null,
            iconAnchor: [-10, 15] 
        });

        this.idLabel = L.marker(position, {
            icon: icon,
            pane: 'markerPane',
            interactive: false
        }).addTo(this.map);
    }

    hideIdLabel() {
        if (this.idLabel) {
            this.map.removeLayer(this.idLabel);
            this.idLabel = null;
        }
    }

    showNotamPopup() {
        this.hideIdLabel();
        const content = `<div class="notam-popup"> ${returnCorrectNOTAM(this.endDate, this.est, this.fir,
            this.itemA, this.itemD, this.itemE, this.itemF, this.itemG,
            this.latitude, this.longitude, this.lower, this.nof,
            this.notamID, this.purpose, this.qcode, this.radius,
            this.referredNotamId, this.scope, this.startDate,
            this.traffic, this.type, this.upper)}</div>`;
        L.popup({ minWidth: 400, maxWidth: 500 })
            .setLatLng(this.layer.getLatLng())
            .setContent(content)
            .openOn(this.map);
    }

    removeFromMap() {
        if (this.layer) {
            this.map.removeLayer(this.layer);
        }
        this.hideIdLabel(); 
    }

    notamRadiusToMeters() {
        return this.radius * 1852;
    }

    notamHoverOn(layer) {
        isCursorOverPolygon = true;
        layer.setStyle(this.getSpecificHoverStyle());
    }

    notamHoverOut(layer) {
        isCursorOverPolygon = false;
        layer.setStyle(this.getStyle());
    }

    getSpecificHoverStyle() {
        return { fillColor: 'blue', fillOpacity: 0.4 };
    }

    getStyle() {
        return {
            color: 'blue',
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0
        };
    }
}