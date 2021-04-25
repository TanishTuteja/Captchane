chrome.storage.local.get("Webmail", async (data) => {
  let obj = data["Webmail"];
  if (obj.autoCaptcha) {
    await solveCaptcha();
    if (obj.autoLogin) {
      loginUser(obj.username, obj.password);
    }
  }
});

async function solveCaptcha() {
  let img = document.getElementById("captcha_image");

  let canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);

  function toGrayScale(imgData) {
    for (let i = 0; i < imgData.data.length; i += 4) {
      let color = 0.299 * imgData.data[i] + 0.587 * imgData.data[i + 1] + 0.114 * imgData.data[i + 2];
      imgData.data[i] = color;
      imgData.data[i + 1] = color;
      imgData.data[i + 2] = color;
    }
  }

  function threshold(imgData) {
    for (let i = 0; i < imgData.data.length; i++) {
      if (imgData.data[i] < 130) {
        imgData.data[i] = 0;
      } else {
        imgData.data[i] = 255;
      }
    }
  }

  function segment(imgData, ctx) {
    let start = null;
    let segments = [];
    for (let i = 0; i < imgData.width; i++) {
      let fore = 0;
      for (let j = 0; j < imgData.height; j++) {
        if (imgData.data[4 * (j * imgData.width + i)] === 0) {
          fore++;
        }
      }

      if (fore >= 1 && start === null) {
        start = i;
        segments.push(i);
      } else if (fore < 1 && start !== null) {
        segments.push(i);
        start = null;
      }
    }

    if (start !== null) {
      segments.push(imgData.width);
    }

    chars = [];
    for (let i = 0; i < segments.length; i += 2) {
      let curr = [];
      for (let k = 0; k < imgData.height; k++) {
        let j = Math.max(0, segments[i] - 2);
        while (j < Math.min(imgData.width, segments[i + 1] + 2)) {
          let base = 4 * (k * imgData.width + j);
          curr.push(imgData.data[base]);
          curr.push(imgData.data[base + 1]);
          curr.push(imgData.data[base + 2]);
          curr.push(imgData.data[base + 3]);
          j++;
        }
      }
      let width = curr.length / (4 * imgData.height);
      let currRow = 0;
      while (currRow < imgData.height) {
        let fore = false;
        for (let j = 0; j < width; j++) {
          if (curr[4 * (currRow * width + j)] === 0) {
            fore = true;
            break;
          }
        }
        if (fore) {
          break;
        }
        currRow++;
      }

      let maxRow = imgData.height - 1;
      while (maxRow >= 0) {
        let fore = false;
        for (let j = 0; j < width; j++) {
          if (curr[4 * (maxRow * width + j)] === 0) {
            fore = true;
            break;
          }
        }
        if (fore) {
          break;
        }
        maxRow--;
      }

      let currFinal = [];
      for (let i = 4 * Math.max(currRow - 2, 0) * width; i < Math.min(maxRow + 3, imgData.height) * 4 * width; i++) {
        currFinal.push(curr[i]);
      }

      let height = currFinal.length / (4 * width);
      let newImgData = ctx.createImageData(width, height);
      for (let i = 0; i < 4 * width * height; i++) {
        newImgData.data[i] = currFinal[i];
      }
      chars.push(newImgData);
    }
    return chars;
  }

  const { createWorker, PSM } = Tesseract;

  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  toGrayScale(imgData);
  threshold(imgData);
  ctx.putImageData(imgData, 0, 0);
  let characters = segment(imgData, ctx);
  let text = await recogArray(characters);
  document.getElementsByName("captcha_input")[0].value = text;

  async function recognize(myCanvas) {
    let worker = createWorker({});
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    await worker.setParameters({ tessedit_pageseg_mode: 10, tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" });
    const {
      data: { text },
    } = await worker.recognize(myCanvas);
    await worker.terminate();
    return text;
  }

  async function recogArray(characters) {
    let str = "";
    for (let i = 0; i < characters.length; i++) {
      let canvasDraw = document.createElement("canvas");
      canvasDraw.width = characters[i].width;
      canvasDraw.height = characters[i].height;
      let ctxDraw = canvasDraw.getContext("2d");
      ctxDraw.putImageData(characters[i], 0, 0);

      let rec = await recognize(canvasDraw);
      str += rec;
    }
    return str.replace(/[\r\n]+/gm, "");
  }
}

function loginUser(username, password) {
  document.getElementById("rcmloginuser").value = username;
  document.getElementById("rcmloginpwd").value = password;
  document.getElementById("rcmloginsubmit").click();
}
