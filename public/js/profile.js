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
                .append( $("<td>")
                    .append(status)
                    .attr('id', curReservation._id + '_status')
                )
                .append( $("<td>")
                    .append( $("<button>")
                        .attr('id', curReservation._id + '_button')
                        .addClass("btn btn-sm btn-danger delete-reservation-btn")
                        .append("Cancel")
                    ) 
                );
            
            reservationTableBody.append(tr);

            if (status == "Cancelled") {
                console.log("Cancelled booking detected");
                const button = $(`#${curReservation._id}_button`);
                button.hide()
            }

            

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

        const isConfirmed = confirm("Cancel this reservation?")
        if (!isConfirmed) {
            console.log("User did not cancel");
            return;
        }
        console.log("User choose cancelled");

        $.ajax({
            url: `/api/bookingReservation/${id}`,
            //method: 'DELETE',
            method: 'PATCH',
            success: (res) => {
                if (res.success) {
                    showToast('Reservation Cancelled!', 'success');
                    //const statusLabel = $("#" + id + "_status");
                    const statusLabel = $(`#${id}_status`)
                    //statusLabel.innerHtml = "Cancelled"
                    statusLabel.empty()
                    statusLabel.append("Cancelled")

                    //const button = $("#" + id + "_button");
                    const button = $(`#${id}_button`);
                    button.hide()

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
