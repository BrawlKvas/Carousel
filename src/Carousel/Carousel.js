//! Некорректаная работа при 3 и менее элементах

import './carousel.css';

const WIDTHSLIDE = 200;

class Carousel {
  #isScroll = false;

  constructor(options = {}) {
    this.carousel = document.querySelector('.carousel');

    this.items = null;

    this.#setup();
  }

  #setup = () => {
    //TODO Переделать
    let items = Array.from(this.carousel.querySelectorAll('.carousel-item'));

    if (items.length % 2 === 0) {
      this.carousel.insertAdjacentHTML('beforeend', items[Math.floor(items.length / 2)].outerHTML);
      items = Array.from(this.carousel.querySelectorAll('.carousel-item'));
    }
    
    this.items = items.map((item, i, arr) => {
      return new CarouselItem(item, { x: this.calcX(i, arr.length) });
    });

    this.carousel.ondragstart = () => { return false }
    this.carousel.addEventListener('click', (e) => { e.preventDefault(); }); //TODO Переход по ссылке
    this.carousel.onselectstart = () => { return false }

    this.carousel.addEventListener('mousedown', this.#handlerStart);
    this.carousel.addEventListener('mouseup', this.#handlerEnd);

    this.carousel.addEventListener('touchstart', this.#handlerStart);
    this.carousel.addEventListener('touchend', this.#handlerEnd);
  }

  #handlerStart = (e) => {
    e.preventDefault();

    this.#handlerMove.previousClientX = e.clientX || e.changedTouches[0].clientX;

    this.carousel.addEventListener('touchmove', this.#handlerMove);
    this.carousel.addEventListener('mousemove', this.#handlerMove);
    this.carousel.addEventListener('mouseleave', this.#handlerEnd);
  }

  #handlerEnd = (e) => {
    if (this.#isScroll) {
      this.#isScroll = false;
      this.carousel.classList.remove('scrolling');

      const shift = Math.abs(this.items[0].getX() / WIDTHSLIDE);

      if (shift > 0.3) {
        const dir = this.items[0].getX() > 0 ? true : false;

        const n = Math.round(shift) === 0 ? 1 : Math.round(shift)

        for (let i = 0; i < n; i++) {
          this.shiftingItems(dir);
        }
      }

      this.setEndPointItems();
    
    } else {
      this.items.forEach((item, i, arr) => {
        const slide = e.target.parentNode;

        if (item.elem === slide) {
          for (let j = 0; j < i; j++) {
            this.shiftingItems(false);
          }
        }
      });
    }

    this.carousel.removeEventListener('touchmove', this.#handlerMove);
    this.carousel.removeEventListener('mousemove', this.#handlerMove);
    this.carousel.removeEventListener('mouseleave', this.#handlerEnd);
  }

  #handlerMove = (e) => {
    const movementX = (e.clientX || e.changedTouches[0].clientX) - this.#handlerMove.previousClientX;

    this.#isScroll = true;
    this.carousel.classList.add('scrolling');

    this.items.forEach((item, i, arr) => {
      const max = WIDTHSLIDE * Math.floor(arr.length / 2) + (WIDTHSLIDE / 2);

      if (item.getX() > max) {
        item.setX(-max);
      } else if (item.getX() < -max) {
        item.setX(max);
      } else {
        item.setX(item.getX() + movementX);
      }

    });

    this.#handlerMove.previousClientX = e.clientX || e.changedTouches[0].clientX;

  }

  calcX = (i, maxI) => {
    return i <= Math.floor(maxI / 2) ? i * WIDTHSLIDE : -WIDTHSLIDE * (maxI - i);
  }

  setEndPointItems = () => {
    this.items.forEach((item, i, arr) => {
      item.setX(this.calcX(i, arr.length));
      item.setCss();
    });
  }

  shiftingItems = (dir) => { // true - Сдвиг вправо, false - влево
    if (dir) {
      this.items.unshift(this.items.pop());
    } else {
      this.items.push(this.items.shift());
    }

    this.setEndPointItems();
  }
}

export default Carousel;

class CarouselItem {
  #x = 0;
  #y = 0;
  #z = 0;

  #zIndex = 0;
  #opacity = 1;

  constructor(elem, { x }) {
    this.elem = elem;

    this.setX(x);
  }

  getX = () => {
    return this.#x;
  }

  setX = (value) => {

    this.#x = value;

    const number = Math.abs(this.#x) / WIDTHSLIDE;

    this.#y = number * -50;
    this.#z = number * -200;

    this.#zIndex = Math.round(number * -1);

    this.#opacity = 1 - number * 0.4;

    this.setCss();
  }

  setCss = () => {
    this.elem.style.cssText = `
      transform: translateX(${this.#x}px) translateY(${this.#y}px) translateZ(${this.#z}px);
      z-index: ${this.#zIndex};
      opacity: ${this.#opacity};
    `
  }

}