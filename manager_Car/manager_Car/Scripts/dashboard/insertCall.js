//let mapSelect, mapConfirm, marker;
//let currentInputId = '';
//let coordinates = {
//    modalAddressPickup: null,
//    modalAddressDes: null
//};
//$(document).ready(function () {
//    initMaps();
//    var timeout = null;
//    var activeInput = null;

//    $('.form-input.with-suggestions').on('input', function () {
//        clearTimeout(timeout);
//        var searchText = $(this).val();
//        activeInput = $(this);

//        if (searchText.length >= 3) {
//            timeout = setTimeout(function () {
//                searchAddress(searchText);
//            }, 700);
//        } else {
//            $('#addressSuggestions').hide();
//        }
//    });

//    $('.form-input.with-suggestions').on('keypress', function (e) {
//        if (e.which == 13) {
//            e.preventDefault();
//            activeInput = $(this);
//            searchAddress($(this).val());
//        }
//    });

//    $('.form-input.with-suggestions').on('focus', function () {
//        activeInput = $(this);
//        positionSuggestions();
//    });

//    function positionSuggestions() {
//        if (activeInput) {
//            var inputOffset = activeInput.offset();
//            var inputHeight = activeInput.outerHeight();
//            $('#addressSuggestions').css({
//                'top': inputOffset.top + inputHeight,
//                'left': inputOffset.left,
//                'width': activeInput.outerWidth()
//            });
//        }
//    }

//    function searchAddress(address) {
//        $.ajax({
//            url: '/Dashboard/GetAddressSuggestions',
//            type: 'POST',
//            data: { address: address },
//            success: function (response) {
//                if (response.success && response.data && response.data.Content) {
//                    displaySuggestions(response.data.Content);
//                } else {
//                    $('#addressSuggestions').hide();
//                }
//            },
//            error: function () {
//                $('#addressSuggestions').hide();
//            }
//        });
//    }

//    function displaySuggestions(addresses) {
//        var $suggestions = $('#addressSuggestions');
//        $suggestions.empty();

//        if (addresses.length > 0) {
//            $.each(addresses, function (index, item) {
//                var $div = $('<div>')
//                    .text(item.address)
//                    .addClass('suggestion-item')
//                    .data('id', item.id)
//                    .click(function () {
//                        if (activeInput) {
//                            activeInput.val(item.address.length > 68 ? item.address.substring(0, 68) + "..." : item.address);
//                            getCoordinatesById(item.id, activeInput.attr('id'));
//                        }
//                        $suggestions.hide();
//                    });
//                $suggestions.append($div);
//            });
//            positionSuggestions();
//            $suggestions.show();
//        } else {
//            $suggestions.hide();
//        }
//    }

//    function getCoordinatesById(id, inputId) {
//        $.ajax({
//            url: '/Dashboard/GetCoordinatesById',
//            type: 'POST',
//            data: { id: id },
//            success: function (response) {
//                if (response.data.statusID === 2) {
//                    coordinates[inputId] = {
//                        lat: response.data.Content.latitude,
//                        lng: response.data.Content.longitude
//                    };
//                    console.log(`Tọa độ ${inputId}: Lat: ${coordinates[inputId].lat}, Lng: ${coordinates[inputId].lng}`);
//                } else {
//                    console.log('Không lấy được tọa độ - Status:', response.data.statusID);
//                }
//            },
//            error: function (xhr, status, error) {
//                console.log('Lỗi khi gọi API:', error);
//            }
//        });
//    }

//    $(document).click(function (e) {
//        if (!$(e.target).closest('.form-input.with-suggestions, #addressSuggestions').length) {
//            $('#addressSuggestions').hide();
//        }
//    });

//    $(window).resize(function () {
//        positionSuggestions();
//    });

   
//});

//function initMaps() {
//    initMapSelect();
//    initMapConfirm();
//}

//function initMapSelect() {
//    mapSelect = L.map('mapSelectLocation', {
//        fullscreenControl: true,
//        fullscreenControlOptions: { position: 'topleft', title: 'Phóng to toàn màn hình', titleCancel: 'Thoát toàn màn hình' }
//    }).setView([20.9337809, 105.7835528], 13);

//    var subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
//    var googleNormal = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&scale=2', {
//        maxZoom: 20,
//        subdomains: subdomains,
//        attribution: '© <a href="https://maps.google.com"></a>'
//    });

//    var googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=vi&scale=2', {
//        maxZoom: 20,
//        subdomains: subdomains,
//        attribution: '© <a href="https://maps.google.com"></a>'
//    });

//    var baseMaps = {
//        "Bản đồ Đường phố": googleNormal,
//        "Bản đồ Vệ tinh": googleSatellite
//    };
//    googleNormal.addTo(mapSelect);
//    L.control.layers(baseMaps).addTo(mapSelect);
//    mapSelect.on('click', function (e) { placeMarker(e.latlng); });
//}

//function initMapConfirm() {
//    mapConfirm = L.map('mapConfirm', { fullscreenControl: true, fullscreenControlOptions: { position: 'topleft', title: 'Phóng to toàn màn hình', titleCancel: 'Thoát toàn màn hình' } })
//        .setView([20.9337809, 105.7835528], 13);
//    var subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
//    var googleNormal = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&scale=2', {
//        maxZoom: 20,
//        subdomains: subdomains,
//        attribution: '© <a href="https://maps.google.com"></a>'
//    });

