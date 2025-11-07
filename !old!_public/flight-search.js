$(function() {

    const flights = [
        {
        airline: "Philippine Airlines", flightNo: "PR 67", origin: "Japan", departTime: "06:07",
        destination: "Dubai", arriveTime: "11:45", price: 67000
        },
        {
        airline: "Cebu Pacific",
        flightNo: "5J 563",
        origin: "Manila",
        departTime: "14:20",
        destination: "Cebu",
        arriveTime: "22:25",
        price: 7600
        },
        {
        airline: "AirAsia Philippines",
        flightNo: "Z2 938",
        origin: "Manila",
        departTime: "19:10",
        destination: "United Kingdom",
        arriveTime: "22:25",
        price: 6890
        },
        {
        airline: "Emirates",
        flightNo: "EK 333",
        origin: "Manila",
        departTime: "23:00",
        destination: "Dubai",
        arriveTime: "04:30",
        price: 51200
        }
    ];

    function renderFlights(list) {
        const results = $("#flightResults");
        results.empty();

        if (list.length === 0) {
        results.html(`<div class="alert alert-warning text-center">No flights found for your search.</div>`);
        return;
        }

        $.each(list, function(i, f) {
        const card = `
            <div class="card flight-card shadow mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                <div>
                    <h5 class="card-title mb-0">${f.airline}</h5>
                    <small class="text-warning">${f.flightNo}</small>
                </div>
                <div class="price">₱${f.price.toLocaleString()}</div>
                </div>
                <div class="row text-center">
                <div class="col">
                    <h6>${f.origin}</h6>
                    <p class="mb-0">${f.departTime}</p>
                </div>
                <div class="col">
                    <h6>${f.destination}</h6>
                    <p class="mb-0">${f.arriveTime}</p>
                </div>
                </div>
                <button class="btn btn-success w-100 mt-3 next-button" data-index="${i}">Next</button>
            </div>`;
        results.append(card);
        });
    }

    renderFlights(flights);

    $(document).on("click", ".next-button", function() {
        const i = $(this).data("index");
        const flight = flights[i];
        alert(`Proceeding to book ${flight.airline} (${flight.flightNo})`);
    });

    });