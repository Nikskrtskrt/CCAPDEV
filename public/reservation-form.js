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

        switch (mealOptionValue) {
            case "standard":
                totalCost += 50;
                break;
            case "vegetarian":
                totalCost += 100;
                break;
            case "kosher":
                totalCost += 150;
                break;
            default:
        }

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
            return;
        }

        // $message.html("<div class="alert alert-success">Registration successful!(client-side only)</div>");
        // $("#regForm")[0].reset();
        alert("Submitted! (client-side)");
    }

    selectMealOptions.on("change", updateTotalCost);
    checkBoxExtraBaggage.on("change", updateTotalCost);
    btnSubmit.on("click", onConfirm);
    updateTotalCost(); //Sets up on load    
});