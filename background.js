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

chrome.runtime.onInstalled.addListener(function () {
  for (let i = 0; i < services.length; i++) {
    let obj = {};
    obj[services[i].name] = {
      autoCaptcha: true,
      autoLogin: false,
      username: undefined,
      password: undefined,
    };
    chrome.storage.local.set(obj);
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    port.onDisconnect.addListener(() => {
      for (let i = 0; i < services.length; i++) {
        let name = services[i].name;
        chrome.storage.local.get(name, (data) => {
          obj = data[name];
          if (obj.username === undefined || obj.password === undefined) {
            obj.autoLogin = false;
            chrome.storage.local.set({ [name]: obj });
          }
        });
      }
    });
  }
});
