$(document).ready(function () {
    const reservationModal = new bootstrap.Modal(document.getElementById('reservationModal'));
    const toastEl = $('#toastMsg');
    const toast = new bootstrap.Toast(toastEl[0]);

    function showToast(message, type = 'danger') {
        $('#toastMsg')
            .removeClass('text-bg-danger text-bg-success')
            .addClass(`text-bg-${type}`);
        $('#toastText').text(message);
        toast.show();
    }

    $(document).on('click', '.edit-btn', function () {
        const id = $(this).data('id');
        if (!id) return showToast('Invalid reservation ID');

        $.ajax({
            url: `/api/reservations/${id}`,
            method: 'GET',
            success: function (res) {
                $('#reservationId').val(res._id);
                $('#mealType').val(res.mealType);
                $('#seatNo').val(res.seatNo);
                $('#baggage').val(res.baggage);
                reservationModal.show();
            },
            error: function () {
                showToast('Failed to load reservation details.');
            }
        });
    });

    $('#reservationForm').submit(function (e) {
        e.preventDefault();

        const id = $('#reservationId').val();
        if (!id) return showToast('No reservation ID found.');

        const reservationData = {
            mealType: $('#mealType').val(),
            seatNo: $('#seatNo').val(),
            baggage: $('#baggage').val()
        };

        $.ajax({
            url: `/api/reservations/${id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(reservationData),
            success: function () {
                showToast('Reservation updated successfully!', 'success');
                reservationModal.hide();
                setTimeout(() => location.reload(), 900);
            },
            error: function (xhr) {
                showToast(xhr.responseJSON?.error || 'Error saving reservation');
            }
        });
    });

    $(document).on('click', '.cancel-btn', function () {
        const id = $(this).data('id');
        if (!id) return showToast('Invalid reservation ID');

        if (!confirm('Are you sure you want to cancel this reservation?')) return;

        $.ajax({
            url: `/api/reservations/${id}/cancel`,
            method: 'PUT',
            success: function () {
                showToast('Reservation cancelled!', 'success');
                setTimeout(() => location.reload(), 700);
            },
            error: function () {
                showToast('Failed to cancel reservation.');
            }
        });
    });

    $(document).on('click', '.delete-btn', function () {
        const id = $(this).data('id');
        if (!id) return showToast('Invalid reservation ID');

        if (!confirm('Are you sure you want to PERMANENTLY DELETE this reservation? This cannot be undone.')) {
            return;
        }

        $.ajax({
            url: `/api/reservations/${id}`,
            method: 'DELETE',
            success: function () {
                showToast('Reservation deleted successfully!', 'success');
                setTimeout(() => location.reload(), 700); 
            },
            error: function (xhr) {
                showToast(xhr.responseJSON?.error || 'Failed to delete reservation.');
            }
        });
    });

});