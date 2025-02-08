'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2025-02-04T23:36:17.929Z',
    '2025-02-05T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2025-02-06T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
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
// Functions

//Function that displays date in locale format

const dateFormat = (inputDate, locale) => {
  const numberOfDays = (date1, date2) => {
    return Math.round(Math.abs(date1 - date2) / (24 * 60 * 60 * 1000));
  };

  const differenceInDays = numberOfDays(new Date(), new Date(inputDate));

  if (differenceInDays === 0) return 'TODAY';
  if (differenceInDays === 1) return 'YESTERDAY';
  if (differenceInDays <= 7) return `${differenceInDays} DAY'S AGO`;

  return new Intl.DateTimeFormat(locale).format(new Date(inputDate));
};

//Function that returns formatted currenices

const formattedCur = (amount, locale, currency) => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    amount
  );
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  //combine the movements and movement Dates array into single object to resolve sorting bug.

  const updatedMovementsWithDate = acc.movements.map((mov, i) => {
    return { mov, movDate: acc.movementsDates[i] };
  });

  //making changes according to updated object
  const movs = sort
    ? updatedMovementsWithDate.slice().sort((a, b) => a.mov - b.mov)
    : updatedMovementsWithDate;

  //making changes according to updated object
  movs.forEach(function ({ mov, movDate }, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const formattedMovement = formattedCur(mov, acc.locale, acc.currency)

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${dateFormat(movDate, acc.locale)}</div>
        <div class="movements__value">${formattedMovement}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formattedCur(acc.balance, acc.locale, acc.currency)
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formattedCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formattedCur(Math.abs(out), acc.locale, acc.currency)

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formattedCur(interest, acc.locale, acc.currency)
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format();
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  //Math.floor() to round off
  //const amount = Number(inputLoanAmount.value);
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
//NUMBERS
console.log(23===23.0) //true: as numbers in js are stored as floting points

//converting string to number
console.log(Number('23'))
console.log(+'23')


//parsing - string should begin with numbers otherwise it won't work and these are global functions
//parseInt: extracts integers from string
//args: string, base(2, 10) binary or decimal
//default radix is decimal
console.log(parseInt('23.4px', 10))
console.log(parseInt('25px'))
console.log(parseInt('  25  px  '))
console.log(parseInt('  p25  px  '))  //NaN

//parseFloat
console.log(parseFloat('  25.45  px  '))  
console.log(parseFloat('  10  px  '))  
console.log(parseFloat('  p25  px  '))  //NaN

//checking for NaN
console.log(Number.isNaN('23')) //false
console.log(Number.isNaN(23)) //false
console.log(Number.isNaN('hello')) //true
console.log(Number.isNaN(' ')) //false

//checking for number
console.log(Number.isFinite('sanjay')) //false
console.log(Number.isFinite(+'20')) //true
console.log(Number.isFinite(+'20x')) //false
console.log(Number.isFinite(5)) //true

console.log(Number.isInteger(2.5)) //false
console.log(Number.isInteger(2.0)) //true
console.log(Number.isInteger(2)) //true
console.log(Number.isInteger('hello')) //false
console.log(Number.isInteger(+'23')) //true


//Math and Rounding: type cohersion happends behind the scenes

console.log(Math.sqrt(25))
//alternative methods
console.log(25 ** (1/2))
console.log(8 ** (1/3)) //cube root

//round - rounds off to nearest integer
console.log(Math.round(23.5))
console.log(Math.round(23.2))
//trun - truncates everything after decimal, return interger
console.log(Math.trunc(23.278787878))
console.log(Math.trunc(23.89998989))
//ceil - rounds off to nearest next number
console.log(Math.ceil(23.2998989))
console.log(Math.ceil(23.89998989))
//floor - oppsite of ceil
console.log(Math.floor(0.99))
console.log(Math.floor(92.01))
console.log(Math.floor('23.89998989'))

//constants: find area of circle with radius 15px
const area = Math.PI * Number.parseInt('15 px') ** 2
console.log(Math.PI, area)

//function to generate random numbers between 2 numbers
const randIntegers = (min, max) => {
 console.log(Math.floor(Math.random()*(max-min)) + min)
}

randIntegers(10, 20)
randIntegers(0, 4)

//Remainder operator
console.log(5 % 2); //1, 5 = 2 * 2 + 1
console.log(5 / 2);

console.log(6 % 2); //0, 6 = 2 * 3 + 0
console.log(6 / 2);

//check given number is even
const isEven = n => n % 2 === 0;

console.log(isEven(2));
console.log(isEven(5));
console.log(isEven(53));

//mark the Nth row in different color codes

labelBalance.addEventListener('click', function () {
  const nodeList = document.querySelectorAll('.movements__row');
  Array.from(nodeList).forEach((row, i) => {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'lightblue';
  });
});

//Numeric separator (made numbers more readable in code)

//267,480,000,000
const diameter = 267_480_000_000 //267480000000

//Note: _ must be used between numbers, illegal to use them at the begining or end of the number

const cost = 23_45
console.log(23_45) //2345

console.log(Number('23_45')) //NaN: deosn't work here
console.log(parseInt('23_45')) //23

const MYCONSTANT = 123.34_45 //valid
//test below examples directly in browser console
// const MYCONSTANT1 = 123._34_45 //invalid
// const MYCONSTANT2 = _123.34_45 //invalid
// const MYCONSTANT3 = 123_.34_45 //invalid

//BigInt
console.log(2 ** 53 - 1)
console.log(Number.MAX_SAFE_INTEGER)

console.log(2 ** 53 - 1)
console.log(2 ** 53 + 1)
console.log(2 ** 53 + 3)
console.log(2 ** 53 + 5)

//Initilising the BigInts 

console.log(2344244n)
console.log(BigInt(2332323))


//Mix Type error
const num = 2345
const bigNum = 237878787n

console.log(num * bigNum)
//Uncaught TypeError: Cannot mix Biglnt and other types, use explicit conversions

//Internationalizing dates

const date = new Date() //current date

const options = {
  hour: '2-digit',
  minute: '2-digit',
  day: 'numeric',
  month: 'long',
  year : 'numeric',
  weekday: 'long'
}

const internationalizedDate = new Intl.DateTimeFormat('kn-IN', options).format(date)
console.log(internationalizedDate)
*/
