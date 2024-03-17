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
        gotoURL(downloadLink);
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
