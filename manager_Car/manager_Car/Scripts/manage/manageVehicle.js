$(document).ready(function () {
    let vehicleList = [];
    let isEditMode = false;
    let companyItem = "";
    let companyList = [];
    let licenseDelete = "";

    var tableVehicle = $('#vehicleTable').DataTable({
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
        "searching": false,
        "ordering": false,
        "info": true,
        "lengthChange": false,
        "pageLength": 10,
        "columns": [
            { "data": "STT", "title": "STT", "defaultContent": "" },
            { "data": "License", "title": "Biển số", "defaultContent": "" },
            { "data": "ID", "title": "Mã đàm", "defaultContent": "" },
            { "data": "MaXN", "title": "Mã xí nghiệp", "defaultContent": "" },
            { "data": "CountSeat", "title": "Số chỗ", "defaultContent": "" },
            { "data": "TypeCar", "title": "Loại xe", "defaultContent": "" },
            { "data": "NameVehicle", "title": "Tên xe", "defaultContent": "" },
            { "data": "VehicleColor", "title": "Màu xe", "defaultContent": "" },
            { "data": "ManageModel", "title": "Mô hình quản lý", "defaultContent": "" },
            { "data": "FrameCode", "title": "Số khung", "defaultContent": "" },
            { "data": "PulseCoefficient", "title": "Hệ số xung", "defaultContent": "" },
            { "data": "BlockVehicle", "title": "Khóa xe", "defaultContent": "" },
            { "data": "blackBox", "title": "Hộp đen", "defaultContent": "" },
            { "data": "Meter", "title": "Đồng hồ", "defaultContent": "" },
            { "data": "DriverName", "title": "Tên tài xế", "defaultContent": "" },
            { "data": "DriverPhone", "title": "Số điện thoại tài xế", "defaultContent": "" },
            { "data": "DriverID", "title": "ID tài xế", "defaultContent": "" },
            { "data": "TimeCreateHT", "title": "Thời gian tạo", "defaultContent": "" },
            {
                "title": "Tác vụ",
                "data": null,
                "defaultContent": '<button class="small-btn edit-vehicle"><i class="fas fa-pen-to-square"></i></button>' +
                    '<button class="small-btn delete-vehicle"><i class="fas fa-trash"></i></button>',
                "className": "text-center"
            }
        ],
        "initComplete": function () {
            $('#addButton').on('click', function () {
                isEditMode = false;
                $('#modalTitle').text('Thêm xe');
                $('#addVehicleModal').modal('show');
                $('#license').val('');
                $('#ID').val('');
                $('#countSeat').val('');
                $('#typeCar').val('');
                $('#nameVehicle').val('');
                $('#vehicleColor').val('');
                $('#manageModel').val('');
                $('#frameCode').val('');
                $('#pulseCoefficient').val('');
                $('#blackBox').prop('checked', false);
                $('#blockVehicle').prop('checked', false);
                $('#meter').prop('checked', false);
                setTimeout(() => {
                    $('#company').val('');
                }, 100);
                GetCompany();
            });
        }
    });
    function GetCompany() {
        $.ajax({
            url: '/Manage/GetCompany',
            type: 'POST',
            dataType: 'json',
            beforeSend: function () {
                document.getElementById("loadingOverlay").style.display = "block";
            },
            success: function (response) {
                if (response.success) {
                    if (response.data && response.data.Content && response.data.Content.length > 0) {
                        companyList = response.data.Content;
                        let select = $('#company');
                        select.empty();
                        select.append('<option value="">-- Chọn xe --</option>');

                        $.each(companyList, function (index, item) {
                            select.append('<option value="' + item.MaXN + '">' + item.Name + '</option>');
                        });
                        $('#company').val(companyItem);
                        $('#company').on('change', function () {
                            let selectedMaXN = $(this).val();
                            $('#maXN').val(selectedMaXN);
                        });

                        let dataToAdd = response.data.Content.map((item, index) => ({
                            "STT": index + 1 || '',
                            "Name": item.Name || '',
                            "PhoneNumber": item.PhoneNumber || '',
                            "Address": item.Address || '',
                            "MaXN": item.MaXN || '',
                        }));
                    }
                }
                document.getElementById("loadingOverlay").style.display = "none";
            },
            error: function () {
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
    }
    function loadDataVehicle() {
        document.getElementById("loadingOverlay").style.display = "flex";
        $.ajax({
            url: '/Manage/GetListVehicle',
            type: 'POST',
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    if (response.data && response.data.Content && response.data.Content.length > 0) {
                        console.log("response.data: ", response.data);
                        vehicleList = response.data.Content;
                        let dataToAdd = response.data.Content.map((item, index) => ({
                            "STT": index + 1 || '',
                            "License": item.License || '',
                            "ID": item.ID || '',
                            "MaXN": item.MaXN || 0,
                            "CountSeat": item.CountSeat || 0,
                            "TypeCar": item.TypeCar || '',
                            "NameVehicle": item.NameVehicle || '',
                            "VehicleColor": item.VehicleColor || '',
                            "ManageModel": item.ManageModel || '',
                            "FrameCode": item.FrameCode || '',
                            "PulseCoefficient": item.PulseCoefficient || '',
                            "BlockVehicle": item.BlockVehicle ? "Bị khóa" : "Hoạt động",
                            "blackBox": item.blackBox ? "Có" : "Không",
                            "Meter": item.Meter ? "Có" : "Không",
                            "DriverName": item.DriverName || '',
                            "DriverPhone": item.DriverPhone || '',
                            "DriverID": item.DriverID || 0,
                            "TimeCreateHT": item.TimeCreateHT || ''
                        }));
                        tableVehicle.clear().rows.add(dataToAdd).draw();
                    }
                    document.getElementById("loadingOverlay").style.display = "none";
                } else {
                    tableVehicle.draw();
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            },
            error: function () {
                tableVehicle.draw();
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
    }

    loadDataVehicle();
    // Xử lý sự kiện nút Tìm kiếm
    $('#search').on('click', function () {
        let fromDate = $('#fromDate').val();
        let toDate = $('#toDate').val();
        let searchColumn = $('#searchColumn').val();
        let searchValue = $('#searchValue').val().toLowerCase();
        console.log("searchColumn", searchColumn);
        console.log("searchValue", searchValue);

        // Hàm chuyển định dạng ngày DD-MM-YYYY sang timestamp
        function parseInputDate(dateStr) {
            if (!dateStr) return null;
            let parts = dateStr.split('-');
            return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
        }

        // Hàm chuyển định dạng HH:mm:ss DD-MM-YYYY sang timestamp
        function parseServerDate(dateStr) {
            if (!dateStr) return null;
            let [time, date] = dateStr.split(' ');
            let [hours, minutes, seconds] = time.split(':');
            let [day, month, year] = date.split('-');
            return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
        }

        let fromTimestamp = parseInputDate(fromDate);
        let toTimestamp = parseInputDate(toDate);

        // Lọc dữ liệu
        let filteredData = vehicleList.filter(item => {
            let itemDate = parseServerDate(item.TimeCreateHT);
            let matchesDate = true;
            let matchesColumn = true;
            let matchesStatus = true;

            // Lọc theo khoảng ngày
            if (fromTimestamp || toTimestamp) {
                matchesDate = (!fromTimestamp || itemDate >= fromTimestamp) && (!toTimestamp || itemDate <= toTimestamp);
            }

            // Lọc theo cột được chọn
            if (searchColumn && searchValue) {
                let columnValue = (item[searchColumn] || '').toString().toLowerCase();
                matchesColumn = columnValue.includes(searchValue);
            }

            return matchesDate && matchesColumn && matchesStatus;
        });

        // Cập nhật lại bảng với dữ liệu đã lọc
        let dataToAdd = filteredData.map((item, index) => ({
            "STT": index + 1 || '',
            "Name": item.Name || '',
            "PhoneNumber": item.PhoneNumber || '',
            "Address": item.Address || '',
            "MaXN": item.MaXN || '',
            "TimeCreateHT ": item.TimeCreateHT || '',
        }));

        tableVehicle.clear().rows.add(dataToAdd).draw();
    });
    loadDataVehicle();

    // Hàm thiết lập input ngày với định dạng DD-MM-YYYY
    function setupDateInput(inputId, pickerId) {
        const dateInput = document.getElementById(inputId);
        const datePicker = document.getElementById(pickerId);
        const calendarIcon = dateInput.nextElementSibling;

        $(calendarIcon).on('click', function () {
            datePicker.showPicker();
        });

        $(datePicker).on('change', function (e) {
            const selectedDate = new Date(e.target.value);
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear();
            dateInput.value = `${day}-${month}-${year}`; // Định dạng DD-MM-YYYY
        });

        $(dateInput).on('input', function (e) {
            let value = e.target.value;
            let numbersOnly = value.replace(/\D/g, '');

            let formatted = '';
            if (numbersOnly.length > 0) {
                let dayInput = numbersOnly.substr(0, 2);
                if (dayInput.length > 0) {
                    formatted = dayInput;
                    if (dayInput.length === 2 || numbersOnly.length > 2) {
                        let day = dayInput.padStart(2, '0');
                        formatted = day;
                        if (numbersOnly.length > 2) {
                            let monthStart = 2;
                            let monthInput = numbersOnly.substr(monthStart, 2);
                            if (monthInput.length > 0) {
                                formatted += '-'; // Dùng dấu - thay vì /
                                if (monthInput.length === 1) {
                                    formatted += monthInput;
                                } else {
                                    let month = monthInput.padStart(2, '0');
                                    formatted += month;
                                }
                                if (numbersOnly.length > 4) {
                                    let yearStart = 4;
                                    let year = numbersOnly.substr(yearStart, 4);
                                    if (year.length > 0) {
                                        formatted += '-' + year; // Dùng dấu - thay vì /
                                    }
                                }
                            }
                        }
                    }
                }
            }
            dateInput.value = formatted;
        });

        $(dateInput).on('keydown', function (e) {
            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
                return;
            }
            if (isNaN(e.key) && e.key !== '-') { // Chỉ cho phép số và dấu -
                e.preventDefault();
            }
        });

        $(dateInput).on('click', function (e) {
            e.preventDefault();
        });
    }

    setupDateInput('fromDate', 'fromDatePicker');
    setupDateInput('toDate', 'toDatePicker');
    $('#vehicleTable').on('click', '.edit-vehicle', function () {
        isEditMode = true;
        $('#addVehicleModal').modal('show');
        $('#modalTitle').text('Chỉnh sửa xe');
        let rowData = tableVehicle.row($(this).parents('tr')).data();
        companyItem = rowData.MaXN;
        $('#license').val(rowData.License);
        $('#ID').val(rowData.ID);
        $('#countSeat').val(rowData.CountSeat);
        $('#typeCar').val(rowData.TypeCar);
        $('#nameVehicle').val(rowData.NameVehicle);
        $('#vehicleColor').val(rowData.VehicleColor);
        $('#manageModel').val(rowData.ManageModel);
        $('#frameCode').val(rowData.FrameCode);
        $('#pulseCoefficient').val(rowData.PulseCoefficient);
        $('#blackBox').prop('checked', rowData.blackBox === "Có");
        $('#blockVehicle').prop('checked', rowData.BlockVehicle === "Bị khóa");
        $('#meter').prop('checked', rowData.Meter === "Có");
        $('#company').val(rowData.MaXN);
        console.log("rowData : ", rowData);
        GetCompany();
    });

    $('#vehicleTable').on('click', '.delete-vehicle', function () {
        let rowData = tableVehicle.row($(this).parents('tr')).data();
        licenseDelete = rowData.License;

        if (confirm("Bạn có chắc chắn muốn xóa xe này không?")) {
            document.getElementById("loadingOverlay").style.display = "flex";
            $.ajax({
                url: '/Manage/DeleteVehicle',
                type: 'POST',
                data: { License: licenseDelete },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        tableVehicle.clear();
                        loadDataVehicle();
                        isEditMode = false;
                        alertNotify("Đã xóa xe thành công!", 'success', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    } else {
                        tableVehicle.draw();
                        alertNotify("Đã xảy ra lỗi khi tải dữ liệu!", 'danger', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    }
                },
                error: function () {
                    tablePoint.draw();
                    alertNotify("Đã xảy ra lỗi khi xóa xe!", 'danger', 3000);
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            });
        } else {
            document.getElementById("loadingOverlay").style.display = "none";
        }
    });
    $("#saveButton").on("click", function () {
        const VehicleData = {
            token: '',
            License: $("#license").val(),
            ID: $("#ID").val(),
            CountSeat: $("#countSeat").val(),
            TypeCar: $("#typeCar").val(),
            NameVehicle: $("#nameVehicle").val(),
            VehicleColor: $("#vehicleColor").val(),
            ManageModel: $("#manageModel").val(),
            FrameCode: $("#frameCode").val(),
            PulseCoefficient: $("#pulseCoefficient").val(),
            blackBox: $("#blackBox").is(":checked"),
            BlockVehicle: $("#blockVehicle").is(":checked"),
            Meter: $("#meter").is(":checked"),
            MaXN: $("#company").val(),
        };

        console.log("VehicleData : ", JSON.stringify(VehicleData));

        if (VehicleData.License == '' || VehicleData.ID == '' || VehicleData.FrameCode == '') {
            alertNotify("Vui lòng nhập đầy đủ thông tin !", 'danger', 3000);
            return;
        }

        const url = isEditMode ? '/Manage/UpdateVehicle' : '/Manage/AddVehicle';
        const successMsg = isEditMode ? "Đã chỉnh sửa xe!" : "Đã thêm xe thành công!";
        const errorMsg = isEditMode ? "Đã xảy ra lỗi khi chỉnh sửa xe!" : "Đã xảy ra lỗi khi thêm xe!";

        document.getElementById("loadingOverlay").style.display = "flex";

        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(VehicleData),
            success: function (response) {
                tableVehicle.clear();
                loadDataVehicle();
                $('#addVehicleModal').modal('hide');
                isEditMode = false;
                $('#modalTitle').text('Thêm xe');
                alertNotify(successMsg, 'success', 3000);
                document.getElementById("loadingOverlay").style.display = "none";
            },
            error: function (error) {
                console.error("Error: ", error);
                alertNotify(errorMsg, 'danger', 3000);
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
    });
    //$('#ExportExcelReport').on('click', function () {
    //    let widthColumnExcel = [
    //        { width: 5 },
    //        { width: 20 },
    //        { width: 20 },
    //        { width: 40 },
    //        { width: 20 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },
    //        { width: 25 },

    //    ]


    //    let dataHeader = [];
    //    let dataTbody = [];

    //    const columnHeaders = tableVehicle.columns().header().toArray();

    //    columnHeaders.forEach(function (header) {
    //        dataHeader.push($(header).text())
    //    });

    //    var rowData = tableVehicle.rows().data().toArray();
    //    rowData.forEach(function (row) {
    //        let rowArray = [];
    //        for (let key in row) {
    //            if (row.hasOwnProperty(key)) {
    //                rowArray.push(row[key]);
    //            }
    //        }
    //        dataTbody.push(rowArray);
    //    });
    //    let fileName = `DỮ LIỆU XE`;
    //    let sheetName = $('#header-username').text();
    //    let subtitle = ``;


    //    exportToExcelPro(fileName, sheetName, dataHeader, dataTbody, fileName, subtitle, widthColumnExcel)
    //});
});