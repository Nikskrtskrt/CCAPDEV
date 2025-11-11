$(function() {
  let flights = [];

  // APPLIED changes based on sirs request.. When origin changes, populate destinations
  $('#origin').on('change', function() {
    const origin = $(this).val();
    if (!origin) {
      $('#destination').html('<option value="">Select Destination</option>');
      return;
    }
    // Get destinations for selected origin, Ask server "What destinations are available from Manila?"
    $.get(`/api/search/destinations?origin=${origin}`, function(destinations) {
      let options = '<option value="">Select Destination</option>';
      destinations.forEach(dest => {
        options += `<option value="${dest}">${dest}</option>`;
      });
      $('#destination').html(options);
    }).fail(function() {
      alert('Failed to load destinations. Please try again.');
    });
  });

  $('#searchForm').on('submit', function(e) {
    e.preventDefault();
    const origin = $('#origin').val();
    const destination = $('#destination').val();
    const date = $('#departure').val();
    if (!origin || !destination) {
      alert('Please select both origin and destination');
      return;
    }
     if (!date) {
      alert('Please select a departure date');
      return;
    }

    let query = `/api/search?origin=${origin}&destination=${destination}`;
    if (date) query += `&date=${date}`;
    $.get(query, function(data) {
      flights = data;
      renderFlights(flights);
    }).fail(function(xhr) {
      const errorMsg = xhr.responseJSON?.error || 'Failed to search flights. Please try again.';
      alert(errorMsg);
    });
  });

  function renderFlights(list) {
    const results = $("#flightResults");
    results.empty();
    
    if (list.length === 0) {
      results.html('<div class="alert alert-warning text-center">No flights found for your search criteria.</div>');
      return;
    }

    $.each(list, function(i, f) {
      // Format date
      const flightDate = new Date(f.date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });

      // Use formatted times from API or format here
      const depTime = f.departureTimeFormatted || new Date(f.departureTime).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      const arrTime = f.arrivalTimeFormatted || new Date(f.arrivalTime).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      const card = `
        <div class="card flight-card shadow mb-3" style="background-color: #2d3e50; color: white; border-radius: 15px; padding: 20px;">
          <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
            <div>
              <h5 class="card-title mb-0">Flight ${f.flightNo}</h5>
              <small class="text-warning">${f.aircraft}</small>
            </div>
            <div class="price" style="font-size: 1.1rem;">
              <span class="badge bg-success">${f.availableSeats} seats available</span>
            </div>
          </div>
          
          <div class="text-center mb-2">
            <small class="text-muted">${flightDate}</small>
          </div>

          <div class="row text-center mt-3">
            <div class="col">
              <h6>${f.origin}</h6>
              <p class="mb-0">${depTime}</p>
            </div>
            <div class="col-2 d-flex align-items-center justify-content-center">
              <i class="bi bi-airplane" style="font-size: 1.5rem;"></i>
            </div>
            <div class="col">
              <h6>${f.destination}</h6>
              <p class="mb-0">${arrTime}</p>
            </div>
          </div>

          <div class="text-center mt-2">
            <small class="text-info">Capacity: ${f.capacity} seats</small>
          </div>

          <button class="btn btn-success w-100 mt-3 next-button" data-instance-id="${f.instanceId}" data-flight-no="${f.flightNo}">
            Book Now
          </button>
        </div>`;
      
      results.append(card);
    });
  }

  // Handle booking button click - now uses instanceId
  $(document).on("click", ".next-button", function() {
    const instanceId = $(this).data("instance-id");
    const flightNo = $(this).data("flight-no");
    const flight = flights.find(f => f.instanceId === instanceId);
    
    if (!flight) {
      alert('Flight data not found');
      return;
    }

    // Store flight data in sessionStorage for booking page
    sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
    
    // REDIRECTING TO to booking page - connected to reservations
    window.location.href = `/reservations/${flightNo}`;
    
  });
});
