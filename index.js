let services = [
  {
    name: "Moodle",
    icon: "assets/moodle_icon.png",
  },
  {
    name: "Kerberos",
    icon: "assets/kerberos_icon.jpg",
  },
  {
    name: "Webmail",
    icon: "assets/webmail_icon.png",
  },
];

createList();
chrome.runtime.connect({ name: "popup" });

function autoCaptchaEvent(event) {
  const elem = event.target;
  chrome.storage.local.get(elem.name, (data) => {
    obj = data[elem.name];
    obj.autoCaptcha = elem.checked;
    chrome.storage.local.set({ [elem.name]: obj }, () => {
      document.querySelector("#autoLoginInput[name='" + elem.name + "']").disabled = !elem.checked;
      if (!elem.checked) {
        document.querySelector("#loginLabel[name='" + elem.name + "']").style.color = "#429a9a";
        document.querySelector(".credentials[name='" + elem.name + "']").style.display = "none";
      } else {
        document.querySelector("#loginLabel[name='" + elem.name + "']").style.color = "#000000";
        document.querySelector(".credentials[name='" + elem.name + "']").style.display = document.querySelector("#autoLoginInput[name='" + elem.name + "']").checked ? "block" : "none";
      }
      chrome.storage.local.get(elem.name, (data) => {
        console.log(data);
      });
    });
  });
}

function autoLoginEvent(event) {
  const elem = event.target;
  chrome.storage.local.get(elem.name, (data) => {
    obj = data[elem.name];
    obj.autoLogin = elem.checked;
    chrome.storage.local.set({ [elem.name]: obj }, () => {
      document.querySelector(".credentials[name='" + elem.name + "']").style.display = elem.checked ? "block" : "none";
      if (obj.username === undefined) {
      }
      chrome.storage.local.get(elem.name, (data) => {
        console.log(data);
      });
    });
  });
}

function updateCreds(event) {
  const elem = event.target;
  let nameInput = document.querySelector(".username[name='" + elem.name + "']");
  let passInput = document.querySelector(".password[name='" + elem.name + "']");
  let enteredName = nameInput.value;
  let enteredPass = passInput.value;

  if (enteredName !== "" && enteredPass !== "") {
    chrome.storage.local.get(elem.name, (data) => {
      obj = data[elem.name];
      obj.username = enteredName;
      obj.password = enteredPass;
      chrome.storage.local.set({ [elem.name]: obj }, () => {
        nameInput.value = "";
        passInput.value = "";
        let credentialsStatus = document.querySelector(".credentialsStatus[name='" + elem.name + "']");
        credentialsStatus.textContent = "Username and Password are configured properly.";
        credentialsStatus.style.color = "green";
      });
    });
  } else {
    let credentialsStatus = document.querySelector(".credentialsStatus[name='" + elem.name + "']");
    credentialsStatus.textContent = "The username and password fields can't be empty.";
    credentialsStatus.style.color = "red";
  }
}

