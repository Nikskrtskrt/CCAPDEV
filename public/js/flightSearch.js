$(function() {
  let flights = [];

  // APPLIED changes based on sirs request.. When origin changes, populate destinations
  $('#origin').on('change', function() {
    const origin = $(this).val();
    if (!origin) {
      $('#destination').html('<option value="">Select Destination</option>');
      return;
    }
    // Get destinations for selected origin
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

    let query = `/api/search?origin=${origin}&destination=${destination}`;
    if (date) query += `&date=${date}`;
    $.get(query, function(data) {
      flights = data;
      renderFlights(flights);
    }).fail(function() {
      alert('Failed to search flights. Please try again.');
    });
  });

  function renderFlights(list) {
    const results = $("#flightResults");
    results.empty();
    if (list.length === 0) {
      results.html('<div class="alert alert-warning text-center">No flights found for your search.</div>');
      return;
    }
    $.each(list, function(i, f) {
      // Using REAL database fields from Flight model
      const card = `
    <div class="card flight-card shadow mb-3" style="background-color: #2d3e50; color: white; border-radius: 15px; padding: 20px;">
        <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
        <div>
            <h5 class="card-title mb-0">Flight ${f.flightNo}</h5>
            <small class="text-warning">${f.aircraft}</small>
        </div>
        <div class="price" style="font-size: 1.1rem;">Capacity: ${f.capacity}</div>
        </div>
        <div class="row text-center mt-3">
        <div class="col">
            <h6>${f.origin}</h6>
            <p class="mb-0">${f.departure}</p>
        </div>
        <div class="col">
            <h6>${f.destination}</h6>
            <p class="mb-0">${f.arrival}</p>
        </div>
        </div>
        <button class="btn btn-success w-100 mt-3 next-button" data-id="${f._id}">Next</button>
        </div>`;
      results.append(card);
    });
  }

  $(document).on("click", ".next-button", function() {
    const id = $(this).data("id");
    const flight = flights.find(f => f._id === id);
    alert(`Proceeding to book ${flight.flightNo} from ${flight.origin} to ${flight.destination}`);
  });
});