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
  // var input = document.getElementById("fontUpload");

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
        setTimeout(getDownloadUrl(userId), 500);
      } else if (data["status"] == "success") {
        let result = data["result"];
        document.getElementById("info").innerHTML = "Fonts Converted!";
        window.location.replace("https://transfonter.org/" + result);
        setTimeout(() => {
          document.getElementById("info").innerHTML = "";
          document.getElementById("dragText").classList.remove("hidden");
        }, 3000);
      }
    });
}

// document.getElementById("button1").addEventListener("click", async () => {
//   console.log(document.getElementById("fontUpload").files);
//   document.getElementById("info").innerHTML = "Uploading Fonts";
//   getUserId.then((userId) => {
//     (async () => {
//       for (
//         let i = 0;
//         i < document.getElementById("fontUpload").files.length;
//         i++
//       ) {
//         if (document.getElementById("fontUpload").files[i].size > 15728640) {
//           alert("One of the files you uploaded was too big.");
//           location.reload();
//           break;
//         }
//         await uploadFile(
//           userId,
//           document.getElementById("fontUpload").files[i]
//         );
//       }
//       console.log("DONE");
//       document.getElementById("info").innerHTML = "Converting Fonts: 0%";
//       convertFiles(userId);
//     })();
//     //   console.log(userId);
//     //   uploadFile(userId);
//   });
// });

// document.getElementById("uploadFiles").addEventListener("click", () => {
//   document.getElementById("fontUpload").click();
// });

// document.getElementById("fontUpload").addEventListener("change", (value) => {
//   if (fontUpload.files.length == 1) {
//     document.getElementById("val").innerHTML = "1 file selected";
//   } else if (fontUpload.files.length > 1) {
//     document.getElementById("val").innerHTML =
//       fontUpload.files.length + " files selected";
//   }
// });

document.getElementById("dragzone").addEventListener("drop", (ev) => {
  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    getUserId.then((userId) => {
      (async () => {
        // }
        // console.log([...ev.dataTransfer.items]);
        // for (const item in [...ev.dataTransfer.items]) {
        // console.log(item);
        await Promise.all(
          [...ev.dataTransfer.items].map(async (item) => {
            // [...ev.dataTransfer.items].forEach(function (item, i) {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
              const file = item.getAsFile();
              let fileExt = file.name
                .split(".")
                .slice(-1)
                .toString()
                .toLowerCase();
              if (
                fileExt == "ttf" ||
                fileExt == "otf" ||
                fileExt == "woff" ||
                fileExt == "woff2" ||
                fileExt == "svg"
              ) {
                if (file.size > 15728640) {
                  alert("One of the files you uploaded was too big.");
                } else {
                  // console.log(file);
                  document.getElementById("info").innerHTML =
                    "Uploading Fonts.. ";
                  await uploadFile(userId, file);
                }
              }
            }
          })
        );
        console.log("DONE UPLOPADING");
        document.getElementById("info").innerHTML = "Converting Fonts: 0%";
        await convertFiles(userId);
      })();
    });
  }
});

"dragenter dragstart dragend dragleave dragover drag drop"
  .split(" ")
  .forEach((e) => {
    document.getElementById("dragzone").addEventListener(e, (ev) => {
      // console.log(e);
      ev.preventDefault();
      if (e == "dragover" || e == "dragenter") {
        document.getElementById("dragzone").classList.add("form-dragging");
        document.getElementById("dragText").classList.add("hidden");
      }
      if (e == "dragleave" || e == "dragend" || e == "drop") {
        document.getElementById("dragzone").classList.remove("form-dragging");
        document.getElementById("dragText").classList.remove("hidden");
      }
      if (e == "drop") {
        document.getElementById("dragText").classList.add("hidden");
      }
    });
  });
