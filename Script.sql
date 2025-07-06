	let u_name = '', u_id = 0;

	function showHistory(userId, userName) {
		u_id = userId;
		u_name = userName;
		// Set the user name in the modal title
		$("#nameUser").text(userName);

		// Clear previous content and show loading message
		$("#historyContent").html("<p>Đang tải lịch sử...</p>");

		// **Important:** Do NOT get dates from #inputDate here directly for the AJAX call.
		// The dates will now come from the modal's input fields.
		// Instead, simply show the modal.
		$('#exampleModal').modal('show');

		// Automatically load history when the modal is shown
		// We'll call a dedicated function to load history that reads from modal's date inputs
		// Call it immediately with default/pre-filled dates (if any)
		loadHistoryData(userId, userName);
	}

	// Function to load history data based on current modal filter settings
	function loadHistoryData(userId, userName) {
		$("#historyContent").html("<p>Đang tải lịch sử...</p>"); // Show loading state

		// Get dates from the modal's input fields
		const fromDateVal = $('#historyFromDate').val();
		const toDateVal = $('#historyToDate').val();

		// Construct date parameters for API
		const params = new URLSearchParams({ userId });

		// Only append if dates are actually selected
		if (fromDateVal) {
			params.append("fromDate", `${fromDateVal}T00:00:00`);
		}
		if (toDateVal) {
			params.append("toDate", `${toDateVal}T23:59:59`);
		}

		$.ajax({
			url: `/api/UserQuery/getUserTransactionsById?${params.toString()}`,
			method: "GET",
			success: function (data) {
				if (data.length === 0) {
					$("#historyContent").html("<p>Không có lịch sử giao dịch trong khoảng thời gian đã chọn.</p>");
					return;
				}

				let html = ''; // Start with an empty string as the user name is in the title

				// Display each transaction
				data.forEach(tran => {
					const isSender = tran.proposeUsername === userName;
					const amount = isSender ? tran.point : -tran.point;

					const pointText = amount > 0
						? `<span class="text-primary fw-bold">+${amount}</span>`
						: `<span class="text-danger fw-bold">${amount}</span>`;

					const counterParty = isSender ? tran.receiveUsername : tran.proposeUsername;

					// Format datetime to Vietnamese locale
					const transactionDateTime = new Date(tran.dateTime).toLocaleString('vi-VN', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
						hour12: false // Use 24-hour format
					});

					const calendarText = ((tran.calendar1 || '') + (tran.calendar2 || '')).trim() || '[Không có]';

					html += `
						<div class="border rounded p-2 mb-3">
							<p class="mb-1"><strong>${transactionDateTime}</strong> &nbsp; ${pointText}</p>
							<p class="mb-1"><strong>${isSender ? 'Chuyển cho' : 'Nhận từ'}:</strong> ${counterParty}</p>
							<p class="mb-1"><strong class="text-success">Lịch: </strong> ${calendarText}</p>
						</div>`;

				});

				$("#historyContent").html(html);
			},
			error: function () {
				$("#historyContent").html("<p class='text-danger'>Lỗi khi tải dữ liệu lịch sử.</p>");
			}
		});
	}

	// Event listener for the "Apply Filter" button inside the modal
	$(document).on('click', '#applyHistoryFilterBtn', function () {
		// Get the userId and userName that was last used to open the modal
		// You might need to store these in data attributes or a global variable if they're not always present
		const currentUserId = u_id; // Assuming you set this when opening the modal
		const currentUserName = u_name;
		if (currentUserId && currentUserName) {
			loadHistoryData(currentUserId, currentUserName);
		} else {
			// Handle case where userId/userName is not available (shouldn't happen if flow is correct)
			showToast("Lỗi", "Không tìm thấy thông tin người dùng để áp dụng bộ lọc.", "danger");
		}
	});

	// Event listener for when the modal is shown to set initial data attributes
	// This is crucial to pass userId to the applyHistoryFilterBtn click handler
	$('#exampleModal').on('show.bs.modal', function (event) {
		const button = $(event.relatedTarget); // Button that triggered the modal
		const userId = button.data('user-id'); // Extract info from data-* attributes
		const userName = button.data('user-name');
		console.log('userId: ', userId)
		if (userId && userName) {
			$(this).data('user-id', userId); // Store user-id in the modal's data
			$(this).data('user-name', userName); // Store user-name in the modal's data
			$("#nameUser").text(userName); // Set the name

			// You can also pre-fill dates here if you want
			// For example, set default to current month
			const today = new Date();
			const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
			const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);

			$('#historyFromDate').val(firstDayOfMonth);
			$('#historyToDate').val(lastDayOfMonth);

			// Load data initially when modal opens
			loadHistoryData(userId, userName);
		}
	});
