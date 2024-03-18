const getUserId = new Promise((resolve) => {
  (async () => {
    await fetch("https://transfonter.org/", {
      method: "Get",
    })
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        const regex = /window.USER_ID = '(.*)';/g;

        let m;
        while ((m = regex.exec(data)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          resolve(m[1]);
        }
      });
  })();
});

async function uploadFile(userId, file) {
  var data = new FormData();
  data.append("user_id", userId);
  data.append("files", file);

  await fetch("https://transfonter.org/fonts/upload", {
    method: "POST",
    body: data,
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      // convertFiles(userId);
    });
}

function convertFiles(userId) {
  var data = new FormData();
  data.append("user_id", userId);
  data.append("family", 1);
  data.append("formats[]", "ttf");
  data.append("hinting", "");
  data.append("language", "");
  data.append("text", "");
  data.append("unicodes", "");
  data.append("fontDisplay", "swap");
  data.append("fontsDirectory", "");

  fetch("https://transfonter.org/fonts/process", {
    method: "POST",
    body: data,
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      getDownloadUrl(userId);
    });
}

function getDownloadUrl(userId) {
  fetch(
    "https://transfonter.org/fonts/status?user_id=" +
      userId +
      "&task_id=" +
      userId,
    {
      method: "GET",
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      if (data["status"] == "process") {
        document.getElementById("info").innerHTML =
          "Converting Fonts: " + data["progress"] + "%";
        setTimeout(() => {
          getDownloadUrl(userId);
        }, 500);
      } else if (data["status"] == "success") {
        let result = data["result"];
        document.getElementById("info").innerHTML = "Fonts Converted!";
        window.location.replace("https://transfonter.org/" + result);
        setTimeout(() => {
          document.getElementById("info").innerHTML = "";
          if (window.location.pathname == "/src/html/convert.html") {
            document.getElementById("dragText").classList.remove("hidden");
          }
        }, 3000);
      }
    });
}
