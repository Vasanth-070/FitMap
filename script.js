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
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(distance, duration, cords) {
    this.distance = distance;
    this.duration = duration;
    this.cords = cords;
  }
}
class Running extends Workout {
  constructor(distance, duration, cords, cadence) {
    super(distance, duration, cords);
    this.cadence = cadence;
    this._calcPace();
  }
  _calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(distance, duration, cords, elevation) {
    super(distance, duration, cords);
    this.elevation = elevation;
    this._calcElevation();
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

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._showForm.bind(this));
    inputType.addEventListener('change', this._toggleEvent);
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

    this.#map.on('click', this._newWorkout.bind(this));
  }

  _showForm(submission) {
    submission.preventDefault();
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    const { lat, lng } = this.#clickEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running - popup',
        })
      )
      .setPopupContent(`Workout`)
      .openPopup();
  }

  _toggleEvent(e) {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(clickE) {
    this.#clickEvent = clickE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
}
const app = new App();
