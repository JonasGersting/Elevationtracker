class SmallAerodrome extends AirspacePolygon {
    aipIds = [];
    currentPage = 0;
    constructor(geometry, name, map, rwys) {
        super(geometry, name, map);
        this.geometry = geometry;
        this.name = name;
        this.map = map;
        this.rwys = rwys;
        this.icon = this.createCustomIcon();
        this.marker = null;
        this.rotationAngle = 0;
    }

    createCustomIcon() {
        const trueHeading = this.rwys && this.rwys[0] ? this.rwys[0].trueHeading : 0;
        const circleSize = 18; // px
        const borderWidth = 3; // px
        const borderColor = 'black';
        const backgroundColor = 'transparent';
        let rotationBarHtml = '';
        if (this.rwys !== undefined) {
            rotationBarHtml = `
                <div class="rotation-bar"
                    style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 25px; /* Breite des Runway-Indikators */
                        height: 3px; /* Dicke des Runway-Indikators */
                        background-color: black;
                        transform: translate(-50%, -50%) rotate(${trueHeading - 90}deg);
                        transform-origin: center;
                    ">
                </div>`;
        }

        const iconHtml = `
            <div class="marker-icon" style="position: relative; width: ${circleSize}px; height: ${circleSize}px; display: flex; align-items: center; justify-content: center;">
                <div class="circle-marker"
                    style="
                        width: ${circleSize}px;
                        height: ${circleSize}px;
                        background-color: ${backgroundColor};
                        border: ${borderWidth}px solid ${borderColor};
                        border-radius: 50%;
                        box-sizing: border-box;
                    ">
                </div>
                ${rotationBarHtml}
            </div>
        `;

        return L.divIcon({
            className: 'custom-div-icon',
            html: iconHtml,
            iconSize: [circleSize, circleSize],
            iconAnchor: [circleSize / 2, circleSize / 2]
        });
    }

    addToMap() {
        this.marker = L.marker([this.geometry.coordinates[1], this.geometry.coordinates[0]], { icon: this.icon }).addTo(this.map);
        this.marker.bindPopup(`Name: ${this.name}`);
        this.marker.on('mouseover', () => {
            this.marker.openPopup();
        });
        this.marker.on('mouseout', () => {
            this.marker.closePopup();
        });
    }

    closeDetailInfo() {
        let detailDiv = document.getElementById('aerodromeInfoDetail');
        detailDiv.style.height = '0px';
    }
}
