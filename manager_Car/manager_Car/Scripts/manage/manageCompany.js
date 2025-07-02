$(document).ready(function () {
    let companyList = [];
    let isEditMode = false;
    let maXN = null;

    var tableCompany = $('#companyTable').DataTable({
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
            { "data": "STT", "defaultContent": "" },
            { "data": "Name", "defaultContent": "" },
            { "data": "PhoneNumber", "defaultContent": "" },
            { "data": "Address", "defaultContent": "" },
            { "data": "MaXN", "defaultContent": "" },
            { "data": "TimeCreateHT ", "defaultContent": "" },
            {
                "title": "Tác vụ",
                "data": null,
                "defaultContent": '<button class="small-btn edit-company"><i class="fas fa-pen-to-square"></i></button>' +
                    '<button class="small-btn delete-company"><i class="fas fa-trash"></i></button>',
                "className": "text-center"
            }
        ],
        "initComplete": function () {
            $('#addButton').on('click', function () {
                isEditMode = false;
                $('#modalTitle').text('Thêm công ty');
                $('#name').val('');
                $('#phoneNumber').val('');
                $('#address').val('');
                document.getElementById("maXNGroup").style.display = "none";
                $('#addCompanyModal').modal('show'); 
            });
        }
    });

    function loadDataCompany() {
        document.getElementById("loadingOverlay").style.display = "flex";
        $.ajax({
            url: '/Manage/GetCompany',
            type: 'POST',
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    if (response.data && response.data.Content && response.data.Content.length > 0) {
                        console.log("response.data: ", response.data);
                        companyList = response.data.Content;
                        let dataToAdd = response.data.Content.map((item, index) => ({
                            "STT": index + 1 || '',
                            "Name": item.Name || '',
                            "PhoneNumber": item.PhoneNumber || '',
                            "Address": item.Address || '',
                            "MaXN": item.MaXN || '',
                            "TimeCreateHT ": item.TimeCreateHT || '',
                        }));
                        tableCompany.clear().rows.add(dataToAdd).draw();
                    }
                    document.getElementById("loadingOverlay").style.display = "none";
                } else {
                    tableCompany.draw();
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            },
            error: function () {
                tableCompany.draw();
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
    }

    loadDataCompany();
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
        let filteredData = companyList.filter(item => {
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

        tableCompany.clear().rows.add(dataToAdd).draw();
    });
    loadDataCompany();

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
    $('#companyTable').on('click', '.edit-company', function () {
        isEditMode = true;
        $('#addCompanyModal').modal('show');
        $('#modalTitle').text('Chỉnh sửa công ty');
        let rowData = tableCompany.row($(this).parents('tr')).data();
        maXN = rowData.MaXN;
        $('#name').val(rowData.Name);
        $('#phoneNumber').val(rowData.PhoneNumber);
        $('#address').val(rowData.Address);
        $('#maXN').val(rowData.MaXN);
    });

    $('#companyTable').on('click', '.delete-company', function () {
        let rowData = tableCompany.row($(this).parents('tr')).data();
        maXN = rowData.MaXN;

        if (confirm("Bạn có chắc chắn muốn xóa công ty này không?")) {
            document.getElementById("loadingOverlay").style.display = "flex";
            $.ajax({
                url: '/Manage/DeleteCompany',
                type: 'POST',
                data: { MaXN: maXN },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        tableCompany.clear();
                        loadDataCompany();
                        isEditMode = false;
                        alertNotify("Đã xóa công ty thành công!", 'success', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    } else {
                        tableCompany.draw();
                        alertNotify("Đã xảy ra lỗi khi tải dữ liệu!", 'danger', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    }
                },
                error: function () {
                    tablePoint.draw();
                    alertNotify("Đã xảy ra lỗi khi xóa công ty!", 'danger', 3000);
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            });
        } else {
            document.getElementById("loadingOverlay").style.display = "none";
        }
    });
    $("#saveButton").on("click", function () {
        const phoneNumber = $("#phoneNumber").val().trim();
        const phoneRegex = /^(0[1-9])\d{8,9}$/; 

        if (!phoneRegex.test(phoneNumber)) {
            alertNotify("Số điện thoại sai định dạng. Vui lòng nhập lại (ví dụ: 0987654321).", 'danger', 3000);
            return;
        }

        const CompanyData = {
            token: '',
            Name: $("#name").val(),
            Address: $("#address").val(),
            PhoneNumber: phoneNumber,
            MaXN: isEditMode ? $("#maXN").val() : undefined
        };

        console.log("CompanyData : ", JSON.stringify(CompanyData));

        if (CompanyData.Name == '' || CompanyData.Address == '' || CompanyData.PhoneNumber == '') {
            alertNotify("Vui lòng nhập đầy đủ thông tin (Tên và Địa chỉ)!", 'danger', 3000);
            return;
        }

        const url = isEditMode ? '/Manage/UpdateCompany' : '/Manage/AddCompany';
        const successMsg = isEditMode ? "Đã chỉnh sửa công ty!" : "Đã thêm công ty thành công!";
        const errorMsg = isEditMode ? "Đã xảy ra lỗi khi chỉnh sửa công ty!" : "Đã xảy ra lỗi khi thêm công ty!";

        document.getElementById("loadingOverlay").style.display = "flex";

        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(CompanyData),
            success: function (response) {
                tableCompany.clear();
                loadDataCompany();
                $('#addCompanyModal').modal('hide');
                isEditMode = false;
                $('#modalTitle').text('Thêm công ty');
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
    $('#ExportExcelReport').on('click', function () {
        let widthColumnExcel = [
            { width: 5 },
            { width: 20 },
            { width: 20 },
            { width: 40 },
            { width: 20 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            { width: 25 },

        ]


        let dataHeader = [];
        let dataTbody = [];

        const columnHeaders = tableCompany.columns().header().toArray();

        columnHeaders.forEach(function (header) {
            dataHeader.push($(header).text())
        });

        var rowData = tableCompany.rows().data().toArray();
        //console.log("Row data:", rowData);
        //console.log("Một hàng dữ liệu:", rowData[0]);
        //rowData.forEach(function (row) {
        //    console.log("row[1]: ", row.col2);
        //    //dataTbody.push(["", (row[1] != null ? row[1].toString() : ""), row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], (row[11] != null ? row[11].toString() : ""), (row[12] != null ? row[12].toString() : ""), row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20], row[21], row[22], row[23], row[24], row[25], row[26], ""])
        //    //dataTbody.push(["", row.col2 || "", row.col3, row.col4,]);
        //});
        rowData.forEach(function (row) {
            let rowArray = [];
            for (let key in row) {
                if (row.hasOwnProperty(key)) {
                    rowArray.push(row[key]);
                }
            }
            dataTbody.push(rowArray);
        });

        //console.log("Data Header:", dataHeader);
        //console.log("Data Tbody:", dataTbody);

        let fileName = `DỮ LIỆU CÔNG TY`;
        let sheetName = $('#header-username').text();
        let subtitle = ``;


        exportToExcelPro(fileName, sheetName, dataHeader, dataTbody, fileName, subtitle, widthColumnExcel)
    });
});