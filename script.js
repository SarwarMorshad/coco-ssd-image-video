/*
1. Get Elements
2. Handle File type
3. Click Event detect
*/

let video = document.getElementById("video");
let image = document.getElementById("image");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let model;
let mediaType = ""; // To track if the media is video or image
let detectRequested = false; // object detection is requested or not

// Load the COCO-SSD model
cocoSsd.load().then((loadedModel) => {
  model = loadedModel;
  document.getElementById("detectButton").disabled = false;
});

//File Upload Handling
document.getElementById("mediaUpload").addEventListener("change", function (event) {
  let file = event.target.files[0];
  let fileURL = URL.createObjectURL(file); //Url of the file

  // Reset media elements and flags
  resetMedia();
  detectRequested = false;

  if (file.type.startsWith("video/")) {
    video.src = fileURL;
    video.style.display = "block";
    video.onloadeddata = function () {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      mediaType = "video";
    };
  } else if (file.type.startsWith("image/")) {
    image.src = fileURL;
    image.style.display = "block";
    image.onload = function () {
      canvas.width = image.width;
      canvas.height = image.height;
      mediaType = "image";
    };
  }
});

//Detect button clicked
document.getElementById("detectButton").addEventListener("click", function () {
  detectRequested = true;
  detectObjects();
});

function resetMedia() {
  //video.pause();
  video.src = "";
  video.style.display = "none";
  image.src = "";
  image.style.display = "none";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function detectObjects() {
  if (mediaType === "video") {
    detectObjectsInVideo();
  } else if (mediaType === "image") {
    detectObjectsInImage();
  }
}

function detectObjectsInVideo() {
  video.play();
  video.addEventListener("playing", function () {
    detectFrame();
  });
}

function detectFrame() {
  model.detect(video).then((predictions) => {
    drawPredictions(predictions);
    if (detectRequested) {
      requestAnimationFrame(detectFrame);
    }
  });
}

function detectObjectsInImage() {
  model.detect(image).then((predictions) => {
    drawPredictions(predictions);
  });
}

function drawPredictions(predictions) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (mediaType === "video") {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  } else if (mediaType === "image") {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }
  predictions.forEach((prediction) => {
    ctx.beginPath();
    ctx.rect(...prediction.bbox);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.stroke();
    ctx.font = "bold 16px Arial";
    ctx.fillText(
      `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
      prediction.bbox[0],
      prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
    );
  });
}
