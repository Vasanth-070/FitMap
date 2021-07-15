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

let map, clickEvent;
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log('Location Found');
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      const cords = [latitude, longitude];
      map = L.map('map').setView(cords, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on('click', function (clickE) {
        clickEvent = clickE;
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    },
    function () {
      alert(`Unable to locate you:(`);
    }
  );

form.addEventListener('submit', function (submission) {
  submission.preventDefault();
  inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
      '';
  const { lat, lng } = clickEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
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
});
inputType.addEventListener('change', function (e) {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});
