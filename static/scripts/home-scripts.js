// --------------------- REDIRECT CODE -----------------------

function redirect(page) {
    fetch('/redirect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page: page })
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// -------------------------------------------------------------

function showTagline() {
    setTimeout(function() {
        var taglineDiv = document.getElementById('tagline');
        taglineDiv.style.color = '#12372A';
    }, 1000); 
}

showTagline()