 'use strict';

const MIN_LENGTH_FORM_FOR_AUTH = 3;

const modalCartEl = document.querySelector('.modal');
const modalCartBodyEl = document.querySelector('.modal-body');
const modalPriceEl = document.querySelector('.modal-pricetag');
const cartButtonEl = document.querySelector('#cart-button');
const cartButtonCloseEl = document.querySelector('.js-modalCartClose');
const cartButtonClearEl = document.querySelector('.clear-cart');
const buttonAuthEl = document.querySelector('.button-auth');
const modalAuthEl = document.querySelector('.modal-auth');
const buttonCloseAuthEl = document.querySelector('.close-auth');
const logInFormEl = document.querySelector('#logInForm');
const logInInputEl = document.querySelector('#login');
const userNameEl = document.querySelector('.user-name');
const buttonOutEl = document.querySelector('.button-out');
const bodyEl = document.querySelector('body');
const cardsRestaurantsEl = document.querySelector('.cards-restaurants');
const containerPromoEl = document.querySelector('.container-promo');
const restaurantsEl = document.querySelector('.restaurants');
const menuEl = document.querySelector('.menu');
const logoEl = document.querySelector('.logo');
const cardsMenuEl = document.querySelector('.cards-menu'); 


const cart = []; //Массив для корзины

