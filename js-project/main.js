
// globals

///// these work /////
// VGA
// 1280 x 960
// 1440 x 1080  <-- native?
// 1600 x 1200
// 2048 x 1536


var previewWidth = 640;
var previewHeight = 480;
var outputWidth = 800;
var outputHeight = 600;
var timerMillis = 1000;
var timer_is_on = 0;

var data;
var webcamDiv;
var debugCanvas, debugContext;
var coordinateList = [];

var numberOfPrintersSelector;
var sizeOfBoxSelector;
var selectPositionsButton;
var resetPositionsButton;
var selectPositionText;

var numberOfPrinters = 3;
var sizeOfBox = 40;
var isBeingSelected = false;

initialize();



function initialize() {

    // hide debugPanel
    // $("#debugPanel").toggleClass('hidden');

    // webcam stuff
    webcamDiv = document.getElementById('webcamDiv');
    debugCanvas = document.getElementById('debugCanvas');
    debugContext = debugCanvas.getContext("2d");

    webcamDiv.width = previewWidth;
    webcamDiv.height = previewHeight;
    debugCanvas.width = previewWidth;
    debugCanvas.height = previewHeight;

    Webcam.set({
        width: previewWidth,
        height: previewHeight,
        dest_width: previewWidth,
        dest_height: previewHeight,
        image_format: 'png',
        jpeg_quality: 100,
        force_flash: false
    });
    Webcam.attach( '#webcamDiv' );

    // button and div stuff
    numberOfPrintersSelector = document.getElementById('numberOfPrintersSelector');
    sizeOfBoxSelector = document.getElementById('sizeOfBoxSelector');
    selectPositionText = document.getElementById('selectPositionText');
    selectPositionText.innerHTML = "select printers"

    // coordinate click event listener
    debugCanvas.addEventListener("mousedown", clickEvent, false);

    // enable / disable init
    $('#resetPositionsButton').prop('disabled', true);
    $('#startRecordingButton').prop('disabled', true);
    $('#stopRecordingButton').prop('disabled', true);


}

// get click coordinates
function clickEvent(event) {

    if (isBeingSelected === false) {
      return;
    }

      var x = event.x;
      var y = event.y;

      x -= debugCanvas.offsetLeft;
      y -= debugCanvas.offsetTop;

      // draw rectangle
      var boxSize = sizeOfBoxSelector.value;
      debugContext.beginPath();
      debugContext.lineWidth="3";
      debugContext.strokeStyle="#FFFF66";
      debugContext.rect(x-boxSize/2, y-boxSize/2, boxSize, boxSize);
      debugContext.stroke();

      // save coordinate in global list
      coordinateList.push({x:x, y:y});

      // display info
      selectPositionText.innerHTML = "printers selected: " + coordinateList.length + "/" + numberOfPrintersSelector.value;

      // end saving
      if (coordinateList.length === parseInt(numberOfPrintersSelector.value)) {

        $('#startRecordingButton').prop('disabled', false);
        $('#stopRecordingButton').prop('disabled', false);

          // ready to record!
          isBeingSelected = false;

          selectPositionText.innerHTML = "ready to record..";
      }

}


// hook up buttons
document.getElementById("selectPositionsButton").addEventListener("click", function(){
    selectPositions();
});

document.getElementById("resetPositionsButton").addEventListener("click", function(){
    resetPositions();
});

document.getElementById("startRecordingButton").addEventListener("click", function(){
    startTimer();
});

document.getElementById("stopRecordingButton").addEventListener("click", function(){
    stopTimer();
});



// hook up input divs



// frame loop stuff
function timedCount() {
    snapshot();
    t = setTimeout(function(){timedCount()}, timerMillis);
}

function startTimer() {
    if (!timer_is_on) {
        timer_is_on = 1;
        timedCount();
    }
}

function stopTimer() {
    clearTimeout(t);
    timer_is_on = 0;
}


// take snapshot and do stuff with it!
function snapshot() {

  // Webcam.snap( function(data_uri, canvas, context) {
  //         // copy image to my own canvas
  //         debugContext.drawImage( context, 0, 0 );
  //     } );

  // Webcam.snap( function(data_uri) {
  //         document.getElementById('my_result').innerHTML = '<img src="'+data_uri+'"/>';
  //     } );

    // // get data and extract raw pixels
    // Webcam.snap( function() {}, debugCanvas );
    // // imageContext = imageCanvas.getContext('2d');
    // // data = imageContext.getImageData(0,0,imageCanvas.width,imageCanvas.height);
    // // processData(data);
    //
    // debugContext = debugCanvas.getContext("2d");
    // // draw to canvas...
    // var blobOut;
    // debugCanvas.toBlob(function(blob) {
    //   blobOut = blob;
    // });

    // return blobOut;
}

function selectPositions() {
    $('#numberOfPrintersSelector').prop('disabled', true);
    $('#sizeOfBoxSelector').prop('disabled', true);
    $('#selectPositionsButton').prop('disabled', true);
    $('#resetPositionsButton').prop('disabled', false);
    $('#startRecordingButton').prop('disabled', true);
    $('#stopRecordingButton').prop('disabled', true);

    isBeingSelected = true;
    coordinateList = [];
    selectPositionText.innerHTML = "select printers"
}

function resetPositions() {
  $('#numberOfPrintersSelector').prop('disabled', false);
  $('#sizeOfBoxSelector').prop('disabled', false);
  $('#selectPositionsButton').prop('disabled', false);
  $('#resetPositionsButton').prop('disabled', true);
  $('#startRecordingButton').prop('disabled', true);
  $('#stopRecordingButton').prop('disabled', true);

  isBeingSelected = false;
  coordinateList = [];
  selectPositionText.innerHTML = "select printers"
  clearDebugCanvas();
}


// var blob = snapshot();
// saveBlob(blob);
// // togglePanel();  // bring snap to front

function saveBlob(blob) {
  saveAs(blob, "image-" + Math.floor((new Date()).getTime() / 1000) + ".png");
}




function getPixel(data,x,y) {
    if(x<0 || x>=data.width || y<0 || y>=data.height) {
        return({r:0, g:0, b:0, a:0});
    } else {
        var index = (y*data.width+x)*4;
        return({r:data.data[index+0], g:data.data[index+1], b:data.data[index+2], a:data.data[index+3]});
    }
}


function clearDebugCanvas() {
    debugContext.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
}


function drawCircle(context, rad, xPos, yPos, color) {
    context.beginPath();
    context.arc(xPos, yPos, rad, 0, 2 * Math.PI, false);
    context.strokeWidth = 1;
    context.strokeStyle = color; // 'green' or '#ff003300'
    context.stroke();
}


function drawDot(context, rad, xPos, yPos, color) {
    context.beginPath();
    context.arc(xPos, yPos, rad, 0, 2 * Math.PI, false);
    context.fillStyle = color; // 'green' or '#ff003300'
    context.fill();
}


function togglePanel() {
    $("#debugPanel").toggleClass('hidden');
    $("#webcamPanel").toggleClass('hidden');
}
