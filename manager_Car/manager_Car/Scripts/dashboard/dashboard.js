var idOrder = "";
var rowTable = "";
var orderItem = "";
let mapSelect, mapConfirm, marker;
let currentInputId = '';
let selectedAddressPickUp = '';
let selectedAddressDes = '';
let coordinates = {
    modalAddressPickup: null,
    modalAddressDes: null
};
$(document).ready(function () {
    var orderList = [];
    initMaps();
    var timeout = null;
    var activeInput = null;
    let table = $('#pendingCallTable').DataTable({
        "language": {
            "emptyTable": "Không có dữ liệu hiển thị",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ mục",
            "lengthMenu": "Hiển thị _MENU_ mục",
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
        "columns": [
            {'title': "STT", "data": "STT", "defaultContent": "" },
            { 'title': "Kiểu", "data": "Kiểu", "defaultContent": "" },
            { "title": "Máy", "data": "Máy", "defaultContent": "" },
            { "title": "Thời điểm gọi", "data": "Thời điểm gọi", "defaultContent": "" },
            { "title": "Điện thoại", "data": "Điện thoại", "defaultContent": "" },
            { "title": "Loại xe", "data": "Loại xe", "defaultContent": "" },
            { "title": "Địa chỉ đón", "data": "Địa chỉ đón", "defaultContent": "" },
            { "title": "Địa chỉ đến", "data": "Địa chỉ đến", "defaultContent": "" },
            { "title": "Thời gian đón", "data": "Thời gian đón", "defaultContent": "" },
            {
                "title":"Xe nhận",
                "data": "Xe nhận",
                "defaultContent": "",
                "width": "5%",
                "createdCell": function (td, cellData, rowData, row, col) {
                    $(td).html('<input type="text" class="editable-input" value="' + (cellData || '') + '" />');
                }
            },
            {
                "title": "Xe đến điểm",
                "data": "Xe đến điểm",
                "defaultContent": "",
                "width": "5%",
                "createdCell": function (td, cellData, rowData, row, col) {
                    $(td).html('<input type="text" class="editable-input" value="' + (cellData || '') + '" />');
                }
            },
            {
                "title": "Xe đón",
                "data": "Xe đón",
                "defaultContent": "",
                "width": "5%",
                "createdCell": function (td, cellData, rowData, row, col) {
                    $(td).html('<input type="text" class="editable-input" value="' + (cellData || '') + '" />');
                }
            },
            {
                "title": "Số lượng xe",
                "data": "Số lượng xe",
                "defaultContent": "",
                "width": "5%",
                "createdCell": function (td, cellData, rowData, row, col) {
                    $(td).html('<input type="text" class="editable-input" value="' + (cellData || '') + '" />');
                }
            },
            { "title": "Lệnh khách hàng", "data": "Lệnh khách hàng", "defaultContent": "" },
            { "title": "Lệnh lái xe", "data": "Lệnh lái xe", "defaultContent": "" },
            { "title": "Lệnh ĐHV", "data": "Lệnh ĐHV", "defaultContent": "" },
            { "title": "Giá cước", "data": "Giá cước", "defaultContent": "" }
        ],
        "autoWidth": false,
        "rowCallback": function (row, data) {
            if (typeof data.isEditedXeDenDiem === 'undefined') data.isEditedXeDenDiem = false;
            if (typeof data.isEditedXeNhan === 'undefined') data.isEditedXeNhan = false;
            if (typeof data.isEditedXeDon === 'undefined') data.isEditedXeDon = false;
            if (typeof data.isEditedSoLuongXe === 'undefined') data.isEditedSoLuongXe = false;
        }
    });
    $('#pendingCallTable tbody').on('keypress', '.editable-input', function (e) {
        if (e.which === 13) {
            let $input = $(this);
            let row = table.row($input.closest('tr')).index();
            let col = $input.closest('td').index();
            let newValue = $input.val().trim();
            let data = table.row(row).data();

            switch (col) {
                case 9:
                    data["Xe nhận"] = newValue;
                    break;
                case 10:
                    data["Xe đến điểm"] = newValue;
                    break;
                case 11:
                    data["Xe đón"] = newValue;
                    break;
                case 12:
                    if (isNaN(newValue) || newValue === '' || !Number.isInteger(parseFloat(newValue))) {
                        alertNotify("Đã xảy ra lỗi khi tải dữ liệu! Vui lòng nhập số nguyên hợp lệ.", 'danger', 3000);
                        return;
                    }
                    data["Số lượng xe"] = parseInt(newValue);
                    break;
            }

            table.row(row).data(data).draw(false);
        }
    });

    table.on('draw', function () {
        table.cells(null, [9, 10, 11, 12]).every(function () {
            let cellData = this.data();
            $(this.node()).html('<input type="text" class="editable-input" value="' + (cellData || '') + '" />');
        });
    });

    tablePhone = $('#phoneTable').DataTable({
        "language": {
            "emptyTable": "Không có dữ liệu hiển thị",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ mục",
        },
        "ordering": false,
        "paging": false,
        "searching": false,
        "info": false,
        "columns": [
            { "data": "STT", "defaultContent": "" },
            { "data": "PhoneNumber", "defaultContent": "" },
            { "data": "TimeCall", "defaultContent": "" },
            { "data": "StatusOrder", "defaultContent": "" },
            { "data": "Note", "defaultContent": "" }
        ]
    });
    var chatHub = $.connection.chatHub;
    chatHub.client.openModal = function (user, message) {
        var data = JSON.parse(message);
        console.log("data: ", data);
        if (data.Action === "1") {
            var buttonText = "testModal";
            showModalWithData(buttonText);
            document.getElementById('modalPhone').value = data.PhoneNumber;
            document.getElementById('modalLine').value = data.Line;
            document.getElementById('modalTimeCall').value = data.ThoiGianHienThi;
            document.getElementById('modalAddressPickup').value = '';
            document.getElementById('modalAddressDes').value = '';
            document.getElementById('modalCarType').value = '3';
            document.getElementById('modalNote').value = '';
            phoneDataHistory();
        }
    };
    $.connection.hub.stop();
    $.connection.hub.start().done(function () {
        setInterval(function () {
            if ($.connection.hub && $.connection.hub.state === $.signalR.connectionState.disconnected) {
                console.log('Mất kết nối SignalR, kết nối lại!');
                $.connection.hub.stop();
                $.connection.hub.start();
            }
        }, 1000);
    });
    loadData();

    function loadData() {

        document.getElementById("loadingOverlay").style.display = "flex";
        $.ajax({
            url: '/Dashboard/GetListWaitOrder',
            type: 'POST',
            dataType: 'json',
            success: function (response) {
                table.clear();
                if (response.success && response.data && response.data.Content?.length > 0) {
                    orderList = response.data.Content;
                    console.log("orderList : ", orderList);
                    let dataToAdd = orderList.map((item, index) => {
                        const addressPickup = item.AddressPickup?.length > 27
                            ? item.AddressPickup.substring(0, 27) + "..."
                            : item.AddressPickup || "";
                        const addressDes = item.AddressDes?.length > 27
                            ? item.AddressDes.substring(0, 27) + "..."
                            : item.AddressDes || "";
                        let sourceText;
                        switch (parseInt(item.Source)) {
                            case 1: sourceText = "Chèn cuốc"; break;
                            case 2: sourceText = "Khách hàng"; break;
                            case 3: sourceText = "Cuộc gọi"; break;
                            default: sourceText = "Không xác định"; break;
                        }
                        let carTypeText;
                        switch (parseInt(item.TypeCar)) {
                            case 1: carTypeText = "5 chỗ"; break;
                            case 2: carTypeText = "7 chỗ"; break;
                            default: carTypeText = "Không xác định"; break;
                        }
                        let handleDriveText;
                        switch (parseInt(item.HandleDrive)) {
                            case 0: handleDriveText = "Reset"; break;
                            case 1: handleDriveText = "Nhận khách"; break;
                            case 2: handleDriveText = "Gặp khách"; break;
                            case 3: handleDriveText = "Trả khách"; break;
                            case 4: handleDriveText = "Hủy khách"; break;
                            case 5: handleDriveText = "Khách hủy"; break;
                            case 6: handleDriveText = "Từ chối"; break;
                            case 7: handleDriveText = "TimeOut"; break;
                            default: handleDriveText = ""; break;
                        }
                        let handleOperationText;
                        switch (parseInt(item.HandleOperation)) {
                            case 1: handleOperationText = "Gửi app"; break;
                            case 2: handleOperationText = "Đã gửi cuốc"; break;
                            default: handleOperationText = ""; break;
                        }
                        return {
                            "STT": index + 1,
                            "Kiểu": sourceText,
                            "Máy": item.Line || "",
                            "Thời điểm gọi": item.TimeCall
                                ? (item.TimeCall.length > 11 ? item.TimeCall.substring(0, 11) + "..." : item.TimeCall)
                                : "",
                            "Điện thoại": item.PhoneNumber || "",
                            "Loại xe": carTypeText,
                            "Địa chỉ đón": addressPickup,
                            "Địa chỉ đến": addressDes,
                            "Thời điểm đón": item.TimePickup
                                ? (item.TimePickup.length > 11 ? item.TimePickup.substring(0, 11) + "..." : item.TimePickup)
                                : "",
                            "Xe nhận": item.CarReceive || "",
                            "Xe đón": item.CarPickup || "",
                            "Lệnh lái xe": handleDriveText || "",
                            "Lệnh ĐHV": handleOperationText || "",
                            "Giá cước": item.Fee?.toLocaleString("vi-VN") || "0",
                            "IDOrder": item.IDOrder
                        };
                    });
                    table.rows.add(dataToAdd);
                    table.draw();
                } else {
                    table.draw();
                }
                document.getElementById("loadingOverlay").style.display = "none";
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error: ", error);
                table.clear().draw();
                alertNotify("Đã xảy ra lỗi khi tải dữ liệu!", 'danger', 3000);
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });

        var chatHub = $.connection.chatHub;
        chatHub.client.addNewMessageToPage = function (name, message) {
            const parsedMessage = JSON.parse(message);
            console.log("parsedMessage: ", parsedMessage);
            /* Dia chi don */
            const addressPickup = parsedMessage.a9?.length > 30
                ? parsedMessage.a9.substring(0, 30) + "..."
                : parsedMessage.a9 || "";
            /* Dia chi den */
            const addressDes = parsedMessage.b1?.length > 30
                ? parsedMessage.b1.substring(0, 30) + "..."
                : parsedMessage.b1 || "";
            let sourceText;
            switch (parseInt(parsedMessage.c5)) {
                case 1: sourceText = "Chèn cuốc"; break;
                case 2: sourceText = "Khách hàng"; break;
                case 3: sourceText = "Cuộc gọi"; break;
                default: sourceText = "Không xác định"; break;
            }
            let carTypeText;
            switch (parseInt(parsedMessage.c1)) {
                case 1: carTypeText = "5 chỗ"; break;
                case 2: carTypeText = "7 chỗ"; break;
                default: carTypeText = "Tất cả"; break;
            }
            let handleDriveText;
            switch (parseInt(parsedMessage.d5)) {
                case 0: handleDriveText = "Reset"; break;
                case 1: handleDriveText = "Nhận khách"; break;
                case 2: handleDriveText = "Gặp khách"; break;
                case 3: handleDriveText = "Trả khách"; break;
                case 4: handleDriveText = "Hủy khách"; break;
                case 5: handleDriveText = "Khách hủy"; break;
                case 6: handleDriveText = "Từ chối"; break;
                case 7: handleDriveText = "TimeOut"; break;
                default: handleDriveText = ""; break;
            }
            let handleOperationText;
            switch (parseInt(parsedMessage.d4)) {
                case 1: handleOperationText = "Gửi app"; break;
                case 2: handleOperationText = "Đã gửi cuốc"; break;
                default: handleOperationText = ""; break;
            }

            let ThoiGianDon;
            try {
                ThoiGianDon = parsedMessage.b2.length > 11 ? parsedMessage.b2.substring(0, 11) + "..." : parsedMessage.b2 || "";
            }
            catch {

            }
            const newRow = {
                "STT": 1,
                "Kiểu": sourceText,
                "Máy": parsedMessage.a8 || "",
                "Thời điểm gọi": parsedMessage.a7.length > 11 ? parsedMessage.a7.substring(0, 11) + "..." : parsedMessage.a7 || "",
                "Điện thoại": parsedMessage.a6 || "",
                "Loại xe": carTypeText,
                "Địa chỉ đón": addressPickup,
                "Địa chỉ đến": addressDes,
                "Thời gian đón": ThoiGianDon,
                "Xe nhận": parsedMessage.b6 || "",
                "Xe đón": parsedMessage.b8 || "",
                "Lệnh lái xe": handleDriveText || "",
                "Lệnh ĐHV": handleOperationText || "",
                "Giá cước": parsedMessage.c7?.toLocaleString("vi-VN") || "0",
                "IDOrder": parsedMessage.a1
            };

            let currentData = table.rows().data().toArray();
            //    //Nhap nhap nhay
            //    const rowNode = table.row(rowTable).node();
            //    console.log("rowNode :", rowNode);
            //    console.log("rowTable :", rowTable);
            //    if (rowNode) {
            //        $('#pendingCallTable tbody tr').removeClass('selected-row');
            //        $(rowNode).addClass('hightlight-row');
            //        console.log("Class added :", rowNode.classList);
            //        //setTimeout(() => {
            //        //    $(rowNode).removeClass('highlight-row');
            //        //}, 2000); // Dừng nhấp nháy sau 2 giây
            //    }
            //}
            if (!addressPickup == '' && !parsedMessage.a8 == '' && !parsedMessage.a6 == '') {
                const orderIndex = orderList.findIndex(order => order.IDOrder === parsedMessage.a1);
                if (orderIndex === -1) {
                    orderList.unshift(parsedMessage);
                    currentData.unshift(newRow);
                    hideModal();
                    alertNotify("Đã thêm cuốc xe mới!", 'success', 3000);
                } else {
                    orderList[orderIndex] = parsedMessage;
                    const rowIndex = currentData.findIndex(row => row.IDOrder === parsedMessage.a1);
                    if (rowIndex !== -1) {
                        currentData[rowIndex] = newRow;
                    }
                    hideModal();
                    alertNotify("Đã gửi app thành công!", 'success', 3000);
                }
            }
            else {
                alertNotify("Hãy điền đủ dữ liệu", 'danger', 3000);
            }
            currentData = currentData.map((item, index) => {
                item.STT = index + 1;
                return item;
            });

            table.clear();
            table.rows.add(currentData);
            table.draw(false);

            orderList.unshift(parsedMessage);
        };
        $.connection.hub.stop();
        $.connection.hub.start().done(function () {
            setInterval(function () {
                if ($.connection.hub && $.connection.hub.state === $.signalR.connectionState.disconnected) {
                    console.log('Mất kết nối SignalR, kết nối lại!');
                    $.connection.hub.stop();
                    $.connection.hub.start();
                }
            }, 1000);
        });
    }

    // Xử lý sự kiện click vào hàng trong table
    $('#pendingCallTable tbody').on('click', 'tr', function (e) {
        let data = table.row(this).data();
        if (data) {
            //$('#pendingCallTable tbody tr').removeClass('selected-row');
            //$(this).addClass('selected-row');
            //$('.editable-input').css('background-color', 'red');
            // Xóa class selected-row và reset background của tất cả editable-input
            $('#pendingCallTable tbody tr').removeClass('selected-row');
            $('#pendingCallTable tbody tr').find('.editable-input').css({
                'background-color': '',
                'color': ''
            });
            $(this).addClass('selected-row');
            $(this).find('.editable-input').css({
                'background-color': '#ff8c00',
                'color': 'white'
            });
            if ($(e.target).hasClass('editable-input')) {
                $(e.target).css({
                    'background-color': 'white',
                    'color': 'black'
                });
            }
            let selectedOrder = orderList.find(order => order.IDOrder === data.IDOrder);
            if (selectedOrder) {
                $('#sdtInput').val(selectedOrder.PhoneNumber || '');
                $('#diaChiDonInput').val(selectedOrder.AddressPickup || '');
                $('#diaChiDenInput').val(selectedOrder.AddressDes || '');
            }
        }
    });

    // Xử lý sự kiện dbclick vào hàng trong table
    $('#pendingCallTable tbody').on('dblclick', 'tr', function () {
        let data = table.row(this).data();
        var buttonText = "Gửi app";
        if (data) {
            let selectedOrder = orderList.find(order => order.IDOrder === data.IDOrder);
            orderItem = selectedOrder;
            if (selectedOrder) {
                $('#modalPhone').val(selectedOrder.PhoneNumber || '');
                $('#modalLine').val(selectedOrder.Line || '');
                $('#modalTimeCall').val(selectedOrder.TimeCall || '');
                $('#modalAddressPickup').val(
                    selectedOrder.AddressPickup
                        ? (selectedOrder.AddressPickup.length > 68
                            ? selectedOrder.AddressPickup.substring(0, 68) + "..."
                            : selectedOrder.AddressPickup)
                        : ''
                );
                $('#modalAddressDes').val(
                    selectedOrder.AddressDes
                        ? (selectedOrder.AddressDes.length > 68
                            ? selectedOrder.AddressDes.substring(0, 68) + "..."
                            : selectedOrder.AddressDes)
                        : ''
                );
                $('#modalCarType').val(selectedOrder.TypeCar || '');
                $('#modalNote').val(selectedOrder.Note || '');
            }
            showModalWithData(buttonText);
            idOrder = data.IDOrder;
            rowTable = $(this).index() + 1;
            phoneDataHistory();
            confirmLocations();
        }
    });
    //Hien thi data lich su so dien thoai
    function phoneDataHistory() {
        var phoneNumber = $('#modalPhone').val();
        if (!phoneNumber) {
            alertNotify("Vui lòng nhập số điện thoại", 'danger', 3000);
            return;
        }

        $.ajax({
            url: '/Dashboard/GetAddressTable',
            type: 'POST',
            data: {
                phoneNumber: phoneNumber
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    console.log("response : ", response);
                    tablePhone.clear();
                    if (response.data && response.data.Content && response.data.Content.length > 0) {
                        let dataToAdd = response.data.Content.map((item, index) => ({
                            "STT": index + 1 || '',
                            "PhoneNumber": item.PhoneNumber || '',
                            "TimeCall": item.TimeCall || '',
                            "StatusOrder": (function () {
                                switch (item.StatusOrder) {
                                    case 1: return 'Chờ xác nhận';
                                    case 2: return 'Hoàn thành đơn';
                                    case 3: return 'Tổng đài viên hủy';
                                    case 4: return 'Lái xe hủy';
                                    case 5: return 'Khách hàng hủy';
                                    default: return item.StatusOrder || '';
                                }
                            })(),
                            "Note": item.Note || ''
                        }));

                        tablePhone.rows.add(dataToAdd);
                        tablePhone.draw();
                    } else {
                        tablePhone.draw();
                    }
                } else {
                    tablePhone.clear().draw();
                }
            },
            error: function (xhr, status, error) {
                tablePhone.clear().draw();
            }
        });
    }
    // Gắn sự kiện đóng modal một lần duy nhất
    const closeBtn = document.querySelector('.close-btn');
    const modalOverlay = document.getElementById('modalOverlay');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', hideModal);
    }

    //Đóng group hướng dẫn
    const instructGroup = $(".instruct-group");
    const toggleButton = $(".toggle-arrow");

    if (instructGroup.length && toggleButton.length) {
        toggleButton.on("click", function () {
            instructGroup.toggleClass("hidden");
            toggleButton.toggleClass("active");
            console.log("Button clicked!");
        });
    } else {
        console.error("Không tìm thấy .instruct-group hoặc .toggle-arrow");
    }
    // Hàm hiển thị modal
    function showModalWithData(buttonText) {
        setTimeout(function () {
            $('#addressSuggestions').hide().empty();
            mapConfirm.invalidateSize();
            $('#phoneTable').resize();
        }, 50)
        autoCheckCheckbox();
        const checkboxes = document.querySelectorAll('input[name="callType"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    checkboxes.forEach(cb => {
                        if (cb !== this) {
                            cb.checked = false;
                        }
                    });
                }
            });
        });
        const button = document.getElementById("createHoe");
        if (buttonText === "Gửi app") {
            document.getElementById("buttonText").textContent = 'Gửi app';
            button.style.backgroundColor = "#f7e031";
            button.style.borderColor = "#f7e031";
            if (button) {
                button.removeEventListener("click", createOrder);
                button.addEventListener("click", sendOrder);
            }
        }
        else if (buttonText === "Tạo cuốc") {
            clearMapData();
            clearCheckboxes();
            document.getElementById("buttonText").textContent = 'Tạo cuốc';
            button.style.backgroundColor = "#28a745";
            button.style.borderColor = "#28a745";
            if (button) {
                button.removeEventListener("click", sendOrder);
                button.addEventListener("click", createOrder);
            }
        }
        else {
            clearMapData();
            clearCheckboxes();
            document.getElementById("buttonText").textContent = 'Tạo cuốc';
            button.style.backgroundColor = "#28a745";
            button.style.borderColor = "#28a745";
            if (button) {
                button.removeEventListener("click", sendOrder);
                button.addEventListener("click", createOrder);
            }
        }

        const modal = document.getElementById('modal');
        const modalOverlay = document.getElementById('modalOverlay');
        if (modal && modalOverlay) {
            modal.style.display = 'block';
            modalOverlay.style.display = 'block';
            const carTypeSelect = document.getElementById('modalCarType');
        }
    }
    function autoCheckCheckbox() {
        const keyMap = {
            'T': 'taxi',    
            'K': 'other',   
            'G': 'callback', 
            'I': 'complaint',
            'D': 'service', 
            'M': 'inquiry'  
        };

        document.addEventListener('keydown', function (event) {
            if (!event || !event.key) {
                console.warn('Event or event.key is undefined');
                return;
            }

            let key = event.key.toUpperCase();

           
            if (/^[A-Z]$/.test(key)) { 
                if (keyMap[key]) {
                    let allCheckboxes = document.querySelectorAll('input[name="callType"]');
                    allCheckboxes.forEach(checkbox => {
                        checkbox.checked = false;
                    });

                    let checkbox = document.querySelector(`input[name="callType"][value="${keyMap[key]}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        event.preventDefault();
                    }
                }
            }
        });
    }
    function createOrder() {
        document.getElementById("loadingOverlay").style.display = "flex";
        let isTaxiChecked = $('input[name="callType"][value="taxi"]').is(':checked');
        const now = new Date();
        const formattedDate = now.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false
        }).replace(',', '').replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
        if (
            $("#modalPhone").val() === '' ||
            selectedAddressPickUp === '' ||
            $("#modalLine").val() === ''
            // || !isTaxiChecked
        ) {
           alertNotify("Hãy điền đủ dữ liệu!", 'danger', 3000);
        }
        else {
            const orderData = {
                phoneCustomer: $("#modalPhone").val(),
                Line: $("#modalLine").val(),
                TimeOrder: formattedDate,
                addressPickup: selectedAddressPickUp,
                addressDes: selectedAddressDes,
                countSeat: 0,
                note: $("#modalNote").val(),
                latitudePickup: coordinates.modalAddressPickup?.lat || null,
                longitudePickup: coordinates.modalAddressPickup?.lng || null,
                latitudeDes: coordinates.modalAddressDes?.lat || null,
                longitudeDes: coordinates.modalAddressDes?.lng || null,
                TypeCar: $("#modalCarType").val()
            };
            console.log("orderData : ", JSON.stringify(orderData));
            $.ajax({
                url: '/InsertCall/AddOrderByOperation',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(orderData),
                success: function (response) {
                    document.getElementById("loadingOverlay").style.display = "none";
                },
                error: function (error) {
                    console.error("Error: ", error);
                    alertNotify("Đã xảy ra lỗi khi thêm cuốc xe!", 'danger', 3000);
                    document.getElementById("loadingOverlay").style.display = "none";
                }
            });
        }
    }
    function sendOrder() {
        document.getElementById("loadingOverlay").style.display = "flex";
        if (
            $("#modalPhone").val() === '' ||
            selectedAddressPickUp === '' ||
            $("#modalLine").val() === ''
            // || !isTaxiChecked
        ) {
            alertNotify("Hãy điền đủ dữ liệu!", 'danger', 3000);
        }
        else {
   $.ajax({
            url: '/InsertCall/SendOrderApp',
            type: 'POST',
            data: {
                idOrder: idOrder,
                handle: "1"
            },
            dataType: 'json',
            success: function (response) {
                console.log("responseSendOrderApp: ", response);
                document.getElementById("loadingOverlay").style.display = "none";
            },
            error: function (error) {
                console.error("Error: ", error);
                alertNotify("Đã xảy ra lỗi khi gửi app xe!", 'danger', 3000);
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
        hideModal();
        }
    }

    $("#updateButton").click(function () {
        document.getElementById("loadingOverlay").style.display = "flex";
        const now = new Date();
        const formattedDate = now.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false
        }).replace(',', '').replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
        
        if (
            $("#modalPhone").val() === '' ||
            selectedAddressPickUp === '' ||
            $("#modalLine").val() === ''
            // || !isTaxiChecked
        ) {
            alertNotify("Hãy điền đủ dữ liệu!", 'danger', 3000);
        }
        else {
const orderData = {
            phoneCustomer: $("#modalPhone").val(),
            Line: $("#modalLine").val(),
            TimeOrder: orderItem.TimeOrder,
            addressPickup: selectedAddressPickUp,
            addressDes: selectedAddressDes,
            countSeat: 0,
            note: $("#modalNote").val(),
            latitudePickup: coordinates.modalAddressPickup?.lat ? coordinates.modalAddressPickup.lat : orderItem.LatPickup,
            longitudePickup: coordinates.modalAddressPickup?.lng ? coordinates.modalAddressPickup.lng : orderItem.LngPickup,
            latitudeDes: coordinates.modalAddressDes?.lat ? coordinates.modalAddressDes.lat : orderItem.LatDes,
            longitudeDes: coordinates.modalAddressDes?.lng ? coordinates.modalAddressDes.lng : orderItem.LngDes,
            TypeCar: $("#modalCarType").val(),
            idOrder: idOrder
            };
            $.ajax({
            url: '/InsertCall/UpdateOrderByOperation',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(orderData),
            success: function (response) {
                document.getElementById("loadingOverlay").style.display = "none";
                console.log("Thay đổi thành công");
                console.log("data : ", JSON.stringify(orderData));
            },
            error: function (error) {
                console.error("Error: ", error);
                alertNotify("Đã xảy ra lỗi khi thêm cuốc xe!", 'danger', 3000);
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
        hideModal();
        }
    });

    // Hàm ẩn modal
    function hideModal() {
        const modal = document.getElementById('modal');
        const modalOverlay = document.getElementById('modalOverlay');
        if (modal && modalOverlay) {
            modal.style.display = 'none';
            modalOverlay.style.display = 'none';
        }
    }

    // Xử lý phím tắt
    document.addEventListener('keydown', function (event) {
        currentTable = $('#pendingCallTable').DataTable();
        if (event.target.tagName.toLowerCase() === 'input' && event.target.classList.contains('editable-input')) {
            return;
        }
        const selectedRow = document.querySelector('.selected-row');

        //if (selectedRow) {
        //    const rowData = table.row(selectedRow).data(); 
        //    let newHandleOperationText = rowData["Lệnh ĐHV"] || "";
        //    console.log("rowData: ", rowData);
        //    console.log("newHandleOperationText: ", newHandleOperationText);
        if (selectedRow) {
            const rowData = table.row(selectedRow).data(); 
            let newHandleOperationText = rowData["Lệnh ĐHV"] || "";
                switch (event.key.toLowerCase()) {
                    case '1':
                        newHandleOperationText = "Đã mời";
                        break;
                    case '3':
                        newHandleOperationText = "Đã xin lỗi khách";
                        break;
                    case '4':
                        newHandleOperationText = "Máy bận";
                        break;
                    case '5':
                        newHandleOperationText = "Đổ Chuông Tắt";
                        break;
                    case '6':
                        newHandleOperationText = "Không nghe máy";
                        break;
                    case '7':
                        newHandleOperationText = "Chờ Khách Một";
                        break;
                    case '8':
                        newHandleOperationText = "Khách Hoãn Xe";
                        break;
                    case '9':
                        newHandleOperationText = "Khách Có Xe Đi";
                        break;
                    case 'r':
                        newHandleOperationText = "Chuyển điều";
                        break;
                    case 't':
                        newHandleOperationText = "Trượt/Chùa";
                        break;
                    case 'm':
                        newHandleOperationText = "Đã mời Gần 2";
                        break;
                    case 'o':
                        newHandleOperationText = "Không thấy xe";
                        break;
                    case 'a':
                        newHandleOperationText = "CHUYỂN APP";
                        break;
                    case 'c':
                        newHandleOperationText = "Thấy xe";
                        break;
                    case 'd':
                        newHandleOperationText = "Đang ra";
                        break;
                    case 'g':
                        newHandleOperationText = "Giục xe";
                        break;
                    case 'l':
                        newHandleOperationText = "Ko liên lạc được";
                        break;
                    case 'y':
                        newHandleOperationText = "Cho số";
                        break;
                    case 'k':
                        newHandleOperationText = "Ko trực tiếp";
                        break;
                    case 'h':
                        newHandleOperationText = "Hoàn thành";
                        break;
                    case 'b':
                        newHandleOperationText = "Bản đồ";
                        break;
                    case ' ':
                        newHandleOperationText = "Đang gọi ...";
                        break;
                    case 'p':
                        newHandleOperationText = "Cho lx sdt";
                        break;
                    case 'n':
                        newHandleOperationText = "Ko cho số";
                        break;
                    case '/':
                        newHandleOperationText = "Xe nhận";
                        break;
                    case '*':
                        newHandleOperationText = "Xe MK";
                        break;
                    case '-':
                        newHandleOperationText = "Xe";
                        break;
                    default:
                        return
                }
                var rowIndex = $(selectedRow).index();

                // Cập nhật dữ liệu trong bảng
                currentTable.cell(rowIndex, 15).data(newHandleOperationText).draw();
            }
    });

    // Xử lý các nút chuyển tab
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function () {
            const dataPartial = this.getAttribute('data-partial');
            if (dataPartial !== 'InsertNewCall') {
                document.querySelectorAll('.btn').forEach(btn => {
                    if (btn.getAttribute('data-partial') !== 'InsertNewCall') {
                        btn.classList.remove('active');
                    }
                });
                this.classList.add('active');
            }
        });
    });

    // Hàm chuyển tab
    function ClickIncomingPending() {
        document.getElementById("incomingPending").style.display = "block";
        document.getElementById("maps").style.display = "none";
        document.getElementById("mapview").style.display = "none";
        document.getElementById("instruct-bottom").style.display = "block";
       
    }

    function ClickIncomingResolved() {
        document.getElementById("incomingPending").style.display = "none";
        document.getElementById("maps").style.display = "block";
        document.getElementById("mapview").style.display = "none";
        document.getElementById("instruct-bottom").style.display = "block";
    }

    function ClickInsertNewCall() {
        const now = new Date();
        const formattedDate = now.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false
        }).replace(',', '').replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
        var buttonText = "Tạo cuốc";
        showModalWithData(buttonText);
        document.getElementById('modalPhone').value = '';
        document.getElementById('modalLine').value = '';
        document.getElementById('modalTimeCall').value = formattedDate;
        document.getElementById('modalAddressPickup').value = '';
        document.getElementById('modalAddressDes').value = '';
        document.getElementById('modalCarType').value = '3';
        document.getElementById('modalNote').value = '';
        let table = $('#phoneTable').DataTable();
        table.clear().draw();
        document.getElementById("instruct-bottom").style.display = "block";
    }
    function ClickIncomingRejected() {
        document.getElementById("instruct-bottom").style.display = "block";
    }
    function ClickMapView() {
        document.getElementById("maps").style.display = "none";
        document.getElementById("mapview").style.display = "block";
        document.getElementById("incomingPending").style.display = "none";
        document.getElementById("instruct-bottom").style.display = "none";

        let mapView;
        if (!mapView) {
            mapView = L.map('mapview', {
                fullscreenControl: true,
                fullscreenControlOptions: {
                    position: 'topleft',
                    title: 'Phóng to toàn màn hình',
                    titleCancel: 'Thoát toàn màn hình'
                }
            }).setView([21.0668736, 105.729324], 10);

            var subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
            L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&scale=2', {
                maxZoom: 20,
                subdomains: subdomains,
                attribution: '© <a href="https://maps.google.com"></a>'
            }).addTo(mapView);
        }
        $.ajax({
            url: '/MapView/GetAllDriverGPS',
            type: 'POST',
            dataType: 'json',
            success: function (response) {
                if (response.success && response.data && response.data.Content?.length > 0) {
                    const drivers = response.data.Content;
                    mapView.eachLayer(function (layer) {
                        if (layer instanceof L.Marker) {
                            mapView.removeLayer(layer);
                        }
                    });
                    drivers.forEach(driver => {
                        const lat = driver.Latitude;
                        const lng = driver.Longitude;
                        const popupContent = `
                                             <b>Biển số:</b> ${driver.BienSo}<br>
                                             <b>Mã đàm:</b> ${driver.MaDam}<br>
                                             <b>Trạng thái:</b> ${driver.DeviceStatus}<br>
                                             <b>Tọa độ:</b> ${lat}, ${lng}<br>
                                             <b>Thời gian:</b> ${driver.Time}<br>
                                             <b>Tốc độ:</b> ${driver.VGPS} km/h
                                              `;
                        L.marker([lat, lng])
                            .addTo(mapView)
                            .bindPopup(popupContent);
                    });
                    const bounds = L.latLngBounds(drivers.map(driver => [driver.Latitude, driver.Longitude]));
                    mapView.fitBounds(bounds);
                } else {
                    alertNotify("Không có dữ liệu tài xế để hiển thị!", 'warning', 3000);
                }
                document.getElementById("loadingOverlay").style.display = "none";
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error: ", error);
                alertNotify("Đã xảy ra lỗi khi tải dữ liệu!", 'danger', 3000);
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
    }
    function ClickMapOnline() {
        document.getElementById("instruct-bottom").style.display = "none";
    }
    function ClickTestModal() {
        var buttonText = "testModal";
        const now = new Date();
        const formattedDate = now.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false
        }).replace(',', '').replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
        showModalWithData(buttonText);
        document.getElementById('modalPhone').value = '0972437273';
        document.getElementById('modalLine').value = '0';
        document.getElementById('modalTimeCall').value = formattedDate;
        document.getElementById('modalAddressPickup').value = '';
        document.getElementById('modalAddressDes').value = '';
        document.getElementById('modalCarType').value = '3';
        document.getElementById('modalNote').value = '';
    }
    window.ClickIncomingPending = ClickIncomingPending;
    window.ClickIncomingResolved = ClickIncomingResolved;
    window.ClickInsertNewCall = ClickInsertNewCall;
    window.ClickIncomingRejected = ClickIncomingRejected;
    window.ClickMapView = ClickMapView;
    window.ClickMapOnline = ClickMapOnline;
    window.ClickTestModal = ClickTestModal;

    $('.form-input.with-suggestions').on('input', function () {
        clearTimeout(timeout);
        var searchText = $(this).val();
        activeInput = $(this);

        if (searchText.length >= 3) {
            timeout = setTimeout(function () {
                searchAddress(searchText);
            }, 700);
        } else {
            $('#addressSuggestions').hide();
        }
    });

    $('.form-input.with-suggestions').on('keypress', function (e) {
        if (e.which == 13) {
            e.preventDefault();
            activeInput = $(this);
            searchAddress($(this).val());
        }
    });

    $('.form-input.with-suggestions').on('focus', function () {
        activeInput = $(this);
        updateSuggestionsClass();
        if (!$(this).val()) {
            $('#addressSuggestions').hide().empty();
        } else {
            positionSuggestions(); 
        }
    });

    function updateSuggestionsClass() {
        if (activeInput && activeInput.length) {
            var $suggestions = $('#addressSuggestions');
            $suggestions.removeClass('pickup-suggestions destination-suggestions');

            if (activeInput.attr('id') === 'modalAddressPickup') {
                $suggestions.addClass('pickup-suggestions');
            } else if (activeInput.attr('id') === 'modalAddressDes') {
                $suggestions.addClass('destination-suggestions'); 
            }
        }
    }

    function positionSuggestions() {
        if (activeInput) {
            var inputOffset = activeInput.offset();
            var inputHeight = activeInput.outerHeight();
            var $suggestions = $('#addressSuggestions');

            $suggestions.css({
                'left': inputOffset.left,
                'width': activeInput.outerWidth()
            });

            $suggestions.show();
        }
    }

    function searchAddress(address) {
        $.ajax({
            url: '/Dashboard/GetAddressSuggestions',
            type: 'POST',
            data: { address: address },
            success: function (response) {
                if (response.success && response.data && response.data.Content) {
                    displaySuggestions(response.data.Content);
                } else {
                    $('#addressSuggestions').hide();
                }
            },
            error: function () {
                $('#addressSuggestions').hide();
            }
        });
    }

    function displaySuggestions(addresses) {
        var $suggestions = $('#addressSuggestions');
        $suggestions.empty();

        if (addresses.length > 0) {
            $.each(addresses, function (index, item) {
                var $div = $('<div>')
                    .text(item.address)
                    .addClass('suggestion-item')
                    .data('id', item.id)
                    .click(function () {
                        if (activeInput) {
                            activeInput.val(item.address.length > 68 ? item.address.substring(0, 68) + "..." : item.address);
                            getCoordinatesById(item.id, activeInput.attr('id'));
                        }
                        $suggestions.hide();
                        activeInput.data('suggestionSelected', true);
                    });
                $suggestions.append($div);
            });
            updateSuggestionsClass(); 
            positionSuggestions();
            $suggestions.show();
        } else {
            $suggestions.hide();
        }
    }

    function getCoordinatesById(id, inputId) {
        $.ajax({
            url: '/Dashboard/GetCoordinatesById',
            type: 'POST',
            data: { id: id },
            success: function (response) {
                if (response.data.statusID === 2) {
                    coordinates[inputId] = {
                        lat: response.data.Content.latitude,
                        lng: response.data.Content.longitude
                    };
                    if (inputId == "modalAddressPickup") {
                        selectedAddressPickUp = response.data.Content.address;
                    }
                    else if (inputId == "modalAddressDes") {
                        selectedAddressDes = response.data.Content.address;
                    }
                    console.log(`Tọa độ ${inputId}: Lat: ${coordinates[inputId].lat}, Lng: ${coordinates[inputId].lng}`);
                } else {
                    console.log('Không lấy được tọa độ - Status:', response.data.statusID);
                }
            },
            error: function (xhr, status, error) {
                console.log('Lỗi khi gọi API:', error);
            }
        });
    }
    //$(document).click(function (e) {
    //    var $target = $(e.target);
    //    var isInputClicked = $target.closest('.form-input.with-suggestions').length > 0;
    //    var isSuggestionsClicked = $target.closest('#addressSuggestions').length > 0;

    //    if (!isInputClicked && !isSuggestionsClicked) {
    //        if (activeInput && activeInput.length) {
    //            // Kiểm tra xem người dùng có chọn gợi ý nào không
    //            if (!activeInput.data('suggestionSelected')) {
    //                activeInput.val(''); // Xóa giá trị input nếu không chọn gợi ý
    //            }
    //            // Reset trạng thái
    //            activeInput.data('suggestionSelected', false);
    //        }
    //        $('#addressSuggestions').hide();
    //    }
    //});
    $(document).click(function (e) {
        if (!$(e.target).closest('.form-input.with-suggestions, #addressSuggestions').length) {
            $('#addressSuggestions').hide();
        }
    });
    $(window).resize(function () {
        positionSuggestions();
    });

});
function clearCheckboxes() {
    const checkboxes = document.querySelectorAll('input[name="callType"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}
function initMaps() {
    initMapSelect();
    initMapConfirm();
}

function initMapSelect() {
    mapSelect = L.map('mapSelectLocation', {
        fullscreenControl: true,
        fullscreenControlOptions: { position: 'topleft', title: 'Phóng to toàn màn hình', titleCancel: 'Thoát toàn màn hình' }
    }).setView([20.9337809, 105.7835528], 13);

    var subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
    var googleNormal = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&scale=2', {
        maxZoom: 20,
        subdomains: subdomains,
        attribution: '© <a href="https://maps.google.com"></a>'
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
    googleNormal.addTo(mapSelect);
    L.control.layers(baseMaps).addTo(mapSelect);
    mapSelect.on('click', function (e) { placeMarker(e.latlng); });

}

function initMapConfirm() {
    mapConfirm = L.map('mapConfirm', { fullscreenControl: true, fullscreenControlOptions: { position: 'topleft', title: 'Phóng to toàn màn hình', titleCancel: 'Thoát toàn màn hình' } })
        .setView([20.9337809, 105.7835528], 13);
    var subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
    var googleNormal = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&scale=2', {
        maxZoom: 20,
        subdomains: subdomains,
        attribution: '© <a href="https://maps.google.com"></a>'
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
    googleNormal.addTo(mapConfirm);
    L.control.layers(baseMaps).addTo(mapConfirm);
    googleNormal.addTo(mapConfirm);
}
function clearMapData() {
    if (mapConfirm) {
        mapConfirm.eachLayer(function (layer) {
            if (!layer._url || !layer._url.includes('google.com')) {
                mapConfirm.removeLayer(layer);
            }
        });
        mapConfirm.setView([20.9337809, 105.7835528], 13);
    }
}
function openMapModal(inputId) {
    currentInputId = inputId;
    document.getElementById("mapModalSelectLocation").style.display = "block";
    if (!mapSelect) initMapSelect();
    else mapSelect.invalidateSize();
}

function closeMapModal() {
    document.getElementById("mapModalSelectLocation").style.display = "none";
    document.getElementById("loadingOverlayMap").style.display = "none";
    currentInputId = '';
}

function placeMarker(latlng) {
    console.log("hi");
    if (marker) mapSelect.removeLayer(marker);

    marker = L.marker(latlng, { draggable: true }).addTo(mapSelect);
    mapSelect.panTo(latlng);
    marker.bindPopup("Đang tải địa chỉ...").openPopup();

    updatePopupWithAddress(latlng);
    marker.on('dragend', function (e) {
        const newLatLng = marker.getLatLng();
        mapSelect.panTo(newLatLng);
        marker.bindPopup("Đang tải địa chỉ...").openPopup();
        updatePopupWithAddress(newLatLng);
    });
}

function updatePopupWithAddress(latlng) {
    $.ajax({
        url: '/Dashboard/GetAddressCoor',
        type: 'POST',
        data: { latitude: latlng.lat, longitude: latlng.lng },
        success: function (data) {
            let address = (data.data.statusID === 2 && data.data.Content && data.data.Content.Address)
                ? data.data.Content.Address
                : "Không tìm thấy địa chỉ";
            marker.bindPopup(address).openPopup();
        },
        error: function () {
            marker.bindPopup("Lỗi khi lấy địa chỉ").openPopup();
        }
    });
}

function selectLocation() {
    if (marker && currentInputId) {
        const latlng = marker.getLatLng();
        coordinates[currentInputId] = { lat: latlng.lat, lng: latlng.lng };
        document.getElementById("loadingOverlayMap").style.display = "flex";
        $.ajax({
            url: '/Dashboard/GetAddressCoor',
            type: 'POST',
            data: { latitude: latlng.lat, longitude: latlng.lng },
            success: function (data) {
                setTimeout(() => {
                    let selectedAddress = (data.data.statusID === 2 && data.data.Content && data.data.Content.Address)
                        ? data.data.Content.Address
                        : `Lat: ${latlng.lat}, Lng: ${latlng.lng}`;
                    document.getElementById(currentInputId).value = selectedAddress.length > 68 ? selectedAddress.substring(0, 68) + "..." : selectedAddress;
                    if (currentInputId == "modalAddressPickup") {
                        selectedAddressPickUp = selectedAddress;
                    }
                    else if (currentInputId == "modalAddressDes") {
                        selectedAddressDes = selectedAddress;
                    }
                    console.log("selectedAddress: ", selectedAddress);
                    document.getElementById("loadingOverlayMap").style.display = "none";
                    closeMapModal();
                }, 1000);
            },
            error: function () {
                setTimeout(() => {
                    document.getElementById(currentInputId).value = `Lat: ${latlng.lat}, Lng: ${latlng.lng}`;
                    document.getElementById("loadingOverlayMap").style.display = "none";
                    closeMapModal();
                }, 1000);
            }
        });
    } else {
        alertNotify("Vui lòng chọn một địa điểm trên bản đồ!", 'danger', 3000);
    }
}

function confirmLocations() {
    mapConfirm.eachLayer(function (layer) { if (layer instanceof L.Marker) mapConfirm.removeLayer(layer); });

    if (orderItem.LatPickup && orderItem.LngPickup) {
        L.marker([orderItem.LatPickup, orderItem.LngPickup], { icon: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41] }) })
            .addTo(mapConfirm)
            .bindPopup(orderItem.AddressPickup || "Địa điểm đón", { closeOnClick: false, autoClose: false, height: 200, width: 150 })
            .openPopup();
    } else {
        alertNotify("Vui lòng chọn địa điểm đón trước!", 'danger', 3000);
        return;
    }

    if (orderItem.LatDes && orderItem.LngDes) {
        L.marker([orderItem.LatDes, orderItem.LngDes], { icon: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41] }) })
            .addTo(mapConfirm)
            .bindPopup(orderItem.AddressDes || "Địa điểm đến", { closeOnClick: false, autoClose: false, height: 200, width: 150 })
            .openPopup();
    } else {
        alertNotify("Vui lòng chọn địa điểm đến trước!", 'danger', 3000);
        return;
    }

    mapConfirm.fitBounds([
        [orderItem.LatPickup, orderItem.LngPickup],
        [orderItem.LatDes, orderItem.LngDes]
    ]);
}

