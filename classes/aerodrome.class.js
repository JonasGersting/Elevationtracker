class Aerodrome extends AirspacePolygon {
    aipIds = [];
    currentPage = 0;
    constructor(geometry, name, map, icaoCode, rwys) {
        super(geometry, name, map, icaoCode);
        this.geometry = geometry;
        this.name = name;
        this.map = map;
        this.icaoCode = icaoCode;
        this.rwys = rwys;
        this.icon = this.createCustomIcon();
        this.marker = null;
        this.aipImgs = [];
        this.currentImgIndex;
        this.rotationAngle = 0;
        this.aipImgsAct = false;
        this.notamInfoAct = false;
    }

    getRotationBarHtml(trueHeading) {
        if (this.rwys === undefined) return '';
        return `
            <div class="rotation-bar"
                style="
                    position: absolute; top: 50%; left: 50%; width: 25px; height: 3px;
                    background-color: black; transform: translate(-50%, -50%) rotate(${trueHeading - 90}deg);
                    transform-origin: center;">
            </div>`;
    }

    getIconHtml(circleSize, backgroundColor, borderWidth, borderColor, rotationBarHtml) {
        return `
            <div class="marker-icon" style="position: relative; width: ${circleSize}px; height: ${circleSize}px; display: flex; align-items: center; justify-content: center;">
                <div class="circle-marker"
                    style="
                        width: ${circleSize}px; height: ${circleSize}px; background-color: ${backgroundColor};
                        border: ${borderWidth}px solid ${borderColor}; border-radius: 50%; box-sizing: border-box;">
                </div>
                ${rotationBarHtml}
                <div class="additional-info text-shadow" style="display: none; font-size: 12px; width: 35px; position: absolute; right: -32px; bottom: -18px;">
                    ${this.icaoCode}
                </div>
            </div>`;
    }

    createCustomIcon() {
        const trueHeading = this.rwys && this.rwys[0] ? this.rwys[0].trueHeading : 0;
        const circleSize = 18;
        const borderWidth = 3;
        const borderColor = 'black';
        const backgroundColor = 'transparent';
        const rotationBarHtml = this.getRotationBarHtml(trueHeading);
        const iconHtml = this.getIconHtml(circleSize, backgroundColor, borderWidth, borderColor, rotationBarHtml);
        return L.divIcon({
            className: 'custom-div-icon',
            html: iconHtml,
            iconSize: [circleSize, circleSize],
            iconAnchor: [circleSize / 2, circleSize / 2]
        });
    }

    addToMap() {
        this.marker = L.marker([this.geometry.coordinates[1], this.geometry.coordinates[0]], { icon: this.icon }).addTo(this.map);
        this.marker.bindPopup(`Name: ${this.name}<br>ICAO: ${this.icaoCode}`);
        this.map.on('zoomend', () => this.toggleAdditionalInfo());
        this.toggleAdditionalInfo();
        this.marker.on('mouseover', () => {
            this.marker.openPopup();
        });
        this.marker.on('mouseout', () => {
            this.marker.closePopup();
        });
        this.marker.on('click', () => this.onClick());
    }

    toggleAdditionalInfo() {
        if (!this.marker || !this.marker._icon) return;
        const zoomLevel = this.map.getZoom();
        const infoElement = this.marker._icon.querySelector('.additional-info');
        if (infoElement) {
            if (zoomLevel >= 9) {
                infoElement.style.display = 'block';
            } else {
                infoElement.style.display = 'none';
            }
        }
    }

    prepareDetailView() {
        const detailDiv = document.getElementById('aerodromeInfoDetail');
        detailDiv.style.height = '100vh';
        detailDiv.innerHTML = '';
        return detailDiv;
    }

    displayCard(detailDiv, name, icaoCode, metarTargetId) {
        const cardHTML = this.returnCard(name, icaoCode, metarTargetId);
        detailDiv.innerHTML = cardHTML;
    }

    loadMetarData(metarTargetId) {
        const metarLinkElementId = `metartaf-${metarTargetId}`;
        if (!document.getElementById(metarLinkElementId)) {
            const fallbackLink = document.getElementById(metarTargetId);
            if (fallbackLink) fallbackLink.textContent = `METAR/TAF für ${this.icaoCode} nicht init.`;
            return;
        }
        const script = document.createElement('script');
        script.async = true; script.defer = true; script.crossOrigin = 'anonymous';
        script.src = `https://metar-taf.com/de/embed-js/${this.icaoCode}?qnh=hPa&rh=rh&target=${metarTargetId}`;
        script.onerror = () => {
            const targetLink = document.getElementById(metarTargetId);
            if (targetLink) {
                targetLink.textContent = `METAR/TAF für ${this.icaoCode} Ladefehler.`;
                targetLink.href = '#error-loading-metar';
            }
        };
        document.body.appendChild(script);
    }

    initializeAipButtons() {
        try {
            const loader = document.getElementById('loaderAipImg');
            const btn = document.getElementById('showAipImgsBtn');
            loader.style.display = 'inline-block';
            if (this.aipIds && this.aipIds.length > 0) {
                this.currentPage = 0;
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
            loader.style.display = 'none';
        } catch (e) {
            showErrorBanner("Fehler beim Initialisieren der AIP-Buttons.");
        }
    }

    async onClick() {       
        this.setaipInfo(this.icaoCode);
        currentAerodrome = this;
        const detailDiv = this.prepareDetailView();
        const metarTargetId = `${this.icaoCode}`;
        this.displayCard(detailDiv, this.name, this.icaoCode, metarTargetId);
        this.loadMetarData(metarTargetId);
        this.initializeAipButtons();
    }

 

    returnCard(name, icaoCode, metarTargetId) {
        return `
            <div class="overlay"></div>
            <div class="cardWrapper">
                <div class="aerodromeCard" id="aerodromeCard">
                    <button onclick="currentAerodrome.closeDetailInfo()" class="closeButton">X</button>
                    <h2>${name}</h2>
                    <h3>${icaoCode}</h3>
                    <a href="https://metar-taf.com/de/${icaoCode}" target="_blank" id="metartaf-${metarTargetId}" class="metar">METAR &quot;${name}&quot; Airfield</a>
                    <div class="buttonWithLoader">
                        <button class="aerodromeCardButton" id="showAipImgsBtn" onclick="currentAerodrome.toggleAIPImgs()">
                        <span class="loader z-index1100" id="loaderAipImg" style="display: none;"></span>
                        AIP-Info</button>
                        <button class="aerodromeCardButton" disabled id="showNotam" onclick="currentAerodrome.toggleNotam()">
                        <span class="loader z-index1100" id="loaderNotam" style="display: none;"></span>
                        NOTAM</button>
                    </div>
                </div>
                <div id="aipInfo">
                </div>
                <div id="notamInfo"></div>
            </div>`;
    }

    setaipInfo(icaoCode) {
        aipInfo.forEach(item => {
            if (item.indicator === icaoCode) {
                this.aipIds = [
                    item.Adinfo
                ];
                if (Array.isArray(item.charts)) {
                    item.charts.forEach(item => {
                        this.aipIds.push(item);
                    });
                } else if (item.charts) {
                    this.aipIds.push(item.charts);
                }
            }
        });
    }



    hideAIPImgs(aipImgContainer, aerodromeCard) {
        this.aipImgsAct = false;
        aipImgContainer.style.width = '0px';
        aipImgContainer.innerHTML = '';
        aerodromeCard.style.borderRadius = '16px';
    }

    getInfoContainerWidth() {
        if (window.innerWidth <= 1000) return '500px';
        if (window.innerWidth <= 1300) return '600px';
        return '900px';
    }

    setAipContainerContent(aipImgContainer) {
        aipImgContainer.innerHTML = `
            <button onclick="currentAerodrome.changeAipImg('left')" class="switchButton left-32" id="switchAipImgLeft"><</button>
            <button onclick="currentAerodrome.changeAipImg('right')" class="switchButton right-32" id="switchAipImgRight">></button>
            <span id="pageIndicator">${this.currentPage + 1} / ${this.aipIds.length}</span>
            <iframe id="pdfIframe" src="https://aip.dfs.de/vfr/scripts/getLogicalpage.php?id=${this.aipIds[this.currentPage]}#zoom=page-fit" frameborder="0"></iframe>
        `;
    }

    showAIPImgs(aipImgContainer, aerodromeCard) {
        this.aipImgsAct = true;
        aerodromeCard.style.borderTopRightRadius = '0px';
        aerodromeCard.style.borderBottomRightRadius = '0px';
        aipImgContainer.style.width = this.getInfoContainerWidth();
        aipImgContainer.innerHTML = '';
        this.setAipContainerContent(aipImgContainer);
    }

    toggleAIPImgs() {
        const aipImgContainer = document.getElementById('aipInfo');
        const notamInfoContainer = document.getElementById('notamInfo');
        const aerodromeCard = document.getElementById('aerodromeCard');
        if (this.notamInfoAct) {
            this.hideNotamInfo(notamInfoContainer, aerodromeCard);
        }
        if (this.aipImgsAct) {
            this.hideAIPImgs(aipImgContainer, aerodromeCard);
        } else {
            this.showAIPImgs(aipImgContainer, aerodromeCard);
        }
    }

    toggleNotam() {
        const aipImgContainer = document.getElementById('aipInfo');
        const notamInfoContainer = document.getElementById('notamInfo');
        const aerodromeCard = document.getElementById('aerodromeCard');
        if (this.aipImgsAct) {
            this.hideAIPImgs(aipImgContainer, aerodromeCard);
        }
        if (this.notamInfoAct) {
            this.hideNotamInfo(notamInfoContainer, aerodromeCard);
        } else {
            this.showNotamInfo(notamInfoContainer, aerodromeCard);

        }
    }

    async showADNotam(notamInfoContainer) {
       await this.checkNotamAvailability();
        notamInfoContainer.innerHTML = '';
        aerodromeNotam.forEach(notam => {
            if (notam.itemA == this.icaoCode) {
                notamInfoContainer.innerHTML += `<div class="notamDetail"> ${returnCorrectNOTAM(
                    notam.endDate, notam.est, notam.fir,
                    notam.itemA, notam.itemD, notam.itemE, notam.itemF, notam.itemG,
                    notam.latitude, notam.longitude, notam.lower, notam.nof, notam.notamID, notam.purpose, notam.qcode, notam.radius,
                    notam.referredNotamId, notam.scope, notam.startDate, notam.traffic, notam.type, notam.upper
                )}</div>`;
            }
        });
        if (notamInfoContainer.innerHTML === '') {
            notamInfoContainer.innerHTML = `<div class="notamDetail">Keine NOTAM für diesen Flugplatz gefunden.</div>`;
        }
    }

    async checkNotamAvailability() {
        if (allNOTAM.length === 0) {
            await getNotam('AD');
            setLastNotamCheck();
        } else {
            let now = new Date();
            if (lastNotamCheck - now > 5 * 60 * 1000) {
                await getNotam('AD');
                setLastNotamCheck();
            }
        }
    }

    hideNotamInfo(notamInfoContainer, aerodromeCard) {
        this.notamInfoAct = false;
        notamInfoContainer.style.width = '0px';
        notamInfoContainer.innerHTML = '';
        aerodromeCard.style.borderRadius = '16px';
    }

    async showNotamInfo(notamInfoContainer, aerodromeCard) {
        this.notamInfoAct = true;
        aerodromeCard.style.borderTopRightRadius = '0px';
        aerodromeCard.style.borderBottomRightRadius = '0px';
        notamInfoContainer.style.width = this.getInfoContainerWidth();
        notamInfoContainer.innerHTML = '';
        await this.showADNotam(notamInfoContainer);
    }

    updateAipPage(direction) {
        if (direction === 'right') {
            this.currentPage = (this.currentPage + 1) % this.aipIds.length;
        } else if (direction === 'left') {
            this.currentPage = (this.currentPage - 1 + this.aipIds.length) % this.aipIds.length;
        }
    }

    updateAipIframeAndIndicator() {
        let aipIframe = document.getElementById('pdfIframe');
        let pageIndicator = document.getElementById('pageIndicator');
        if (aipIframe) {
            aipIframe.src = `https://aip.dfs.de/vfr/scripts/getLogicalpage.php?id=${this.aipIds[this.currentPage]}#zoom=page-fit`;
        }
        if (pageIndicator) {
            pageIndicator.innerHTML = `${this.currentPage + 1} / ${this.aipIds.length}`;
        }
    }

    changeAipImg(direction) {
        if (!this.aipIds || this.aipIds.length === 0) return;
        this.updateAipPage(direction);
        this.updateAipIframeAndIndicator();
    }

    closeDetailInfo() {
        let detailDiv = document.getElementById('aerodromeInfoDetail');
        detailDiv.style.height = '0px';
    }
}
