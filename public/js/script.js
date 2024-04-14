  let button = document.querySelector(".subject_enter");
  let form = document.querySelector(".subject_form");
  let check = true;
  button.addEventListener("click", () => {
    if (check) {
      form.style.display = "inline";
      check = false;
      button.style.color = "black";
      button.style.background = "#4070f4";
    } else if (check == false) {
      form.style.display = "none";
      check = true;
      button.style.color = "white";
      button.style.background = "#4070f4"
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
})
