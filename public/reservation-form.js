document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservationForm');
    const selectMealOptions = document.getElementById('mealOptions');
    const checkBoxExtraBaggage = document.getElementById('extraBaggage');
    
    selectMealOptions.onchange = updateTotalCost;
    checkBoxExtraBaggage.onchange = updateTotalCost;
    

    function getTotalCost() {
        var totalCost = 0;

        switch (selectMealOptions.value) {
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

        if (checkBoxExtraBaggage.checked) {
            totalCost += 75;
        }

        return totalCost;
    }

    function updateTotalCost() {
        const totalCostElement = document.getElementById('totalCost');
        const totalCost = getTotalCost();
        totalCostElement.textContent = `Total Cost $${totalCost}`;
    }
});