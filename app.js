const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");
const loadingSpinner = document.getElementById("loading-spinner");

let currentPage = 1;
let booksPerPage = 16;
let booksData = [];

function showSpinner() {
    loadingSpinner.classList.remove("hidden");
}

function hideSpinner() {
    loadingSpinner.classList.add("hidden");
}

async function fetchBooks(query) {
    const startIndex = (currentPage - 1) * booksPerPage;
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
    )}&startIndex=${startIndex}&maxResults=${booksPerPage}`;
    
    showSpinner();
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch books");
        const data = await response.json();
        hideSpinner();

        if (!data.items || data.items.length === 0) {
            resultContainer.innerHTML = "<p>No books found</p>";
            paginationContainer.innerHTML = "";
            return;
        }

        booksData = data.items;
        displayBooks(data.totalItems);
    } catch (error) {
        hideSpinner();
        resultContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        paginationContainer.innerHTML = "";
    }
}

function displayBooks(totalItems) {
    resultContainer.innerHTML = "";
    booksData.forEach((book) => {
        const volumeInfo = book.volumeInfo;
        const bookCover = volumeInfo.imageLinks
            ? volumeInfo.imageLinks.thumbnail
            : "https://via.placeholder.com/150x200?text=No+Image";
        const bookElement = document.createElement("div");
        bookElement.className = "book-card";
        bookElement.innerHTML = `
            <img src="${bookCover}" alt="Book Cover">
            <h3>${volumeInfo.title}</h3>
            <p>${volumeInfo.authors ? volumeInfo.authors.join(", ") : "Unknown Author"}</p>
        `;
        resultContainer.appendChild(bookElement);
    });

    const maxPagesToShow = 5;
    displayPagination(totalItems, maxPagesToShow);
}

function displayPagination(totalItems, maxPagesToShow) {
    paginationContainer.innerHTML = "";
    const totalPages = Math.min(Math.ceil(totalItems / booksPerPage), 100); // Google Books API limit

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (currentPage > 1) {
        addPageButton('«', currentPage - 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i, i, i === currentPage);
    }

    if (currentPage < totalPages) {
        addPageButton('»', currentPage + 1);
    }
}

function addPageButton(text, pageNum, isActive = false) {
    const pageButton = document.createElement("button");
    pageButton.textContent = text;
    pageButton.className = isActive ? "active" : "";
    pageButton.addEventListener("click", () => {
        currentPage = pageNum;
        triggerSearch();
    });
    paginationContainer.appendChild(pageButton);
}

function triggerSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        resultContainer.innerHTML = "<p>Please enter a search term</p>";
        return;
    }
    fetchBooks(query);
}

// Search button event listener
searchButton.addEventListener("click", () => {
    currentPage = 1;  // Reset to first page on new search
    triggerSearch();
});

// Optional: Add enter key support
searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        currentPage = 1;
        triggerSearch();
    }
});