//    var googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=vi&scale=2', {
//        maxZoom: 20,
//        subdomains: subdomains,
//        attribution: '© <a href="https://maps.google.com"></a>'
//    });

//    var baseMaps = {
//        "Bản đồ Đường phố": googleNormal,
//        "Bản đồ Vệ tinh": googleSatellite
//    };
//    googleNormal.addTo(mapConfirm);
//    L.control.layers(baseMaps).addTo(mapConfirm);
//    googleNormal.addTo(mapConfirm);
//}

//function openMapModal(inputId) {
//    currentInputId = inputId;
//    document.getElementById("mapModalSelectLocation").style.display = "block";
//    if (!mapSelect) initMapSelect();
//    else mapSelect.invalidateSize();
//}

//function closeMapModal() {
//    document.getElementById("mapModalSelectLocation").style.display = "none";
//    document.getElementById("loadingOverlayMap").style.display = "none";
//    currentInputId = '';
//}

//function placeMarker(latlng) {
//    console.log("hi");
//    if (marker) mapSelect.removeLayer(marker);

//    marker = L.marker(latlng, { draggable: true }).addTo(mapSelect);
//    mapSelect.panTo(latlng);
//    marker.bindPopup("Đang tải địa chỉ...").openPopup();

//    updatePopupWithAddress(latlng);
//    marker.on('dragend', function (e) {
//        const newLatLng = marker.getLatLng();
//        mapSelect.panTo(newLatLng);
//        marker.bindPopup("Đang tải địa chỉ...").openPopup();
//        updatePopupWithAddress(newLatLng);
//    });
//}

//function updatePopupWithAddress(latlng) {
//    $.ajax({
//        url: '/Dashboard/GetAddressCoor',
//        type: 'POST',
//        data: { latitude: latlng.lat, longitude: latlng.lng },
//        success: function (data) {
//            let address = (data.data.statusID === 2 && data.data.Content && data.data.Content.Address)
//                ? data.data.Content.Address
//                : "Không tìm thấy địa chỉ";
//            marker.bindPopup(address).openPopup();
//        },
//        error: function () {
//            marker.bindPopup("Lỗi khi lấy địa chỉ").openPopup();
//        }
//    });
//}

//function selectLocation() {
//    if (marker && currentInputId) {
//        const latlng = marker.getLatLng();
//        coordinates[currentInputId] = { lat: latlng.lat, lng: latlng.lng };
//        document.getElementById("loadingOverlayMap").style.display = "flex";
//        $.ajax({
//            url: '/Dashboard/GetAddressCoor',
//            type: 'POST',
//            data: { latitude: latlng.lat, longitude: latlng.lng },
//            success: function (data) {
//                setTimeout(() => {
//                    let selectedAddress = (data.data.statusID === 2 && data.data.Content && data.data.Content.Address)
//                        ? data.data.Content.Address
//                        : `Lat: ${latlng.lat}, Lng: ${latlng.lng}`;
//                    document.getElementById(currentInputId).value = selectedAddress;
//                    document.getElementById("loadingOverlayMap").style.display = "none";
//                    closeMapModal();
//                }, 1000);
//            },
//            error: function () {
//                setTimeout(() => {
//                    document.getElementById(currentInputId).value = `Lat: ${latlng.lat}, Lng: ${latlng.lng}`;
//                    document.getElementById("loadingOverlayMap").style.display = "none";
//                    closeMapModal();
//                }, 1000);
//            }
//        });
//    } else {
//        alertNotify("Vui lòng chọn một địa điểm trên bản đồ!", 'danger', 3000);
//    }
//}

//function confirmLocations() {
//    document.getElementById("loadingOverlayModal").style.display = "flex";
//    mapConfirm.eachLayer(function (layer) { if (layer instanceof L.Marker) mapConfirm.removeLayer(layer); });
//    const address1 = document.getElementById("modalAddressPickup").value;
//    const address2 = document.getElementById("modalAddressDes").value;

//    if (coordinates.modalAddressPickup) {
//        L.marker(coordinates.modalAddressPickup, { icon: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41] }) })
//            .addTo(mapConfirm)
//            .bindPopup(address1 || "Địa điểm đón", { closeOnClick: false, autoClose: false })
//            .openPopup();
//        document.getElementById("loadingOverlayModal").style.display = "none";
//    } else {
//        alertNotify("Vui lòng chọn địa điểm đón trước!", 'danger', 3000);
//        document.getElementById("loadingOverlayModal").style.display = "none";
//        return;
//    }

//    if (coordinates.modalAddressDes) {
//        L.marker(coordinates.modalAddressDes, { icon: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41] }) })
//            .addTo(mapConfirm)
//            .bindPopup(address2 || "Địa điểm đến", { closeOnClick: false, autoClose: false })
//            .openPopup();
//        document.getElementById("loadingOverlayModal").style.display = "none";
//    } else {
//        alertNotify("Vui lòng chọn địa điểm đến trước!", 'danger', 3000);
//        document.getElementById("loadingOverlayModal").style.display = "none";
//        return;
//    }

//    mapConfirm.fitBounds([
//        [coordinates.modalAddressPickup.lat, coordinates.modalAddressPickup.lng],
//        [coordinates.modalAddressDes.lat, coordinates.modalAddressDes.lng]
//    ]);
//}
