let currentPage = 1;
const cardsPerPage = 9; 
let totalPages = 1;
let data = [];
const container = document.getElementById('housing-cards');
const pagination = document.getElementById('pagination-controls');
const totalSpan = document.getElementById('total-instances');

function fetchPage(page) {
  fetch(`https://fosterfledging.me/api/housing?page[size]=${cardsPerPage}&page[number]=${page}`, {
    headers: { 'Accept': 'application/vnd.api+json' }
  })
    .then(response => response.json())
    .then(apiData => {
      data = apiData.data || [];
      totalPages = Math.ceil(apiData.meta.total / cardsPerPage);

      if (totalSpan) totalSpan.textContent = apiData.meta.total;

      renderPage();
      renderPagination();
    })
    .catch(err => console.error('Error fetching housing data:', err));
}

function renderPage() {
  container.innerHTML = '';
  data.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${item.attributes.photo_url || ''}" class="card-img-top" alt="${item.attributes.name || ''}">
        <div class="card-body">
          <h5 class="card-title">${item.attributes.name || 'Unknown Housing Name'}</h5>
          <p class="card-text">${item.attributes.address || 'No address available'}</p>
          <a href="housing_instance.html?id=${item.id}" class="btn btn-primary mb-2">View Details</a>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

function renderPagination() {
  pagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', e => {
      e.preventDefault();
      currentPage = i;
      fetchPage(currentPage); 
    });
    pagination.appendChild(li);
  }
}

fetchPage(currentPage);

