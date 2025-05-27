class SmallAerodrome extends AirspacePolygon {
    aipIds = [];
    currentPage = 0;
    constructor(geometry, name, map, rwys) {
        super(geometry, name, null, map, null, null, null, null, null, null, null);
        this.rwys = rwys;
        this.icon = this.createCustomIcon();
        this.marker = null;
        this.rotationAngle = 0;
    }

    getTrueHeading() {
        return this.rwys && this.rwys[0] ? this.rwys[0].trueHeading : 0;
    }

    buildRotationBarHtml(trueHeading) {
        if (this.rwys === undefined) return '';
        const style = `position: absolute; top: 50%; left: 50%; width: 25px; height: 3px; background-color: rgb(10, 60, 135); transform: translate(-50%, -50%) rotate(${trueHeading - 90}deg); transform-origin: center;`;
        return `
            <div class="rotation-bar" style="${style}">
            </div>`;
    }

    buildIconHtml(circleSize, backgroundColor, borderWidth, borderColor, rotationBarHtml) {
        const markerIconStyle = `position: relative; width: ${circleSize}px; height: ${circleSize}px; display: flex; align-items: center; justify-content: center;`;
        const circleMarkerStyle = `width: ${circleSize}px; height: ${circleSize}px; background-color: ${backgroundColor}; border: ${borderWidth}px solid ${borderColor}; border-radius: 50%; box-sizing: border-box;`;
        return `
            <div class="marker-icon" style="${markerIconStyle}">
                <div class="circle-marker" style="${circleMarkerStyle}">
                </div>
                ${rotationBarHtml}
            </div>
        `;
    }

    createDivIconOptions(htmlContent, circleSize) {
        return {
            className: 'custom-div-icon',
            html: htmlContent,
            iconSize: [circleSize, circleSize],
            iconAnchor: [circleSize / 2, circleSize / 2]
        };
    }

    createCustomIcon() {
        const trueHeading = this.getTrueHeading();
        const circleSize = 18;
        const borderWidth = 3;
        const borderColor = 'rgb(10, 60, 135)';
        const backgroundColor = 'transparent';

        const rotationBarHtml = this.buildRotationBarHtml(trueHeading);
        const iconHtml = this.buildIconHtml(circleSize, backgroundColor, borderWidth, borderColor, rotationBarHtml);
        const divIconOptions = this.createDivIconOptions(iconHtml, circleSize);
        return L.divIcon(divIconOptions);
    }

    addToMap() {
        const coordinates = [this.geometry.coordinates[1], this.geometry.coordinates[0]];
        this.marker = L.marker(coordinates, { icon: this.icon }).addTo(this.map);
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
        if (detailDiv) { 
            detailDiv.style.height = '0px';
        }
    }
}
