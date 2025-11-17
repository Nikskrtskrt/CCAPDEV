$(document).ready(function () {
    let flights = [];
    let searchDate = null;
    let availableTimes = [];

    // When origin changes, populate destinations
    $('#origin').on('change', function () {
        const origin = $(this).val();
        
        // Reset dependent fields
        $('#destination').html('<option value="">Select Destination</option>');
        $('#departureTime').html('<option value="">Select a date first</option>').prop('disabled', true);
        
        if (!origin) return;

        // Get destinations for selected origin
        $.ajax({
            url: `/api/search/destinations?origin=${origin}`,
            method: 'GET',
            success: function (destinations) {
                let options = '<option value="">Select Destination</option>';
                destinations.forEach(dest => {
                    options += `<option value="${dest}">${dest}</option>`;
                });
                $('#destination').html(options);
            },
            error: function () {
                alert('Failed to load destinations. Please try again.');
            }
        });
    });

    // When destination changes, reset time dropdown TO NOTHING
    $('#destination').on('change', function () {
        $('#departureTime').html('<option value="">Select a date first</option>').prop('disabled', true);
    });

    // When date changes, get any available departure times
    $('#departure').on('change', function () {
        const origin = $('#origin').val();
        const destination = $('#destination').val();
        searchDate = $(this).val();

        if (!origin || !destination) {
            alert('Please select both origin and destination first');
            $(this).val('');
            return;
        }

        if (!searchDate) {
            $('#departureTime').html('<option value="">Select a date first</option>').prop('disabled', true);
            return;
        }

        $('#departureTime').html('<option value="">Loading times...</option>').prop('disabled', true);

        // GET available times for this route and date
        $.ajax({
            url: `/api/search/times?origin=${origin}&destination=${destination}&date=${searchDate}`,
            method: 'GET',
            success: function (times) {
                if (times.length === 0) {
                    $('#departureTime').html('<option value="">No flights available on this date</option>').prop('disabled', true);
                    return;
                }

                availableTimes = times;
                let options = '<option value="">Select Departure Time</option>';
                times.forEach(time => {
                    const timeStr = new Date(time.departureTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    options += `<option value="${time.flightNo}">${timeStr} - ${time.flightNo} (${time.availableSeats} seats available)</option>`;
                });
                $('#departureTime').html(options).prop('disabled', false);
            },
            error: function () {
                $('#departureTime').html('<option value="">Error loading times</option>').prop('disabled', true);
                alert('Failed to load departure times. Please try again.');
            }
        });
    });

    // This handles the search form submission
    $('#searchForm').on('submit', function (e) {
        e.preventDefault();

        const origin = $('#origin').val();
        const destination = $('#destination').val();
        const selectedFlightNo = $('#departureTime').val();
        searchDate = $('#departure').val();

        if (!origin || !destination) {
            alert('Please select both origin and destination');
            return;
        }

        if (!searchDate) {
            alert('Please select a departure date');
            return;
        }

        if (!selectedFlightNo) {
            alert('Please select a departure time');
            return;
        }

        // Finds the selected flight from available times
        const selectedFlight = availableTimes.find(f => f.flightNo === selectedFlightNo);
        
        if (!selectedFlight) {
            alert('Selected flight not found');
            return;
        }

        flights = [selectedFlight];
        renderFlights(flights);
    });

    function renderFlights(list) {
        const results = $("#flightResults");
        results.empty();

        if (list.length === 0) {
            results.html(`
                <div class="text-center text-light py-5">
                    <i class="bi bi-inbox" style="font-size: 3rem; opacity: 0.3;"></i>
                    <h5 class="mt-3">No flights found</h5>
                    <p class="text-muted">Try different dates or destinations</p>
                </div>
            `);
            return;
        }

        results.append(`<h4 class="text-light mb-4">
            <i class="bi bi-airplane-fill me-2"></i>
            Selected Flight
        </h4>`);

        // Rendering the flight card
        $.each(list, function (i, f) {
            const departureTime = new Date(f.departureTime).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const arrivalTime = new Date(f.arrivalTime).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const dateStr = new Date(searchDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });

            const card = `
            <div class="card flight-card mb-4">
                <!-- Card Header: Airline Info -->
                <div class="flight-card-header d-flex justify-content-between align-items-center pb-3 mb-3">
                    <div>
                        <h5 class="mb-1 fw-bold">${f.aircraft}</h5>
                        <small class="text-warning">${f.flightNo}</small>
                    </div>
                    <div class="text-end">
                        <h4 class="mb-0 text-success fw-bold">₱${(Math.random() * 50000 + 5000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
                        <small class="text-muted">per person</small>
                    </div>
                </div>

                <!-- Flight Route -->
                <div class="row align-items-center text-center mb-3">
                    <!-- Departure -->
                    <div class="col-4">
                        <h2 class="mb-1 fw-bold">${f.origin}</h2>
                        <h4 class="text-warning mb-1">${departureTime}</h4>
                        <small class="text-muted">${dateStr}</small>
                    </div>

                    <!-- Arrow -->
                    <div class="col-4">
                        <i class="bi bi-arrow-right text-warning" style="font-size: 2rem;"></i>
                    </div>

                    <!-- Arrival -->
                    <div class="col-4">
                        <h2 class="mb-1 fw-bold">${f.destination}</h2>
                        <h4 class="text-warning mb-1">${arrivalTime}</h4>
                        <small class="text-muted">${dateStr}</small>
                    </div>
                </div>

                <!-- Additional Flight Info -->
                <div class="mt-3 pt-3" style="border-top: 1px solid rgba(255,255,255,0.1);">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <small class="text-muted">
                                <i class="bi bi-people-fill me-2"></i>
                                <strong>Available Seats:</strong> ${f.availableSeats}
                            </small>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted">
                                <i class="bi bi-airplane me-2"></i>
                                <strong>Aircraft:</strong> ${f.aircraft}
                            </small>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-2"></i>
                                <strong>Status:</strong> ${f.status}
                            </small>
                        </div>
                    </div>
                </div>

                <!-- Select Button -->
                <button class="btn btn-success select-flight-btn" 
                        data-flight-id="${f._id}" 
                        data-flight-no="${f.flightNo}"
                        ${f.availableSeats <= 0 ? 'disabled' : ''}>
                    ${f.availableSeats <= 0 ? 'Fully Booked' : 'Next - Select This Flight'}
                </button>
            </div>`;
            results.append(card);
        });
    }

    // Handles flight selection
    $(document).on("click", ".select-flight-btn", function () {
        const $btn = $(this);
        const originalText = $btn.html();

        // shows loading
        $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Checking availability...');

        const flightNo = $btn.data("flight-no");
        const flight = flights.find(f => f.flightNo === flightNo);

        if (!flight) {
            alert('Flight not found');
            $btn.prop('disabled', false).html(originalText);
            return;
        }

        if (!searchDate) {
            alert('Please select a date first');
            $btn.prop('disabled', false).html(originalText);
            return;
        }

        // Checks if there are available seats
        if (flight.availableSeats <= 0) {
            alert('Sorry, this flight is fully booked.');
            $btn.prop('disabled', false).html(originalText);
            return;
        }

        // Check if flight instance is available (not cancelled)
        if (flight.status === 'Cancelled') {
            alert(`This flight has been cancelled for ${new Date(searchDate).toLocaleDateString()}`);
            $btn.prop('disabled', false).html(originalText);
            return;
        }

        // REDIRECTION TO RESERVATION PAGE
        window.location.href = `/reservation/${flightNo}/${searchDate}`;
    });
});
