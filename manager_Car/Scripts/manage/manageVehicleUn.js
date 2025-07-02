$(document).ready(function () {
    let vehicleUnList = [];
    let isEditMode = false;
    let maXN = null;

    var tableVehicleUn = $('#vehicleUnTable').DataTable({
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
            { "data": "TimeCreateHT", "title": "Thời gian tạo", "defaultContent": "" }
        ]
    });

    function loadDataVehicleUn() {
        console.log("hi");
        document.getElementById("loadingOverlay").style.display = "flex";
        $.ajax({
            url: '/Manage/GetListVehicleUn',
            type: 'POST',
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    if (response.data && response.data.Content && response.data.Content.length > 0) {
                        console.log("response.data: ", response.data);
                        vehicleUnList = response.data.Content;
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
                            "BlockVehicle": item.BlockVehicle || '', 
                            "BlackBox": item.BlackBox || '', 
                            "Meter": item.Meter || '', 
                            "TimeCreateHT": item.TimeCreateHT || '' 
                        }));
                        tableVehicleUn.clear().rows.add(dataToAdd).draw();
                    }
                    document.getElementById("loadingOverlay").style.display = "none";
                } else {
                    tableVehicleUn.draw();
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            },
            error: function () {
                tableVehicleUn.draw();
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
    }

    loadDataVehicleUn();
    // Xử lý sự kiện nút Tìm kiếm
    //$('#search').on('click', function () {
    //    let fromDate = $('#fromDate').val();
    //    let toDate = $('#toDate').val();
    //    let searchColumn = $('#searchColumn').val();
    //    let searchValue = $('#searchValue').val().toLowerCase();
    //    console.log("searchColumn", searchColumn);
    //    console.log("searchValue", searchValue);

    //    // Hàm chuyển định dạng ngày DD-MM-YYYY sang timestamp
    //    function parseInputDate(dateStr) {
    //        if (!dateStr) return null;
    //        let parts = dateStr.split('-');
    //        return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
    //    }

    //    // Hàm chuyển định dạng HH:mm:ss DD-MM-YYYY sang timestamp
    //    function parseServerDate(dateStr) {
    //        if (!dateStr) return null;
    //        let [time, date] = dateStr.split(' ');
    //        let [hours, minutes, seconds] = time.split(':');
    //        let [day, month, year] = date.split('-');
    //        return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
    //    }

    //    let fromTimestamp = parseInputDate(fromDate);
    //    let toTimestamp = parseInputDate(toDate);

    //    // Lọc dữ liệu
    //    let filteredData = vehicleUnList.filter(item => {
    //        let itemDate = parseServerDate(item.TimeCreateHT);
    //        let matchesDate = true;
    //        let matchesColumn = true;
    //        let matchesStatus = true;

    //        // Lọc theo khoảng ngày
    //        if (fromTimestamp || toTimestamp) {
    //            matchesDate = (!fromTimestamp || itemDate >= fromTimestamp) && (!toTimestamp || itemDate <= toTimestamp);
    //        }

    //        // Lọc theo cột được chọn
    //        if (searchColumn && searchValue) {
    //            let columnValue = (item[searchColumn] || '').toString().toLowerCase();
    //            matchesColumn = columnValue.includes(searchValue);
    //        }

    //        return matchesDate && matchesColumn && matchesStatus;
    //    });

    //    // Cập nhật lại bảng với dữ liệu đã lọc
    //    let dataToAdd = filteredData.map((item, index) => ({
    //        "STT": index + 1 || '',
    //        "Name": item.Name || '',
    //        "PhoneNumber": item.PhoneNumber || '',
    //        "Address": item.Address || '',
    //        "MaXN": item.MaXN || '',
    //        "TimeCreateHT ": item.TimeCreateHT || '',
    //    }));

    //    tableVehicleUn.clear().rows.add(dataToAdd).draw();
    //});
    //loadDataVehicleUn();

    //// Hàm thiết lập input ngày với định dạng DD-MM-YYYY
    //function setupDateInput(inputId, pickerId) {
    //    const dateInput = document.getElementById(inputId);
    //    const datePicker = document.getElementById(pickerId);
    //    const calendarIcon = dateInput.nextElementSibling;

    //    $(calendarIcon).on('click', function () {
    //        datePicker.showPicker();
    //    });

    //    $(datePicker).on('change', function (e) {
    //        const selectedDate = new Date(e.target.value);
    //        const day = String(selectedDate.getDate()).padStart(2, '0');
    //        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    //        const year = selectedDate.getFullYear();
    //        dateInput.value = `${day}-${month}-${year}`; // Định dạng DD-MM-YYYY
    //    });

    //    $(dateInput).on('input', function (e) {
    //        let value = e.target.value;
    //        let numbersOnly = value.replace(/\D/g, '');

    //        let formatted = '';
    //        if (numbersOnly.length > 0) {
    //            let dayInput = numbersOnly.substr(0, 2);
    //            if (dayInput.length > 0) {
    //                formatted = dayInput;
    //                if (dayInput.length === 2 || numbersOnly.length > 2) {
    //                    let day = dayInput.padStart(2, '0');
    //                    formatted = day;
    //                    if (numbersOnly.length > 2) {
    //                        let monthStart = 2;
    //                        let monthInput = numbersOnly.substr(monthStart, 2);
    //                        if (monthInput.length > 0) {
    //                            formatted += '-'; // Dùng dấu - thay vì /
    //                            if (monthInput.length === 1) {
    //                                formatted += monthInput;
    //                            } else {
    //                                let month = monthInput.padStart(2, '0');
    //                                formatted += month;
    //                            }
    //                            if (numbersOnly.length > 4) {
    //                                let yearStart = 4;
    //                                let year = numbersOnly.substr(yearStart, 4);
    //                                if (year.length > 0) {
    //                                    formatted += '-' + year; // Dùng dấu - thay vì /
    //                                }
    //                            }
    //                        }
    //                    }
    //                }
    //            }
    //        }
    //        dateInput.value = formatted;
    //    });

    //    $(dateInput).on('keydown', function (e) {
    //        if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
    //            return;
    //        }
    //        if (isNaN(e.key) && e.key !== '-') { // Chỉ cho phép số và dấu -
    //            e.preventDefault();
    //        }
    //    });

    //    $(dateInput).on('click', function (e) {
    //        e.preventDefault();
    //    });
    //}

    //setupDateInput('fromDate', 'fromDatePicker');
    //setupDateInput('toDate', 'toDatePicker');

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

    //    const columnHeaders = tableVehicleUn.columns().header().toArray();

    //    columnHeaders.forEach(function (header) {
    //        dataHeader.push($(header).text())
    //    });

    //    var rowData = tableVehicleUn.rows().data().toArray();
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