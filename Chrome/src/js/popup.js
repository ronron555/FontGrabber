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

function fontFetch() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const result = chrome.tabs.sendMessage(tabs[0].id, {
      msg: "getFonts",
    });
    result.then((value) => {
      if (Object.keys(value).length == 0) {
        document.getElementById("info0").innerHTML = "No Fonts Found.";
        document.getElementById("info0").style.display = "block";
        document.getElementById("info1").style.display = "none";
        document.getElementById("button1").remove();
      } else {
        let totalFontCount = 0;
        Object.keys(value).forEach((fontType) => {
          totalFontCount = totalFontCount + value[fontType].length;
        });
        let fontCount = Object.keys(sortFonts(value)).length;
        document.getElementById("info0").innerHTML = "<b> Fonts Found! </b>";
        document.getElementById("info0").style.display = "block";
        document.getElementById("info1").innerHTML =
          "<b>" + fontCount + "</b> Fonts";
        document.getElementById("info1").style.display = "block";
        document.getElementById("info2").innerHTML =
          "<b>" + Object.keys(value).length + "</b> Types";
        document.getElementById("info2").style.display = "block";
        document.getElementById("info3").innerHTML =
          "<b>" + totalFontCount + "</b> Total Font Files";
        document.getElementById("info3").style.display = "block";
        document.getElementById("button2").style.display = "none";
        document.getElementById("button1").style.display = "inline";
        document.getElementById("button1").innerHTML = "Download Fonts";
        document.getElementById("button1").classList.remove("button-left");
        document
          .getElementById("button1")
          .removeEventListener("click", scanWebsite);
        document.getElementById("button1").addEventListener("click", () => {
          chrome.storage.session
            .set({ fontsObject: value })
            .then(gotoURL("src/html/download.html"));
        });
      }
    });
  });
}

function gotoURL(url) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs[0];
    chrome.tabs.update(tab.id, { url: url });
  });
}

const scanWebsite = () => {
  document.getElementById("info0").innerHTML = "<b>Scanning Website...</b>";
  document.getElementById("info0").style.display = "block";
  document.getElementById("info1").innerHTML = "can take up to a minute";
  document.getElementById("info1").style.display = "block";
  document.getElementById("button1").style.display = "none";
  document.getElementById("button2").style.display = "none";
  fontFetch();
};

document.getElementById("button1").addEventListener("click", scanWebsite);

document.getElementById("button2").addEventListener("click", () => {
  gotoURL("src/html/convert.html");
});
