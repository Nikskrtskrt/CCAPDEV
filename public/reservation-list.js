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
  col.classList.add('col-12', 'col-lg-6');

  col.innerHTML = `
    <div class="card booking-card shadow-sm border-0 d-flex flex-row align-items-stretch mb-4">
      <!-- Image + top-right feature box -->
      <div class="position-relative flex-shrink-0" style="width: 50%;">
        <img src="${res.img}" class="img-fluid h-100 object-fit-cover rounded-start" alt="${res.flight}">
      </div>

      <!-- Card Body -->
      <div class="card-body d-flex flex-column justify-content-between bg-white text-dark rounded-end">
        <div>
          <h5 class="fw-bold mb-1">${res.airline}</h5>
          <p class="text-muted mb-1">${res.flight} • ${res.departure.split(' - ')[0]} → ${res.arrival.split(' - ')[0]}</p>
          <p class="small mb-3">${res.departure}<br>${res.arrival}</p>
        </div>

        <div class="price-button-row">
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
