$(document).ready(function () {
    const flightModal = new bootstrap.Modal(document.getElementById('flightModal'));
    const toastEl = $('#toastMsg');
    const toast = new bootstrap.Toast(toastEl[0]);

    function showToast(message, type = 'danger') {
        $('#toastMsg')
            .removeClass('text-bg-danger text-bg-success')
            .addClass(`text-bg-${type}`);

        $('#toastText').text(message);
        toast.show();
    }


    $(document).on('click', '#addFlightBtn', function () {
        $('#modalTitle').text('Add Flight Template');
        $('#flightForm')[0].reset();
        $('#flightId').val('');
        $('#saveFlightBtn').show();
        $('input, select').prop('disabled', false);
        $('input[name="daysOfWeek"]').prop('checked', false);
        flightModal.show();
    });


    $(document).on('click', '.view-btn', function () {
        const id = $(this).data('id');
        if (!id) return showToast('Invalid id');

        $.ajax({
            url: `/api/flights/${id}`, 
            method: 'GET',
            success: function (data) {
                const tpl = data.flight;
                const instances = data.instances;

                $('#modalTitle').text('View Flight Template');
                $('#flightId').val(tpl._id);
                $('#flightNo').val(tpl.flightNo || '');
                $('#origin').val(tpl.origin || '');
                $('#destination').val(tpl.destination || '');
                $('#departure').val(tpl.departure || '');
                $('#arrival').val(tpl.arrival || '');
                $('#aircraft').val(tpl.aircraft || '');
                $('#capacity').val(tpl.capacity || '');
                $('#seasonStart').val(tpl.seasonStart ? tpl.seasonStart.slice(0, 10) : '');
                $('#seasonEnd').val(tpl.seasonEnd ? tpl.seasonEnd.slice(0, 10) : '');

                $('input[name="daysOfWeek"]').prop('checked', false);
                (tpl.daysOfWeek || []).forEach(day => {
                    $(`input[name="daysOfWeek"][value="${day}"]`).prop('checked', true);
                });

                let tableHTML = '';
                if (instances.length > 0) {
                    instances.forEach(inst => {
                        tableHTML += `
                            <tr>
                                <td>${new Date(inst.date).toLocaleDateString()}</td>
                                <td>${new Date(inst.departureTime).toLocaleTimeString()}</td>
                                <td>${new Date(inst.arrivalTime).toLocaleTimeString()}</td>
                                <td>${inst.status}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm delete-instance-btn" data-id="${inst._id}">
                                        Delete
                                    </button>
                                </td>
                            </tr>`;
                    });
                }

                $('#instancesTable tbody').html(tableHTML);
                $('input, select').prop('disabled', true);
                $('#saveFlightBtn').hide();
                flightModal.show();
            },
            error: function (xhr) {
                showToast('Error retrieving template');
            }
        });
    });


    $(document).on('click', '.delete-instance-btn', function () {
        const id = $(this).data('id');
        if (!confirm('Delete this flight instance?')) return;

        $.ajax({
            url: `/api/flights/instance/${id}`,
            method: 'DELETE',
            success: function () {
                showToast('Instance deleted!');
                $(`button[data-id="${id}"]`).closest('tr').remove();
            },
            error: function () {
                showToast('Error deleting instance');
            }
        });
    });


    $(document).on('click', '.edit-btn', function () {
        const id = $(this).data('id');
        if (!id) return showToast('Invalid id');

        $.ajax({
        url: `/api/flights/${id}`,
        method: 'GET',
        success: function (tpl) {
            $('#modalTitle').text('Edit Flight Template');
            $('#flightId').val(tpl._id);
            $('#flightNo').val(tpl.flightNo || '');
            $('#origin').val(tpl.origin || '');
            $('#destination').val(tpl.destination || '');
            $('#departure').val(tpl.departure || '');
            $('#arrival').val(tpl.arrival || '');
            $('#aircraft').val(tpl.aircraft || '');
            $('#capacity').val(tpl.capacity || '');
            $('#seasonStart').val(tpl.seasonStart ? tpl.seasonStart.slice(0, 10) : '');
            $('#seasonEnd').val(tpl.seasonEnd ? tpl.seasonEnd.slice(0, 10) : '');

            $('input[name="daysOfWeek"]').prop('checked', false);
            (tpl.daysOfWeek || []).forEach(day => {
            $(`input[name="daysOfWeek"][value="${day}"]`).prop('checked', true);
            });

            $('input, select').prop('disabled', false);
            $('#saveFlightBtn').show();
            flightModal.show();
        },
        error: function () {
            showToast('Error retrieving template');
        }
        });
    });


    $('#flightForm').submit(function (e) {
        e.preventDefault();

        const id = $('#flightId').val();
        const daysOfWeek = [];
        $('input[name="daysOfWeek"]:checked').each(function () {
        daysOfWeek.push($(this).val());
        });

        const tplData = {
        flightNo: $('#flightNo').val(),
        origin: $('#origin').val(),
        destination: $('#destination').val(),
        daysOfWeek,
        departure: $('#departure').val(),
        arrival: $('#arrival').val(),     
        seasonStart: $('#seasonStart').val(),
        seasonEnd: $('#seasonEnd').val(),
        aircraft: $('#aircraft').val(),  
        capacity: Number($('#capacity').val() || 0),
        };

        if (!tplData.flightNo || !tplData.origin || !tplData.destination) {
        return showToast('Please fill in flightNo, origin, destination');
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/flights/${id}` : '/api/flights';

        $.ajax({
        url,
        method,
        contentType: 'application/json',
        data: JSON.stringify(tplData),
        success: function () {
            showToast('Flight template saved!', 'success');
            flightModal.hide();
            setTimeout(() => location.reload(), 900);
        },
        error: function () {
            showToast('Error saving template');
        }
        });
    });


    $(document).on('click', '.delete-btn', function () {
        const id = $(this).data('id');
        if (!id) return showToast('Invalid id');
        if (!confirm('Delete this flight template?')) return;

        $.ajax({
        url: `/api/flights/${id}`,
        method: 'DELETE',
        success: function () {
            showToast('Template deleted!', 'success');
            setTimeout(() => location.reload(), 900);
        },
        error: function () {
            showToast( 'Failed to delete template');
        }
        });
    });
});
