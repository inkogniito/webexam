const api_key = 'f4939284-4831-4d26-9348-77ec6318558b';
const routeIdname = new Map();
const gidIdname = new Map();
let currentPage = 1;
let itemsPerPage = 4;
let orders;
let selorderID;
let selgidprice;

//РЕНДЕР ТАБЛИЦЫ С ЗАЯВКАМИ
async function fetchRoutes() {
    const routesUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes');
    routesUrl.searchParams.set('api_key', api_key);
    try {
        const response = await fetch(routesUrl);
        const data = await response.json();
        data.forEach(route => {
            routeIdname.set(route.id, route.name);
        });
    } catch (error) {
        showAlert(error.message, 'alert-danger');
    }
}

async function fetchOrders() {
    const ordersUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders');
    ordersUrl.searchParams.set('api_key', api_key);
    try {
        const response = await fetch(ordersUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        showAlert(error.message, 'alert-danger');
    }
}

async function renderOrders() {
    orders = await fetchOrders();
    await fetchRoutes();
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '';
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        console.log(order)
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${routeIdname.get(order.route_id)}</td>
            <td>${order.date}</td>
            <td>${order.price}</td>
            <td class="d-flex align-items-center justify-content-around">
                <i class="bi bi-eye" data-orderid="${order.id}" data-bs-toggle="modal" data-bs-target="#orderModal"></i>
                <i class="bi bi-pencil-square" data-orderid="${order.id}" data-bs-toggle="modal" data-bs-target="#orderModal"></i>
                <i class="bi bi-trash" data-orderid="${order.id}" data-bs-toggle="modal" data-bs-target="#deleteConfirmationModal"></i>   
            </td>
        `;
        tableBody.appendChild(row);
    }
    document.querySelectorAll('.bi-eye').forEach(view => {
        view.onclick = viewOrder;
    });
    document.querySelectorAll('.bi-pencil-square').forEach(view => {
        view.onclick = editOrder;
    });
    document.querySelectorAll('.bi-trash').forEach(view => {
        view.onclick = delOrder;
    });

}

function loadOrderData() {
    const orderdataUrl = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${selorderID}`)
    orderdataUrl.searchParams.set('api_key', api_key);

    fetch(orderdataUrl).then(result => result.json()).then(order => {
        console.log(order);
        loadGidPrice(order.guide_id);
        document.getElementById('excursionDate').value = order.date;
        document.getElementById('routeName').innerText = routeIdname.get(order.route_id);
        document.getElementById('excursionStartTime').value = order.time.slice(0, 5);
        document.getElementById('duration').value = order.duration;
        document.getElementById('peopleCount').value = order.persons;
        document.getElementById('option1').checked = order.optionFirst;
        document.getElementById('option2').checked = order.optionSecond;
        document.getElementById('totalCost').innerText = order.price;
    });
}

function loadGidPrice(guidId) {
    const gidPriceUrl = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/guides/${guidId}`)
    gidPriceUrl.searchParams.set('api_key', api_key);
    fetch(gidPriceUrl).then(result => result.json()).then(gid => {
        document.getElementById('guideName').innerHTML = gid.name;
        selgidprice = gid.pricePerHour;
    });
}

const viewOrder = (event) => {
    selorderID = event.target.dataset.orderid;
    setmodal(true);
    loadOrderData();
}
const editOrder = (event) => {
    selorderID = event.target.dataset.orderid;
    setmodal(false);
    loadOrderData();
}
const delOrder = (event) => {
    selorderID = event.target.dataset.orderid;
    deleteOrder();
    renderOrders();
}

document.querySelector('#confirmDeleteBtn').onclick = delsubmit;

function delsubmit() {
    window.location.reload(true);
}

function setmodal(flag) {
    document.getElementById('excursionDate').disabled = flag;
    document.getElementById('excursionStartTime').disabled = flag;
    document.getElementById('duration').disabled = flag;
    document.getElementById('peopleCount').disabled = flag;
    document.getElementById('option1').disabled = flag;
    document.getElementById('option2').disabled = flag;
}

const deleteOrder = () => {
    const deleteOrderUrl = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${selorderID}`);
    deleteOrderUrl.searchParams.set('api_key', api_key);
    return fetch(deleteOrderUrl, {
        method: 'DELETE'
    })
}
/*
//РАБОТА С ЗАЯВКОЙ(ЦЕНА)
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
        if (option2 && personsCount >= 5) { totalPrice *= 1.25; }
        if (option2 && personsCount < 5 && personsCount >= 1) { totalPrice *= 1.15 };
    }
    return Math.round(totalPrice);
}

*/


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
    renderOrders();
}