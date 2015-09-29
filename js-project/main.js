

///// these work /////
// VGA
// 640 x 480
// 800 x 600
// 1280 x 960
// 1440 x 1080  <-- native?
// 1600 x 1200
// 2048 x 1536
var previewWidth = 640;
var previewHeight = 480;
var outputWidth = 1440;
var outputHeight = 1080;
var scale_x = outputWidth / previewWidth;
var scale_y = outputHeight / previewHeight;
var timerMillis = 5000;
var timer_is_on = 0;
var t;

var data;
var webcamDiv;
var debugCanvas, debugContext;
var coordinateList = [];

var numberOfPrintersSelector;
var sizeOfBoxSelector;
var selectPositionsButton;
var resetPositionsButton;
var selectPositionText;

var isBeingSelected = false;

initialize();



function initialize() {

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
        dest_width: outputWidth,
        dest_height: outputHeight,
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
    recordingIndicatorText = document.getElementById('recordingIndicatorText');
    recordingIndicatorText.innerHTML = "";

    // coordinate click event listener
    debugCanvas.addEventListener("mousedown", clickEvent, false);

    // enable / disable init
    $('#resetPositionsButton').prop('disabled', true);
    $('#startRecordingButton').prop('disabled', true);
    $('#stopRecordingButton').prop('disabled', true);

}

function addInputField(num) {
    var container = document.getElementById('inputFieldContainer');
    if (num === 1) {
        container.innerHTML = '<div class="form-group"><label>Firmware version:</label></div>';
    }
    container.innerHTML += ('<div class="form-group"><input id="in' + num +
                            '" type="text" class="form-control" maxlength="10" placeholder="Printer ' +
                            num + ' firmware"></div>');
}

function clearInputFieldContainer() {
    document.getElementById('inputFieldContainer').innerHTML = "";
}

// hook up buttons
document.getElementById("selectPositionsButton").addEventListener("click", function(){
    selectPositions();
});

document.getElementById("resetPositionsButton").addEventListener("click", function(){
    resetPositions();
});

document.getElementById("startRecordingButton").addEventListener("click", function(){
    startRecording();
});

/////// TODO  Stop recording doesnt reset.. merely stops so you can reposition and then restart again.. without coordinate loss
document.getElementById("stopRecordingButton").addEventListener("click", function(){
    resetPositions();
});


// button actions
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
    recordingIndicatorText.innerHTML = "";
    clearDebugCanvas();
    clearInputFieldContainer();

    stopRecording();
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

    // save coordinate in global list
    coordinateList.push({x:x, y:y});

    // draw rectangle
    var boxSize = sizeOfBoxSelector.value;
    debugContext.beginPath();
    debugContext.lineWidth="3";
    debugContext.strokeStyle="#FFFF66";
    debugContext.rect(x-boxSize/2, y-boxSize/2, boxSize, boxSize);
    debugContext.stroke();

    // draw box number
    debugContext.font="20px Verdana";
    debugContext.fillStyle="#FFFF66";
    debugContext.fillText(coordinateList.length,x-boxSize/2,y-boxSize/2-5);

    // add input field for printer description
    addInputField(coordinateList.length);

    // display info
    selectPositionText.innerHTML = "printers selected: " + coordinateList.length + "/" + numberOfPrintersSelector.value;

    // check if ready to record!
    if (coordinateList.length === parseInt(numberOfPrintersSelector.value)) {
        $('#startRecordingButton').prop('disabled', false);
        $('#stopRecordingButton').prop('disabled', true);
        isBeingSelected = false;
        selectPositionText.innerHTML = "ready to record..";
    }

}

function clearDebugCanvas() {
    debugContext.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
}


// frame loop stuff
function timedCount() {
    snapshot();
    t = setTimeout(function(){timedCount()}, timerMillis);
}

function startRecording() {
    $('#startRecordingButton').prop('disabled', true);
    $('#stopRecordingButton').prop('disabled', false);
    recordingIndicatorText.innerHTML = "RECORDING";
    if (!timer_is_on) {
        timer_is_on = 1;
        timedCount();
    }
}

function stopRecording() {
    clearTimeout(t);
    timer_is_on = 0;
}


// take snapshot and do stuff with it!
function snapshot() {

    // number of printers monitored
    var numPrinters = coordinateList.length;

    // save time stamp for all images
    var timestamp = Math.floor((new Date()).getTime() / 1000);

    // create buffer canvas and for full image
    var canvasSnap = document.createElement('canvas');
    var contextSnap = canvasSnap.getContext("2d");
    canvasSnap.width = outputWidth;
    canvasSnap.height = outputHeight;
    Webcam.snap( function() {}, canvasSnap );

    // create buffer canvas strip to hold cropped images
    var box_w = Math.round(sizeOfBoxSelector.value * scale_x);
    var box_h = Math.round(sizeOfBoxSelector.value * scale_y);
    var buffer = document.createElement('canvas');
    buffer.width = box_w * numPrinters;  // stack cropped images sideways
    buffer.height = box_h;
    var bufferCtx = buffer.getContext("2d");

    // loop through all coordinates
    var printerDescription = "";
    for (var i = 0; i < numPrinters; i++) {
        // crop image data
        var box_x = Math.round((coordinateList[i].x - sizeOfBoxSelector.value/2) * scale_x);
        var box_y = Math.round((coordinateList[i].y - sizeOfBoxSelector.value/2) * scale_y);
        var imageData = contextSnap.getImageData(box_x, box_y, box_w, box_h);
        bufferCtx.putImageData(imageData, i*box_w, 0); // stitch to image mosaic

        // write filename with printer descriptions
        var fieldValue = document.getElementById('in' + (i+1)).value;
        if (fieldValue == "") fieldValue = "null";
        printerDescription += ("_" + fieldValue);
    }

    // save data with unique filename
    filename = timestamp + "_snap_" + numPrinters + printerDescription + ".png";
    saveCanvas(buffer, filename);

}

function saveCanvas(canvas, name) {
    canvas.toBlob(function(blob) {
        saveAs(blob, name);
    })
}
