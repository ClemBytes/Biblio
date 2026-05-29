function compCol(col_nb, isNumber, tra, trb) {
    let a;
    let b;
    if (isNumber) {
        a = Number(tra.children[col_nb].innerText);
        b = Number(trb.children[col_nb].innerText);
    } else {
        a = tra.children[col_nb].innerText;
        b = trb.children[col_nb].innerText;
    }
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    }
    return 0;
}

function compTitles(tra, trb) {
    return compCol(1, false, tra, trb);
}

function compTitlesR(tra, trb) {
    return compCol(1, false, trb, tra);
}

function compAuthors(tra, trb) {
    return compCol(2, false, tra, trb);
}

function compAuthorsR(tra, trb) {
    return compCol(2, false, trb, tra);
}

function compGenres(tra, trb) {
    return compCol(3, false, tra, trb);
}

function compGenresR(tra, trb) {
    return compCol(3, false, trb, tra);
}

function compYears(tra, trb) {
    return compCol(4, true, tra, trb);
}

function compYearsR(tra, trb) {
    return compCol(4, true, trb, tra);
}

function compInitialState(tra, trb) {
    const a = Number(tra.dataset.bookIndex);
    const b = Number(trb.dataset.bookIndex);
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    }
    return 0;
}

function sortTableInitialState() {
    let rows = Array.from(document.getElementById("ma-table").children);

    rows.sort(compInitialState);

    document.getElementById("ma-table").replaceChildren(...rows);
}

function sortTableOrdered(colName) {
    let rows = Array.from(document.getElementById("ma-table").children);

    if (colName === "titles") {
        rows.sort(compTitles);
    } else if (colName === "authors") {
        rows.sort(compAuthors);
    } else if (colName === "genres") {
        rows.sort(compGenres);
    } else if (colName === "years") {
        rows.sort(compYears);
    }

    document.getElementById("ma-table").replaceChildren(...rows);
}

function sortTableReversed(colName) {
    let rows = Array.from(document.getElementById("ma-table").children);

    if (colName === "titles") {
        rows.sort(compTitlesR);
    } else if (colName === "authors") {
        rows.sort(compAuthorsR);
    } else if (colName === "genres") {
        rows.sort(compGenresR);
    } else if (colName === "years") {
        rows.sort(compYearsR);
    }

    document.getElementById("ma-table").replaceChildren(...rows);
}

function beOrdered(id) {
    let sortTh = document.getElementById(id + "-title");
    sortTh.dataset.sortstate = "ordered";
    document.getElementById("nosort-" + id).classList.add("d-none");
    document.getElementById("ordered-" + id).classList.remove("d-none");
    document.getElementById("reversed-" + id).classList.add("d-none");
}

function beReversed(id) {
    let sortTh = document.getElementById(id + "-title");
    sortTh.dataset.sortstate = "reversed";
    document.getElementById("nosort-" + id).classList.add("d-none");
    document.getElementById("ordered-" + id).classList.add("d-none");
    document.getElementById("reversed-" + id).classList.remove("d-none");
}

function beUndefined(id) {
    let sortTh = document.getElementById(id + "-title");
    sortTh.dataset.sortstate = "undefined";
    document.getElementById("nosort-" + id).classList.remove("d-none");
    document.getElementById("ordered-" + id).classList.add("d-none");
    document.getElementById("reversed-" + id).classList.add("d-none");
}

// Initialize sort states
const all_ids = ["titles", "authors", "genres", "years"];
for (const id of all_ids) {
    beUndefined(id);
}

function updateSortState(id) {
    let sortTh = document.getElementById(id + "-title");

    if (sortTh.dataset.sortstate === "undefined") {
        // undefined -> ORDERED
        beOrdered(id);
        for (const other_id of all_ids) {
            if (other_id !== id) {
                beUndefined(other_id);
            }
        }
        sortTableOrdered(id);
    } else if (sortTh.dataset.sortstate === "ordered") {
        // ordered -> REVERSED
        beReversed(id);
        for (const other_id of all_ids) {
            if (other_id !== id) {
                beUndefined(other_id);
            }
        }
        sortTableReversed(id);
    } else if (sortTh.dataset.sortstate === "reversed") {
        // reversed -> UNDEFINED
        beUndefined(id);
        sortTableInitialState();
    }
}