const getData = async function (url) { 
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url},
     статус ошибки ${response.status}`);
  }
  return await response.json(); //получаем ответ
}

let login = localStorage.getItem('currentUser'); //получаем значение текущего пользователя
//Добавляем запись логина в LS
    
const toggleModalCart = ()  => {
  modalCartEl.classList.toggle('is-open');      
}

const toggleModalAuth = () => {
  modalAuthEl.classList.toggle("is-open");
  if (modalAuthEl.classList.contains("is-open")) {
    disableScroll();
  } else {
    enableScroll();
  }
}

const onClickCloseModal = (event) => {
  if (event.target == this) {
    modalAuthEl.classList.toggle('is-open');
  }
}

const authorized = () => {
  const logOut = () => {
    confirm('Действительно хотите выйти?');
      login = null;
      localStorage.removeItem('currentUser');
      userNameEl.style.display = '';
      buttonOutEl.style.display = '';
      buttonAuthEl.style.display = '';
      cartButtonEl.style.display = '';
      buttonOutEl.removeEventListener('click', logOut);
      backToHome();
      checkUserStatus();
  }

  console.log('Авторизован');
  buttonAuthEl.style.display = 'none';
  userNameEl.style.display = 'inline';
  userNameEl.textContent = login;
  buttonOutEl.style.display = 'block';
  cartButtonEl.style.display = 'flex';

  buttonOutEl.addEventListener('click', logOut);
}

const notAuthorized = () => {

  console.log('Не авторизован');

    const logIn = (event) => {
      event.preventDefault();
      if (fieldValidation(logInInputEl)){
        login = logInInputEl.value.trim();
        localStorage.setItem('currentUser', login); //метод добавляет свойства со значением в ls
        toggleModalAuth();
        buttonAuthEl.removeEventListener('click', toggleModalAuth);
        buttonCloseAuthEl.removeEventListener('click', toggleModalAuth);
        logInFormEl.removeEventListener('submit', logIn);
        logInFormEl.reset();
        checkUserStatus();
      }
    }
  buttonAuthEl.addEventListener('click', toggleModalAuth);
  buttonCloseAuthEl.addEventListener('click', toggleModalAuth);
  logInFormEl.addEventListener('submit', logIn);
}

function fieldValidation (el) {
  if (el.value.length < MIN_LENGTH_FORM_FOR_AUTH) {
    el.classList.add('invalid');
    el.value = '';
    alert('Введите логин. Логин должен содержать 3 и более символов');
  }
  else {
    return true;
  }
}

function checkUserStatus () {
  if (login) {
    authorized();
  }
  else {
    notAuthorized();
  }
}

/*Generic cards item */

const createCardsRestaurants = ({image, kitchen, name,price, stars, products,time_of_delivery}) => {

  // const { 
  //    image,
  //    kitchen, 
  //    name,
  //    price, 
  //    stars, 
  //    products,
  //    time_of_delivery } = restaurant; //делаем деструктуризацию ,указываем ключи и ткуда берем данные . из параметра restaurant

  const card = `
  <a class="card card-restaurant" data-products="${products}">
		<img src="${image}" alt="image" class="card-image"/>
			<div class="card-text">
				<div class="card-heading">
					<h3 class="card-title">${name}</h3>
					<span class="card-tag tag">${time_of_delivery} мин</span>
				</div>
				  <div class="card-info">
						<div class="rating">
							${stars}
						  </div>
						  <div class="price">От ${price} ₽</div>
						  <div class="category">${kitchen}</div>
						</div>
				</div>	
  </a>`;
  cardsRestaurantsEl.insertAdjacentHTML('beforeend', card);
  
}

/* open card , deligate*/

const createCardGood = ({ description,id,image,name,price,}) => {

  let card = document.createElement('div');
  card.className = 'card';
  card.insertAdjacentHTML('beforeend', `
						<img src="${image}" alt="image" class="card-image"/>
						<div class="card-text">
							<div class="card-heading">
								<h3 class="card-title card-title-reg">${name}</h3>
							</div>
							<div class="card-info">
								<div class="ingredients">${description}.
								</div>
							</div>
							<div class="card-buttons">
								<button class="button button-primary button-add-cart" id="${id}">
									<span class="button-card-text">В корзину</span>
									<span class="button-cart-svg"></span>
								</button>
								<strong class="card-price-bold card-price">${price} ₽</strong>
							</div>
						</div>
  `);
  cardsMenuEl.insertAdjacentElement('beforeend', card);  
}

const openGoods = (event) => {
  const target = event.target;
  const restaurant = target.closest('.card-restaurant');

  if (restaurant && login == null) {
    toggleModalAuth();
  }
  if (restaurant && login != null) {
    //console.log(restaurant.dataset.products); //выводим атрибут dataset
      containerPromoEl.classList.add('hide');
      restaurantsEl.classList.add('hide');
      menuEl.classList.remove('hide');
      cardsMenuEl.textContent = '';

      getData(`./db/${restaurant.dataset.products}`).then((data) => { 
        data.forEach(createCardGood); 
      }); 
  }
}

function backToHome () {
  containerPromoEl.classList.remove('hide');
  restaurantsEl.classList.remove('hide');
  menuEl.classList.add('hide');
}

const addToCard = (event) => {
  const target = event.target;
  const buttonAddToCart = target.closest('.button-add-cart');
   
   if (buttonAddToCart){ //ищем элемент внутри элемента
    const card = buttonAddToCart.closest('.card'); // получаем карточку
    const title = card.querySelector('.card-title-reg').textContent;// получаем название товара и цену
    const cost = card.querySelector('.card-price').textContent;
    const id = buttonAddToCart.id;
    
    const food = cart.find((item) => {
      return item.id === id
    }); //find ищет элемент в массиве по какому то совпадению//кб ф-ция
   
    console.log(food);

    if (food) {
      food.count += 1;
    }
    else {
      cart.push({
      id,
      title,
      cost,
      count: 1,
      })
    }
    console.log(cart);
   }
  
}

const renderCart = () => {
  modalCartBodyEl.textContent = '';
  cart.forEach(({ id, title, cost, count }) => {
    const itemCart = `
    <div class="food-row">
					<span class="food-name">${title}</span>
					<strong class="food-price">${cost}</strong>
					<div class="food-counter">
						<button class="counter-button counter-minus" data-id = ${id}>-</button>
						<span class="counter">${count}</span>
						<button class="counter-button counter-plus" data-id = ${id}>+</button>
					</div>
		</div>
    `;
    modalCartBodyEl.insertAdjacentHTML('beforeend', itemCart);
  }) //data-id т.к. мы не можем использовать id уникальный атрибут

  const totalPrice = cart.reduce((result, item) => {
    return result + parseFloat(item.cost) * item.count}, 0); // возвращаем общую цену.parseFloat игнорирует пробелы и буквы возвращая только цифры
  modalPriceEl.textContent = totalPrice + ' руб.';
}

const changeCount = (event) => {
  const target = event.target;
  
  if (target.classList.contains('counter-button')) {
    const food = cart.find((item) => { // ищем атрибут, который будет совпадать
       return item.id == target.dataset.id;
    })
    if (target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food),1); // удаляем из массива текущий эл
      }
    } //уменьшаем кол товара
    if (target.classList.contains('counter-plus')) food.count++;
    renderCart(); //перезапускаем для обновления корзины
  }
}

const init = () => {
  getData('./db/partners.json').then((data) => { 
  data.forEach(createCardsRestaurants); 
}); 

cartButtonEl.addEventListener('click', () => {
  renderCart();
  toggleModalCart();
});
cartButtonCloseEl.addEventListener('click',toggleModalCart);
cartButtonClearEl.addEventListener('click', () => {
  let question = confirm('Очистить корзину?');
  (question) ?  cart.length = 0 : '';
  renderCart();
})
cardsMenuEl.addEventListener('click', addToCard);
cardsRestaurantsEl.addEventListener('click', openGoods);
modalAuthEl.addEventListener('click', onClickCloseModal);
modalCartBodyEl.addEventListener('click', changeCount);
logoEl.addEventListener('click', backToHome);

checkUserStatus();
}

init();



