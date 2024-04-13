const api_key = "f4939284-4831-4d26-9348-77ec6318558b";
let routes;
let filtredroutes;
let gids;
let filtredGids;
let currentPage = 1;
let itemsPerPage = 5;
const pagesToShow = 7;
let selrouteID = -1;
let selrouteName = '';
let selgidprice;
let selgidid;
let selgidname;

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
        const row = document.createElement('tr');
        row.classList.add('route-row');
        row.innerHTML = `
            <td class="text-center">
                <h5>${route.name}</h5>
                <button class="btn btn-primary btn-route-sel" data-routeid="${route.id}" data-routename="${route.name}">Записаться</button>
            </td>
            <td>${route.description}</td>
            <td>${route.mainObject}</td>
        `;
        routesTableBody.appendChild(row);
        if (row.querySelector('[data-routeid]').dataset.routeid === selrouteID) {
            row.classList.add('table-success');
        }
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
            selrouteName = button.dataset.routename;
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
                    <button class="btn btn-primary btn-gid-sel" data-gidid="${gid.id}" data-gidname="${gid.name}" data-gidprice="${gid.pricePerHour}" 
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
            selgidid = btn.dataset.gidid;
            selgidname = btn.dataset.gidname;
            selgidprice = btn.dataset.gidprice;
            document.querySelector('#modalGuidInfo #guideName').innerHTML = selgidname;
            document.querySelector('#modalRouteInfo #routeName').innerHTML = selrouteName;
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

document.getElementById('modal-submit').onclick = event => {
    const errorMessage = validateRequest()
    if (errorMessage.length !== 0) {
        showAlert(errorMessage, 'alert-danger');
    } else {
        createExcursion();
        showAlert('Вы записались на эксукрсию!', 'alert-success');
    }
}

async function createExcursion() {
    const createExcursionUrl = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${api_key}`;
    const optionFirst = document.getElementById('option1').checked ? 1 : 0;
    const optionSecond = document.getElementById('option2').checked ? 1 : 0;

    const formData = new FormData();

    formData.append("guide_id", selgidid);
    formData.append("route_id", selrouteID);
    formData.append("date", document.getElementById('excursionDate').value);
    formData.append("time", document.getElementById('excursionStartTime').value);
    formData.append("duration", document.getElementById('duration').value);
    formData.append("persons", document.getElementById('peopleCount').value);
    formData.append("price", calculatePrice().toString());
    formData.append("optionFirst", optionFirst.toString());
    formData.append("optionSecond", optionSecond.toString());

    fetch(createExcursionUrl, {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const validateRequest = () => {
    let errors = [validateDate(), validateTime(), validatePersonsCount()];
    let errorMessage = errors.filter(error => error.length !== 0).join('<br>');
    return errorMessage;
}

const validateDate = () => {
    const date = new Date(document.getElementById('excursionDate').value);
    if (isNaN(date) || date < new Date()) {
        return isNaN(date) ? "Дата экскурсии должна быть заполнена" : "Дата экскурсии не может быть ранее или равна текущей дате";
    }
    return '';
}

const validateTime = () => {
    const time = document.getElementById('excursionStartTime').value.trim();
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(time)) return 'Время должно соответствовать шаблону HH:MM';
    const [hours, minutes] = time.split(':').map(Number);
    if (!(hours >= 9 && hours < 23 && minutes >= 0 && minutes < 60)) return 'Время должно соответствовать диапазону 9-23 часов';
    return '';
}

const validatePersonsCount = () => {
    let personsCount = document.getElementById('peopleCount').value.trim();
    if (personsCount === '' || isNaN(personsCount)) return "Количество людей должно быть заполнено и быть числом";
    if (!(personsCount > 0 && personsCount < 21)) return "Размер экскурсионной группы может составлять от 1 до 20 человек";
    return '';
}


const calculatePrice = () => {
    const date = new Date(document.getElementById('excursionDate').value);
    const time = document.getElementById('excursionStartTime').value.trim();
    const personsCount = document.getElementById('peopleCount').value.trim();
    const duration = parseInt(document.getElementById('duration').value)
    const option1 = document.getElementById('option1').checked;
    const option2 = document.getElementById('option2').checked;
    let isThisDayOff;
    let hour;
    
    // Проверка даты экскурсии
    const isDateValid = validateDate() === '';
    // Проверка времени экскурсии
    const isTimeValid = validateTime() === '';
    // Определение переменной isThisDayOff
    if (isDateValid) {
        if (date.getDay() === 0 || date.getDay() === 6) {
            isThisDayOff = 1.5;
        } else {
            isThisDayOff = 1;
        }
    } else {
        isThisDayOff = 1;
    }

    // Если время экскурсии прошло проверку, извлекаем час из времени
    if (isTimeValid) {
        hour = time.split(':').map(Number)[0];
    } else {
        // Если время не прошло проверку, устанавливаем час на 15
        hour = 15;
    }

    // Определение стоимости в зависимости от времени суток
    const isItMorning = hour < 12 ? 400 : 0;
    const isItEvening = hour >= 20 ? 1000 : 0;

    let numberOfVisitor;
    // Проверка количества посетителей
    if (validatePersonsCount() === '') {
        // Если количество посетителей прошло проверку
        if (personsCount < 5) {
            numberOfVisitor = 0;
        } else if (personsCount <= 10) {
            numberOfVisitor = 1000;
        } else {
            numberOfVisitor = 1500;
        }
    } else {
        // Если количество посетителей не прошло проверку
        numberOfVisitor = 1;
    }

    let totalPrice = selgidprice * duration * isThisDayOff + isItMorning + isItEvening + numberOfVisitor;
    if (option1) totalPrice *= 0.85;
    const checkb = document.getElementById('option2');
    if (personsCount > 10) {
        checkb.disabled = true;
    } else {
        checkb.disabled = false;
        if (option2 && personsCount >=5 ) { totalPrice *= 1.25; }
        if (option2 && personsCount <5 && personsCount >=1 ) {totalPrice *= 1.15};
    }
    return Math.round(totalPrice);
}

const modalInputIds = ['duration', 'excursionDate', 'excursionStartTime', 'peopleCount', 'option1', 'option2'];
modalInputIds.forEach(id => {
    document.getElementById(id).onchange = () => {
        document.getElementById('totalCost').innerHTML = calculatePrice().toString();
    }
})
document.getElementById('excursionStartTime').onblur = calculatePrice;

//уведомления - предупреждения
const showAlert = (message, alertType) => {
    const alertCon = document.createElement('div');
    alertCon.className = `alert ${alertType} alert-dismissible text-center`;
    alertCon.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;

    document.querySelector('#notifications .container').appendChild(alertCon);
    const element = document.getElementById('notifications');
    element.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => alertCon.remove(), 4000);
}

window.onload = () => {
    document.getElementById('gidtable').style.display = 'none';
    loadAndDisplayRoutes();
};