// Max number of authors showed
const max_authors = 3;

// Initialize boxes view
const boxComic = document.getElementById("comic-check");
boxComic.checked = false;
boxComic.indeterminate = true;

const boxRead = document.getElementById("read-check");
boxRead.checked = false;
boxRead.indeterminate = true;

function updateCheck(event, id) {
    event.preventDefault();

    let box = document.getElementById(id);

    if (box.dataset.state === "unchecked") {
        // ☐ → -
        box.checked = false;
        box.indeterminate = true;
        box.dataset.state = "indeterminate";
    } else if (box.dataset.state === "indeterminate") {
        // - → 🗹
        box.checked = true;
        box.indeterminate = false;
        box.dataset.state = "checked";
    } else if (box.dataset.state === "checked") {
        // 🗹 → ☐
        box.checked = false;
        box.indeterminate = false;
        box.dataset.state = "unchecked";
    }

    updateTable();
}

function filter_checks(box, book_info) {
    if (box === "unchecked") {
        // ☐
        if (book_info) {
            return false;
        }
    } else if (box === "checked") {
        // 🗹
        if (!book_info) {
            return false;
        }
    }

    return true;
}

function filter_book(book) {
    // Titles
    if (!book["title"].toLowerCase().includes(document.getElementById("title-search").value.toLowerCase())) {
        return false;
    }

    // Authors
    const author_filter = document.getElementById("authors-search").value.toLowerCase();
    if (!book["authors"].some((author) => author.toLowerCase().includes(author_filter))) {
        return false;
    }

    // Genres
    const genres_filter = document.getElementById("genres-search").value.toLowerCase();
    if (!book["genres"].some((genre) => genre.toLowerCase().includes(genres_filter))) {
        return false;
    }

    // Year
    const book_year = book["publication_year"];
    const year_filter_inf_str = document.getElementById("year-search-inf").value;
    const year_filter_inf = Number(year_filter_inf_str);
    if (year_filter_inf_str !== "") {
        if ((book_year === null) || (book_year < year_filter_inf)) {
            return false;
        }
    }

    const year_filter_sup_str = document.getElementById("year-search-sup").value;
    const year_filter_sup = Number(year_filter_sup_str);
    if (year_filter_sup_str !== "") {
        if ((book_year === null) || (book_year > year_filter_sup)) {
            return false;
        }
    }

    // Comic and read
    const boxComicState = document.getElementById("comic-check").dataset.state;
    const boxReadState = document.getElementById("read-check").dataset.state;

    return filter_checks(boxComicState, book["comic"]) && filter_checks(boxReadState, book["read"]);
}

let books;
let filteredBooks;

function updateTable() {
    const maTable = document.getElementById("ma-table");
    const started = Date.now();
    let nbBooks = 0;
    for (const child of maTable.children) {
        const bookIndex = Number(child.dataset.bookIndex);
        const show = filter_book(books[bookIndex]);
        child.classList.toggle("d-none", !show);
        if (show) {
            nbBooks += 1;
        }
    }
    document.getElementById("footer").innerText = nbBooks.toString();
    const elapsed = Date.now() - started;
    console.log(elapsed);
}

function filterWishlist(kind) {
    if (kind === "possessed") {
        return books.filter(book => book.owned);
    } else if (kind === "wishlist") {
        return books.filter(book => !book.owned);
    }
}

