$(document).ready(function () {
    let operationList = [];
    let companyList = [];
    let isEditMode = false;
    let userId = null;

    var tableOperation = $('#operationTable').DataTable({
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
            { "data": "STT", "defaultContent": "", "title": "STT" },
            { "data": "PhoneNumber", "defaultContent": "", "title": "Số điện thoại" },
            { "data": "Name", "defaultContent": "", "title": "Tên tài khoản" },
            { "data": "UserName", "defaultContent": "", "title": "Tên đăng nhập" },
            { "data": "Password", "defaultContent": "", "title": "Mật khẩu" },
            { "data": "Role", "defaultContent": "", "title": "Vai trò" },
            { "data": "MaXN", "defaultContent": "", "title": "Mã doanh nghiệp" },
            { "data": "UserID", "defaultContent": "", "title": "Mã tài khoản" },
            { "data": "TimeCreateHT", "defaultContent": "", "title": "Ngày khởi tạo" },
            { "data": "BlockAcc", "defaultContent": "", "title": "Trạng thái" },
            {
                "title": "Tác vụ",
                "data": null,
                "defaultContent": '<button class="small-btn edit-operation"><i class="fas fa-pen-to-square"></i></button>' +
                    '<button class="small-btn delete-operation"><i class="fas fa-trash"></i></button>',
                "className": "text-center"
            }
        ],
        "initComplete": function () {
            $('#addButton').on('click', function () {
                isEditMode = false;
                $('#modalTitle').text('Thêm điều hành viên');
                $('#phoneNumber').val('');
                $('#username').val('');
                $('#password').val('');
                $('#name').val('');
                $('#blockAcc').val(false);
                document.getElementById("maXNGroup").style.display = "flex";
                $('#addOperationModal').modal('show');
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
                        select.append('<option value="">-- Chọn công ty --</option>');

                        $.each(companyList, function (index, item) {
                            select.append('<option value="' + item.MaXN + '">' + item.Name + '</option>');
                        });

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
    function loadDataOperation() {
        document.getElementById("loadingOverlay").style.display = "flex";
        $.ajax({
            url: '/Manage/GetListUserOperation',
            type: 'POST',
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    console.log("response.data: ", response.data);
                    if (response.data && response.data.Content && response.data.Content.length > 0) {
                        operationList = response.data.Content;
                        let dataToAdd = response.data.Content.map((item, index) => ({
                            "STT": index + 1 || '',
                            "PhoneNumber": item.PhoneNumber || '',
                            "Name": item.Name || '',
                            "UserName": item.UserName || '',
                            "Password": item.Password || '',
                            "Role": item.Role === 0 ? "Quản trị viên" : item.Role === 1 ? "Điều hành viên" : '',
                            "MaXN": item.MaXN || '',
                            "UserID": item.UserID || '',
                            "TimeCreateHT ": item.TimeCreateHT || '',
                            "BlockAcc": item.BlockAcc ? "Bị khóa" : "Hoạt động",
                        }));
                        tableOperation.clear().rows.add(dataToAdd).draw();
                    }
                    document.getElementById("loadingOverlay").style.display = "none";
                } else {
                    tableOperation.draw();
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            },
            error: function () {
                tableOperation.draw();
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
    }
    loadDataOperation();
    $('#search').on('click', function () {
        let fromDate = $('#fromDate').val();
        let toDate = $('#toDate').val();
        let searchColumn = $('#searchColumn').val();
        let searchValue = $('#searchValue').val().toLowerCase();
        let statusFilter = $('#statusFilter').val();
        console.log("searchColumn", searchColumn);
        console.log("searchValue", searchValue);

        function parseInputDate(dateStr) {
            if (!dateStr) return null;
            let parts = dateStr.split('-');
            return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
        }

        function parseServerDate(dateStr) {
            if (!dateStr) return null;
            let [time, date] = dateStr.split(' ');
            let [hours, minutes, seconds] = time.split(':');
            let [day, month, year] = date.split('-');
            return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
        }

        let fromTimestamp = parseInputDate(fromDate);
        let toTimestamp = parseInputDate(toDate);

        let filteredData = operationList.filter(item => {
            let itemDate = parseServerDate(item.TimeCreateHT);
            let matchesDate = true;
            let matchesColumn = true;
            let matchesStatus = true;

            if (fromTimestamp || toTimestamp) {
                matchesDate = (!fromTimestamp || itemDate >= fromTimestamp) && (!toTimestamp || itemDate <= toTimestamp);
            }

            if (searchColumn && searchValue) {
                let columnValue = (item[searchColumn] || '').toString().toLowerCase();
                matchesColumn = columnValue.includes(searchValue);
            }

            if (statusFilter) {
                matchesStatus = (item.BlockAcc ? "Bị khóa" : "Hoạt động") === statusFilter;
            }

            return matchesDate && matchesColumn && matchesStatus;
        });

        let dataToAdd = filteredData.map((item, index) => ({
            "STT": index + 1 || '',
            "PhoneNumber": item.PhoneNumber || '',
            "Name": item.Name || '',
            "UserName": item.UserName || '',
            "Password": item.Password || '',
            "Role": item.Role === 0 ? "Quản trị viên" : item.Role === 1 ? "Điều hành viên" : '',
            "MaXN": item.MaXN || '',
            "UserID": item.UserID || '',
            "TimeCreateHT ": item.TimeCreateHT || '',
            "BlockAcc": item.BlockAcc ? "Bị khóa" : "Hoạt động",
        }));

        tableOperation.clear().rows.add(dataToAdd).draw();
    });
    loadDataOperation();

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
            dateInput.value = `${day}-${month}-${year}`;
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
                                formatted += '-'; 
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
                                        formatted += '-' + year;
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
            if (isNaN(e.key) && e.key !== '-') {
                e.preventDefault();
            }
        });

        $(dateInput).on('click', function (e) {
            e.preventDefault();
        });
    }

    setupDateInput('fromDate', 'fromDatePicker');
    setupDateInput('toDate', 'toDatePicker');
    $('#operationTable').on('click', '.edit-operation', function () {
        isEditMode = true;
        $('#addOperationModal').modal('show');
        document.getElementById("maXNGroup").style.display = "none";
        $('#modalTitle').text('Chỉnh sửa điều hành viên');
        let rowData = tableOperation.row($(this).parents('tr')).data();
        userId = rowData.UserID;
        $('#name').val(rowData.Name);
        $('#phoneNumber').val(rowData.PhoneNumber);
        $('#username').val(rowData.UserName);
        $('#password').val(rowData.Password);
        $('#blockAcc').prop('checked', rowData.BlockAcc === "Bị khóa");
        console.log("rowData: ", rowData);
    });

    $('#operationTable').on('click', '.delete-operation', function () {
        let rowData = tableOperation.row($(this).parents('tr')).data();
        userId = rowData.UserID;

        if (confirm("Bạn có chắc chắn muốn xóa điều hành viên này không?")) {
            document.getElementById("loadingOverlay").style.display = "flex";
            $.ajax({
                url: '/Manage/DeleteOperation',
                type: 'POST',
                data: { UserID: userId },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        tableOperation.clear();
                        loadDataOperation();
                        isEditMode = false;
                        alertNotify("Đã xóa điều hành viên thành công!", 'success', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    } else {
                        tableOperation.draw();
                        alertNotify("Đã xảy ra lỗi khi tải dữ liệu!", 'danger', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    }
                },
                error: function () {
                    tableOperation.draw();
                    alertNotify("Đã xảy ra lỗi khi xóa điều hành viên!", 'danger', 3000);
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
        console.log("hu: ", $("#company").val());
        const OperationData = {
            token: '',
            Name: $("#name").val(),
            PhoneNumber: phoneNumber,
            UserName: $("#username").val(),
            Password: $("#password").val(),
            BlockAcc: $("#blockAcc").is(":checked")+"",
            MaXN: isEditMode ? undefined : $("#company").val() ,
            UserID: isEditMode ? userId+"" : undefined
        };

        console.log("OperationData : ", JSON.stringify(OperationData));

        if (OperationData.Name == '' || OperationData.UserName == '' || OperationData.Password == '' || OperationData.MaXN == '' || OperationData.PhoneNumber == '') {
            alertNotify("Vui lòng nhập đầy đủ thông tin!", 'danger', 3000);
            return;
        }

        const url = isEditMode ? '/Manage/UpdateOperation' : '/Manage/AddOperation';
        const successMsg = isEditMode ? "Đã chỉnh sửa điều hành viên!" : "Đã thêm điều hành viên thành công!";
        const errorMsg = isEditMode ? "Đã xảy ra lỗi khi chỉnh sửa điều hành viên!" : "Đã xảy ra lỗi khi thêm điều hành viên!";

        document.getElementById("loadingOverlay").style.display = "flex";

        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(OperationData),
            success: function (response) {
                tableOperation.clear();
                loadDataOperation();
                $('#addOperationModal').modal('hide');
                isEditMode = false;
                $('#modalTitle').text('Thêm điều hành viên');
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
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
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

        ]


        let dataHeader = [];
        let dataTbody = [];

        const columnHeaders = tableOperation.columns().header().toArray();

        columnHeaders.forEach(function (header) {
            dataHeader.push($(header).text())
        });

        var rowData = tableOperation.rows().data().toArray();
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

        let fileName = `DỮ LIỆU ĐIỀU HÀNH VIÊN`;
        let sheetName = $('#header-username').text();
        let subtitle = ``;


        exportToExcelPro(fileName, sheetName, dataHeader, dataTbody, fileName, subtitle, widthColumnExcel)
    });
});