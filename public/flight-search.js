document.getElementById('flightForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = document.getElementById('flightForm');
    const resultsDiv = document.getElementById('flightResults');
    form.classList.add('slide-right');
    resultsDiv.classList.add('slide-in');
});

document.querySelectorAll('.flight-card').forEach(card => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.flight-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
    });
});