function createServiceItem(id, title, imageSrc, autoCaptcha, autoLogin) {
  let iconImg = document.createElement("img");
  iconImg.setAttribute("class", "serviceIcon");
  iconImg.src = imageSrc;

  let divServiceContent = document.createElement("div");
  divServiceContent.setAttribute("class", "serviceContent");

  let divServiceTop = document.createElement("div");
  divServiceTop.setAttribute("class", "serviceTop");

  let spanServiceTitle = document.createElement("span");
  spanServiceTitle.setAttribute("class", "serviceTitle");
  spanServiceTitle.textContent = title;
  divServiceTop.appendChild(spanServiceTitle);

  divServiceContent.appendChild(divServiceTop);

  let autoCaptchaDiv = document.createElement("div");
  autoCaptchaDiv.setAttribute("class", "autoCaptcha");

  let spanServiceEnabled = document.createElement("span");
  spanServiceEnabled.textContent = "Auto Captcha";
  spanServiceEnabled.setAttribute("class", "switchLabel");
  autoCaptchaDiv.appendChild(spanServiceEnabled);

  let labelSwitch = document.createElement("label");
  labelSwitch.setAttribute("class", "switch");

  let inputCheckBox = document.createElement("input");
  inputCheckBox.setAttribute("type", "checkbox");
  inputCheckBox.setAttribute("id", "autoCaptchaInput");
  inputCheckBox.setAttribute("name", title);

  inputCheckBox.checked = autoCaptcha;

  inputCheckBox.addEventListener("click", autoCaptchaEvent);
  labelSwitch.appendChild(inputCheckBox);

  let spanSliderRound = document.createElement("span");
  spanSliderRound.setAttribute("class", "slider round");
  labelSwitch.appendChild(spanSliderRound);

  autoCaptchaDiv.appendChild(labelSwitch);

  divServiceContent.appendChild(autoCaptchaDiv);

  let autoLoginDiv = document.createElement("div");
  autoLoginDiv.setAttribute("class", "autoLogin");

  let spanAutoLogin = document.createElement("span");
  spanAutoLogin.textContent = "Auto Login";
  spanAutoLogin.setAttribute("class", "switchLabel");
  if (!autoCaptcha) {
    spanAutoLogin.style.color = "#429a9a";
  } else {
    spanAutoLogin.style.color = "#000000";
  }
  spanAutoLogin.setAttribute("name", title);
  spanAutoLogin.setAttribute("id", "loginLabel");
  autoLoginDiv.appendChild(spanAutoLogin);

  let labelSwitch2 = document.createElement("label");
  labelSwitch2.setAttribute("class", "switch");

  let inputCheckBox2 = document.createElement("input");
  inputCheckBox2.setAttribute("type", "checkbox");
  inputCheckBox2.setAttribute("id", "autoLoginInput");

  inputCheckBox2.setAttribute("name", title);
  inputCheckBox2.checked = autoLogin;
  inputCheckBox2.disabled = !autoCaptcha;

  inputCheckBox2.addEventListener("click", autoLoginEvent);
  labelSwitch2.appendChild(inputCheckBox2);

  let spanSliderRound2 = document.createElement("span");
  spanSliderRound2.setAttribute("class", "slider round");
  labelSwitch2.appendChild(spanSliderRound2);

  autoLoginDiv.appendChild(labelSwitch2);

  let credentialsDiv = document.createElement("div");
  credentialsDiv.setAttribute("class", "credentials");
  credentialsDiv.setAttribute("name", title);

  let inputUsername = document.createElement("input");
  inputUsername.setAttribute("class", "username");
  inputUsername.setAttribute("type", "text");
  inputUsername.setAttribute("placeholder", "Username");
  inputUsername.setAttribute("name", title);
  credentialsDiv.appendChild(inputUsername);

  let inputPassword = document.createElement("input");
  inputPassword.setAttribute("class", "password");
  inputPassword.setAttribute("type", "password");
  inputPassword.setAttribute("placeholder", "Password");
  inputPassword.setAttribute("name", title);
  credentialsDiv.appendChild(inputPassword);

  let buttonUpdate = document.createElement("button");
  buttonUpdate.setAttribute("type", "submit");
  buttonUpdate.setAttribute("class", "update");
  buttonUpdate.setAttribute("name", title);
  buttonUpdate.textContent = "Update";
  buttonUpdate.addEventListener("click", updateCreds);
  credentialsDiv.appendChild(buttonUpdate);

  let credentialsStatus = document.createElement("p");
  credentialsStatus.setAttribute("class", "credentialsStatus");
  credentialsStatus.setAttribute("name", title);
  chrome.storage.local.get(title, (data) => {
    obj = data[title];
    if (obj.username !== undefined && obj.password !== undefined) {
      credentialsStatus.textContent = "Username and Password are configured properly.";
      credentialsStatus.style.color = "green";
    } else {
      credentialsStatus.textContent = "Please update your username and password to enable auto login feature.";
      credentialsStatus.style.color = "red";
    }
  });

  credentialsDiv.appendChild(credentialsStatus);

  credentialsDiv.style.display = autoCaptcha && autoLogin ? "block" : "none";
  autoLoginDiv.appendChild(credentialsDiv);

  divServiceContent.appendChild(autoLoginDiv);

  let serviceDiv = document.createElement("div");
  serviceDiv.setAttribute("class", "service");
  serviceDiv.appendChild(iconImg);
  serviceDiv.appendChild(divServiceContent);

  document.getElementsByClassName("servicesList")[0].appendChild(serviceDiv);
}

function createList() {
  let servicesList = document.querySelector(".servicesList");
  for (let i = 0; i < services.length; i++) {
    chrome.storage.local.get(services[i].name, (data) => {
      console.log();
      createServiceItem(i, services[i].name, services[i].icon, data[services[i].name].autoCaptcha, data[services[i].name].autoLogin);
    });
  }
}
