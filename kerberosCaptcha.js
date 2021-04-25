chrome.storage.local.get("Kerberos", async (data) => {
  let obj = data["Kerberos"];
  if (obj.autoCaptcha) {
    await solveCaptcha();
    if (obj.autoLogin) {
      loginUser(obj.username, obj.password);
    }
  }
});

async function solveCaptcha() {
  let img = document.getElementsByClassName("captcha-image")[0];

  let canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);

  function medianBlur(imgData) {
    let width = imgData.width;
    let height = imgData.height;
    const copy = JSON.parse(JSON.stringify(imgData));

    for (let i = 0; i < imgData.height; i++) {
      for (let j = 0; j < imgData.width; j++) {
        let pixels = [];
        if (j - 1 >= 0) {
          pixels.push(copy.data[4 * (i * width + j - 1)]);
          if (i - 1 >= 0) {
            pixels.push(copy.data[4 * ((i - 1) * width + j - 1)]);
          }
          if (i + 1 < height) {
            pixels.push(copy.data[4 * ((i + 1) * width + j - 1)]);
          }
        }
        if (j + 1 < width) {
          pixels.push(copy.data[4 * (i * width + j + 1)]);
          if (i - 1 >= 0) {
            pixels.push(copy.data[4 * ((i - 1) * width + j + 1)]);
          }
          if (i + 1 < height) {
            pixels.push(copy.data[4 * ((i + 1) * width + j + 1)]);
          }
        }
        if (i - 1 >= 0) {
          pixels.push(copy.data[4 * ((i - 1) * width + j)]);
        }
        if (i + 1 < height) {
          pixels.push(copy.data[4 * ((i + 1) * width + j)]);
        }

        pixels.sort(function (a, b) {
          return a - b;
        });

        let half = Math.floor(pixels.length / 2);

        let median = pixels.length % 2 === 0 ? (pixels[half - 1] + pixels[half]) / 2.0 : pixels[half];

        imgData.data[(i * width + j) * 4] = median;
      }
    }
  }

  function threshold(imgData) {
    for (let i = 0; i < imgData.data.length; i++) {
      if (imgData.data[i] < 150) {
        imgData.data[i] = 0;
      } else {
        imgData.data[i] = 255;
      }
    }
  }

  const { createWorker, PSM } = Tesseract;

  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  threshold(imgData);
  medianBlur(imgData);
  ctx.putImageData(imgData, 0, 0);
  let text = await recogWord(canvas);
  document.getElementsByName("captcha")[0].value = text;

  async function recogWord(canvas) {
    let worker = createWorker({});
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    await worker.setParameters({ tessedit_pageseg_mode: 8, tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" });
    const {
      data: { text },
    } = await worker.recognize(canvas);
    await worker.terminate();
    return text;
  }
}

function loginUser(username, password) {
  document.getElementsByName("username")[0].value = username;
  document.getElementsByName("password")[0].value = password;
  document.getElementsByName("submit")[0].click();
}
