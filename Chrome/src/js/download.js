var downloadList = [];

function createDownloadList(sortedFonts) {
  let fontNames = Object.keys(sortedFonts).sort();

  fontNames.forEach((fontName) => {
    let mainDiv = document.createElement("div");
    mainDiv.classList.add("mainFontDiv");
    let fontDiv = document.createElement("div");
    fontDiv.classList.add("fontName");
    let fontTitle = document.createElement("h2");
    fontTitle.appendChild(document.createTextNode(fontName));
    fontDiv.appendChild(fontTitle);
    let downloadDiv = document.createElement("div");
    downloadDiv.classList.add("downloadDiv");

    var fontStyle = document.createElement("style");
    let fontTypes = Object.keys(sortedFonts[fontName]);
    fontTypes.forEach((fontType) => {
      let fontFile = sortedFonts[fontName][fontType][0];
      let fontLocation = sortedFonts[fontName][fontType][1];
      let downloadButton = document.createElement("button");
      downloadButton.appendChild(document.createTextNode(fontType));
      downloadButton.type = "button";
      let downloadLink = "";

      if (fontFile.startsWith("http")) {
        downloadLink = fontFile;
      } else if (fontFile.startsWith("/")) {
        let parts = fontLocation.split("/");
        let baseUrl = parts[0] + "/" + parts[1] + "/" + parts[2];
        downloadLink = baseUrl + "/" + fontFile;
      } else {
        let parts = fontLocation.split("/");
        let cssFolderURL = parts.slice(0, -1).join("/");
        downloadLink = cssFolderURL + "/" + fontFile;
      }

      downloadButton.onclick = () => {
        if (!downloadList.includes(downloadLink)) {
          // console.log("add index " + downloadList.length);
          downloadList.push(downloadLink);
          downloadButton.classList.add("buttonSelected");
          // console.log(downloadList);
        } else {
          let index = downloadList.indexOf(downloadLink);
          // console.log("remove index " + index);
          downloadlist = downloadList.splice(index, 1);
          downloadButton.classList.remove("buttonSelected");
          // console.log(downloadList);
        }
        if (downloadList.length > 0) {
          document.getElementById("programDiv").style.display = "none";
          document.getElementById("buttonsDiv").style.display = "block";
          if (downloadList.length == 1) {
            document.getElementById("downloadSelected").innerHTML =
              "Download Original";
          } else {
            document.getElementById("downloadSelected").innerHTML =
              "Download Original (ZIP)";
          }
        } else {
          document.getElementById("programDiv").style.display = "block";
          document.getElementById("buttonsDiv").style.display = "none";
        }

        // gotoURL(downloadLink);
      };
      downloadButton.classList.add("downloadButton");
      downloadDiv.appendChild(downloadButton);

      fontStyle.appendChild(
        document.createTextNode(
          "\
      @font-face {\
          font-family: " +
            fontName +
            ";\
          src: url('" +
            downloadLink +
            "') format('" +
            fontType +
            "');\
      }\
      "
        )
      );
    });
    fontDiv.appendChild(downloadDiv);
    mainDiv.appendChild(fontDiv);

    let previewDiv = document.createElement("div");
    previewDiv.classList.add("fontPreview");
    previewDiv.appendChild(fontStyle);
    let hebrewFont = document.createElement("span");
    hebrewFont.textContent = "לורם איפסום";
    previewDiv.appendChild(hebrewFont);
    let englishFont = document.createElement("span");
    englishFont.textContent = "Lorem Ipsum";
    previewDiv.appendChild(englishFont);
    previewDiv.style = "font-family: " + fontName + ";";
    mainDiv.appendChild(previewDiv);

    document.getElementById("dynamicDiv").appendChild(mainDiv);
  });
}

function zipAndDownload() {
  var zip = new JSZip();

  function request(url) {
    return new Promise((resolve) => {
      var httpRequest = new XMLHttpRequest();
      httpRequest.open("GET", url, true);
      httpRequest.responseType = "blob";
      httpRequest.onprogress = (e) => {
        document.getElementById("info").innerHTML = "Downloading Fonts.. ";
      };
      httpRequest.onload = (e) => {
        document.getElementById("info").innerHTML = "";
        var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
        zip.file(filename, httpRequest.response);
        resolve();
      };
      httpRequest.send();
    });
  }

  Promise.all(
    downloadList.map(function (url) {
      return request(url);
    })
  ).then(() => {
    console.log(zip);
    zip
      .generateAsync({
        type: "blob",
      })
      .then((content) => {
        let downloadUrl = URL.createObjectURL(content);
        gotoURL(downloadUrl);
        // a.download = "folder" + new Date().getTime();
        // a.innerHTML = "download " + a.download;
      });
  });
}

function convertSelected() {
  function request(url, userId) {
    return new Promise(async (resolve) => {
      var httpRequest = new XMLHttpRequest();
      httpRequest.open("GET", url, true);
      httpRequest.responseType = "blob";
      httpRequest.onprogress = (e) => {
        document.getElementById("info").innerHTML = "Downloading Fonts.. ";
      };
      httpRequest.onload = async (e) => {
        console.log("START UPLOAD FILE");
        let filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
        let file = new File([httpRequest.response], filename);
        await uploadFile(userId, file);
        resolve();
      };
      httpRequest.send();
    });
  }

  getUserId.then((userId) => {
    (async () => {
      Promise.all(
        downloadList.map(async (url) => {
          return request(url, userId);
        })
      ).then(() => {
        console.log("DONE UPLOPADING");
        convertFiles(userId);
      });
    })();
  });
}

function sortFonts(fontsObject) {
  let sortedFonts = {};
  Object.keys(fontsObject).forEach((fontType) => {
    let curType = fontsObject[fontType];
    for (let i = 0; i < curType.length; i++) {
      fontFileName = curType[i][0].split("/").slice(-1);
      fontName = fontFileName.join("").split(".")[0];
      if (!sortedFonts[fontName]) {
        sortedFonts[fontName] = {};
        if (!sortedFonts[fontName][fontType]) {
          sortedFonts[fontName][fontType] = curType[i];
        } else {
          sortedFonts[fontName][fontType].push(curType[i]);
        }
      } else {
        if (!sortedFonts[fontName][fontType]) {
          sortedFonts[fontName][fontType] = curType[i];
        } else {
          sortedFonts[fontName][fontType].push(curType[i]);
        }
      }
    }
  });
  return sortedFonts;
}

function gotoURL(url) {
  window.location.replace(url);
}

function getFonts() {
  chrome.storage.session.get(["fontsObject"]).then((result) => {
    let fontsObject = result["fontsObject"];
    console.log(fontsObject);
    let sortedFonts = sortFonts(fontsObject);
    console.log(sortedFonts);
    createDownloadList(sortedFonts);
  });
}

window.onload = function () {
  getFonts();
};

document.getElementById("programDiv").addEventListener("click", () => {
  window.location.href = "convert.html";
});

document.getElementById("switchConverter").addEventListener("click", () => {
  // window.location.href = "convert.html";
  convertSelected();
});

document.getElementById("downloadSelected").addEventListener("click", () => {
  if (downloadList.length > 1) {
    zipAndDownload();
  } else {
    downloadList.forEach((link) => {
      if (link !== "") {
        gotoURL(link);
      }
    });
  }
});
