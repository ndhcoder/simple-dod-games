"use strict";
var INF = 1000000000;
var BLACK_FLAG = 1;
var WHITE_FLAG = 2;
var NONE = 0;

var playManager = function() {
	var currentStatus = [
		[0,0,0,0,0],
		[0,1,0,0,0],
		[0,1,0,0,0],
		[0,0,2,2,0]
	];
	var points = [
		[
			[0,0,0,0,0],
			[0,-10,-25,-40,-60],
			[0,-5,-20,-35,-60],
			[0,0,-15,-30,-60]
		],
		[
			[0,60,60,60,0],
			[0,30,35,40,0],
			[0,15,20,25,0],
			[0,0,5,10,0]
		]
	];
	//var gameOver = false;
	var deeper = 8;
	var optimal = new Map();
	var pointSave = new Map();
	var turnBoss = BLACK_FLAG;

	// getter
	this.getCurrentStatus = function() { return currentStatus; }
	this.getDeeper = function() { return deeper; }
	this.getOptimal = function() { return optimal; }
	this.getPointSave = function() { return pointSave; }
	this.getTurnBoss = function() { return turnBoss; }
	this.getGameOver = function() { return gameOver; }

	// setter
	this.setDeeper = function(deep) { deeper = deep; }
	this.setTurnBoss = function(turn) { turnBoss = turn; }
	this.setCurrentStatus = function(stt) { currentStatus = JSON.parse(JSON.stringify(stt)); }
	this.setGameOver = function(ov) { gameOver = ov; }

	// action
	this.find = function(stt, h, flag, fromSTT = null) {
		var winner = this.gameOver(stt,flag);
		if(h == 0 || winner != NONE) {
			//if(h == 5) console.log(stt,h + " -----------" + this.gameOver(stt, WHITE_FLAG));
			var p = this.getPoint(stt);
			if(winner != NONE) {
				p = flag == BLACK_FLAG ? (INF + h) : (- INF - h);
				//console.log("with : "+ p);
				//console.log(stt);
			}
			let setup = {
				mini: p,
				status: stt,
				from: {},
				to: {}
			};

			//	if(h == 5) console.log(setup);

			return setup;
		}

		var move = flag == BLACK_FLAG ? blackMove : whiteMove;
		var mini = flag == BLACK_FLAG ? (INF + deeper*5):(-INF - deeper*5);
		var sttSave = [];
		var from = {};
		var to = {};
		//if(h == 5) console.log(fromSTT,stt);
		for(var i = 1; i <= row; i++) {
			for(var j = 1; j <= column; j++) {
				if(stt[i][j] == flag) {
					//console.log(i,j);
					//if(i == 2 && j == 1) console.log("find " + i  + " ; " + j);
					for(var k = 0; k < 3 ; k++) {
						let xx = i + move[k].x;
						let yy = j + move[k].y;
						
						if(flag == BLACK_FLAG && (xx < 1 || xx > row)) continue;
						if(flag == WHITE_FLAG && (yy < 1 || yy > column)) continue;

						if(stt[xx][yy] != 0 && (xx >= 1 && yy <= column)) {
							continue;
						}

						//if(h == 8) console.log(stt,"(" + i + "," + j + "),(" + xx + " , " + yy + ") , " + flag);
						let s = JSON.parse(JSON.stringify(stt));
						s[i][j] = 0;
						s[xx][yy] = flag;
						//if(h == 6) console.log(s,this.gameOver(s, WHITE_FLAG));

						if(flag == WHITE_FLAG) {
							let temp = this.find(s, h-1, BLACK_FLAG, JSON.parse(JSON.stringify(stt)));
							//if(h == 7) console.log(stt,temp);
							if(mini < temp.mini) {
								mini = temp.mini;
								sttSave = JSON.parse(JSON.stringify(s));
								from.x = i;
								from.y = j;
								to.x = xx;
								to.y = yy;

								// cut alpha-beta
								if(optimal.has(h)) {
									let ev = optimal.get(h);
									//console.log("h = " + h + ", u = " + ev.mini + ", v = " + mini);
									if(ev.mini <= mini) {
										let setup = {
											mini: mini,
											status: sttSave,
											flag: flag,
											from: from,
											to: to
										};

										this.updateOptimal(h, setup, flag)
										return setup;
									}
								}
							}
						}
						else if(flag == BLACK_FLAG) {

							let temp = this.find(s, h-1, WHITE_FLAG, JSON.parse(JSON.stringify(stt)));
							//if(h == 6) console.log(stt,temp);
							// if(h == 6) {
							// 	console.log("DEBUG");
							// 	console.log(temp);
							// }
							if(mini > temp.mini) {

								mini = temp.mini;
								sttSave = JSON.parse(JSON.stringify(s));
								from.x = i;
								from.y = j;
								to.x = xx;
								to.y = yy;

								// cut alpha-beta
								if(optimal.has(h)) {
									let ev = optimal.get(h);
									if(ev.mini >= mini) {
										let setup = {
											mini: mini,
											status: sttSave,
											flag: flag,
											from: from,
											to: to
										};

										this.updateOptimal(h, setup, flag)
										return setup;
									}
								}
							}
						}
					}
				}
			}
		}

		let setup = {
			mini: mini,
			status: sttSave,
			flag: flag,
			from: from,
			to: to
		};

		// if(h == 9) {
		// 	console.log("Tầng đầu : ");
		// 	console.log(setup);
		// }
		this.updateOptimal(h, setup, flag);
		return setup;
	}

	this.updateOptimal = function(key, val, flag) {
		if(optimal.has(key)) {	
			let v = optimal.get(key);

			if(flag == BLACK_FLAG && v.mini > val.mini) {
				optimal.set(key, val);
			}
			else if(flag == WHITE_FLAG && v.mini < val.mini) {
				optimal.set(key,val);
			}
		}
		else optimal.set(key, val);

	//	console.log(val.mini);
	}

	this.getPoint = function(stt) {
		//console.log("Get Point : ");
		let check = pointSave.get(stt);
		if(check) return check;
		var p = 0;
		for(var i = 0; i <= row; i++) {
			for(var j = 1; j <= column + 1; j++) {
				if(stt[i][j] > 0) {
					p+= points[stt[i][j]  - 1][i][j];

					if(stt[i][j] == BLACK_FLAG) {
						for(var k = j+1; k <= column; k++) {
							if(stt[i][k] == WHITE_FLAG) {
								if(k == j + 1) p+= 40;
								else p+=30;
							}
						}
					}
					else {
						for(var k = i - 1; k > 0; k--) {
							if(stt[k][j] == BLACK_FLAG) {
								if(k + 1 == i) p-=40;
								else p-=30;
							}
						}
					}
				}
			}
		}

		pointSave.set(stt,p);
		return p;
	}

	this.gameOver = function(stt, flag, showLog = false) {
		var move;
		var winner;

		if(flag == BLACK_FLAG) {
			move = blackMove;
			winner = WHITE_FLAG;
		}
		else {
			move = whiteMove;
			winner = BLACK_FLAG;
		}

		var d = 0;
		var tmp = false;

		for(var i = 1; i <= row; i++) {
			for(var j = 1; j <= column ; j++) {
				if(stt[i][j] == winner) d++;
				if(stt[i][j] == flag && tmp == false) {
					for(var k = 0; k < 3; k++) {
						let xx = i + move[k].x;
						let yy = j + move[k].y;

						if((xx < 1 || xx > row) && flag == BLACK_FLAG) continue;
						if((yy < 1 || yy > column) && flag == WHITE_FLAG) continue;
						
						if(stt[xx][yy] == 0) tmp = true;
						if((xx < 1  && flag == WHITE_FLAG) || (yy > column && flag == BLACK_FLAG)) tmp = true;
					}
				}
			}
		}
		
		if(showLog == true) {
			console.log("CHECK GAME OVER : ");
			console.log(stt);	
			console.log(d + " , " + tmp);
			console.log(flag==BLACK_FLAG?"black":"white");
			console.log("END CHECK");
		}

		if(d == 0 || tmp == false) return winner;
		return NONE;
	}

	this.jump = function(from, to) {
		var elemFrom = findElement(from.x, from.y);
		var elemTo = findElement(to.x, to.y);
		console.log(elemFrom);
		console.log(elemTo);
		elemFrom.click();
		elemFrom.click();
		if(to.y > column || to.x < 1) {
			elemFrom.find('button').click();
		}
		else elemTo.click();
	}

	this.auto = function() {
		optimal.clear();
		this.lazyUpdateCurrentStatus();
	//	console.log("Status Auto : ");
	//	console.log(this.gameOver(this.getCurrentStatus(), BLACK_FLAG));
	//	console.log(currentStatus);
		var temp = this.find(currentStatus, deeper, turnBoss);
		console.log(temp);
		if(!temp.from.x) {
			showNotify("You Win !!!");
			// optimal.clear();
			// // temp = this.find([
			// // 			[0,0,0,0,0],
			// // 			[0,0,0,0,0],
			// // 			[0,1,2,0,0],
			// // 			[0,2,0,0,0]

			// // ], 10, BLACK_FLAG);

			// console.log("again");
			// console.log(temp);
			// console.log(currentStatus);
		}

		this.jump(temp.from, temp.to);
		this.setCurrentStatus(temp.status);
	}

	this.lazyUpdateCurrentStatus = function() {
		for(var i = 1; i <= row; i++) {
			for(var j = 1; j <= column; j++) {
				let elem = findElement(i,j);
				if(elem.hasClass('chess-black')) {
					currentStatus[i][j] = BLACK_FLAG;
				}
				else if(elem.hasClass('chess-white')) {
					currentStatus[i][j] = WHITE_FLAG;
				}
				else currentStatus[i][j] = NONE;
			}
		}
		//console.log("update:");
		//console.log(currentStatus);
	}
}


