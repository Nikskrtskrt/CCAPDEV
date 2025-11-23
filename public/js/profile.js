$(document).ready(() => {
    const toastEl = $('#toastMsg');
    const toast = new bootstrap.Toast(toastEl[0]);
    const reservationTableBody = $('#reservationTableBody');

    function showToast(msg, type = 'danger') {
        $('#toastMsg')
            .removeClass('text-bg-danger text-bg-success')
            .addClass(`text-bg-${type}`);
        $('#toastText').text(msg);
        toast.show();
    }

    function initializeReservations(arrReservations, arrFlights) {
        if (arrReservations.length == 0) {
            return
        }

        reservationTableBody.empty();

        for (i = 0; i < arrReservations.length; i++) {
            const curReservation = arrReservations[i];
            const curFlight = arrFlights.find(flight => flight._id == curReservation.flight)
            console.log("Current Reservation: ", curReservation);
            console.log("Current Flight: ", curFlight);
            console.log("Current Reservation Id: ", curReservation._id);

            const flightNo = curFlight.flightNo;
            const flightDate = curFlight.date;
            const seatNo = curReservation.seatNo;
            const fareClass = curReservation.fareClass;
            const totalPrice = curReservation.totalPrice;
            const status = curReservation.status;
            
            const tr = $("<tr>")
                .data("id", curReservation._id)
                .append( $("<td>").append(flightNo) )
                .append( $("<td>").append(flightDate) )
                .append( $("<td>").append(seatNo) )
                .append( $("<td>").append(fareClass) )
                .append( $("<td>").append(totalPrice) )
                .append( $("<td>").append(status) )
                .append( $("<td>")
                    .addClass("btn btn-sm btn-danger delete-reservation-btn")
                    .append("Delete")
                );
            
            reservationTableBody.append(tr);

            /*
            <tr data-id="{{_id}}">
                <td>{{ flight.flightNo }}</td>
                <td>{{ formatDate flight.date }}</td>
                <td>{{ seatNo }}</td>
                <td>{{ fareClass }}</td>
                <td>{{ totalPrice }}</td>
                <td>{{ status }}</td>
                <td>
                    <button class="btn btn-sm btn-danger delete-reservation-btn">Delete</button>
                </td>
            </tr>
            */
            
        }


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

    $.ajax({
        url: `/api/reservations/user`,
        method: 'GET',
        success: function (data) {
            console.log(`Data Got:\n`, data);

            initializeReservations(data.reservations, data.flights)
        },
        error: function (xhr) {
            console.error('Error fetching reservation data:', xhr.responseText);
        }
    });
});
