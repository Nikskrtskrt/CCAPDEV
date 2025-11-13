$(document).ready(function() {
let flights = [];
let searchDate = null;

    // BASED ON SIRS SUGGESTION: When origin changes, populate destinations
$('#origin').on('change', function() {
    const origin = $(this).val();
    if (!origin) {
            $('#destination').html('<option value="">Select Destination</option>');
            return;
        }

    // Get destinations for selected origin
    $.ajax({
    url: `/api/search/destinations?origin=${origin}`,
    method: 'GET',
            success: function(destinations) {
                let options = '<option value="">Select Destination</option>';
                destinations.forEach(dest => {
                    options += `<option value="${dest}">${dest}</option>`;
                });
                $('#destination').html(options);
            },
            error: function() {
                alert('Failed to load destinations. Please try again.');
            }
        });
    });

    // Handles the search form submission
    $('#searchForm').on('submit', function(e) {
        e.preventDefault();

        const origin = $('#origin').val();
        const destination = $('#destination').val();
        searchDate = $('#departure').val();

    if (!origin || !destination) {
        alert('Please select both origin and destination');
            return;
        }

    if (!searchDate) {
        alert('Please select a departure date to search for available flights');
            return;
        }

        let query = `/api/search?origin=${origin}&destination=${destination}`;
        if (searchDate) query += `&date=${searchDate}`;

        // Show loading state
        $('#flightResults').html(`
            <div class="text-center text-light py-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Searching for flights...</p>
            </div>
        `);

        $.ajax({
        url: query,
        method: 'GET',
        success: function(data) {
            flights = data;
            renderFlights(flights);
        },
            error: function() {
                $('#flightResults').html(`
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Failed to search flights. Please try again.
                    </div>
                `);
            }
        });
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
            Available Flights (${list.length})
        </h4>`);

        // Rendering each flight card
        $.each(list, function(i, f) {
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
                        <h4 class="text-warning mb-1">${f.departure}</h4>
                        <small class="text-muted">${new Date(searchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small>
                        </div>

                        <!-- Arrow -->
                        <div class="col-4">
                        <i class="bi bi-arrow-right text-warning" style="font-size: 2rem;"></i>
                        </div>

                        <!-- Arrival -->
                        <div class="col-4">
                        <h2 class="mb-1 fw-bold">${f.destination}</h2>
                        <h4 class="text-warning mb-1">${f.arrival}</h4>
                        <small class="text-muted">${new Date(searchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small>
                        </div>
                    </div>

                    <!-- Additional Flight Info -->
                    <div class="mt-3 pt-3" style="border-top: 1px solid rgba(255,255,255,0.1);">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <small class="text-muted">
                                <i class="bi bi-calendar3 me-2"></i>
                                <strong>Operates:</strong> ${f.daysOfWeek.join(', ')}
                                </small>
                            </div>
                            <div class="col-md-6">
                                <small class="text-muted">
                                <i class="bi bi-people-fill me-2"></i>
                                <strong>Capacity:</strong> ${f.capacity} seats
                                </small>
                            </div>
                        </div>
                    </div>

                    <!-- Select Button -->
                    <button class="btn btn-success select-flight-btn" 
                            data-flight-id="${f._id}" 
                            data-flight-no="${f.flightNo}">
                        Next - Select This Flight
                </button>
            </div>`;
            results.append(card);
        });
    }

    // Handle flight selection, Find specific instance for the date
$(document).on("click", ".select-flight-btn", function() {
    const $btn = $(this);
    const originalText = $btn.html();
        
        // show loading
        $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Checking availability...');

        const flightNo = $btn.data("flight-no");
        const flightId = $btn.data("flight-id");
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

        // Find the specific FlightInstance for this template and date
    $.ajax({
        url: `/api/search/instances/${flightNo}?date=${searchDate}`,
        method: 'GET',
        success: function(instances) {
            if (instances.length === 0) {
                alert(`No available flight instance found for ${flightNo} on ${new Date(searchDate).toLocaleDateString()}`);
                    $btn.prop('disabled', false).html(originalText);
                    return;
                }

                // Get the first instance (should only be one per day per flight)
                const instance = instances[0];
                
                // Check if flight instance is available (not cancelled)
                if (instance.status === 'Cancelled') {
                    alert(`This flight has been cancelled for ${new Date(searchDate).toLocaleDateString()}`);
                    $btn.prop('disabled', false).html(originalText);
                    return;
                }

                // Check if there are available seats
                const availableSeats = instance.seats;
                if (availableSeats <= 0) {
                    alert(`Sorry, this flight is fully booked.`);
                    $btn.prop('disabled', false).html(originalText);
                    return;
                }
                
                // REDIRECTION TO RESERVATION PAGE
                window.location.href = `/reservation/${flightNo}?instanceId=${instance._id}&date=${searchDate}`;
        },
            error: function(xhr) {
                console.error('Error checking availability:', xhr);
                alert('Failed to check flight availability. Please try again.');
                $btn.prop('disabled', false).html(originalText);
            }
        });
    });
});
