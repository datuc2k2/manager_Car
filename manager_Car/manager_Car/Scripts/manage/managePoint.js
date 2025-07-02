$(document).ready(function () {
    let pointList = [];
    let isEditMode = false;
    let pointId = null;
    var tablePoint = $('#pointTable').DataTable({
        "language": {
            "emptyTable": "Không có dữ liệu hiển thị",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ mục",
            "search": "Tìm kiếm:",
            "paginate": {
                "first": "‹‹",
                "previous": "‹",
                "next": "›",
                "last": "››"
            }
        },
        "paging": true,
        "searching": true,
        "ordering": false,
        "info": true,
        "lengthChange": false,
        "pageLength": 10,
        "columns": [
            { "data": "STT", "defaultContent": "", title: "STT", "width": "5%" },
            { "data": "Name", "defaultContent": "", title: "Tên", "width": "20%" },
            { "data": "AcronymName", "defaultContent": "", title: "Viết tắt", "width": "20%" },
            { "data": "Address", "defaultContent": "", title: "Địa chỉ", "width": "40%" },
            {
                title: "Tác vụ", "width": "15%",
                "data": null,
                "defaultContent": '<button class="small-btn edit-point"><i class="fas fa-pen-to-square"></i></button>' +
                    '<button class="small-btn delete-point"><i class="fas fa-trash"></i></button>',
                "className": "text-center"
            }
        ],
          "initComplete": function () {
            $('div.dataTables_filter').hide();
            $('.search-input').on('keyup', function () {
                var searchValue = $(this).val();
                console.log("searchValue: ", searchValue);
                tablePoint.search(searchValue).draw();
            });
            //$('#addButton').on('click', function () {
            //    isEditMode = false;
            //    pointId = null;
            //    $('#modalTitle').text('Thêm điểm');
            //    $('#addPointModal').modal('show');
            //    resetFormAndMap();
            //    initializeModalMap();
            //    if (!modalMap) {
            //        setTimeout(function () {
            //            initializeModalMap();
            //        }, 300);
            //    }
            //});
        }
    });
    var modalMap;
    initializeModalMap();
    loadDataPoint();
    const addButton = document.getElementById('addButton');
    const modal = document.getElementById('addPointModal');
    const closeButton = modal.querySelector('.btn-close');

    // Hiển thị modal khi click button
    addButton.addEventListener('click', function () {
        modal.style.display = 'block';
    });

    // Ẩn modal khi click nút close
    closeButton.addEventListener('click', function () {
        modal.style.display = 'none';
    });
    function loadDataPoint() {
        document.getElementById("loadingOverlay").style.display = "flex";
        $.ajax({
            url: '/Manage/GetPointCoorsByXN',
            type: 'POST',
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    if (response.data && response.data.Content && response.data.Content.length > 0) {
                        pointList = response.data.Content;
                        let dataToAdd = response.data.Content.map((item, index) => ({
                            "STT": index + 1 || '',
                            "Name": item.Name || '',
                            "AcronymName": item.AcronymName || '',
                            "Address": item.Address || '',
                            "Latitude": item.Latitude || '',
                            "Longitude": item.Longitude || '',
                            "Radius": item.Radius || '',
                            "IDPoint": item.IDPoint || ''
                        }));
                        tablePoint.rows.add(dataToAdd).draw();
                        // Vẽ lại các điểm trên bản đồ
                        drawPointsOnMap();
                    }
                    document.getElementById("loadingOverlay").style.display = "none";
                } else {
                    tablePoint.draw();
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            },
            error: function () {
                tablePoint.draw();
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
    }
    function populateModal(rowData) {
        $('#modalTitle').text('Chỉnh sửa điểm');
        $('#pointName').val(rowData.Name);
        $('#address').val(rowData.Address);
        $('#acronymName').val(rowData.AcronymName);
        $('#latitudePoint').val(rowData.Latitude);
        $('#longitudePoint').val(rowData.Longitude);

        if (modalMap) {
            if (modalMap.marker) modalMap.removeLayer(modalMap.marker);
            if (modalMap.circle) modalMap.removeLayer(modalMap.circle);

            // Thêm marker mới
            modalMap.marker = L.marker([rowData.Latitude, rowData.Longitude]).addTo(modalMap);

            // Thêm circle nếu có radius
            if (rowData.Radius) {
                modalMap.circle = L.circle([rowData.Latitude, rowData.Longitude], {
                    radius: rowData.Radius,
                    color: 'blue',
                    fillColor: '#f03',
                    fillOpacity: 0.3
                }).addTo(modalMap);
            }

            // Căn giữa bản đồ vào vị trí point
            modalMap.setView([rowData.Latitude, rowData.Longitude], 15);
        }
    }
    var modalMap;
    var radius;

    function populateModal(rowData) {
        $('#modalTitle').text('Chỉnh sửa điểm');
        $('#pointName').val(rowData.Name);
        $('#address').val(rowData.Address);
        $('#acronymName').val(rowData.AcronymName);
        $('#latitudePoint').val(rowData.Latitude);
        $('#longitudePoint').val(rowData.Longitude);

        if (modalMap) {
            if (modalMap.marker) modalMap.removeLayer(modalMap.marker);
            if (modalMap.circle) modalMap.removeLayer(modalMap.circle);

            modalMap.marker = L.marker([rowData.Latitude, rowData.Longitude]).addTo(modalMap);

            if (rowData.Radius) {
                modalMap.circle = L.circle([rowData.Latitude, rowData.Longitude], {
                    radius: rowData.Radius,
                    color: 'blue',
                    fillColor: '#f03',
                    fillOpacity: 0.3
                }).addTo(modalMap);
            }

            modalMap.setView([rowData.Latitude, rowData.Longitude], 12);
        }
    }
    $('#pointTable').on('click', '.edit-point', function () {
        isEditMode = true;
        $('#modalTitle').text('Chỉnh sửa điểm');
        let rowData = tablePoint.row($(this).parents('tr')).data();
        pointId = rowData.IDPoint;
        console.log("pointId: ", pointId);
        $('#addPointModal').modal('show');
        populateModal(rowData);
        initializeModalMap();
        if (!modalMap) {
            setTimeout(function () {
                initializeModalMap();
                populateModal(rowData);
            }, 300);
        }
    });

    $('#pointTable').on('click', '.delete-point', function () {
        let rowData = tablePoint.row($(this).parents('tr')).data();
        pointId = rowData.IDPoint;

        if (confirm("Bạn có chắc chắn muốn xóa điểm này không?")) {
            document.getElementById("loadingOverlay").style.display = "flex";
            $.ajax({
                url: '/Manage/DeletePointCoor',
                type: 'POST',
                data: { pointId: pointId },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        tablePoint.clear();
                        loadDataPoint();
                        isEditMode = false;
                        currentEditId = null;
                        alertNotify("Đã xóa điểm thành công!", 'success', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    } else {
                        tablePoint.draw();
                        alertNotify("Đã xảy ra lỗi khi tải dữ liệu!", 'danger', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    }
                },
                error: function () {
                    tablePoint.draw();
                    alertNotify("Đã xảy ra lỗi khi xóa điểm!", 'danger', 3000);
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            });
        } else {
            document.getElementById("loadingOverlay").style.display = "none";
        }
    });

    let isToggleOn = false;

    $('.toggle-btn').on('click', function () {
        const $this = $(this);
        if ($this.hasClass('on')) {
            isToggleOn = true;
            $this.hide();
            $('.toggle-btn.off').show();
            $("#mapInstruction").text("Cần phải ấn và giữ chuột").show();
            if (modalMap) {
                modalMap.on('click', onMapClick);
                modalMap.on('mousedown', onMouseDown);
                modalMap.on('mousemove', onMapMouseMove);
            }
            $("#latitudePoint").prop('readonly', false);
            $("#longitudePoint").prop('readonly', false);
        } else {
            isToggleOn = false;
            $this.hide();
            $('.toggle-btn.on').show();
            $("#mapInstruction").hide();
            if (modalMap) {
                modalMap.off('click', onMapClick);
                modalMap.off('mousedown', onMouseDown);
                modalMap.off('mousemove', onMouseMove);
                modalMap.off('mouseup', onMouseUp);
                modalMap.off('mousemove', onMapMouseMove);
            }
            $("#latitudePoint").prop('readonly', true);
            $("#longitudePoint").prop('readonly', true);
            if (modalMap && modalMap.marker) {
                modalMap.removeLayer(modalMap.marker);
                modalMap.marker = null;
            }
            if (modalMap && modalMap.circle) {
                modalMap.removeLayer(modalMap.circle);
                modalMap.circle = null;
            }
            $("#latitudePoint").val('');
            $("#longitudePoint").val('');
        }
    });
    let isDrawing = false;
    let startLatLng;

    function onMapClick(e) {
        if (!isToggleOn) return;

        var lat = e.latlng.lat;
        var lng = e.latlng.lng;
        console.log("Click - Latitude: " + lat.toFixed(6) + ", Longitude: " + lng.toFixed(6));
        $("#latitudePoint").val(lat.toFixed(6));
        $("#longitudePoint").val(lng.toFixed(6));

        if (modalMap.marker) {
            modalMap.removeLayer(modalMap.marker);
        }
        modalMap.marker = L.marker([lat, lng]).addTo(modalMap);
        startLatLng = e.latlng;
    }

    function onMouseDown(e) {
        if (!isToggleOn) return;

        isDrawing = true;
        startLatLng = e.latlng;
        console.log("MouseDown - Latitude: " + startLatLng.lat.toFixed(6) + ", Longitude: " + startLatLng.lng.toFixed(6));

        $("#latitudePoint").val(startLatLng.lat.toFixed(6));
        $("#longitudePoint").val(startLatLng.lng.toFixed(6));

        if (modalMap.marker) {
            modalMap.removeLayer(modalMap.marker);
        }
        modalMap.marker = L.marker(startLatLng).addTo(modalMap);

        modalMap.dragging.disable();
        modalMap.touchZoom.disable();
        modalMap.doubleClickZoom.disable();
        modalMap.scrollWheelZoom.disable();
        modalMap.boxZoom.disable();
        modalMap.keyboard.disable();

        modalMap.on('mousemove', onMouseMove);
        modalMap.on('mouseup', onMouseUp);
    }

    function onMapMouseMove(e) {
        if (!isToggleOn) return;

        const mapBounds = modalMap.getContainer().getBoundingClientRect();
        const mouseX = e.originalEvent.clientX - mapBounds.left;
        const mouseY = e.originalEvent.clientY - mapBounds.top;

        if (mouseX >= 0 && mouseX <= mapBounds.width && mouseY >= 0 && mouseY <= mapBounds.height) {
            $("#mapInstruction")
                .css({ left: e.originalEvent.clientX + 'px', top: e.originalEvent.clientY + 'px' })
                .show();

            if (!isDrawing) {
                $("#mapInstruction").text("Cần phải ấn và giữ chuột");
            }
        } else {
            $("#mapInstruction").hide();
        }
    }

    function onMouseMove(e) {
        if (!isDrawing || !startLatLng) return;

        if (modalMap.circle) {
            modalMap.removeLayer(modalMap.circle);
        }

        var distance = startLatLng.distanceTo(e.latlng);

        var roundedRadius = Math.round(distance);

        $("#mapInstruction").text("Bán kính: " + roundedRadius + " mét. Thả ra để tạo vòng tròn");

        modalMap.circle = L.circle(startLatLng, {
            radius: roundedRadius,
            color: 'blue',
            fillColor: '#f03',
            fillOpacity: 0.3
        }).addTo(modalMap);
        if (!modalMap.marker) {
            modalMap.marker = L.marker(startLatLng).addTo(modalMap);
        }
    }

    function onMouseUp(e) {
        if (!isDrawing || !startLatLng) return;
        isDrawing = false;
        modalMap.off('mousemove', onMouseMove);
        modalMap.off('mouseup', onMouseUp);

        $("#latitudePoint").val(startLatLng.lat.toFixed(6));
        $("#longitudePoint").val(startLatLng.lng.toFixed(6));
        console.log("MouseUp - Latitude: " + startLatLng.lat.toFixed(6) + ", Longitude: " + startLatLng.lng.toFixed(6)); // Debug

        var distance = startLatLng.distanceTo(e.latlng);
        var roundedRadius = Math.round(distance);

        console.log("Bán kính: " + roundedRadius + " mét");
        radius = roundedRadius;

        if (modalMap.circle) {
            modalMap.removeLayer(modalMap.circle);
        }
        modalMap.circle = L.circle(startLatLng, {
            radius: roundedRadius,
            color: 'blue',
            fillColor: '#f03',
            fillOpacity: 0.3
        }).addTo(modalMap);

        modalMap.dragging.enable();
        modalMap.touchZoom.enable();
        modalMap.doubleClickZoom.enable();
        modalMap.scrollWheelZoom.enable();
        modalMap.boxZoom.enable();
        modalMap.keyboard.enable();

        $("#mapInstruction").hide();

        isToggleOn = false;
        $('.toggle-btn.off').hide();
        $('.toggle-btn.on').show();

        modalMap.off('click', onMapClick);
        modalMap.off('mousedown', onMouseDown);

        $("#latitudePoint").prop('readonly', true);
        $("#longitudePoint").prop('readonly', true);
    }

    function initializeModalMap() {
        modalMap = L.map('modalMap', {
            fullscreenControl: true,
            fullscreenControlOptions: {
                position: 'topleft',
                title: 'Phóng to toàn màn hình',
                titleCancel: 'Thoát toàn màn hình'
            }
        }).setView([21.0668736, 105.729324], 10);

        var subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
        var googleNormal = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&scale=2', {
            maxZoom: 20,
            subdomains: subdomains,
            attribution: '© <a href="https://maps.google.com"</a>'
        });

        var googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=vi&scale=2', {
            maxZoom: 20,
            subdomains: subdomains,
            attribution: '© <a href="https://maps.google.com"></a>'
        });

        var baseMaps = {
            "Bản đồ Đường phố": googleNormal,
            "Bản đồ Vệ tinh": googleSatellite
        };

        googleNormal.addTo(modalMap);
        L.control.layers(baseMaps).addTo(modalMap);
    }

    $("#saveButton").on("click", function () {
        //var pointName = $("#pointName").val().trim();
        //var address = $("#address").val().trim();
        //var abbreviation = $("#abbreviation").val().trim();
        //var latitudePoint = $("#latitudePoint").val();
        //var longitudePoint = $("#longitudePoint").val();

        //if (pointName && latitudePoint && longitudePoint) {
        //    table.row.add([
        //        table.data().count() + 1,
        //        pointName,
        //        abbreviation || '',
        //        address || '',
        //        'Sửa | Xóa'
        //    ]).draw();
        //$('#addPointModal').modal('hide');
        if (isEditMode) {
            const PointData = {
                token: '',
                Name: $("#pointName").val(),
                Address: $("#address").val(),
                AcronymName: $("#acronymName").val(),
                Latitude: $("#latitudePoint").val(),
                Longitude: $("#longitudePoint").val(),
                Radius: radius || ($('#addPointModal').is(':visible') && modalMap.circle ? modalMap.circle.getRadius() : 0),
                IDPoint: pointId
            };
            console.log("PointData : ", JSON.stringify(PointData));
            document.getElementById("loadingOverlay").style.display = "flex";
            $.ajax({
                url: '/Manage/UpdatePointCoor',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(PointData),
                success: function (response) {
                    tablePoint.clear();
                    loadDataPoint();
                    $('#addPointModal').modal('hide');
                    resetFormAndMap();
                    isEditMode = false;
                    currentEditId = null;
                    $('#modalTitle').text('Thêm điểm');
                    alertNotify("Đã chỉnh sửa điểm!", 'success', 3000);
                    document.getElementById("loadingOverlay").style.display = "none";
                },
                error: function (error) {
                    console.error("Error: ", error);
                    alertNotify("Đã xảy ra lỗi khi chỉnh sửa điểm!", 'danger', 3000);
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            });
        }
        else {
            const PointData = {
                token: '',
                Name: $("#pointName").val(),
                Address: $("#address").val(),
                AcronymName: $("#acronymName").val(),
                Latitude: $("#latitudePoint").val(),
                Longitude: $("#longitudePoint").val(),
                Radius: radius,
            };
            console.log("PointData : ", JSON.stringify(PointData));
            if (PointData.Name != '' && PointData.Address != '' && PointData.AcronymName != '' && PointData.Latitude != '' && PointData.Longitude != '') {
                document.getElementById("loadingOverlay").style.display = "flex";
                $.ajax({
                    url: '/Manage/AddPointCoor',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(PointData),
                    success: function (response) {
                        tablePoint.clear();
                        loadDataPoint();
                        $('#addPointModal').modal('hide');
                        resetFormAndMap();
                        isEditMode = false;
                        currentEditId = null;
                        $('#modalTitle').text('Thêm điểm');
                        alertNotify("Đã thêm điểm thành công!", 'success', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    },
                    error: function (error) {
                        console.error("Error: ", error);
                        alertNotify("Đã xảy ra lỗi khi thêm điểm!", 'danger', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    }
                });
            }
            else {
                alertNotify("Vui lòng nhập đầy đủ thông tin Tên POI và chọn vị trí trên bản đồ!", 'danger', 3000);
            }
        }

    });
    $("#resetButton").on("click", function () {
        resetFormAndMap();
    });

    function resetFormAndMap() {
        $("#addPointForm")[0].reset();
        $("#latitudePoint").val('');
        $("#longitudePoint").val('');
        if (modalMap && modalMap.marker) {
            modalMap.removeLayer(modalMap.marker);
            modalMap.marker = null;
        }
        if (modalMap && modalMap.circle) {
            modalMap.removeLayer(modalMap.circle);
            modalMap.circle = null;
        }

        // Đặt lại toggle về trạng thái tắt
        isToggleOn = false;
        $('.toggle-btn.on').show();
        $('.toggle-btn.off').hide();

        // Ẩn thông báo
        $("#mapInstruction").hide();

        // Vô hiệu hóa tất cả sự kiện trên bản đồ
        if (modalMap) {
            modalMap.off('click', onMapClick);
            modalMap.off('mousedown', onMouseDown);
            modalMap.off('mousemove', onMouseMove);
            modalMap.off('mouseup', onMouseUp);
            modalMap.off('mousemove', onMapMouseMove);
        }

        // Khóa các trường latitude và longitude
        $("#latitudePoint").prop('readonly', true);
        $("#longitudePoint").prop('readonly', true);

        // Đảm bảo bản đồ có thể di chuyển lại
        modalMap.dragging.enable();
        modalMap.touchZoom.enable();
        modalMap.doubleClickZoom.enable();
        modalMap.scrollWheelZoom.enable();
        modalMap.boxZoom.enable();
        modalMap.keyboard.enable();
    }

    var mapSelect = L.map('mapManagePoint', {
        fullscreenControl: true,
        fullscreenControlOptions: { position: 'topleft', title: 'Phóng to toàn màn hình', titleCancel: 'Thoát toàn màn hình' }
    }).setView([20.9337809, 105.7835528], 13);

    var subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
    var googleNormal = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&scale=2', {
        maxZoom: 20,
        subdomains: subdomains,
        attribution: '© <a href="https://maps.google.com">Google Maps</a>'
    });

    var googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=vi&scale=2', {
        maxZoom: 20,
        subdomains: subdomains,
        attribution: '© <a href="https://maps.google.com">Google Maps</a>'
    });

    var baseMaps = {
        "Bản đồ Đường phố": googleNormal,
        "Bản đồ Vệ tinh": googleSatellite
    };

    googleNormal.addTo(mapSelect);
    L.control.layers(baseMaps).addTo(mapSelect);

    function drawPointsOnMap() {
        // Xóa tất cả các layer hiện có trên bản đồ (nếu có)
        mapSelect.eachLayer(function (layer) {
            if (layer instanceof L.Marker || layer instanceof L.Circle) {
                mapSelect.removeLayer(layer);
            }
        });

        // Lặp qua pointList để vẽ marker và vòng tròn
        pointList.forEach(function (point, index) {
            if (point.Latitude && point.Longitude) {
                // Thêm marker
                var marker = L.marker([point.Latitude, point.Longitude]).addTo(mapSelect)
                    .bindPopup(`<b>${point.Name}</b><br>Địa chỉ: ${point.Address}<br>Bán kính: ${point.Radius || 0} mét`);

                // Thêm vòng tròn nếu có radius
                if (point.Radius) {
                    var circle = L.circle([point.Latitude, point.Longitude], {
                        radius: point.Radius,
                        color: 'blue',
                        fillColor: '#f03',
                        fillOpacity: 0.3
                    }).addTo(mapSelect);
                }
            }
        });
        if (pointList.length > 0) {
            var group = new L.featureGroup(pointList.map(point => L.marker([point.Latitude, point.Longitude])));
            mapSelect.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
    }
});