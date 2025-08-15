// Object to store preloaded pages
const preloadedPages = {};

// Preload all pages with data-preload attribute
document.querySelectorAll('[data-preload]').forEach(link => {
    const url = link.getAttribute('href');

    fetch(url)
        .then(res => res.text())
        .then(html => {
            preloadedPages[url] = html;
        });
});

// Intercept clicks on preloaded links
document.addEventListener('click', e => {
    const link = e.target.closest('[data-preload]');
    if (!link) return;

    e.preventDefault();
    const url = link.getAttribute('href');

    if (preloadedPages[url]) {
        // Extract only the <main> content from the preloaded page
        const parser = new DOMParser();
        const doc = parser.parseFromString(preloadedPages[url], 'text/html');
        const newContent = doc.querySelector('main').innerHTML;

        document.querySelector('#content').innerHTML = newContent;
        history.pushState({}, '', url);
    } else {
        // If not preloaded yet, just navigate normally
        window.location.href = url;
    }
});

// Handle back/forward navigation
window.addEventListener('popstate', () => {
    window.location.reload();
});
