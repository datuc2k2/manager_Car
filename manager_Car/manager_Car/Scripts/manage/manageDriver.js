$(document).ready(function () {
    let driverList = [];
    let companyList = [];
    let isEditMode = false;
    let userId = null;
    let modelBusiness = "";
    let typePhone = "";
    let phoneOperationModal = "";
    let companyItem = "";
    let birthDay;
    let bienSoList = [];
    let bienSoItem = "";

    var tableDriver = $('#driverTable').DataTable({
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
            { "data": "Phone", "defaultContent": "", "title": "Số điện thoại" },
            { "data": "HoTen", "defaultContent": "", "title": "Tên tài khoản" },
            { "data": "UserName", "defaultContent": "", "title": "Tên đăng nhập" },
            { "data": "Password", "defaultContent": "", "title": "Mật khẩu" },
            { "data": "Role", "defaultContent": "", "title": "Vai trò" },
            { "data": "MaXN", "defaultContent": "", "title": "Mã doanh nghiệp" },
            { "data": "UserID", "defaultContent": "", "title": "Mã tài khoản" },
            { "data": "BienSo", "defaultContent": "", "title": "Biển số" },
            { "data": "CCCD", "defaultContent": "", "title": "Căn cước công dân" },
            { "data": "BirthDay", "defaultContent": "", "title": "Ngày sinh" },
            { "data": "Email", "defaultContent": "", "title": "Email" },
            { "data": "ModelBusiness", "defaultContent": "", "title": "Mô hình quản lý" },
            { "data": "TypePhone", "defaultContent": "", "title": "Loại thiết bị" },
            { "data": "PhoneOperation", "defaultContent": "", "title": "Hệ điều hành" },
            { "data": "TimeCreateHT", "defaultContent": "", "title": "Ngày khởi tạo" },
            { "data": "BlockAcc", "defaultContent": "", "title": "Trạng thái" },
            {
                "title": "Tác vụ",
                "data": null,
                "defaultContent": '<button class="small-btn edit-driver"><i class="fas fa-pen-to-square"></i></button>' +
                    '<button class="small-btn delete-driver"><i class="fas fa-trash"></i></button>',
                "className": "text-center"
            }
        ],
        "initComplete": function () {
            $('#addButton').on('click', function () {
                isEditMode = false;
                $('#modalTitle').text('Thêm tài xế');
                $('#phone').val('');
                $('#username').val('');
                $('#password').val('');
                $('#hoTen').val('');
                $('#cccd').val('');
                $('#birthDay').val('');
                $('#email').val('');
                $('#modelBusiness').val('');
                $('#phoneOperation').val('');
                $('#typePhone').val('');
                $('#blockAcc').val(false);
                $('#addDriverModal').modal('show');
                setTimeout(() => {
                    $('#bienSo').val('');
                    $('#company').val('');
                }, 100); 
                GetCompany();
                GetUnBienSo();
                const modelBusiness = document.getElementById("modelBusiness");
                const typePhone = document.getElementById("typePhone");
                const phoneOperation = document.getElementById("phoneOperation");
                setupDateInputBirthday('birthDay', 'birthDayPicker');

                modelBusiness.onchange = () => updateSelections('modelBusiness');
                typePhone.onchange = () => updateSelections('typePhone');
                phoneOperation.onchange = () => updateSelections('phoneOperation');

                filterPhoneModels();
            });
        }
    });
    function setupDateInputBirthday(inputId, pickerId) {
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
            const formattedDate = `${day}-${month}-${year}`;
            dateInput.value = formattedDate;
            birthDay = formattedDate; 
        });

        $(dateInput).on('input', function (e) {
            let value = e.target.value;
            let numbersOnly = value.replace(/[^0-9]/g, '');

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
            birthDay = formatted;
        });

        $(dateInput).on('keydown', function (e) {
            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab' || e.key === '/') {
                return;
            }
            if (isNaN(e.key)) { 
                e.preventDefault();
            }
        });

        $(dateInput).on('click', function (e) {
            e.preventDefault();
        });
    }
    function filterPhoneModels() {
        const typePhoneSelect = document.getElementById("typePhone");
        const phoneOperationSelect = document.getElementById("phoneOperation");
        const selectedType = typePhoneSelect.value;

        phoneOperationSelect.innerHTML = '<option value="">Chọn mẫu điện thoại</option>';

        const phoneModels = {
            "Iphone": ["Iphone XS MAX", "Iphone 12", "Iphone 13", "Iphone 14"],
            "Samsung": ["Samsung S21", "Samsung S22", "Samsung S23", "Samsung S24"],
            "Oppo": ["Oppo Find X3", "Oppo Find X5", "Oppo Reno 6", "Oppo Reno 8"],
            "Xiaomi": ["Xiaomi Mi 11", "Xiaomi Mi 12", "Xiaomi 13", "Xiaomi 14"]
        };

        if (selectedType && phoneModels[selectedType]) {
            phoneModels[selectedType].forEach(model => {
                const option = document.createElement("option");
                option.value = model;
                option.text = model;
                phoneOperationSelect.appendChild(option);
            });
        }
    }

    function updateSelections(fieldId) {
        const element = document.getElementById(fieldId);
        const value = element.value;

        switch (fieldId) {
            case "modelBusiness":
                modelBusiness = value;
                break;
            case "typePhone":
                typePhone = value;
                filterPhoneModels();
                break;
            case "phoneOperation":
                phoneOperation = value; 
                break;
        }
    }

  
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
    function GetUnBienSo() {
        $.ajax({
            url: '/Manage/GetListVehicleUn',
            type: 'POST',
            dataType: 'json',
            beforeSend: function () {
                document.getElementById("loadingOverlay").style.display = "block";
            },
            success: function (response) {
                if (response.success) {
                    if (response.data && response.data.Content && response.data.Content.length > 0) {
                        bienSoList = response.data.Content;
                        let select = $('#bienSo');
                        select.empty();
                        select.append('<option value="">-- Chọn biển số --</option>');

                        $.each(bienSoList, function (index, item) {
                            select.append('<option value="' + item.License + '">' + item.License + '</option>');
                        });
                        $('#bienSo').val(bienSoItem);
                        $('#bienSo').on('change', function () {
                            let selectedLicense = $(this).val();
                            $('#License').val(selectedLicense);
                        });

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
                            "DriverName": item.DriverName || '',
                            "DriverPhone": item.DriverPhone || '',
                            "DriverID": item.DriverID || 0,
                            "TimeCreateHT": item.TimeCreateHT || '' 
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
    function GetListBienSo() {
        $.ajax({
            url: '/Manage/GetListVehicle',
            type: 'POST',
            dataType: 'json',
            beforeSend: function () {
                document.getElementById("loadingOverlay").style.display = "block";
            },
            success: function (response) {
                if (response.success) {
                    if (response.data && response.data.Content && response.data.Content.length > 0) {
                        bienSoList = response.data.Content;
                        let select = $('#bienSo');
                        select.empty();
                        select.append('<option value="">-- Chọn biển số --</option>');

                        $.each(bienSoList, function (index, item) {
                            select.append('<option value="' + item.License + '">' + item.License + '</option>');
                        });
                        $('#bienSo').val(bienSoItem);
                        $('#bienSo').on('change', function () {
                            let selectedLicense = $(this).val();
                            $('#License').val(selectedLicense);
                        });

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
                            "DriverName": item.DriverName || '',
                            "DriverPhone": item.DriverPhone || '',
                            "DriverID": item.DriverID || 0,
                            "TimeCreateHT": item.TimeCreateHT || ''
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
    function loadDataDriver() {
        document.getElementById("loadingOverlay").style.display = "flex";
        $.ajax({
            url: '/Manage/GetListUserDriver',
            type: 'POST',
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    console.log("response.data: ", response.data);
                    if (response.data && response.data.Content && response.data.Content.length > 0) {
                        driverList = response.data.Content;
                        let dataToAdd = response.data.Content.map((item, index) => ({
                            "STT": index + 1 || '',
                            "Phone": item.Phone || '',
                            "HoTen": item.HoTen || '',
                            "UserName": item.UserName || '',
                            "Password": item.Password || '',
                            "Role": item.Role === 0 ? "Quản trị viên" : item.Role === 1 ? "Điều hành viên" : '',
                            "MaXN": item.MaXN || '',
                            "UserID": item.UserID || '',
                            "BienSo": item.BienSo || '',
                            "CCCD": item.CCCD || '',
                            "Email": item.Email || '',
                            "ModelBusiness": item.ModelBusiness || '',
                            "TypePhone": item.TypePhone || '',
                            "BirthDay": item.BirthDay || '',
                            "PhoneOperation": item.PhoneOperation || '',
                            "TimeCreateHT": item.TimeCreateHT || '',
                            "BlockAcc": item.BlockAcc ? "Bị khóa" : "Hoạt động",
                        }));
                        tableDriver.clear().rows.add(dataToAdd).draw();
                    }
                    document.getElementById("loadingOverlay").style.display = "none";
                } else {
                    tableDriver.draw();
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            },
            error: function () {
                tableDriver.draw();
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
    }
    // Xử lý sự kiện nút Tìm kiếm
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

        // Lọc dữ liệu
        let filteredData = driverList.filter(item => {
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

            // Lọc theo trạng thái
            if (statusFilter) {
                matchesStatus = (item.BlockAcc ? "Bị khóa" : "Hoạt động") === statusFilter;
            }

            return matchesDate && matchesColumn && matchesStatus;
        });

        // Cập nhật lại bảng với dữ liệu đã lọc
        let dataToAdd = filteredData.map((item, index) => ({
            "STT": index + 1 || '',
            "Phone": item.Phone || '',
            "HoTen": item.HoTen || '',
            "UserName": item.UserName || '',
            "Password": item.Password || '',
            "Role": item.Role === 0 ? "Quản trị viên" : item.Role === 1 ? "Điều hành viên" : '',
            "MaXN": item.MaXN || '',
            "UserID": item.UserID || '',
            "BienSo": item.BienSo || '',
            "CCCD": item.CCCD || '',
            "Email": item.Email || '',
            "ModelBusiness": item.ModelBusiness || '',
            "TypePhone": item.TypePhone || '',
            "BirthDay": item.BirthDay || '',
            "PhoneOperation": item.PhoneOperation || '',
            "TimeCreateHT": item.TimeCreateHT || '',
            "BlockAcc": item.BlockAcc ? "Bị khóa" : "Hoạt động",
        }));

        tableDriver.clear().rows.add(dataToAdd).draw();
    });
    loadDataDriver();

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

    $('#driverTable').on('click', '.edit-driver', function () {
        isEditMode = true;
        $('#addDriverModal').modal('show');
        //document.getElementById("maXNGroup").style.display = "none";
        $('#modalTitle').text('Chỉnh sửa thông tin tài xế');
        let rowData = tableDriver.row($(this).parents('tr')).data();
        console.log("rowData.PhoneOperation: ", rowData.PhoneOperation);
        let typePhoneValue = rowData.TypePhone || '';
        $('#typePhone').val(typePhoneValue);
        userId = rowData.UserID;
        companyItem = rowData.MaXN;
        bienSoItem = rowData.BienSo;
        $('#phone').val(rowData.Phone);
        $('#username').val(rowData.UserName);
        $('#password').val(rowData.Password);
        $('#hoTen').val(rowData.HoTen);
        $('#cccd').val(rowData.CCCD);
        $('#birthDay').val(rowData.BirthDay);
        $('#email').val(rowData.Email);
        $('#modelBusiness').val(rowData.ModelBusiness);
        if (typePhoneValue) {
            filterPhoneModels();
            setTimeout(() => { let phoneOperationValue = rowData.PhoneOperation || '';
            $('#phoneOperation').val(phoneOperationValue);
            }, 100); 
        } else {
            $('#phoneOperation').html('<option value="">Chọn mẫu điện thoại</option>');
        }
        $('#company').val(rowData.MaXN);
        $('#bienSo').val(rowData.BienSo);
        $('#blockAcc').prop('checked', rowData.BlockAcc === "Bị khóa");
        GetCompany();
        GetListBienSo();
        const modelBusiness = document.getElementById("modelBusiness");
        const typePhone = document.getElementById("typePhone");
        const phoneOperation = document.getElementById("phoneOperation");
        setupDateInputBirthday('birthDay', 'birthDayPicker');

        modelBusiness.onchange = () => updateSelections('modelBusiness');
        typePhone.onchange = () => updateSelections('typePhone');
        phoneOperation.onchange = () => updateSelections('phoneOperation');

        filterPhoneModels();
        console.log("rowData: ", rowData);
    });

    $('#driverTable').on('click', '.delete-driver', function () {
        let rowData = tableDriver.row($(this).parents('tr')).data();
        userId = rowData.UserID;

        if (confirm("Bạn có chắc chắn muốn xóa tài xế này không?")) {
            document.getElementById("loadingOverlay").style.display = "flex";
            $.ajax({
                url: '/Manage/DeleteDriver',
                type: 'POST',
                data: { UserID: userId },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        tableDriver.clear();
                        loadDataDriver();
                        isEditMode = false;
                        alertNotify("Đã xóa tài xế thành công!", 'success', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    } else {
                        tableDriver.draw();
                        alertNotify("Đã xảy ra lỗi khi tải dữ liệu!", 'danger', 3000);
                        document.getElementById("loadingOverlay").style.display = "none";
                    }
                },
                error: function () {
                    tableDriver.draw();
                    alertNotify("Đã xảy ra lỗi khi xóa tài xế!", 'danger', 3000);
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            });
        } else {
            document.getElementById("loadingOverlay").style.display = "none";
        }
    });
    $("#saveButton").on("click", function () {
        const phoneNumber = $("#phone").val().trim();
        const phoneRegex = /^(0[1-9])\d{8,9}$/;

        if (!phoneRegex.test(phoneNumber)) {
            alertNotify("Số điện thoại sai định dạng. Vui lòng nhập lại (ví dụ: 0987654321).", 'danger', 3000);
            return;
        }
        console.log("congty: ", $("#company").val());
        console.log("BienSo: ", $("#bienSo").val());
        const DriverData = {
            token: '', Phone: phoneNumber,
            UserName: $('#username').val(),
            Password: $('#password').val(),
            HoTen: $('#hoTen').val(),
            CCCD: $('#cccd').val(),
            BienSo: $('#bienSo').val(),
            BirthDay: birthDay,
            Email: $('#email').val(),
            ModelBusiness: modelBusiness,
            TypePhone: typePhone,
            PhoneOperation: phoneOperation,
            BlockAcc: $("#blockAcc").is(":checked")+"",
            MaXN: $("#company").val() ,
            UserID: isEditMode ? userId+"" : undefined
        };
        console.log("birthDay : ", birthDay);
        console.log("DriverData : ", JSON.stringify(DriverData));

        if ( DriverData.UserName == '' || DriverData.Password == '' || DriverData.HoTen == '' || DriverData.BienSo == '' || DriverData.MaDam == '' || DriverData.SoGhe == '' || DriverData.PhoneNumber == '') {
            alertNotify("Vui lòng nhập đầy đủ thông tin!", 'danger', 3000);
            return;
        }

        const url = isEditMode ? '/Manage/UpdateUserDriver' : '/Manage/AddUserDriver';
        const successMsg = isEditMode ? "Đã chỉnh sửa tài xế!" : "Đã thêm tài xế thành công!";
        const errorMsg = isEditMode ? "Đã xảy ra lỗi khi chỉnh sửa tài xế!" : "Đã xảy ra lỗi khi thêm tài xế!";

        document.getElementById("loadingOverlay").style.display = "flex";

        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(DriverData),
            success: function (response) {
                tableDriver.clear();
                loadDataDriver();
                $('#addDriverModal').modal('hide');
                isEditMode = false;
                $('#modalTitle').text('Thêm tài xế');
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

    //Xuat file
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
            { width: 10 },
            { width: 10 },
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

        ]


        let dataHeader = [];
        let dataTbody = [];

        const columnHeaders = tableDriver.columns().header().toArray();

        columnHeaders.forEach(function (header) {
            dataHeader.push($(header).text())
        });

        var rowData = tableDriver.rows().data().toArray();
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

        let fileName = `DỮ LIỆU TÀI XẾ`;
        let sheetName = $('#header-username').text();
        let subtitle = ``;


        exportToExcelPro(fileName, sheetName, dataHeader, dataTbody, fileName, subtitle, widthColumnExcel)
    });

 
});