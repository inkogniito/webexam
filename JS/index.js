const api_key = "f4939284-4831-4d26-9348-77ec6318558b";
let routes;
let filtredroutes;
let gids;
let filtredGids;
let currentPage = 1;
let itemsPerPage = 5;
const pagesToShow = 7;
let selrouteID = -1;

//МАРШРУТЫ
//загрузка маршрутов с сервера
async function fetchRoutes() {
    const routesUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes');
    routesUrl.searchParams.set('api_key', api_key);
    try {
        const response = await fetch(routesUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        showAlert(error.message, 'alert-danger');
    }
}

//отображение маршрутов
function displayRoutes() {
    const routesTableBody = document.querySelector('#routesTable tbody');
    routesTableBody.innerHTML = '';

    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;

    const displayedRoutes = filtredroutes.slice(startIndex, endIndex);

    displayedRoutes.forEach(route => {
        const row = `
            <tr class="route-row"> 
                <td class="text-center">
                    <h5>${route.name}</h5>
                    <button class="btn btn-primary btn-route-sel" data-routeid="${route.id}" data-routename="${route.name}">Записаться</button>
                </td>
                <td>${route.description}</td>
                <td>${route.mainObject}</td>
            </tr>
        `;
        routesTableBody.innerHTML += row;
    });
}

//выбор маршрута
function selectRoute() {
    // Получаем все кнопки с классом .btn-route-sel
    const buttons = document.querySelectorAll('.btn-route-sel');

    // Добавляем обработчик событий для каждой кнопки
    buttons.forEach(button => {
        button.addEventListener('click', event => {
            // Находим родительскую строку (tr) кнопки
            let routeRow = event.target.closest('.route-row');

            // Удаляем класс 'selected-route' у всех строк
            document.querySelectorAll('.route-row').forEach(row => {
                row.classList.remove('table-success');
            });

            // Добавляем класс 'selected-route' к строке, содержащей нажатую кнопку
            routeRow.classList.add('table-success');
            selrouteID = button.dataset.routeid;
            loadAndDisplayGids();
        });
    });
}
//формирование таблицы маршрутов
function loadAndDisplayRoutes() {
    fetchRoutes().then(data => {
        routes = data;
        filtredroutes = routes;
        displayRoutes();
        renderPagination();
        fillRouteFilterOptions();
    });
}

//пагинация маршрутов
function renderPagination() {
    const totalPages = Math.ceil(routes.length / itemsPerPage);
    const paginationElement = document.querySelector('#pagination');
    paginationElement.innerHTML = '';

    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        const link = document.createElement('a');
        link.classList.add('page-link');
        link.textContent = i;
        link.href = '#';
        if (i === currentPage) {
            li.classList.add('active');
        }
        li.appendChild(link);
        paginationElement.appendChild(li);

        link.addEventListener('click', function (event) {
            event.preventDefault();
            currentPage = i;
            displayRoutes();
            renderPagination();
        });
    }
    selectRoute();
}

//заполнение выпадающего списка
const fillRouteFilterOptions = () => {
    let selectElement = document.querySelector('.form-select');
    selectElement.innerHTML = '';
    const uniqueNames = new Set();
    selectElement.appendChild(createOption("Не выбрано"));
    routes.forEach(route => {
        const names = extractObjects(route.mainObject);
        names.forEach(name => {
            uniqueNames.add(name);
        });
    });
    uniqueNames.forEach(name => {
        selectElement.appendChild(createOption(name));
    });
}

//создание элемента
const createOption = (content) => {
    const option = document.createElement('option');
    option.value = content;
    option.text = content;
    return option;
}

//формирование списка обьектов для опций
const extractObjects = (inputString) => {
    const matches = inputString.match(/«([^»]{1,20})»/g) || [];
    return matches.map(match => match.slice(1, -1));
}

