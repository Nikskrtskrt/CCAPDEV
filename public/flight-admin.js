$(function() {
    // Test Flight Data
    let flights = [
        { flightNo: "PAL420", origin: "Manila", destination: "Tokyo", departure: "2025-11-01T08:00", arrival: "2025-11-01T13:00", aircraft: "A320", capacity: 180 },
        { flightNo: "CEB6767", origin: "Cebu", destination: "Singapore", departure: "2025-11-02T09:00", arrival: "2025-11-02T12:30", aircraft: "B737", capacity: 150 }
    ];

    function renderTable() {
        let tbody = $("#flightTable tbody");
        tbody.empty();
        $.each(flights, function(i, f) {
            tbody.append(`
                <tr>
                <td>${f.flightNo}</td>
                <td>${f.origin}</td>
                <td>${f.destination}</td>
                <td>${f.departure.replace("T"," ")}</td>
                <td>${f.arrival.replace("T"," ")}</td>
                <td>${f.aircraft}</td>
                <td>${f.capacity}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn" data-index="${i}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-index="${i}">Delete</button>
                </td>
                </tr>
            `);
        });
    }
    //Adds flights to table
    renderTable();

    // Add Flights
    $("#addFlightBtn").click(function(){
        $("#modalTitle").text("Add Flight");
        $("flightForm")[0].reset();
        $("#editIndex").val("");
    });

    //Flight Saving
    $("#saveFlightBtn").click(function(){
        let flight = {
            flightNo: $("#flightNo").val(),
            origin: $("#origin").val(),
            destination: $("#destination").val(),
            departure: $("#departure").val(),
            arrival: $("#arrival").val(),
            aircraft: $("#aircraft").val(),
            capacity: $("#capacity").val()
        }

    let index = $("#editIndex").val();

    if (index === ""){
        flights.push(flight);
    }
    else{
        flights[index] = flight;
    }

    $("#flightModal").modal("hide");
        renderTable();
    }); 

    $(document).on("click", ".edit-btn", function(){
        let i = $(this).data("index");
        let f = flights[i];
        $("#modalTitle").text("Edit Flight");
        $("#flightNo").val(f.flightNo);
        $("#origin").val(f.origin);
        $("#destination").val(f.destination);
        $("#departure").val(f.departure);
        $("#aircraft").val(f.aircraft);
        $("#capacity").val(f.capacity);
        $("#editIndex").val(i);
        $("#flightModal").modal("show");
    });

    $(document).on("click", ".delete-btn", function(){
        let i = $(this).data("index");
        if(confirm("confirm delete this fligt?")){
            flights.splice(i,1);
            renderTable();
        }
    })
});