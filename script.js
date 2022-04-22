'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  clicks = 0;
  date = new Date();
  description;
  id = (Date.now() + '').slice(-10);
  constructor(distance, duration, cords) {
    this.distance = distance;
    this.duration = duration;
    this.cords = cords;
  }
  _SetDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type === 'running' ? 'Running' : 'Cycling'} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(distance, duration, cords, cadence) {
    super(distance, duration, cords);
    this.cadence = cadence;
    this._calcPace();
    this._SetDescription();
  }
  _calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(distance, duration, cords, elevation) {
    super(distance, duration, cords);
    this.elevation = elevation;
    this._calcElevation();
    this._SetDescription();
  }
  _calcElevation() {
    this.elevation = this.distance / (this.duration / 60);
    return this.elevation;
  }
}

//////////////////////////////////////////////////////////////////////
///APP ARCHITECTURE
class App {
  #map;
  #clickEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    this._extractDataFromLocal();
    //Event listeners
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleEvent);
    containerWorkouts.addEventListener('click', this._zoomToWorkout.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert(`Unable to locate you:(`);
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const cords = [latitude, longitude];
    this.#map = L.map('map').setView(cords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
      this._renderWorkoutOnMap(work);
    });
  }

  _showForm(clickE) {
    this.#clickEvent = clickE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }

  _toggleEvent(e) {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(submission) {
    submission.preventDefault();

    //Read inputs
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    const { lat, lng } = this.#clickEvent.latlng;

    //Validate inputs
    const validateInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const validatePositive = (...inputs) => inputs.every(inp => inp > 0);

    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validateInputs(distance, duration) ||
        !validatePositive(distance, duration)
      ) {
        return alert(`Input should a positive number`);
      }

      workout = new Cycling(distance, duration, { lat, lng }, elevation);
    }
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !validateInputs(distance, duration, cadence) ||
        !validatePositive(distance, duration, cadence)
      ) {
        return alert(`Input should a positive number`);
      }

      workout = new Running(distance, duration, { lat, lng }, cadence);
    }

    //Store workouts
    this.#workouts.push(workout);

    //Show workout popup on map
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    this._renderWorkoutOnMap(workout);
    this._renderWorkout(workout);
    this._hideForm();
    this._storeToLocal(workout);
    console.log(workout);
  }
  _storeToLocal(workout) {
    localStorage.setItem('workout', JSON.stringify(this.#workouts));
  }
  _renderWorkoutOnMap(workout) {
    L.marker(...[workout.cords])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.description)
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;
    if (workout.type === 'running') {
      html += `
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
      `;
    }
    if (workout.type === 'cycling') {
      html += `
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.elevation.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.speed}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>
    `;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  _zoomToWorkout(e) {
    const workEl = e.target.closest('.workout');
    if (!workEl) return;
    const workout = this.#workouts.find(work => work.id === workEl.dataset.id);
    this.#map.setView(workout.cords, 13, {
      animate: true,
      pan: { duration: 2 },
    });
    this._countClick(workout);
  }
  _countClick(work) {
    work.clicks++;
  }
  _extractDataFromLocal() {
    const data = JSON.parse(localStorage.getItem('workout'));
    console.log(data);
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }
}
const app = new App();
