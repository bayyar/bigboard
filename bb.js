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
var avgValue = {0:0,1:6.5,2:25,3:55.5,4:98,5:152.5,6:219,7:297.5,8:388,9:490.5,10:605,11:731.5,12:870,13:1020.5,14:1183,15:1357.5,16:1544,17:1742.5,18:1953,19:2175.5, 20:2410};

// Grey out selected player
$(document).on('click', '#player.btn-default', function () {
    if ($(this).siblings('#flag').hasClass('btn-danger'))
        $(this).siblings('#flag').removeClass('btn-danger').addClass('prev-flagged');
    else if ($(this).siblings('#yes').hasClass('btn-success')) {
        $(this).siblings('#yes').removeClass('btn-success').addClass('prev-yes');
    }
    $(this).parent().children().removeClass('btn-default').addClass('chosen');
});

// Ungrey unselected player
$(document).on('click', '#player.btn.chosen', function () {
    if ($(this).siblings('#flag').hasClass('prev-flagged'))
        $(this).siblings('#flag').removeClass('prev-flagged').addClass('btn-danger');
    else if ($(this).siblings('#yes').hasClass('prev-yes'))
        $(this).siblings('#yes').removeClass('prev-yes').addClass('btn-success');
    $(this).parent().children().removeClass('chosen').addClass('btn-default');  
});

// Flag and unflag a player
$(document).on('click', '#flag.btn-default', function () {  
    $(this).toggleClass('btn-danger', 'btn-default');
    $(this).siblings('#player').toggleClass('btn-danger', 'btn-default');
});

// Select (draft) a player
$(document).on('click', '#yes.btn-default', function () {
	if ($(this).hasClass("mdl")) {
		$(this).toggleClass('btn-success', 'btn-default');
	} else {
        if ($(this).siblings('#flag').hasClass('btn-danger')) {
            $(this).siblings().removeClass('btn-danger').addClass('btn-success prev-flagged');
        }
        $(this).parent().children().removeClass('btn-default').addClass('btn-success');
        updateScoreBoard($(this).data("rank"), $(this).data("position"), 1);
	};
}); 

// Unselect a player
$(document).on('click', '#yes.btn-success', function () {
	if ($(this).hasClass('mdl')) {
        $(this).toggleClass('btn-success', 'btn-default');
	}  else {
        if ($(this).siblings('#flag').hasClass('prev-flagged')) {
            $(this).siblings().removeClass('btn-success prev-flagged').addClass('btn-danger');
        }
        $(this).parent().children().removeClass('btn-success').addClass('btn-default');
        updateScoreBoard($(this).data("rank"), $(this).data("position"), -1);    
	}
}); 

// Helper function to update the scoreboard, given a rank (#), position, and direction of change (1 or -1)
function updateScoreBoard(rank, position, change) {
    picks += 1 * change;
    $('.picks').html(picks);
    curValue += rank * change;
    voa = avgValue[picks] - curValue;
    $('.voa').html(voa);
    updatePickTypes(position, 1 * change);
    $('.pickTypes').html('(RB: '+numRb+', WR: '+numWr+', TE: '+numTe+', QB: '+numQb+')');
}

// Helper function to update picks given position and direction of change (1 or -1)
function updatePickTypes(position, change) {
	if (position == "RB") numRb += change;
	else if (position == "WR") numWr += change;
	else if (position == "TE") numTe += change;
	else numQb += change;
};
