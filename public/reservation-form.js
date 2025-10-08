const BASE_COST = 500;
const SEAT_PRICES = {
    "window": 50,
    "aisle": 25,
    "middle": 0,
}
const SEAT_TYPE = {
    'A': "window",
    'B': "middle",
    'C': "aisle",
    'D': "aisle",
    'E': "middle",
    'F': "window",
}
const MEAL_PRICES = {
    "standard": 50,
    "vegetarian": 100,
    "kosher": 150,
};

let seatData = {}

$(function() { //Note: Same as $(document).ready(function() {
    const reservationForm = $("#reservationForm")
    
    const inputFirstName = $("#firstName");
    const inputLastName = $("#lastName");
    const inputEmail = $("#email");
    const inputPassportNumber = $("#passportNumber");
    const selectMealOptions = $("#mealOptions");
    const seatMapContainer = $("#seatMapContainer");
    const checkBoxExtraBaggage = $("#extraBaggage");

    const summaryBaseCostElement = $("#summaryBaseCost");
    const summarySeatTypeCostElement = $("#summarySeatTypeCost");
    const summaryMealOptionCostElement = $("#summaryMealOptionCost");
    const summaryExtraBaggageCostElement = $("#summaryExtraBaggageCost");
    const totalCostElement = $("#totalCostLabel");
    const btnSubmit = $("#submitBtn");

    let selectedSeat = null;
    
    function unselectSelectedSeat() {
        if (selectedSeat === null)
            return;

        const oldSeatNumber = selectedSeat.data("seat-number");
        selectedSeat.removeClass("selected");
        selectedSeat = null;
    }

    function onSeatClick(seatElement) {
        const seatNumber = seatElement.data("seat-number");
        const curSeatData = seatData[seatNumber];
        const curStatus = curSeatData.status;
        console.log("Clicked " + seatNumber);

        if (curStatus != "available")
            return;
                        
        unselectSelectedSeat();
        selectedSeat = seatElement;
        seatElement.addClass("selected");
        updateSummary();

        console.log("selected");
    }

    function initializeSeats() {
        const TOTAL_ROWS = 5;
        const TOTAL_COLS = 6;
        const ROW_CLASS = "row justify-content-center seat-row";
        const COL_CLASS = "col-1 d-flex align-items-center justify-content-center";
        const BUFFER_CLASS = "col-1 aisle-buffer";
        
        //seatMapContainer.empty();
        for (let row = 1; row <= TOTAL_ROWS; row++) {
            const curRowElement = $("<div>").addClass(ROW_CLASS);
            seatMapContainer.append(curRowElement)

            for (let col = 1; col <= TOTAL_COLS; col++) {
                //ASCII of A is 65
                const letter = String.fromCharCode(64 + col);
                const seatNumber = `${row}${letter}`
                seatData[seatNumber] = {
                    'type': SEAT_TYPE[letter],
                    'status': "available" 
                }

                const curColElement = $("<div>").addClass(COL_CLASS);
                const seatDisplay = $("<div>")
                    .addClass("seat")
                    .addClass("available")
                    .text(seatNumber)
                    .data("seat-number", seatNumber);
                    //.data("seat-type", "Middle")
                    //.data("status", "available")
                
                seatDisplay.on("click", function() {
                    onSeatClick(seatDisplay);
                });
                
                curRowElement.append(curColElement.append(seatDisplay));

                //Create Buffer after 3rd seat
                if (col == 3) {
                    curRowElement.append(
                        $("<div>").addClass(BUFFER_CLASS)
                    );
                }
            }
        }
    }

    function getTotalCost() {
        const mealOptionValue = selectMealOptions.val().trim();
        const extraBaggageValue = checkBoxExtraBaggage.is(":checked");
        

        let totalCost = BASE_COST;
        
        if (selectedSeat !== null) {
            const seatNumber = selectedSeat.data("seat-number");
            const seatType = seatData[seatNumber].type
            totalCost += SEAT_PRICES[seatType]
        }

        totalCost += MEAL_PRICES[mealOptionValue] || 0;

        if (extraBaggageValue) {
            totalCost += 75;
        }

        return totalCost;
    }

    function updateSummary() {
        const mealOptionValue = selectMealOptions.val().trim();
        const extraBaggageValue = checkBoxExtraBaggage.is(":checked");

        summaryBaseCostElement.text(`$${BASE_COST}`);
        
        if (selectedSeat !== null) {
            const seatNumber = selectedSeat.data("seat-number");
            const seatType = seatData[seatNumber].type
            summarySeatTypeCostElement.text(`+$${SEAT_PRICES[seatType] || 0}`);
        } else {
            summarySeatTypeCostElement.text(`Please select a seat`);
        }
        
        summaryMealOptionCostElement.text(`+$${MEAL_PRICES[mealOptionValue] || 0}`);
        summaryExtraBaggageCostElement.text(`+$${(extraBaggageValue ? 75 : 0)}`);

        
        const totalCost = getTotalCost();
        totalCostElement.text(`Total Cost $${totalCost}`);
    }

    function onConfirm() {
        const firstName = inputFirstName.val().trim();
        const lastName = inputLastName.val().trim();
        const email = inputEmail.val().trim();
        const passportNumber = inputPassportNumber.val().trim();

        let errors = [];
        if (!firstName) errors.push("First name is required.");
        if (!lastName) errors.push("Last name is required.");
        if (!email) errors.push("Email is required.");
        if (!passportNumber) errors.push("Passport number is required.");
        if (errors.length > 0) {
            // $message.html("<div class="alert alert-danger">" + errors.join("<br>") + "</div>");
            alert("Errors:\n" + errors.join("\n"));
            return;
        }

        const totalCost = getTotalCost();

        // $message.html("<div class="alert alert-success">Registration successful!(client-side only)</div>");
        // $("#regForm")[0].reset();
        alert(`Reservation Confirmed!\n\n` +
          `Passenger: ${firstName} ${lastName}\n` +
          //`Seat: ${seatNumber} (${seatType} seat)\n` +
          `Total Cost: $${totalCost}\n\n` +
          `(This is a client-side demo)`);
        
        reservationForm.trigger("reset");
        unselectSelectedSeat();
    }

    selectMealOptions.on("change", updateSummary);
    checkBoxExtraBaggage.on("change", updateSummary);
    btnSubmit.on("click", onConfirm);
    initializeSeats();
    updateSummary(); //Sets up on load    
});