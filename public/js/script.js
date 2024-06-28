let button = document.querySelector(".add");
let form = document.querySelector(".subject_form");
let icon = document.querySelector(".button_icon");

let check = true;
  button.addEventListener("click", () => {
    if (check) {
      form.style.display = "inline";
      check = false;
      button.style.background = "blue";
      icon.style.color = "white";
      icon.classList.add("rotate-left");  
    } else {
      form.style.display = "none";
      check = true;
      icon.style.color = "blue";
      button.style.background = "white";
      icon.classList.remove("rotate-left");
    }
  });
  let button2 = document.querySelector(".contacts");
  let button3 = document.querySelector(".collapse-contacts");
  let check1 = true;
  button2.addEventListener("click", () => {
    if (check1) {
      button3.style.display = "inline";
      check1 = false;
    } else if (check1 == false) {
      button3.style.display = "none";
      check1 = true;
    }
  });
 