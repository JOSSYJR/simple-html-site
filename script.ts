interface Comment {
    postId: number;
    id: number;
    name: string;
    email: string;
    body: string;
}

const searchInput = document.getElementById('search-input') as HTMLInputElement;
const resultsList = document.getElementById('results') as HTMLUListElement;

let debounceTimer: number;

function showLoading(): void {
    resultsList.innerHTML = '<li class="loading">Searching...</li>';
}

function showError(message: string): void {
    resultsList.innerHTML = `<li class="error">${message}</li>`;
}

function clearResults(): void {
    resultsList.innerHTML = '';
}

function displayResults(comments: Comment[]): void {
    if (comments.length === 0) {
        resultsList.innerHTML = '<li class="no-results">No matching comments found</li>';
        return;
    }

    resultsList.innerHTML = comments
        .map(comment => `
            <li class="comment">
                <h3 class="comment-name">${comment}</h3>
            </li>
        `)
        .join('');
}

searchInput?.addEventListener('input', async (e) => {
    const searchTerm = (e.target as HTMLInputElement).value.trim();
    
    // Clear previous results if search term is empty
    if (!searchTerm) {
        clearResults();
        return;
    }

    // Debounce to avoid too many requests
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(async () => {
        showLoading();
        
        try {
            const response = await fetch(`http://localhost:3001/?queryString=${encodeURIComponent(searchTerm)}`);            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const comments: Comment[] = await response.json();
            displayResults(comments);
        } catch (error) {
            console.error('Error fetching search results:', error);
            showError("Failed to load results. Please try again");
        }
    }, 300);
});














