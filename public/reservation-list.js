
const reservations = [
  {
    id: '001',
    name: 'Nicole Serra',
    email: 'nicole.serra@example.com',
    passport: 'P1234567',
    flight: 'PR 456',
    airline: 'Philippine Airlines',
    departure: 'Manila (MNL) - Oct 10, 10:00 AM',
    arrival: 'Cebu (CEB) - Oct 10, 11:30 AM',
    seat: '12A (Window)',
    meal: 'Vegetarian',
    baggage: '10kg',
    total: '₱4,500',
    img: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Boeing_747-2F6B%2C_Philippine_Airlines_JP6183973.jpg'
  },
  {
    id: '002',
    name: 'John Cruz',
    email: 'john.cruz@example.com',
    passport: 'P7654321',
    flight: '5J 765',
    airline: 'Cebu Pacific',
    departure: 'Cebu (CEB) - Oct 12, 8:00 AM',
    arrival: 'Manila (MNL) - Oct 12, 9:30 AM',
    seat: '8C (Aisle)',
    meal: 'Standard',
    baggage: '5kg',
    total: '₱3,200',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/RP-C3908_%288_Oct_2024%29.jpg/1280px-RP-C3908_%288_Oct_2024%29.jpg'
  }
];

const bookingCards = document.getElementById('bookingCards');

reservations.forEach(res => {
  const col = document.createElement('div');
  col.classList.add('col-md-4');

  col.innerHTML = `
    <div class="card shadow-sm position-relative">
      <img src="${res.img}" class="card-img-top" alt="${res.flight}">
      
      <div class="position-absolute top-0 end-0 bg-white feature-bar py-3">
        <p><i class="bi bi-wifi"></i><br>In-flight WiFi</p>
        <p><i class="bi bi-cup-hot"></i><br>Meal: ${res.meal}</p>
        <p><i class="bi bi-suitcase2"></i><br>${res.baggage}</p>
      </div>

      <div class="card-body">
        <h5 class="card-title fw-bold">${res.airline}</h5>
        <p class="card-text text-muted">${res.flight} • ${res.departure.split(' - ')[0]} → ${res.arrival.split(' - ')[0]}</p>
        <p class="small text-secondary">${res.departure}<br>${res.arrival}</p>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="text-primary fw-bold fs-6">${res.total}</span>
          <button class="btn btn-select btn-sm" onclick="viewDetails('${res.id}')" data-bs-toggle="modal" data-bs-target="#bookingDetailsModal">
            View Details
          </button>
        </div>
      </div>
    </div>
  `;
  
  bookingCards.appendChild(col);
});

function viewDetails(id) {
  const booking = reservations.find(r => r.id === id);
  const details = `
    <p><strong>Passenger Name:</strong> ${booking.name}</p>
    <p><strong>Email:</strong> ${booking.email}</p>
    <p><strong>Passport Number:</strong> ${booking.passport}</p>
    <p><strong>Flight:</strong> ${booking.flight} (${booking.airline})</p>
    <p><strong>Seat:</strong> ${booking.seat}</p>
    <p><strong>Meal:</strong> ${booking.meal}</p>
    <p><strong>Extra Baggage:</strong> ${booking.baggage}</p>
    <p><strong>Total Price:</strong> ${booking.total}</p>
  `;
  document.getElementById('bookingDetailsBody').innerHTML = details;
}
