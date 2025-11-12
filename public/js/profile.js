$(document).ready(() => {
    const toastEl = $('#toastMsg');
    const toast = new bootstrap.Toast(toastEl[0]);

    function showToast(msg, type = 'danger') {
        $('#toastMsg')
            .removeClass('text-bg-danger text-bg-success')
            .addClass(`text-bg-${type}`);
        $('#toastText').text(msg);
        toast.show();
    }

    $(document).on('click', '.delete-reservation-btn', function () {
        const row = $(this).closest('tr');
        const id = row.data('id');

        if (!confirm('Delete this reservation?')) return;

        $.ajax({
        url: `/api/reservations/${id}`,
        method: 'DELETE',
        success: (res) => {
            if (res.success) {
            row.remove();
            showToast('Reservation deleted!', 'success');
            } else {
            showToast('Failed to delete reservation');
            }
        }
        });
    });

    $(document).on('click', '.edit-reservation-btn', function () {
        const row = $(this).closest('tr');
        const id = row.data('id');
        const seatNo = prompt('New seat number:', row.find('td:eq(2)').text());
        const fareClass = prompt('New fare class:', row.find('td:eq(3)').text());

        if (!seatNo || !fareClass) return;

        $.ajax({
        url: `/api/reservations/${id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ seatNo, fareClass }),
        success: (res) => {
            if (res.success) {
            row.find('td:eq(2)').text(seatNo);
            row.find('td:eq(3)').text(fareClass);
            showToast('Reservation updated!', 'success');
            } else {
            showToast('Failed to update reservation');
            }
        }
        });
    });
});
