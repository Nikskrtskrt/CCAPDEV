const seatPrices = {
    "window": 50,
    "aisle": 25,
    "middle": 0
}

const mealPrices = {
    "standard": 50,
    "vegetarian": 100,
    "kosher": 150
};

$(function() { //Note: Same as $(document).ready(function() {
    const inputFirstName = $("#firstName");
    const inputLastName = $("#lastName");
    const inputEmail = $("#email");
    const inputPassportNumber = $("#passportNumber");
    const selectMealOptions = $("#mealOptions");
    const checkBoxExtraBaggage = $("#extraBaggage");
    const totalCostElement = $("#totalCost");
    const btnSubmit = $("#submitBtn");
    
    function getTotalCost() {
        const mealOptionValue = selectMealOptions.val().trim();
        const extraBaggageValue = checkBoxExtraBaggage.is(":checked");
        const baseCost = 500;
        let totalCost = baseCost;

        totalCost += mealPrices[mealOptionValue] || 0;

        if (extraBaggageValue) {
            totalCost += 75;
        }

        return totalCost;
    }

    function updateTotalCost() {
        const totalCost = getTotalCost();
        //totalCostElement.textContent = `Total Cost $${totalCost}`;
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
    }

    selectMealOptions.on("change", updateTotalCost);
    checkBoxExtraBaggage.on("change", updateTotalCost);
    btnSubmit.on("click", onConfirm);
    updateTotalCost(); //Sets up on load    
});