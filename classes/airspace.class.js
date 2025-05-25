class AirspacePolygon {
    aipInfoAirspace;
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit) {
        this.geometry = geometry;
        this.name = name;
        this.ident = ident;
        this.map = map;
        this.layer = null;
        this.polygonLayers = polygonLayers;
        this.pdfDoc = null;
        this.pageNum = 1;
        this.scale = 1;
        this.rotation = 0;
        this.centerLat = centerLat;
        this.centerLon = centerLon;
        this.lowerLimit = lowerLimit;
        this.lowerLimitUnit = lowerLimitUnit;
        this.upperLimit = upperLimit;
        this.upperLimitUnit = upperLimitUnit;
        this.labelMarker = null;
        this.labelHighlightColor = 'darkgrey';
        this.labelHighlightTextColor = 'white'; 
        this._boundUpdateLabelVisibility = this._updateLabelVisibility.bind(this);
        this._labelTemporarilyVisibleByHover = false;
        this._boundPolygonMouseoverForLabel = this._onPolygonMouseoverForLabel.bind(this);
        this._boundPolygonMouseoutForLabel = this._onPolygonMouseoutForLabel.bind(this);
        this._boundPolygonClick = this._onPolygonClick.bind(this); 

    }


       _shouldHaveLabel() {
        return this instanceof EdrAirspace ||
            this instanceof EddAirspace ||
            this instanceof CtrAirspace ||
            this instanceof RmzAirspace ||
            this instanceof TmzAirspace;
    }

    _initializeLabel() {
        if (!this.map) return;
        this._createLabelMarker();
        if (this.labelMarker) {
            this._updateLabelVisibility();
            this.map.on('zoomend', this._boundUpdateLabelVisibility);
        }
    }

    _ensureLabelCenterCoordinates() {
        if (this.centerLat && this.centerLon) return true;
        if (!this.layer) {
            console.error(`Layer für ${this.ident || this.name} nicht vorhanden, Label kann nicht positioniert werden.`);
            return false;
        }
        try {
            const bounds = this.layer.getBounds();
            if (!bounds.isValid()) {
                console.error(`Ungültige Bounds für ${this.ident || this.name}, Label kann nicht positioniert werden.`);
                return false;
            }
            const center = bounds.getCenter();
            this.centerLat = center.lat;
            this.centerLon = center.lng;
            return true;
        } catch (e) {
            console.error(`Fehler beim Ermitteln des Zentrums für ${this.ident || this.name}:`, e);
            return false;
        }
    }

    _getLimitsDisplayHtml() {
        const lowerDisplay = (this.lowerLimit === 0 || this.lowerLimit === "0") ? "GND" : `${this.lowerLimit} ${this.lowerLimitUnit}`;
        return `
            <span style="border-bottom: 1px solid #555; display: inline-block; margin-bottom: 2px; padding-bottom: 1px;">${this.upperLimit} ${this.upperLimitUnit}</span><br>
            <span style="display: inline-block; margin-top: 1px;">${lowerDisplay}</span>`;
    }

    _getLabelPrimaryAndSecondaryDisplay() {
        let primaryDisplay = '';
        let secondaryDisplayHtml = '';
        if (this instanceof EdrAirspace || this instanceof EddAirspace) {
            primaryDisplay = this.ident || 'N/A';
            if (this.name && this.name !== primaryDisplay) {
                secondaryDisplayHtml = `<div class="airspace-label-name" style="display: none; margin-top: 3px; font-weight: normal;">${this.name}</div>`;
            }
        } else if (this instanceof CtrAirspace || this instanceof RmzAirspace || this instanceof TmzAirspace) {
            primaryDisplay = this.name || this.ident || 'N/A';
        } else {
            primaryDisplay = this.ident || this.name || 'N/A';
        }
        return { primaryDisplay, secondaryDisplayHtml };
    }

    _buildFinalLabelHtml(primaryDisplay, limitsHtml, secondaryDisplayHtml) {
        return `
            <div style="line-height: 1.2;">
                <b>${primaryDisplay}</b><br>
                ${limitsHtml}
            </div>
            ${secondaryDisplayHtml}
        `;
    }

    _createLeafletDivIcon(htmlContent) {
        return L.divIcon({
            html: htmlContent,
            className: 'airspace-custom-label text-shadow',
            iconSize: null,
        });
    }

    _createLeafletLabelMarkerInstance(position, icon) {
        return L.marker(position, {
            icon: icon,
            pane: 'markerPane',
            interactive: true
        });
    }

    _handleLabelMouseover(event) {
        const iconElement = event.target.getElement();
        if (!iconElement) return;
        iconElement.classList.remove('text-shadow');
        iconElement.style.backgroundColor = this.labelHighlightColor;
        iconElement.style.color = this.labelHighlightTextColor;
        iconElement.style.zIndex = '1000';
        if (this instanceof EdrAirspace || this instanceof EddAirspace) {
            const nameEl = iconElement.querySelector('.airspace-label-name');
            if (nameEl) nameEl.style.display = 'block';
        }
        if (this.layer) {
            this.layer.setStyle({ fillColor: 'white', fillOpacity: 0.8 });
            this.layer.bringToFront();
        }
    }

    _handleLabelMouseout(event) {
        const iconElement = event.target.getElement();
        if (!iconElement) return;
        iconElement.classList.add('text-shadow');
        iconElement.style.backgroundColor = '';
        iconElement.style.color = '';
        iconElement.style.zIndex = '';
        if (this instanceof EdrAirspace || this instanceof EddAirspace) {
            const nameEl = iconElement.querySelector('.airspace-label-name');
            if (nameEl) nameEl.style.display = 'none';
        }
        if (this.layer) this.layer.setStyle(this.getStyle());
    }

    async _handleLabelClick() {
        currentAirspace = this;
        const id = await this.setAipInfoAirspace(this.ident || this.name);
        if (id) this.showInfoPdf(id);
        else console.log('No PDF ID found for:', this.ident || this.name);
    }

    _addEventListenersToLabelMarker() {
        this.labelMarker.on('mouseover', this._handleLabelMouseover.bind(this));
        this.labelMarker.on('mouseout', this._handleLabelMouseout.bind(this));
        this.labelMarker.on('click', this._handleLabelClick.bind(this));
    }

    _createLabelMarker() {
        if (!this._ensureLabelCenterCoordinates()) return;
        const limitsHtml = this._getLimitsDisplayHtml();
        const { primaryDisplay, secondaryDisplayHtml } = this._getLabelPrimaryAndSecondaryDisplay();
        const labelHtml = this._buildFinalLabelHtml(primaryDisplay, limitsHtml, secondaryDisplayHtml);
        const divIcon = this._createLeafletDivIcon(labelHtml);
        const markerPosition = L.latLng(this.centerLat, this.centerLon);
        this.labelMarker = this._createLeafletLabelMarkerInstance(markerPosition, divIcon);
        this._addEventListenersToLabelMarker();
    }

    _styleLabelOnPolygonHover() {
        const iconElement = this.labelMarker.getElement();
        if (!iconElement) return;
        iconElement.style.zIndex = '1000';
        iconElement.style.backgroundColor = this.labelHighlightColor;
        iconElement.style.color = this.labelHighlightTextColor;
        iconElement.classList.remove('text-shadow');
    }

    _showLabelTemporarily(currentZoom) {
        if (currentZoom < 9 && !this.map.hasLayer(this.labelMarker)) {
            this.labelMarker.addTo(this.map);
            this._labelTemporarilyVisibleByHover = true;
        }
    }

    _onPolygonMouseoverForLabel() {
        if (!this.map || !this.labelMarker) return;
        this._styleLabelOnPolygonHover();
        this._showLabelTemporarily(this.map.getZoom());
    }

    _resetLabelStyleAfterPolygonHover() {
        const iconElement = this.labelMarker.getElement();
        if (!iconElement) return;
        iconElement.style.zIndex = '';
        iconElement.style.backgroundColor = '';
        iconElement.style.color = '';
        iconElement.classList.add('text-shadow');
    }

    _hideTemporaryLabel() {
        if (this._labelTemporarilyVisibleByHover) {
            if (this.map.hasLayer(this.labelMarker)) {
                this.map.removeLayer(this.labelMarker);
            }
            this._labelTemporarilyVisibleByHover = false;
        }
    }

    _onPolygonMouseoutForLabel() {
        if (!this.map || !this.labelMarker) return;
        this._resetLabelStyleAfterPolygonHover();
        this._hideTemporaryLabel();
    }

    async _onPolygonClick() {
        currentAirspace = this;
        const identifier = (this instanceof EdrAirspace || this instanceof EddAirspace)
            ? this.ident
            : (this.name || this.ident);
        if (!identifier) {
            console.log('Kein Identifikator (Name oder Ident) für AIP-Abfrage vorhanden.');
            return;
        }
        const id = await this.setAipInfoAirspace(identifier);
        if (id) this.showInfoPdf(id);
        else console.log('No PDF ID found for:', identifier);
    }

    _manageLabelLayer(shouldBeVisible) {
        if (shouldBeVisible) {
            if (!this.map.hasLayer(this.labelMarker)) {
                this.labelMarker.addTo(this.map);
            }
            this._labelTemporarilyVisibleByHover = false;
        } else {
            if (!this._labelTemporarilyVisibleByHover && this.map.hasLayer(this.labelMarker)) {
                this.map.removeLayer(this.labelMarker);
            }
        }
    }

    _updateLabelVisibility() {
        if (!this.labelMarker || !this.map) return;
        const currentZoom = this.map.getZoom();
        const labelShouldBeNormallyVisible = currentZoom >= 9;
        this._manageLabelLayer(labelShouldBeNormallyVisible);
    }

    addToMap() {
        if (this._shouldHaveLabel()) {
            this._initializeLabel();
            if (this.layer) {
                this.layer.on('mouseover', this._boundPolygonMouseoverForLabel);
                this.layer.on('mouseout', this._boundPolygonMouseoutForLabel);
                this.layer.on('click', this._boundPolygonClick);
            }
        }
    }

    _removePolygonEventListenersFromLayer() {
        if (this.layer && this._shouldHaveLabel()) {
            this.layer.off('mouseover', this._boundPolygonMouseoverForLabel);
            this.layer.off('mouseout', this._boundPolygonMouseoutForLabel);
            this.layer.off('click', this._boundPolygonClick);
        }
    }

    _removePolygonLayerFromMap() {
        if (this.layer) {
            if (this.map && this.map.hasLayer(this.layer)) {
                this.map.removeLayer(this.layer);
            }
            this.layer = null;
        }
    }

    _removeLabelMarkerFromMapInstance() {
        if (this.labelMarker) {
            if (this.map && this.map.hasLayer(this.labelMarker)) {
                this.map.removeLayer(this.labelMarker);
            }
            this.labelMarker = null;
        }
    }

    _removeLabelZoomListener() {
        if (this.map && this._boundUpdateLabelVisibility) {
            this.map.off('zoomend', this._boundUpdateLabelVisibility);
        }
    }

    _cleanupLabelResources() {
        if (this._shouldHaveLabel()) {
            this._removeLabelMarkerFromMapInstance();
            this._removeLabelZoomListener();
        }
    }

    removeFromMap() {
        this._removePolygonEventListenersFromLayer();
        this._removePolygonLayerFromMap();
        this._cleanupLabelResources();
    }

    _getPdfDetailDiv() {
        return document.getElementById('aerodromeInfoDetail');
    }

    _buildPdfViewerHtmlContent(pdfPath) {
        return `
            <div class="overlay"></div>
            <div class="cardWrapper">
                <div class="airspaceInfoCard">
                    <div class="airspaceInfoCardHeader">
                        <h3>${this.name}</h3>
                        <h3>${this.ident}</h3>
                        <button onclick="currentAirspace.closeInfoPdf()" class="closeButton" style="position: absolute; right: 10px; top: 10px; z-index: 1000;">X</button>
                    </div>    
                    <iframe id="pdfIframe" src=${pdfPath} frameborder="0" style="width: 100%; height: 100%;"></iframe>
                </div>
            </div>
        `;
    }

    showInfoPdf(pdfId) {
        const pdfPath = this.returnCorrectAipPath(pdfId);
        const detailDiv = this._getPdfDetailDiv();
        if (!detailDiv) return;
        detailDiv.style.height = '100vh';
        detailDiv.innerHTML = this._buildPdfViewerHtmlContent(pdfPath);
    }

    returnCorrectAipPath(pdfId) {
        const vfrIdents = ['Kiel', 'Eckernförd', 'Hohe Düne'];
        if (vfrIdents.includes(this.ident)) {
            return `vfraip://aip.dfs.de/VFR/scripts/renderPage.php?fmt=pdf&id=${pdfId}#zoom=page-fit`;
        } else {
            return `https://aip.dfs.de/IFR/scripts/renderPage.php?fmt=pdf&id=${pdfId}#zoom=page-fit`;
        }
    }

    _findIdInArray(items, targetName, arrayKey) {
        let foundId = null;
        items.forEach(item => {
            const lowerCaseArray = item[arrayKey].map(val => val.toLowerCase());
            if (lowerCaseArray.includes(targetName.toLowerCase())) {
                foundId = item.ID;
            }
        });
        return foundId;
    }

    _findEdrId(name) {
        const edrPattern = /ED-R\s*(\S+)/;
        const edrMatch = name.match(edrPattern);
        const cleanName = edrMatch && edrMatch[1] ? edrMatch[1] : name;
        return this._findIdInArray(edrInfo, cleanName, "ED-R");
    }

    _findEddId(name) {
        const eddPattern = /ED-D\s*(\S+)/;
        const eddMatch = name.match(eddPattern);
        const cleanName = eddMatch && eddMatch[1] ? eddMatch[1] : name;
        return this._findIdInArray(eddInfo, cleanName, "ED-D");
    }

    _findPjeId(name) {
        const cleanName = name.replace('PJA', '').trim();
        return this._findIdInArray(pjeInfo, cleanName, "PJE");
    }

    setAipInfoAirspace(name) {
        return new Promise((resolve) => {
            let id = null;
            if (this instanceof RmzAirspace) id = this._findIdInArray(rmzInfo, name, "RMZ");
            else if (this instanceof CtrAirspace) id = this._findIdInArray(ctrInfo, name, "CTRs");
            else if (this instanceof PjeAirspace) id = this._findPjeId(name);
            else if (this instanceof TmzAirspace) id = this._findIdInArray(tmzInfo, name, "TMZ");
            else if (this instanceof EdrAirspace) id = this._findEdrId(name);
            else if (this instanceof EddAirspace) id = this._findEddId(name);
            resolve(id);
        });
    }

    closeInfoPdf() {
        let detailDiv = document.getElementById('aerodromeInfoDetail');
        if (detailDiv) detailDiv.style.height = '0px';
    }

    getStyle() {
        return {};
    }
}
