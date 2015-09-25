
// globals
var width = 640;
var height = 480;
var timerMillis = 100;
var timer_is_on = 0;

var data;
var videoCanvas;
var debugCanvas, debugContext;

var numberOfPrinters = 3;
var sizeOfBox = 40;
var isBeingSelected = 0;

initialize();



function initialize() {

    videoCanvas = document.getElementById('webcamDiv');
    debugCanvas = document.getElementById('canvasDiv');
    debugContext = debugCanvas.getContext("2d");

    videoCanvas.width = width;
    videoCanvas.height = height;
    debugCanvas.width = width;
    debugCanvas.height = height;

    Webcam.set({
        width: width,
        height: height,
        dest_width: width,
        dest_height: height,
        image_format: 'png',
        jpeg_quality: 100,
        force_flash: false
    });
    Webcam.attach( '#webcamDiv' );

}

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

function snapshot() {

  Webcam.snap( function(data_uri, canvas, context) {
          // copy image to my own canvas
          debugContext.drawImage( context, 0, 0 );
      } );


    // // get data and extract raw pixels
    // Webcam.snap( function() {}, imageCanvas );
    // imageContext = imageCanvas.getContext('2d');
    // data = imageContext.getImageData(0,0,imageCanvas.width,imageCanvas.height);
    // processData(data);
}

// function processData(data) {
//
//     ////// DEBUG CANVAS DRAWING //////
//     clearDebugCanvas();
//
//     //set the data back
//     debugContext.putImageData(data,0,0);
//
// }




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


function toggleDebug() {
    $("#debugPanel").toggleClass('hidden');
    $("#cameraPanel").toggleClass('hidden');
    $("#chartPanel").toggleClass('hidden');
}
