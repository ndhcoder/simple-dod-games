"use strict";
var turn = ["black", "white"];
var turnIndex = 0;
var turnBoss = 0;
var play;

$(document).ready(function() {
	 play = new playManager();
	// var testSTT = [
	// 	[0,0,0,0,0],
	// 	[0,0,0,1,1],
	// 	[0,0,0,2,0],
	// 	[0,0,0,2,0]	
	// ];
	// console.log(play.find(testSTT, 8, BLACK_FLAG));

	// console.log(play.gameOver(testSTT, BLACK_FLAG, true));

	play.getOptimal().forEach(function(key, val) {
		console.log(key, " : " + val);
	});
	regEventChessElement();
	if(turnIndex == turnBoss) play.auto();
});

function regEventChessElement() {
	 $(document).on('click','.element-game[class*=chess]', function(e) {
	 	e.stopImmediatePropagation();
	 	if(comeByFlagAvaliable) {
	 		comeByFlagAvaliable = false;
	 		return;
	 	}

		clicked = $(this);
		type = getType(clicked);
		if(type != turn[turnIndex]) {
			resetAvaliable();
			return;
		}

		$('.element-game[class*=chess]').html('');
		if(clicked.data('row') == 1 && type == 'white') {
			clicked.html("<button class=\"done-moved-up\"></button>");
		}
		else if(clicked.data('column') == column && type =='black') {
			clicked.html("<button class=\"done-moved-right\"></button");
		}

		if(type != "empty") resetAvaliable();
		eventMove($(this), function(type) {
			classChess = (type=="black")?("chess-black"):("chess-white");
			$(document).on('click', '.avaliable-move', function(e) {
				e.stopImmediatePropagation();
				if(!clicked.hasClass('chess-black') && !clicked.hasClass('chess-white')) {
					return;
				}
				clicked.html('');
				clicked.removeClass("chess-black");
				clicked.removeClass("chess-white");
				
				//console.log(count + " : ");
				//console.log(clicked);	
				$(this).addClass(classChess);
				$('.has-focus').removeClass('has-focus');
				$(this).addClass('has-focus');
				comeByFlagAvaliable = true;
				let turn_flag = turnIndex == 0 ? WHITE_FLAG : BLACK_FLAG;
				turnIndex = (turnIndex + 1)%2;
				$('#show-turn').html('Player : ' + turn[turnIndex]);
				play.lazyUpdateCurrentStatus();
			//	console.log(play.getCurrentStatus(), turnIndex, true);
				if(play.gameOver(play.getCurrentStatus(), turn_flag, true)) {

					showNotify(turnIndex == turnBoss ? "You Win" : "You Lose");
					return;
				}
				if(turnIndex == turnBoss) play.auto();
				resetAvaliable();
			});
		});
	});

	$(document).on('click', 'button[class*="done-moved"]', function(e) {
		e.stopImmediatePropagation();
		$(this).parent().removeClass('chess-black');
		$(this).parent().removeClass('chess-white');
		$(this).parent().html('');
		resetAvaliable();
		let turn_flag = turnIndex == 0 ? WHITE_FLAG : BLACK_FLAG;
		turnIndex = (turnIndex + 1)%2;
		play.lazyUpdateCurrentStatus();
	//	console.log(play.gameOver(getCurrentStatus(), turnIndex, true);
		if(play.gameOver(play.getCurrentStatus(), turn_flag, true)) {
			showNotify(turnIndex == turnBoss ? "You Win" : "You Lose");
			return;
		}
		if(turnIndex == turnBoss) play.auto();
	});
}
