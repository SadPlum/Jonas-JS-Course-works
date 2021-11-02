'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// Create usernames
const createUsernames = () => {
  accounts.forEach(
    acc =>
      (acc.userName = acc.owner
        .toLowerCase()
        .split(' ')
        .map(owner => owner[0])
        .join(''))
  );
};
createUsernames();

// check user for login?
const checkUser = (un, ps) => {
  for (const us of accounts) {
    if (un === us.userName && ps === us.pin) {
      currentUser = us;
    }
  }
};

// timer
let min = 4;
let sec = 59;
const timer = () => {
  const zero = sec < 10 ? '0' : '';
  labelTimer.innerHTML = '0' + min + ':' + zero + sec;
  sec--;
  if (sec == 0) {
    min--;
    sec = 60;
  }
  if (min === 0 && sec === 0) {
    containerApp.style.opacity = 0;
    clearInterval(timer);
  }
};

// opens app, makes app visible. updates UI
const openApp = () => {
  min = 4;
  sec = 59;
  clearInterval(timer);
  inputLoginPin.value = '';
  inputLoginUsername.value = '';
  containerApp.style.opacity = 1;
  labelWelcome.innerHTML = `Welcome back, ${currentUser.owner.split(' ')[0]}`;
  updateBalance();
  let countDown = setInterval(timer, 1000);
};

// reducer for sum balance
const sum = (a, b) => a + b;

// current user
let currentUser;

// calc money in and money out
const inOut = () => {
  let monIn = [];
  let monOut = [];
  currentUser.movements.forEach(move => {
    move > 0 ? monIn.push(move) : monOut.push(move);
  });
  labelSumIn.innerHTML = `${monIn.reduce(sum)}€`;
  labelSumOut.innerHTML = `${Math.abs(monOut.reduce(sum))}€`;
  labelSumInterest.innerHTML = `${
    monIn.reduce(sum) * (currentUser.interestRate / 100)
  }€`;
};

// movements
const updateMovements = (sort = false) => {
  containerMovements.innerHTML = '';
  const movs = sort
    ? currentUser.movements.slice().sort((a, b) => a - b)
    : currentUser.movements;
  let type;
  for (let i = 0; i < currentUser.movements.length; i++) {
    let type = movs[i] > 0 ? 'deposit' : 'withdrawal';
    let html = `<div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${movs[i]}€</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  }
};

// transfer money
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const to = inputTransferTo.value;
  if (currentUser.balance - amount > 0) {
    let toAcc;
    if (to !== currentUser.userName) {
      for (const us of accounts) {
        us.userName === to.toLowerCase() ? (toAcc = us) : '';
      }
    }
    if (toAcc !== undefined) {
      currentUser.movements.push(-amount);
      toAcc.movements.push(amount);
      updateBalance();
      inputTransferAmount.value = '';
      inputTransferTo.value = '';
    }
  }
});

// request loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  currentUser.movements.push(amount);
  updateBalance();
  inputLoanAmount.value = '';
});

// login
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  const un = inputLoginUsername.value;
  const ps = Number(inputLoginPin.value);
  currentUser = null;
  checkUser(un, ps);
  console.log(currentUser);
  currentUser !== null ? openApp(currentUser) : '';
});

const updateBalance = () => {
  currentUser.balance = currentUser.movements.reduce(sum);
  labelBalance.innerHTML = `${currentUser.balance}€`;
  inOut();
  updateMovements();
};

// sort button
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  updateMovements(!sorted);
  sorted = !sorted;
});

// close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentUser.userName &&
    Number(inputClosePin.value) === currentUser.pin
  ) {
    inputCloseUsername.value = inputClosePin.value = '';
    const curr = accounts.findIndex(
      acc => acc.userName === currentUser.userName
    );
    accounts.splice(curr, 1);
    containerApp.style.opacity = 0;
    clearInterval(timer);
  }
});
