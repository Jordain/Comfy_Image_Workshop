// Adds an animation to the element with the given id
const animateCSS = (element_id, animation, prefix = "animate__") =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.getElementById(element_id);

    node.classList.add(`${prefix}animated`, animationName, `animate__faster`);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(
        `${prefix}animated`,
        animationName,
        `animate__faster`
      );
      resolve("Animation ended");
    }
    node.addEventListener("animationend", handleAnimationEnd, {
      once: true,
    });
  });
  function toggleMenu() {
    var menu = document.querySelector('.menu');
    menu.classList.toggle('hidden');
  }