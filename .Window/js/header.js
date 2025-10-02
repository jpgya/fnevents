document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');

    
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';


    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }

        
        link.addEventListener('click', (e) => {
            
            navLinks.forEach(l => l.classList.remove('active')); 
            e.target.classList.add('active');
        });
    });
});