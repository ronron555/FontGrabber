var totalFonts = {};
function extractFontUrl(css, cssURL) {
  const regex = /url\((.*?)\) format\((\'|\")(.*?)(\'|\")\)/g;
  let m;
  var fonts = {};

  var i = 0;
  while ((m = regex.exec(css)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    /*
          Group 0 : url(https://fonts.gstatic.com/s/roboto/v16/ek4gzZ-GeXAPcSbHtCeQI_esZW2xOQ-xsNqO47m55DA.woff2) format('woff2')
          Group 1 : https://fonts.gstatic.com/s/roboto/v16/ek4gzZ-GeXAPcSbHtCeQI_esZW2xOQ-xsNqO47m55DA.woff2
          Group 2 : ' or "
          Group 3 : woff2
          Group 4 : ' or "
      */

    // console.log(m  );
    if (m[1].startsWith("'") || m[1].startsWith('"')) {
      if (fonts[m[3]]) {
        fonts[m[3]].push([m[1].slice(1, -1), cssURL]);
      } else {
        fonts[m[3]] = [[m[1].slice(1, -1), cssURL]];
      }
    } else {
      if (fonts[m[3]]) {
        fonts[m[3]].push([m[1], cssURL]);
      } else {
        fonts[m[3]] = [[m[1], cssURL]];
      }
    }

    i++;
  }
  if (Object.keys(fonts).length > 0) {
    let keys = Object.keys(fonts);
    keys.forEach((key) => {
      if (totalFonts[key]) {
        fonts[key].forEach((font) => totalFonts[key].push(font));
      } else {
        totalFonts[key] = fonts[key];
      }
    });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.msg == "getFonts") {
    (async () => {
      totalFonts = {};
      let allCss = "";
      // console.log(document.styleSheets);
      for (let i = 0; i < document.styleSheets.length; i++) {
        let hrefUrl = "";
        if (document.styleSheets[i].href !== null) {
          hrefUrl = document.styleSheets[i].href;
        } else {
          hrefUrl = window.location.href;
        }
        let localCss = "";
        let styleSheet = document.styleSheets[i];
        styleSheet.crossOrigin = "anonymous";
        try {
          let cssRules = styleSheet["cssRules"];
          for (let j = 0; j < cssRules.length; j++) {
            let cssRule = cssRules[j];
            cssText = cssRule["cssText"];
            localCss = localCss + cssText;
          }
        } catch (e) {
          console.log(i + " LocalCSS ERROR: " + e);
          if (document.styleSheets[i].href !== null) {
            console.log("Trying to Fetch URL...");
            await fetch(document.styleSheets[i].href)
              .then(function (response) {
                return response.text();
              })
              .then(function (data) {
                localCss = data;
                hrefUrl = document.styleSheets[i].href;
              })
              .catch(function (e) {
                console.log(i, "Fetch ERROR: ", e);
              });
          }
        }
        // console.log(localCss);
        allCss = allCss + localCss;
        extractFontUrl(localCss, hrefUrl);
      }

      console.log(totalFonts);
      sendResponse(totalFonts);
    })();
    return true;
  }
});
