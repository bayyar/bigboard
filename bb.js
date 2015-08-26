// Set Google Sheets input
var spreadsheet = "1DbTBz3PYLi3nqw4D_j_8Q1cnSjumzr_RnjQVZS8heJE";
var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheet + "/od6/public/values?alt=json";

// Read Google Sheet into Big Board format
$.getJSON(url, function(data) {
	// Create empty arrays to hold player by round
    var rbArray = [], wrArray = [], teArray = [], qbArray = [];
    // Navigate to player entries
    var entry = data.feed.entry;
    // Read each row
    $(entry).each(function() {
        var name = this.gsx$name.$t;
        var position = this.gsx$position.$t;
        var rank = this.gsx$rank.$t;
        // If new round, start by clearing arrays
        if (rank % 12 == 1) {
            rbArray.length = 0;
            wrArray.length = 0;
            teArray.length = 0;
            qbArray.length = 0;
        }
        // Add the entry into the appropriate position array
        var entry = createButtonSet(name, position, rank);
        if (position == "RB") rbArray.push(entry);
        else if (position == "WR") wrArray.push(entry);
        else if (position == "TE") teArray.push(entry);
        else qbArray.push(entry);
        // If end of round, add arrays to the appropriate columns
        if (rank % 12 == 0) {
            $('tbody:last').append('<tr id="active-row">');
            $('#active-row').append('<td>' + ~~(rank / 12) + '</td>')
            addToTable(rbArray);
            addToTable(wrArray);
            addToTable(teArray);
            addToTable(qbArray);
            $('tr#active-row').removeAttr('id');
            $('tbody:last').append('</tr>')
        }
    });
	
	function createButtonSet(name, position, rank) {
		return '<span class="parent"><button type="button" class="btn btn-default" id="yes" data-rank="'+rank+'" data-position="'+position+'"><span class="glyphicon glyphicon-ok"</span></button><button type="button" class="btn btn-default" id="flag"><span class="glyphicon glyphicon-flag"</span></button><button type="button" class="btn btn-default" id="player">(' + rank + ') ' + name + '</button></span><br />'
	};


    function addToTable(ary) {
        $('#active-row').append('<td id="active-cell">');
        for (var i = 0; i < ary.length; i++) {
        	$('#active-cell').append(ary[i]);
        }
        $('td#active-cell').removeAttr('id');
        $('#active-row').append('</td>');
    }

});

var picks = 0, curValue = 0, voa = 0;
var numRb = 0, numWr = 0, numTe = 0, numQb = 0;
var avgValue = {0:0,1:6.5,2:25,3:55.5,4:98,5:152.5,6:219,7:297.5,8:388,9:490.5,10:605,11:731.5,12:870,13:1020.5,14:1183,15:1357.5,16:1544,17:1742.5};

$(document).on('click', '#player.btn-default', function () {
    $(this).parent().children().removeClass('btn-default').addClass('chosen');  
});

$(document).on('click', '#player.btn.chosen', function () {
    $(this).parent().children().removeClass('chosen').addClass('btn-default');  
});

$(document).on('click', '#flag.btn-default', function () {  
    $(this).toggleClass('btn-danger', 'btn-default');
    $(this).siblings('#player').toggleClass('btn-danger', 'btn-default');
});

$(document).on('click', '#yes.btn-default', function () {
	if ($(this).hasClass("mdl")) {
		console.log("Ho");
		$(this).removeClass('btn-default');
	    $(this).addClass('btn-success');
	} else {
		console.log("Hey");
		$(this).removeClass('btn-default');
	    $(this).addClass('btn-success');
	   	picks++;
	   	$('.picks').html(picks);
	    curValue += $(this).data("rank");
	    voa = avgValue[picks] - curValue;
	    $('.voa').html(voa);
	    updatePickTypes($(this).data("position"),1);
	    $('.pickTypes').html('(RB: '+numRb+', WR: '+numWr+', TE: '+numTe+', QB: '+numQb+')');
	};
}); 

$(document).on('click', '#yes.btn-success', function () {
	if ($(this).hasClass('mdl')) {
		$(this).removeClass('btn-success');
	    $(this).addClass('btn-default');
	}  else {
		$(this).removeClass('btn-success');
	    $(this).addClass('btn-default');
	    picks--;
	    $('.picks').html(picks);
	    curValue -= $(this).data("rank");
	    voa = avgValue[picks] - curValue;
	    $('.voa').html(voa);
	    updatePickTypes($(this).data("position"),-1);
	    $('.pickTypes').html('(RB: '+numRb+', WR: '+numWr+', TE: '+numTe+', QB: '+numQb+')');	    
	}
}); 

function updatePickTypes(position, change) {
	if (position == "RB") numRb += change;
	else if (position == "WR") numWr += change;
	else if (position == "TE") numTe += change;
	else numQb += change;
};
