$(function() {
    let flights = [];
    function loadFlights() {
    $.get('/api/flights', function(data) {
        flights = data;
        renderTable();
        });
    }

    function renderTable() {
        let tbody = $("#flightTable tbody");
        tbody.empty();
        $.each(flights, function(i, f) {
        tbody.append(`
        <tr>
            <td>${f.flightNo}</td>
            <td>${f.origin}</td>
            <td>${f.destination}</td>
            <td>${f.departure}</td>
            <td>${f.arrival}</td>
            <td>${f.aircraft}</td>
            <td>${f.capacity}</td>
            <td>
                <button class="btn btn-warning btn-sm edit-btn" data-id="${f._id}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${f._id}">Delete</button>
            </td>
            </tr>
        `);
    });
    }
    loadFlights();

    $("#addFlightBtn").click(function(){
        $("#modalTitle").text("Add Flight");
        $("#flightForm")[0].reset();
        $("#editIndex").val("");
    });

    $("#saveFlightBtn").click(function(){
    let flight = {
        flightNo: $("#flightNo").val(),
        origin: $("#origin").val(),
        destination: $("#destination").val(),
        departure: $("#departure").val(),
        arrival: $("#arrival").val(),
        aircraft: $("#aircraft").val(),
        capacity: parseInt($("#capacity").val())
        };

    let id = $("#editIndex").val();

    if (id === "") {
        $.post('/api/flights', flight, function() {
        $("#flightModal").modal("hide");
        loadFlights();
        });} else {
        $.ajax({ url: '/api/flights/' + id, type: 'PUT', contentType: 'application/json', data: JSON.stringify(flight),
            success: function() {
            $("#flightModal").modal("hide");
            loadFlights();
                }
            });
        }
    }); 

    $(document).on("click", ".edit-btn", function(){
        let id = $(this).data("id");
        $.get('/api/flights/' + id, function(f) {
            $("#modalTitle").text("Edit Flight");
            $("#flightNo").val(f.flightNo);
            $("#origin").val(f.origin);
            $("#destination").val(f.destination);
            $("#departure").val(f.departure);
            $("#arrival").val(f.arrival);
            $("#aircraft").val(f.aircraft);
            $("#capacity").val(f.capacity);
            $("#editIndex").val(id);
            $("#flightModal").modal("show");
        });
    });

    $(document).on("click", ".delete-btn", function(){
        let id = $(this).data("id");
        if(confirm("Confirm delete this flight?")){
        $.ajax({url: '/api/flights/' + id, type: 'DELETE', success: function() {
                loadFlights();
                }
            });
        }
    });
});