//фильтрация маршрутов
const filterRoutes = () => {
    const searchValue = document.getElementById('routes-search').value.toLowerCase().trim();
    const selectedWord = document.querySelector('.form-select').value;
    if (searchValue.length === 0 && selectedWord === "Не выбрано") {
        filtredroutes = routes;
    } else {
        filtredroutes = routes.filter(route =>
            (route.name.toLowerCase().includes(searchValue) || searchValue.length === 0) &&
            (route.mainObject.includes(selectedWord) || selectedWord === "Не выбрано")
        );
        if (filtredroutes.length === 0) {
            showAlert("Извините, маршрутов с такими критериями не найдено", 'alert-warning');
        }
    }
    currentPage = 1;
    displayRoutes();
    renderPagination();
}
document.getElementById('searchIcon').onclick = filterRoutes;
document.querySelector('.form-select').onchange = filterRoutes;

//ГИДЫ

//загрузка списка гидов
async function fetchGids() {
    const gidUrl = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${selrouteID}/guides`);
    gidUrl.searchParams.set('api_key', api_key);
    try {
        const response = await fetch(gidUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        showAlert(error.message, 'alert-danger');
    }
}

//отображение гидов
function displayGids() {
    const gidtableBody = document.querySelector('#guidesTable tbody');
    gidtableBody.innerHTML = '';

    filtredGids.forEach(gid => {
        const row = `
            <tr>
                <td class = 'd-flex align-items-center justify-content-around'>
                    <button class="btn btn-primary btn-gid-sel" data-guid-id="${gid.id}" data-guid-name="${gid.name}" data-guid-price="${gid.pricePerHour}" 
                    data-bs-toggle="modal" data-bs-target="#reservationModal">Выбрать</button>
                </td>
                <td>${gid.name}</td>
                <td>${gid.language}</td>
                <td>${gid.workExperience}</td>
                <td>${gid.pricePerHour}</td>
            </tr>
        `;
        gidtableBody.innerHTML +=row;
    });
    document.getElementById('gidtable').style.display = 'block';

    document.querySelectorAll('.btn-gid-sel').forEach(btn => {
        btn.onclick = () => {

        };
    });
}

//формирование таблицы гидов
function loadAndDisplayGids() {
    fetchGids().then(data => {
        gids = data;
        filtredGids = gids;
        displayGids();
        fillLanguageFilterOptions();
    });
}

// Заполнение выпадающего списка языка гида
const fillLanguageFilterOptions = () => {
    let selectElement = document.getElementById('languageFilter');
    selectElement.innerHTML = '';
    const uniqueLanguages = new Set();
    selectElement.appendChild(createLanguageOption("Не выбрано"));
    gids.forEach(gid => {
        uniqueLanguages.add(gid.language);
    });
    uniqueLanguages.forEach(language => {
        selectElement.appendChild(createLanguageOption(language));
    });
}

// Создание элемента опции для языка гида
const createLanguageOption = (language) => {
    const option = document.createElement('option');
    option.value = language;
    option.text = language;
    return option;
}

// Обработчик события для кнопки фильтрации
function filterGids() {
    const selectedLanguage = document.getElementById('languageFilter').value;
    const minExperience = parseInt(document.getElementById('minExperience').value);
    const maxExperience = parseInt(document.getElementById('maxExperience').value);

    if (isNaN(minExperience) && isNaN(maxExperience) && selectedLanguage === "He выбрано") {
        filtredGids = gids;
    } else {
        filtredGids = gids.filter(gid => (
            (selectedLanguage === 'Не выбрано' || gid.language === selectedLanguage) &&
            (isNaN(minExperience) || parseInt(gid.workExperience) >= minExperience) &&
            (isNaN(maxExperience) || parseInt(gid.workExperience) <= maxExperience)
        ));
    }
    displayGids();
}
document.getElementById('gidsFiltrBtn').onclick = filterGids;

//ЗАЯВКА

//уведомления - предупреждения
const showAlert = (message, alertType) => {
    const alertCon = document.createElement('div');
    alertCon.className = `alert ${alertType} alert-dismissible text-center`;
    alertCon.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;

    document.querySelector('#notifications .container').appendChild(alertCon);
    setTimeout(() => alertCon.remove(), 4000);
}

window.onload = () => {
    document.getElementById('gidtable').style.display = 'none';
    loadAndDisplayRoutes();
};