const urlParams = new URLSearchParams(window.location.search);
const id = parseInt(urlParams.get('id'), 10);

const LAT_LNG_THRESHOLD = 0.5;

// two locations are nearby
function isNearby(lat1, lng1, lat2, lng2) {
    return Math.abs(lat1 - lat2) <= LAT_LNG_THRESHOLD && Math.abs(lng1 - lng2) <= LAT_LNG_THRESHOLD;
}

// Render related items as cards
function renderRelated(title, containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // clear previous content

    if (!items || items.length === 0) {
        container.innerHTML = `<p>No related instances found.</p>`;
        return;
    }

    items.forEach(item => {
        const attrs = item.attributes || item;
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100 shadow-sm">
                ${attrs.photo_url ? `<img src="${attrs.photo_url}" class="card-img-top" alt="${attrs.name || ''}">` : ''}
                <div class="card-body">
                    <h5 class="card-title">${attrs.name || 'Unknown Name'}</h5>
                    <p class="card-text">${attrs.address || 'No address available'}</p>
                    <p><strong>Category:</strong> ${attrs.category || 'N/A'}</p>
                    <a href="${attrs.website || '#'}" target="_blank" class="btn btn-primary btn-sm">Website</a>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

if (isNaN(id)) {
    document.getElementById('instance-card').innerHTML = "<p>Invalid instance ID</p>";
} else {
    fetch(`https://fosterfledging.me/api/counseling/${id}`, {
        headers: { 'Accept': 'application/vnd.api+json' }
    })
    .then(res => res.json())
    .then(item => {
        // Handle multiple possible JSON structures
        const attrs = item.data?.attributes || item.attributes || item;
        if (!attrs) {
            console.warn('Counseling attributes missing', item);
            document.getElementById('instance-card').innerHTML = "<p>Instance attributes missing</p>";
            return;
        }

        const instanceLat = parseFloat(attrs.lat);
        const instanceLng = parseFloat(attrs.lng);

        const container = document.getElementById('instance-card');
        container.innerHTML = `
            <div class="row g-3">
                <div class="col-md-6">
                    ${attrs.photo_url ? `<img src="${attrs.photo_url}" class="img-fluid rounded shadow-sm" alt="${attrs.name || ''}">` : ''}
                </div>
                <div class="col-md-6">
                    <h2>${attrs.name || 'Unknown Counseling Name'}</h2>
                    <p><strong>Address:</strong> ${attrs.address || 'No address available'}</p>
                    <p><strong>Lat/Lng:</strong> ${instanceLat || 'N/A'}, ${instanceLng || 'N/A'}</p>
                    <p><strong>Category:</strong> ${attrs.category || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${attrs.phone || 'N/A'}</p>
                    <p><strong>Website:</strong> <a href="${attrs.website || '#'}" target="_blank">${attrs.website || 'N/A'}</a></p>
                    <p><strong>Source:</strong> ${attrs.source || 'N/A'}</p>
                    <p><strong>Retrieved at:</strong> ${attrs.retrieved_at || 'N/A'}</p>
                </div>
            </div>
            <div class="mt-3">
                <iframe
                    width="100%"
                    height="300"
                    style="border:0"
                    loading="lazy"
                    allowfullscreen
                    referrerpolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDxdnMN98-DPS0W4TuaJwsiV0-3D6dIv4Y&q=${instanceLat},${instanceLng}">
                </iframe>
            </div>
        `;

        // fetch related housing
        fetch('https://fosterfledging.me/api/housing?page[size]=100', { headers: { 'Accept': 'application/vnd.api+json' } })
            .then(res => res.json())
            .then(data => {
                const allItems = Array.isArray(data.data) ? data.data : [data.data];
                const nearby = allItems.filter(i => {
                    const lat = parseFloat(i.attributes?.lat);
                    const lng = parseFloat(i.attributes?.lng);
                    return !isNaN(lat) && !isNaN(lng) && isNearby(instanceLat, instanceLng, lat, lng);
                });
                renderRelated('Nearby Housing', 'related-housing', nearby);
            })
            .catch(err => {
                console.error('Error fetching housing data:', err);
                renderRelated('Nearby Housing', 'related-housing', []);
            });

        // Fetch related organizations
        fetch('http://localhost:5000/api/organizations?page[size]=100', { headers: { 'Accept': 'application/vnd.api+json' } })
            .then(res => res.json())
            .then(data => {
                const allItems = Array.isArray(data.data) ? data.data : [data.data];
                const nearby = allItems.filter(i => {
                    const lat = parseFloat(i.attributes?.lat);
                    const lng = parseFloat(i.attributes?.lng);
                    return !isNaN(lat) && !isNaN(lng) && isNearby(instanceLat, instanceLng, lat, lng);
                });
                renderRelated('Nearby Organizations', 'related-organizations', nearby);
            })
            .catch(err => {
                console.error('Error fetching organizations data:', err);
                renderRelated('Nearby Organizations', 'related-organizations', []);
            });

    })
    .catch(err => {
        console.error('Error fetching counseling data:', err);
        document.getElementById('instance-card').innerHTML = "<p>Instance not found or error loading instance</p>";
    });
}
