

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
var timerMillis = 1000;
var timer_is_on = 0;
var t;

var data;
var webcamDiv;
var debugCanvas, debugContext;
var testCanvas, testContext;
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
    testCanvas = document.getElementById('testCanvas');
    testContext = testCanvas.getContext("2d");

    webcamDiv.width = previewWidth;
    webcamDiv.height = previewHeight;
    debugCanvas.width = previewWidth;
    debugCanvas.height = previewHeight;
    testCanvas.width = outputWidth;
    testCanvas.height = outputHeight;

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

    var canvasSnap;
    var contextSnap;

    Webcam.snap( function(data_uri, canvas, context) { //////////// COULD TRY TO MOVE TO OTHER METHOD, WITHOUT URI
        // copy image to my own canvas for testing  FOR TESTING, REMOVE AFTER
        testContext.drawImage( canvas, 0, 0 );
        contextSnap = context;
    } );


    // save time stamp for all images
    var timestamp = Math.floor((new Date()).getTime() / 1000);

    // loop through all coordinates
    for (var i = 0; i < coordinateList.length; i++) {
        // crop image data and save
        var box_x = Math.round((coordinateList[i].x - sizeOfBoxSelector.value/2) * scale_x);
        var box_y = Math.round((coordinateList[i].y - sizeOfBoxSelector.value/2) * scale_y);
        var box_w = Math.round(sizeOfBoxSelector.value * scale_x);
        var box_h = Math.round(sizeOfBoxSelector.value * scale_y);
        var imageData = contextSnap.getImageData(box_x, box_y, box_w, box_h);
        var buffer = document.createElement('canvas');
        var bufferCtx = buffer.getContext("2d");
        buffer.width = box_w;
        buffer.height = box_h;
        bufferCtx.putImageData(imageData, 0, 0);

        filename = timestamp + "_printer_" + (i+1) + ".png";
        saveCanvas(buffer, filename);
    }


}

function saveCanvas(canvas, name) {
    canvas.toBlob(function(blob) {
        saveAs(blob, name);
    })
}
