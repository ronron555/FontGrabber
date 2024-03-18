document.getElementById("dragzone").addEventListener("drop", (ev) => {
  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    getUserId.then((userId) => {
      (async () => {
        await Promise.all(
          [...ev.dataTransfer.items].map(async (item) => {
            // console.log(item);
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
        convertFiles(userId);
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
