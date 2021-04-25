chrome.storage.local.get("Moodle", (data) => {
  let obj = data["Moodle"];
  if (obj.autoCaptcha) {
    solveCaptcha();
    if (obj.autoLogin) {
      loginUser(obj.username, obj.password);
    }
  }
});

function solveCaptcha() {
  let formText = document.getElementById("login").textContent;

  let i = 0;
  let num;

  if (formText.indexOf("first value") !== -1) {
    i = formText.indexOf("first value") + "first value".length + 1;
    while (formText.charAt(i) === " ") {
      i++;
    }
    let number = "";
    while (formText.charAt(i) !== " ") {
      number += formText.charAt(i);
      i += 1;
    }
    num = parseInt(number);
  } else if (formText.indexOf("second value") !== -1) {
    i = formText.indexOf("second value") + "second value".length + 1;
    while (formText.charAt(i) === " ") {
      i++;
    }
    while (formText.charAt(i) !== " ") {
      i += 1;
    }
    i += 3;
    while (formText.charAt(i) === " ") {
      i++;
    }
    let number = "";
    while (formText.charAt(i) !== " ") {
      number += formText.charAt(i);
      i += 1;
    }
    num = parseInt(number);
  } else if (formText.indexOf("add") !== -1) {
    i = formText.indexOf("add") + "add".length + 1;
    let number1 = "";
    while (formText.charAt(i) === " ") {
      i++;
    }
    while (formText.charAt(i) !== " ") {
      number1 += formText.charAt(i);
      i += 1;
    }
    num1 = parseInt(number1);

    i += 3;
    let number2 = "";
    while (formText.charAt(i) === " ") {
      i++;
    }

    while (formText.charAt(i) !== " ") {
      number2 += formText.charAt(i);
      i += 1;
    }
    num2 = parseInt(number2);

    num = num1 + num2;
  } else if (formText.indexOf("subtract") !== -1) {
    i = formText.indexOf("subtract") + "subtract".length + 1;
    let number1 = "";
    while (formText.charAt(i) === " ") {
      i++;
    }
    while (formText.charAt(i) !== " ") {
      number1 += formText.charAt(i);
      i += 1;
    }
    num1 = parseInt(number1);

    i += 3;
    let number2 = "";
    while (formText.charAt(i) === " ") {
      i++;
    }
    while (formText.charAt(i) !== " ") {
      number2 += formText.charAt(i);
      i += 1;
    }
    num2 = parseInt(number2);

    num = num1 - num2;
  } else {
    throw Exception("Unexpected Error");
  }

  document.getElementById("valuepkg3").value = num.toString();
}

function loginUser(username, password) {
  document.getElementById("username").value = username;
  document.getElementById("password").value = password;

  document.getElementById("loginbtn").click();
}