function changeTab(tabName) {
    const tab = document.getElementById(tabName + "-tab");
    if (tab.classList.contains("active")) {
        return;
    }

    let otherTab;
    if (tabName === "possessed") {
        otherTab = document.getElementById("wishlist-tab");
    } else if (tabName === "wishlist") {
        otherTab = document.getElementById("possessed-tab");
    }

    tab.classList.toggle("active");
    tab.classList.toggle("inactive");
    otherTab.classList.toggle("active");
    otherTab.classList.toggle("inactive");

    createTable(tabName);
    updateTable();
}

function updateModal(bookIndex) {
    const book = filteredBooks[bookIndex];
    const isbn = book["isbn"];
    const title = book["title"];
    const authors = book["authors"];
    const genres = book["genres"];
    const book_year = book["publication_year"];
    const comic = book["comic"];
    const read = book["read"];

    const modalTitle = document.getElementById("modalTitle");
    modalTitle.innerText = title;

    const modalBody = document.getElementById("modalBody");
    modalBody.innerHTML = "" +
        "<img alt='cover' src=\"https://covers.openlibrary.org/b/ISBN/" + isbn + "-L.jpg\">" +
        "<div>Auteur/autrice(s) : " + authors.join(', ') + "</div>" +
        "<div>Genre(s) : " + genres.join(', ') + "</div>" +
        "<div>Publié en : " + book_year + "</div>" +
        "<div>BD ? " + comic + "</div>" +
        "<div>Lu ? " + read + "</div>";
}

function createTable(kind) {
    if (books === undefined) {
        return;
    }
    filteredBooks = filterWishlist(kind);

    const maTable = document.getElementById("ma-table");

    const started = Date.now();
    let newTable = [];

    for (let [i, book] of filteredBooks.entries()) {
        newTable.push("<tr data-book-index='", i, "' data-bs-toggle=\"modal\" data-bs-target=\"#modalBox\" onclick=\"updateModal(" + i + ")\">");
        {
            newTable.push("<td>");
            const isbn = book["isbn"];
            newTable.push(
                "<img alt='cover' loading=\"lazy\" src=\"https://covers.openlibrary.org/b/ISBN/",
                isbn,
                "-S.jpg\" height='58px'>",
                "</a>",
                "</td>",
            );
        }
        newTable.push(
            "<td>",
            book["title"],
            "</td>",
        );
        {
            const all_authors = book["authors"];
            newTable.push(
                "<td title=\"",
                all_authors.join(', '),
                "\">"
            );
            if (all_authors.length > max_authors) {
                newTable.push(
                    all_authors.slice(0, max_authors).join(', '),
                    ", …"
                );
            } else {
                newTable.push(all_authors.join(', '));
            }
            newTable.push("</td>");
        }
        newTable.push(
            "<td>",
            book["genres"].join(", "),
            "</td>",
            "<td>",
            book["publication_year"],
            "</td>",
        );
        {
            const is_comic = book["comic"];
            newTable.push("<td>");
            if (is_comic) {
                newTable.push("<input class=\"form-check-input\" type=\"checkbox\" value=\"\" id=\"checkCheckedDisabled\" aria-label=\"Not BD\" checked disabled>");
            } else {
                newTable.push("<input class=\"form-check-input\" type=\"checkbox\" value=\"\" id=\"checkDisabled\" aria-label=\"BD\" disabled>");
            }
            newTable.push("</td>");
        }
        {
            const is_read = book["read"];
            newTable.push("<td>");
            if (is_read) {
                newTable.push("<input class=\"form-check-input\" type=\"checkbox\" value=\"\" id=\"checkCheckedDisabled\" aria-label=\"Not Lu\" checked disabled>");
            } else {
                newTable.push("<input class=\"form-check-input\" type=\"checkbox\" value=\"\" id=\"checkDisabled\" aria-label=\"Lu\" disabled>");
            }
            newTable.push("</td>");
        }

        newTable.push("</tr>");
    }

    maTable.innerHTML = newTable.join("");

    const elapsed = Date.now() - started;
    console.log(elapsed);
}

async function main() {
    const response = await fetch("books.json");
    books = await response.json();
    createTable("possessed");
    updateTable();
}

main().then();