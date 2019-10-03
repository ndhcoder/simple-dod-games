var elementGames;
var chessElements;
var boardGame;
var heightBoard;
var widthBoard;
var column = 3;
var row = 3;
var clicked;
var classChess;
var type;

var blackMove = [
	{x: 0 , y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
];
var whiteMove = [
	{x:-1, y:0}, {x: 0 , y:-1}, {x:0, y:1}
];

$(document).ready(function() {
	initDOM();
	initBoardGame({
		"width": 100 / column + "%",
		"height": heightBoard / row + "px"
	});

	$('#notify > button').click(function() { hideNotify(); });
});

var comeByFlagAvaliable = false;
var count = 0;

var initBoardGame = function(config) {
	//console.log(config);
	$.each(elementGames, function(i) {
		$(this).css(config);
		//console.log($(this));
	});
}

var resetAvaliable = function() {
	$('.element-game').removeClass('avaliable-move');
}

var initDOM = function() {
	elementGames = $('.element-game');
	boardGame = $('.main-game');
	heightBoard = boardGame.height();
	widthBoard = boardGame.width();
	chessElements = $('.element-game[class*=chess]');
}

var eventMove = function(element, callback) {
	let x = element.data('row');
	let y = element.data('column');
	//console.log('click element: ' + '(' + x + ', ' + y + ');');
	let type = getType(element);
	var arrMove = [];
	if(type == "black") arrMove = blackMove;
	else if(type == "white") arrMove = whiteMove;

	$.each(arrMove, function(i) {	
		let xx = x + arrMove[i].x;
		let yy = y + arrMove[i].y;

	//	console.log("xx: " , xx + ", " + yy);
		let elem = findElement(xx,yy);
		if(isAvailable(null,null, elem)) {
			elem.addClass('avaliable-move');
		}
	});

	callback(type);
}

var showNotify = function(text = null) {
	//alert("show notify");
	if(text != null) {
		$('#notify').html(text);
	}

	$('#notify').css({
		"transform": "translate(-50%,-50%) scale(1)"
	});
}

var hideNotify = function() {
	$('#notify').css({
		"transform" : "translate(-50%,-50%) scale(0)"
	});
}

var findElement = function(x,y) {
	if(x < 1 || y < 1 || x > row || y > column) return null;
	//console.log("xy : " + x + " , " + y );
	return $('.element-game[data-row=' + x + '][data-column='+ y + ']');
}

var isAvailable = function(x,y, elem = null) {
	if(!elem && (x > row || y > column || x < 1 || y < 1)) return false;
	let e = elem?elem:findElement(x,y);
	let type = getType(e);
	if(type != "empty") return false;
	return true;
}

var getType = function(element) {
	if(!element) return "undefined";
	if(element.hasClass("chess-black")) return "black";
	if(element.hasClass("chess-white")) return "white";
	return "empty";
}

var getCurrentStatus = function() {
	return currentStatus;
}

