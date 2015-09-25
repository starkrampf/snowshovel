/**
 * Created by matthias on 3/23/15.
 */

google.load('visualization', '1.1', {packages: ['line']});
google.setOnLoadCallback(drawChart);

function drawChart(diopters,sineCoeffs) {

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Angle (rad)');
    data.addColumn('number', 'Data');
    data.addColumn('number', 'Fit');
    data.addColumn('number', 'Top');
    data.addColumn('number', 'Bottom');

    // add data
    var dataBuffer = [];
    for (var i=0; i<diopters.length; i++) {
        if (diopters[i] !== null) {
            dataBuffer.push([diopters[i].angle,diopters[i].diopter,sineCoeffs.amplitude*Math.sin(sineCoeffs.frequency*diopters[i].angle+sineCoeffs.phase)+sineCoeffs.offset,15,-15]);
        }
    }

    data.addRows(dataBuffer);

    var options = {
        width: 640,
        height: 480,
        curveType: 'function',
        legend: { position: 'bottom' }
    };

    var chart = new google.charts.Line(document.getElementById('linechart_material'));

    chart.draw(data, options);
}
