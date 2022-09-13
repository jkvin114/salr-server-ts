import { GAME } from "./script.js"
import { COLOR_LIST_BG } from "./canvas_control.js"
const sleep = (m) => new Promise((r) => setTimeout(r, m))

export default class GameInterface {
	constructor(game) {
		if (GameInterface._instance) {
			return GameInterface._instance
		}
		GameInterface._instance = this
		this.obsNoti1 = new ObsNotification(".obs_notification1")
		this.obsNoti2 = new ObsNotification(".obs_notification2")
		this.winwidth = window.innerWidth
		this.winheight = window.innerHeight

		this.game=game
		this.nextTurnBtnShown = false
		this.skillBtnShown = false
		this.messageBtnShown = false

		this.lastZoomScale = null
		this.waitingDoudleClick = false
		this.mousePosX = 0
		this.mousePosY = 0
		this.clicked = false //for drag check
		this.chat_hidden = false

		this.multikillAlertTimeout=null
		this.killTextTimeout=null

		//important,repetedly used DOM elements
		this.elements = {
			hpframe: $(".hpframe").toArray(),
			hpspan: $(".hp").toArray(),
			shieldframe: $(".shieldframe").toArray(),
			otherui: $(".otherui_new").toArray(),
			otherchar: $(".otherchar").toArray(),
			charimgs: $(".char").toArray(),
			hpis: $(".hpi").toArray(),
			nameis: $(".namei").toArray(),
			skillbtns: $(".skillbtn").toArray(),
			effects: $(".effect").toArray(),
			skillinfoimgs: $(".skillinfoimg").toArray(),
			skillinfos: $(".skillinfo").toArray(),
			kdasections: $(".kdasection").toArray(),
			kdaimgs: $(".kdaimg").toArray(),
			kdainfos: $(".kdainfo").toArray(),
			iteminfosections: $(".itemsection").toArray(),
			timeoutBar: $("#timeoutbar"),
			board_container: document.getElementById("canvas-container"),
			_boardside: document.getElementById("boardside"),
			multikillimg:$(".multikillimg").toArray()
		}
		Object.freeze(this.elements)
	}

	onCreate() {
		// $(".dc").hide()
		// $("#skillinfowindow").css("visibility","hidden")
		// $("#kdawindow").hide()
		// $("#chat_enter").hide()
		// $("#subwaywindow").css("visibility","hi")

		$("#dialog").hide()
		let subwaynames = $(".subway_name").toArray()
		$(subwaynames[0]).html(GAME.chooseLang("Local Train", "완행"))
		$(subwaynames[1]).html(GAME.chooseLang("Rapid Train", "급행"))
		$(subwaynames[2]).html(GAME.chooseLang("Express Train", "특급 급행"))

		let subwaydescs = $(".subway_desc").toArray()
		$(subwaydescs[0]).html(GAME.chooseLang("4 stops until next store", "다음 상점까지 4정거장(턴)"))
		$(subwaydescs[1]).html(GAME.chooseLang("2 stops until next store", "다음 상점까지 2정거장(턴)"))
		$(subwaydescs[2]).html(GAME.chooseLang("0 stops until next store", "다음 상점까지 0정거장(턴)"))
		$("#subway_footer").html(
			GAME.chooseLang(
				"Can buy tickets on credit, Basic attack damage decreases by 40% in subway",
				"티켓 값 외상 가능, 지하철에서는 기본공격 피해 40% 감소"
			)
		)
		

		$("#nextturn").click(() => GAME.onNextTurn())

		$("#skillcancel").click(function () {
			GAME.onSkillCancel()
		})

		$(".skillbtn").click(function () {
			if(!GAME.ui.skillBtnShown) return

			let val = Number($(this).attr("value"))
			GAME.onSkillBtnClick(val)
			console.log("skill")
		})
		$(".basicattackbtn").click(function () {
			if($(this).hasClass("unavaliable")) return

			GAME.onBasicAttackClick()
			console.log("ba")
		})
		

		$("#reload").click(function () {
			if (GAME.ui.nextTurnBtnShown || GAME.ui.skillBtnShown) {
				return
			}
			GAME.connection.reloadGame(Number(sessionStorage.turn))
			//	console.log("reload")
		})

		$("#hide").click(function () {
			if (GAME.ui.chat_hidden) {
				$("#chat").css({ height: "150px", width: "200px", border: "none" })
				GAME.ui.chat_hidden = false
			} else {
				$("#chat").css({
					height: "50px",
					width: "100px",
					border: "2px solid black"
				})

				GAME.ui.chat_hidden = true
			}
			$("#writemessage").toggle()
		})

		

		$("#writemessage").click(function () {
			$("#chat_enter").css("visibility", "visible")
			$("#text").focus()
			GAME.ui.messageBtnShown = true
		})


		$(".roullete_end").click(function () {
			setTimeout(roulleteEnd, 6000)
		})

		$(".start").click(function () {
			$(this).hide()
			GAME.connection.startSimulation()
		})
		$("#toggle_otherui").click(function () {
			$("#otheruis").toggle()
			if($(this).hasClass("otherui_hidden")){
				$(this).removeClass("otherui_hidden")
			}
			else{
				$(this).addClass("otherui_hidden")
			}
		})
		$("#sendmessage").click(function () {
			GAME.sendMessage()
		})

		$("#select h3").html(GAME.chooseLang("Select between two", "둘 중 하나 선택"))
		if (GAME.LANG === "kor") {
			$(".skillinfo").css("font-size", "1.6rem")
		}

		$("#skillinfobtn").click(function () {
			$("#infowindow").css("visibility", "visible")

		})
		$("#closeskillinfobtn").click(function () {
			$("#infowindow").css("visibility", "hidden")
		})

		// $('[data-toggle="tooltip"]').tooltip()

		$("#largedicebtn").bind("click", function () {
			//clearInterval(GAME.diceHighlightInterval)
			$("#largedicebtn").hide()
			// $("#largedicebtnimg").show()
			$("#largedicebtn_pressed").show()
			setTimeout(()=>$("#largedicebtn_pressed").hide(),500)
			GAME.onDiceBtnClick(-1)
		})

		$("#dicecontrolbtn").click(function () {
			if (!GAME.diceControl) {
				return
			}
			GAME.dice_clicked = true
			$(".dc").css("visibility", "hidden")
			$("#diceselection").show()
			$("#largedicebtn").hide()
			$("#diceselection").animate({ right: "30px" }, 300)
			GAME.scene.showPossiblePos()
		})
		$(".diceselection").click(function () {
			$("#diceselection").animate({ right: "-300px" }, 300)
			setTimeout(() => $("#diceselection").hide(), 400)
			//		console.log("dc" + Number($(this).val()))

		//	clearInterval(GAME.diceHighlightInterval)
			$("#largedicebtn").stop().css({ outline: "none" })
			$("#largedicebtn").hide()
			$("#largedicebtnimg").show()
			GAME.dice_clicked = false
			GAME.onDiceBtnClick(Number($(this).val()))
			GAME.scene.hidePossiblePos()
		})

		$(".overlaySelectorimg").click(function () {
			GAME.targetSelected(Number($(this).val()), false)
			$("#overlaySelector").html("")
		})

		$(".subway_select").click(function () {
			GAME.subwayComplete(Number($(this).val()))
		})

		$(".effect_tooltip").click(function () {
			$(".effect_tooltip").css("visibility", "hidden")
		})

		$(".specialeffect_tooltip").click(function () {
			$(".specialeffect_tooltip").css("visibility", "hidden")
		})

		$("#close_stat_tooltip,.stat_tooltip").click(function () {
			$(".stat_tooltip").css("visibility", "hidden")
		})
		$("#close_inventory_tooltip,.inventory_tooltip").click(function () {
			$(".inventory_tooltip").css("visibility", "hidden")
		})

		$("#show_stat").click(function () {
			$(".stat_tooltip")
				.css({
					visibility: "visible"
				})
				.css($(this).offset())
			//$("#stat_content").html(GAME.getStatToast())
		})

		$("#show_items").click(function () {
			$(".inventory_tooltip")
				.css({
					visibility: "visible"
				})
				.css($(this).offset())

			$("#inventory_content").html(GAME.getInventoryTooltip())
		})

		$("#selecttruebutton").click(() => this.selected(true))
		$("#selectfalsebutton").click(() => this.selected(false))

		$("#toggle_fullscreen").click(function(){
			console.log($(this).data("on"))
			if(!$(this).data("on")){
			  
			  document.documentElement.requestFullscreen()
			  $(this).data("on",true)
			}
			else {
			  document.exitFullscreen()
			  $(this).data("on",false)
			}
		  })
		  
		$("#quit").click(GAME.onQuit.bind(GAME))
	}

	/**
	 * show obstacle notification
	 * @param {*} obs id of obstacle
	 * @param {*} text alternate text
	 */
	showObsNotification(obs, text) {

		let opentime = 400
		let duration = 4000
		let gouptime = 200

		//단순 돈은 알림표시 안함
		if (obs <= 3) return

		if (this.obsNoti1.position === 0 && this.obsNoti2.position === 0) {
			this.obsNoti1.write(obs, 1, text)
			//write noti1
			$(this.obsNoti1.name).css({ bottom: "4px", left: "-400px" })
			clearTimeout(this.obsNoti1.timeout)
			$(this.obsNoti1.name).animate({ left: "5px" }, opentime)
			this.obsNoti1.position = 1
			this.obsNoti1.timeout = setTimeout(
				(() => {
					$(this.obsNoti1.name).css({ left: "-400px" })
					this.obsNoti1.position = 0
				}).bind(this),
				duration
			)
		} else if (this.obsNoti2.position === 0 || this.obsNoti2.position === 2) {
			//write noti2
			this.obsNoti2.write(obs, 2, text)

			$(this.obsNoti2.name).css({ bottom: "4px", left: "-400px" })

			$(this.obsNoti1.name).animate({ bottom: "95px" }, gouptime)
			this.obsNoti1.position = 2
			clearTimeout(this.obsNoti2.timeout)
			$(this.obsNoti2.name).animate({ left: "5px" }, opentime)
			this.obsNoti2.position = 1
			this.obsNoti2.timeout = setTimeout(
				(() => {
					$(this.obsNoti2.name).css({ left: "-400px" })
					this.obsNoti2.position = 0
				}).bind(this),
				duration
			)
		} else if (this.obsNoti1.position === 2 || this.obsNoti2.position === 1) {
			//write noti1 again
			this.obsNoti1.write(obs, 1, text)

			$(this.obsNoti1.name).css({ bottom: "4px", left: "-400px" })

			$(this.obsNoti2.name).animate({ bottom: "95px" }, gouptime)
			this.obsNoti2.position = 2
			clearTimeout(this.obsNoti1.timeout)
			$(this.obsNoti1.name).animate({ left: "5px" }, opentime)
			this.obsNoti1.position = 1
			this.obsNoti1.timeout = setTimeout(
				(() => {
					$(this.obsNoti1.name).css({ left: "-400px" })
					this.obsNoti1.position = 0
				}).bind(this),
				duration
			)
		}
	}

	//add drag event for chat window move
	addChatDragEvent() {
		let element = $("#movechat")
		let pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0
		let chat = document.getElementById("chat")
		element.on(
			"touchstart",
			function (coord) {
				coord = coord || window.event

				coord.preventDefault()
				// get the mouse cursor position at startup:
				pos3 = coord.changedTouches[0].pageX
				pos4 = coord.changedTouches[0].pageY

				element.on("touchend", function () {
					// stop moving when mouse button is released:
					element.off("touchend")
					element.off("touchmove")
					element.off("cancel")
				})
				element.on("touchcancel", function () {
					// stop moving when mouse button is released:
					element.off("touchend")
					element.off("touchmove")
					element.off("cancel")
				})
				// call a function whenever the cursor moves:
				element.on(
					"touchmove",
					function (coord) {
						coord = coord || window.event
						coord.preventDefault()

						// calculate the new cursor position:
						pos1 = pos3 - coord.changedTouches[0].pageX
						pos2 = pos4 - coord.changedTouches[0].pageY
						pos3 = coord.changedTouches[0].pageX
						pos4 = coord.changedTouches[0].pageY

						let marginY = this.chat_hidden ? 60 : 150
						let marginX = this.chat_hidden ? 100 : 230

						// set the element's new position:
						chat.style.top = Math.max(10, Math.min(chat.offsetTop - pos2, this.winheight - marginY + 100)) + "px"
						chat.style.left = Math.max(0, Math.min(chat.offsetLeft - pos1, this.winwidth - 170 + 100)) + "px"
					}.bind(this)
				)
			}.bind(this)
		)

		$(element).on(
			"mousedown",
			function (coord) {
				coord = coord || window.event

				coord.preventDefault()
				// get the mouse cursor position at startup:
				pos3 = coord.pageX
				pos4 = coord.pageY

				$(element).on("mouseup", function () {
					// stop moving when mouse button is released:
					element.off("mouseup")
					element.off("mouseleave")
					element.off("mousemove")
					element.off("mouseout")
				})
				$(element).on("mouseleave", function () {
					// stop moving when mouse button is released:
					element.off("mouseup")
					element.off("mouseleave")
					element.off("mousemove")
					element.off("mouseout")
				})
				$(element).on("mouseout", function () {
					// stop moving when mouse button is released:
					element.off("mouseup")
					element.off("mouseleave")
					element.off("mousemove")
					element.off("mouseout")
				})
				// call a function whenever the cursor moves:
				$(element).on(
					"mousemove",
					function (coord) {
						coord = coord || window.event
						coord.preventDefault()

						// calculate the new cursor position:
						pos1 = pos3 - coord.pageX
						pos2 = pos4 - coord.pageY
						pos3 = coord.pageX
						pos4 = coord.pageY

						let marginY = this.chat_hidden ? 60 : 150
						let marginX = this.chat_hidden ? 100 : 230

						// set the element's new position:
						chat.style.top = Math.max(10, Math.min(chat.offsetTop - pos2, this.winheight - marginY + 200)) + "px"
						chat.style.left = Math.max(0, Math.min(chat.offsetLeft - pos1, this.winwidth - 170 + 200)) + "px"
					}.bind(this)
				)
			}.bind(this)
		)
	}

	addKeyboardEvent() {
		document.addEventListener(
			"keydown",
			((event) => {
				const keyName = event.key
				if (keyName === "Enter") {
					if (this.messageBtnShown) {
						GAME.sendMessage()
						this.messageBtnShown = false
					} else if (this.nextTurnBtnShown) {
						GAME.onNextTurn()
					}
				}
				if (keyName === "a" && this.skillBtnShown) {
					GAME.onBasicAttackClick()
				}
				if (keyName === "q" && this.skillBtnShown) {
					GAME.onSkillBtnClick(1)
				}
				if (keyName === "w" && this.skillBtnShown) {
					GAME.onSkillBtnClick(2)
				}
				if (keyName === "e" && this.skillBtnShown) {
					GAME.onSkillBtnClick(3)
				}
			}).bind(this)
		)
	}
	addWheelEvent() {
		// wheelzoom(document.getElementById("board"), {zoom:0.05});
		// return
		document.getElementById("boardwrapper").addEventListener(
			"wheel",
			function (event) {
				event.preventDefault()

				let rect = document.getElementById("boardwrapper").getBoundingClientRect()
				let originX = Math.max((this.mousePosX - rect.left) / rect.width, 0)
				let originY = Math.max((this.mousePosY - rect.top) / rect.height, 0)
				if (event.deltaY < 0) {
					GAME.scene.zoomOut(0.05, originX, originY)
				} else if (event.deltaY > 0) {
					GAME.scene.zoomIn(0.05, originX, originY)
				}
			}.bind(this)
		)
		document.getElementById("board").addEventListener("wheel", function (event) {
			event.preventDefault()
		})
		this.elements._boardside.addEventListener(
			"mousemove",
			function (coord) {
				this.mousePosX = coord.pageX
				this.mousePosY = coord.pageY
			}.bind(this)
		)
	}

	addTouchEvent() {
		let board_container = this.elements.board_container
		this.elements._boardside.addEventListener(
			"touchstart",
			function (click_pos) {
				this.clicked = true

				let origX = click_pos.changedTouches[0].pageX + board_container.scrollLeft
				let origY = click_pos.changedTouches[0].pageY + board_container.scrollTop

				if (this.waitingDoudleClick && click_pos.targetTouches.length === 1) {
					//double touch
					this.waitingDoudleClick = false
					GAME.scene.moveBoardToPlayer(GAME.myturn)
					this.clicked = false
				} else if (click_pos.targetTouches.length === 1) {
					this.waitingDoudleClick = true
					setTimeout((() => (this.waitingDoudleClick = false)).bind(this), 150)
				}

				this.lastZoomScale = 0

				this.elements._boardside.addEventListener(
					"touchmove",
					function (e) {
						if (e.targetTouches.length === 2) {
							let l = this.lastZoomScale
							let gesturedata = this.gesturePinchZoom(e)
							if (!gesturedata) return

							let rect = document.getElementById("boardwrapper").getBoundingClientRect()
							let originX = Math.max((gesturedata.originX - rect.left) / rect.width, 0)
							let originY = Math.max((gesturedata.originY - rect.top) / rect.height, 0)

							if (gesturedata.zoom > 0.4) {
								GAME.scene.zoomIn(0.07, originX, originY)
							} else if (gesturedata.zoom < -0.4) {
								GAME.scene.zoomOut(0.07, originX, originY)
							}
						} else {
							if (!this.clicked) return
							let curX = e.changedTouches[0].pageX + board_container.scrollLeft
							let diffX = origX - curX

							let curY = e.changedTouches[0].pageY + board_container.scrollTop
							let diffY = origY - curY

							board_container.scrollBy(diffX, diffY)
						}
					}.bind(this),
					false
				)
			}.bind(this),
			false
		)
		this.elements._boardside.addEventListener(
			"touchend",
			function () {
				this.lastZoomScale = null
				this.clicked = false
			}.bind(this),
			false
		)
		this.elements._boardside.addEventListener(
			"touchcancel",
			function () {
				this.lastZoomScale = null
				this.clicked = false
			}.bind(this),
			false
		)
	}
	gesturePinchZoom(event) {
		let zoom = false

		if (event.targetTouches.length === 2) {
			let p1 = event.targetTouches[0]
			let p2 = event.targetTouches[1]
			let zoomScale = Math.sqrt(Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2)) //euclidian distance
			let centerX = (p2.pageX + p1.pageX) / 2
			let centerY = (p2.pageY + p1.pageY) / 2
		//	let origin = GAME.scene.pagePosToTransformOrigin(centerX, centerY)

			if (this.lastZoomScale !== null) {
				zoom = zoomScale - this.lastZoomScale
			}

			this.lastZoomScale = zoomScale
			return {
				zoom: zoom,
				originX: centerX,
				originY: centerY
			}
		}
		return null
	}

	addMouseEvent() {
		let board_container = this.elements.board_container
		this.elements._boardside.addEventListener(
			"mousedown",
			function (click_pos) {
				let origX = click_pos.pageX + board_container.scrollLeft
				let origY = click_pos.pageY + board_container.scrollTop
				this.clicked = true
				if (this.waitingDoudleClick) {
					this.waitingDoudleClick = false
					GAME.scene.moveBoardToPlayer(GAME.myturn)
					this.clicked = false
				} else {
					this.waitingDoudleClick = true
					setTimeout(() => this.waitingDoudleClick = false, 150)
				}
				this.elements._boardside.addEventListener(
					"mousemove",
					function (coord) {
						if (!this.clicked) return
						let curX = coord.pageX + board_container.scrollLeft
						let diffX = origX - curX

						let curY = coord.pageY + board_container.scrollTop
						let diffY = origY - curY

						board_container.scrollBy(diffX, diffY)
						//console.log("x" + Math.floor(board_container.scrollLeft) + "  y" + Math.floor(board_container.scrollTop))

					}.bind(this),
					false
				)
			}.bind(this),
			false
		)
		this.elements._boardside.addEventListener(
			"mouseup",
			function (e) {
				this.clicked = false
			}.bind(this),
			false
		)
		this.elements._boardside.addEventListener(
			"mouseleave",
			function (e) {
				this.clicked = false
			}.bind(this),
			false
		)
		this.elements._boardside.addEventListener(
			"mouseout",
			function (e) {
				this.clicked = false
			}.bind(this),
			false
		)
	}

	hideChat() {
		$("#chat").css({ height: "50px", width: "100px", border: "2px solid black" })

		this.chat_hidden = true

		$("#writemessage").hide()
	}

	timeoutStart(time) {
		//	console.log("timeoutstart")
		this.elements.timeoutBar.css("width", "0")
		this.elements.timeoutBar.animate(
			{
				width: "100%"
			},
			time,
			"linear"
		)
	}
	timeoutStop() {
		//	console.log("timeoutstop")
		this.elements.timeoutBar.css("width", "0")
		this.elements.timeoutBar.stop()
	}

	init(setting, simulation = false) {
		console.log("initui")
		$("#loadingtext").html("LOADING THE MAP..")

		$("#skillinfobtn").show()

		// $(this.elements.kdasections[2]).css("visibility","collapse")
		// $(this.elements.kdasections[3]).css("visibility","collapse")
		if (GAME.playerCount > 2) {
			$(this.elements.otherui[1]).show()
		}
		if (GAME.playerCount > 3) {
			$(this.elements.otherui[2]).show()
		}
		if (GAME.playerCount < 4) {
			$(this.elements.kdasections[3]).hide()
		}
		if (GAME.playerCount < 3) {
			$(this.elements.kdasections[2]).hide()
		}

		$(this.elements.kdasections[GAME.myturn]).css("border", "3px solid #a86aff")

		let othercount = 1
		console.log("simulation" + simulation)
		if (simulation) {
			GAME.turnsInUI = [0, 1, 2, 3]
			GAME.simulation = true

			for (let i = 0; i < GAME.playerCount; ++i) {
				$(this.elements.nameis[i]).html(setting[i].name)
				$(this.elements.hpis[i]).html(setting[i].HP + "/" + setting[i].MaxHP)
			}
		} else {
			for (let i = 0; i < GAME.playerCount; ++i) {
				// if (setting[0].team !== "none") {
				//     GAME.teams[i] = setting[i].team
				// }

				if (setting[i].turn === GAME.myturn) {
					$(this.elements.nameis[0]).html(setting[i].name)
					$(this.elements.hpis[0]).html(setting[i].HP + "/" + setting[i].MaxHP)

					if (GAME.isTeam) {
						if (!setting[i].team) {
							$(this.elements.nameis[0]).css("background", "rgba(255, 127, 127,0.5)")
						} else{
							$(this.elements.nameis[0]).css("background", "rgba(119, 169, 249,0.5)")
						}
					}

					GAME.turnsInUI.push(0)
				} else {
					$(this.elements.nameis[othercount]).html(setting[i].name)
					$(this.elements.hpis[othercount]).html(setting[i].HP + "/" + setting[i].MaxHP)
					if (GAME.isTeam) {
						if (!setting[i].team) {
							$(this.elements.nameis[othercount]).css("background", "rgba(255, 127, 127,0.5)")
						} else{
							$(this.elements.nameis[othercount]).css("background", "rgba(119, 169, 249,0.5)")
						}
					}

					GAME.turnsInUI.push(othercount)
					othercount += 1
				}
			}
		}

		for (let i = 0; i < GAME.playerCount; ++i) {
			$(this.elements.kdainfos[i]).html("0/0/0")

			// GAME.player_champlist[i] = setting[i].champ
			$(this.elements.charimgs[GAME.turn2ui(i)]).css("background-color", COLOR_LIST_BG[i])

			if (GAME.isTeam) {
				if (!setting[i].team) {
					$(this.elements.kdaimgs[i]).css("background-color", "#ff7f7f")
				} else if (setting[i].team) {
					$(this.elements.kdaimgs[i]).css("background-color", "#77a9f9")
				}
			}
			// console.log(setting[i])
			this.changeHP(i, setting[i].HP, setting[i].MaxHP)
			
			//this.updatePlayerItems(i, [-1, -1, -1, -1, -1, -1])
		}

		//hp display
		// for (let i = 0; i < GAME.playerCount; ++i) {
		// 	let j = GAME.turnsInUI[i]
		// 	if (i === 0) {
		// 		$(this.elements.hpframe[j]).css("width", String(setting[i].MaxHP) + "px")
		// 		$(this.elements.hpspan[j]).css("width", String(setting[i].HP) + "px")
		// 	} else {
		// 		$(this.elements.hpframe[j]).css("width", String(setting[i].MaxHP * 0.3 + 4) + "px")
		// 		$(this.elements.hpspan[j]).css("width", String(setting[i].HP * 0.3) + "px")
		// 	}
		// }

		GAME.thisui = GAME.turnsInUI[0]
		console.log("initui")

		this.setDefaultSkillImgs(GAME.myturn, setting[GAME.myturn].champ)
	}
	onGameReady(){
		for (let i = 0; i < GAME.playerCount; ++i){
			this.setCharacterDefaultApperance(i, GAME.players[i].champ)
		}
	}

	/**
	 * set skill images to default
	 */
	setDefaultSkillImgs(turn, champ) {
		//skill btn and skill description
		for (let j = 0; j < 3; ++j) {
			// $(this.elements.skillbtns[j]).css({
			// 	background: "url(res/img/skill/" + (champ + 1) + "-" + (j + 1) + ".jpg)",
			// 	"background-size": "100%",
			// 	border: "3px solid rgb(122, 235, 255);"
			// })
			$(this.elements.skillbtns[j]).children("img").attr("src", "res/img/skill/" + (champ + 1) + "-" + (j + 1) + ".jpg")

			$(this.elements.skillinfoimgs[j]).attr("src", "res/img/skill/" + (champ + 1) + "-" + (j + 1) + ".jpg")
		}
	}

	updateSkillImg(data) {
		let champ=data.champ 
		let skill_id=data.skill
		let skill_name = data.skill_name

		let src = ""
		//default skill img
		if(skill_name===""){
			src=(champ + 1) + "-" + (skill_id + 1) + ".jpg"
		}
		else if (skill_name === "bird_r_q") {
			src = "8-1-1.jpg"
		}else if (skill_name === "tree_wither_r") {
			src = "9-3-1.jpg"
		}  else {
			return
		}
		// $(this.elements.skillbtns[skill_id]).css({
		// 	background: "url(res/img/skill/" + src + ")",
		// 	"background-size": "100%",
		// 	border: "3px solid rgb(122, 235, 255);"
		// })
		$(this.elements.skillbtns[skill_id]).children("img").attr("src", "res/img/skill/" + src)

		$(this.elements.skillinfoimgs[skill_id]).attr("src", "res/img/skill/" + src)
	}
	/**
	 * set character image to default
	 * @param {} i
	 * @param {*} champ
	 */
	setCharacterDefaultApperance(i) {
		// let charnames = ["reaper", "elephant", "ghost", "dinosaur", "sniper", "magician", "kraken", "bird", "tree"]
		// if (champ < 0 || champ > charnames.length - 1) return
		$(this.elements.charimgs[GAME.turn2ui(i)]).attr("src",this.getChampImgofTurn(i))
		$(this.elements.kdaimgs[i]).attr("src", this.getChampImgofTurn(i))
	}

	updateCharacterApperance(data, turn) {
		if (data === "") {
			this.setCharacterDefaultApperance(turn)
		}
		if (data === "bird_r") {
			$(this.elements.charimgs[GAME.turn2ui(turn)]).attr("src", "res/img/character/bird_r.png")
			$(this.elements.kdaimgs[turn]).attr("src", "res/img/character/bird_r.png")
		}
		if (data === "elephant_r") {
			$(this.elements.charimgs[GAME.turn2ui(turn)]).attr("src", "res/img/character/knight_r.png")
			$(this.elements.kdaimgs[turn]).attr("src", "res/img/character/knight_r.png")
		}
		if (data === "tree_low_hp") {
			$(this.elements.charimgs[GAME.turn2ui(turn)]).attr("src", "res/img/character/tree_low_hp.png")
			$(this.elements.kdaimgs[turn]).attr("src", "res/img/character/tree_low_hp.png")
		}
	}

	updateSkillInfo(info_kor, info_eng) {
		for (let i = 0; i < info_kor.length; ++i) {
			$(this.elements.skillinfos[i]).html(
				(i===0?"":"<hr>")+SkillInfoParser.parse(GAME.chooseLang(info_eng[i], info_kor[i])))
		}
		this.addEffectTooltipEvent()
		this.addSkillScaleTooltipEvent()
	}
	addSkillScaleTooltipEvent(){

		$(".scaled_value").off()
		$(".scaled_value").mouseenter(function (e) {
			$(".skill_scale_tooltip")
				.css({
					visibility: "visible"
				})
				.css($(this).offset())

			GAME.ui.setSkillScaleTooltip($(this).attr("value"))
		})
		$(".scaled_value").mouseleave(function (e) {
			$(".skill_scale_tooltip").css("visibility", "hidden")
		})
		$(".scaled_value").on("touchstart", function (e) {
			$(".skill_scale_tooltip")
				.css({
					visibility: "visible"
				})
				.css($(this).offset())
			GAME.ui.setSkillScaleTooltip($(this).attr("value"))
		})
	}
	setSkillScaleTooltip(name){
		
		let scale=GAME.skillScale[name]

		if(!scale){
			$(".skill_scale_tooltip p").html("ERROR!")
			return
		}  
		let str=`${scale.base}`
		for(const s of scale.scales){

			let name=this.game.strRes.SCALE_NAMES[s.ability]
			console.log(name)
			if(name===undefined) name=s.ability

			str+=`<a class=${s.ability}>(+${s.val}${name})</a>`
		}
		$(".skill_scale_tooltip p").html(str)
	}
	showBasicAttackBtn(count,isAvailable){
		$(".basicattackbtn").show()
		$(".basicattackbtn").addClass("unavaliable")
		if(isAvailable && count>0){
			$(".basicattackbtn").removeClass("unavaliable")
		}
		$(".basicattack_count a").html(count)
	}

	showSkillBtn(status) {
		console.log("show skill btn turn:" + status.turn)
		$(".storebtn").show()

		$("#nextturn").show()
		this.nextTurnBtnShown = true
		$("#nextturn").attr("disabled", false)
		// if (status.dead) {
		// 	return
		// }

		GAME.skillstatus = status

		

		//$(".skillbtn button").attr("disabled", false)

		//  if(skillcount===4 || players[thisturn].effects[3]>0)
		// if (status.silent > 0 || status.dead) {
		// 	//silent or dead
		// 	return
		// }

		// $(".storebtn").hide()
		// $(".skillbtn").show()
		this.showBasicAttackBtn(status.basicAttackCount,status.canBasicAttack)
		if(status.canUseSkill){
			this.skillBtnShown = true
			$(".skillbtn").removeClass("unavaliable")
		}
			
		this.updateSkillBtnStatus(status)
	}

	updateSkillBtnStatus(status){
		for (let i = 0; i < 3; ++i) {
			
			$(this.elements.skillbtns[i]).children(".duration_mask").remove()
			$(this.elements.skillbtns[i]).children(".cooltime_mask").remove()

			if (status.cooltime[i] === 0) {

				$(this.elements.skillbtns[i]).children(".cooltime").html("")
			//	$(this.elements.skillbtns[i]).html("&nbsp;")
				if (status.duration[i] > 0) {
					$(this.elements.skillbtns[i]).addClass("activated")
				} else {

					$(this.elements.skillbtns[i]).removeClass("activated")
				}
			} else {
				if(status.duration[i]===0){
					console.log(status.cooltimeratio[i])
					$(this.elements.skillbtns[i]).append(`<div class="cooltime_mask" style=" background:
					 conic-gradient(rgba(0,0,0,0.0) 0% ,rgba(0,0,0,0.0) ${100-status.cooltimeratio[i]*100}%,rgba(255, 255, 255, 0.6) 
					 ${100-status.cooltimeratio[i]*100}%,rgba(255, 255, 255, 0.6) 100%); "></div>  `)
	
					$(this.elements.skillbtns[i]).children(".cooltime").html(status.cooltime[i])
				}
				if (status.duration[i] > 0) {
					$(this.elements.skillbtns[i]).addClass("activated")
				} else {
					$(this.elements.skillbtns[i]).removeClass("activated")
					$(this.elements.skillbtns[i]).addClass("unavaliable")
				}
			}
			if(status.duration[i]>0){
				console.log(status.duration[i])//${status.duration[i]*100}
				$(this.elements.skillbtns[i]).append(`<div class="duration_mask" style="background: 
				conic-gradient(rgba(0,0,0,0.6) 0% ,rgba(0,0,0,0.6) ${100-status.duration[i]*100}%,rgba(0, 0, 0, 0) ${100-status.duration[i]*100}%,rgba(0, 0, 0, 0) 100%);"></div>  `)

			}
			
		}
		if (status.level < 3) {
			$(this.elements.skillbtns[2]).addClass("unavaliable")
			if (status.level < 2) {
				$(this.elements.skillbtns[1]).addClass("unavaliable")
			}
		}
	}

	hideSkillBtn() {
		$(".status").html("")
		$(".basicattackbtn").hide()
		// $(".skillbtn").hide()
		$(".skillbtn button").attr("disabled", true)
		$("#nextturn").hide()
		$(".skillbtn").addClass("unavaliable")
		this.nextTurnBtnShown = false
		this.skillBtnShown = false
	}
	hideAll() {
		this.timeoutStop()
		$(".mystatus").show()
		$("#selectionname").hide()
		$("#selectiondesc").hide()
		$("#cancel_tileselection").hide()
		$("#skillcancel").hide()
		$("#confirm_tileselection").hide()
		$("#largedicebtn").hide()
		$(".dc").css("visibility", "hidden")
		$("#diceselection").hide()
		$("#sell_token").hide()
		$("#casino").hide()
		$("#select").hide()
		$(".overlay").hide()
		$("#overlaySelector").html("")
		this.hideSkillBtn()
	//	clearInterval(GAME.diceHighlightInterval)
	}

	highlightUI(t) {
		for (let i = 0; i < GAME.playerCount; ++i) {
			if (i === GAME.thisui) {
				$(this.elements.otherchar[i - 1]).css("outline", "2px solid red")
			} else {
				$(this.elements.otherchar[i - 1]).css("outline", "1px solid black")
			}
		}
	}

	changeShield(shield, target) {
		let ui = GAME.turn2ui(target)
		if (shield <= 0) {
			$(this.elements.shieldframe[ui]).hide()
			
		} else $(this.elements.shieldframe[ui]).css("display", "inline-block")

		if (ui === 0) {
			$(this.elements.shieldframe[ui]).css({
				width: String(shield) + "px"
			})
			$("#effects").css("left", String(0.8 * shield + 30) + "px")
		} else {
			$(this.elements.shieldframe[ui]).css({
				width: String(0.2 * shield) + "px"
			})
		}
		shield = Math.max(shield, 0)

		let name = $(this.elements.hpis[ui]).html()
		let s = name.match(/\([+0-9]+\)/)
		console.log(s)
		if (!s) {
			$(this.elements.hpis[ui]).html(name + ` (+${Math.floor(shield)})`)
		} else if (shield === 0) {
			$(this.elements.hpis[ui]).html(name.replace(/\([+0-9]+\)/, ""))
		} else {
			$(this.elements.hpis[ui]).html(name.replace(/(?<=\(\+)[0-9]+/, shield))
		}
	}

	lostHP(hp, change) {
		if (change < 0) {
			setTimeout(function () {
				$(".myhp_lost").animate(
					{
						width: String(hp) + "px"
					},
					500
				)
			}, 500)
		} else {
			$(".myhp_lost").css({
				width: String(hp) + "px"
			})
		}
	}
	changeHP(target, hp, maxhp) {
		hp = Math.max(hp, 0)

		let ui = GAME.turn2ui(target)
		if (ui === 0) {
			$(this.elements.hpframe[ui]).css({
				width: String(maxhp) + "px"
			})

			$(this.elements.hpspan[ui]).css({
				width: String(hp) + "px"
			})

			let space=window.innerWidth-35
			if(window.matchMedia("(orientation: landscape)").matches){
				space=window.innerWidth-135
			}

			if(maxhp > space){
				$(this.elements.hpframe[ui]).css({
					transform: "scale("+(space/maxhp)+",1)"
				})
				console.log(space/maxhp)
			}
		}
		else{
			$(this.elements.hpframe[ui]).css({
				width: String(0.2 * maxhp) + "px"
			})

			$(this.elements.hpspan[ui]).css({
				width: String(0.2 * hp) + "px"
			})

			if(maxhp >= 800){
				$(this.elements.hpspan[ui]).css({
					transform: "scale(0.7,1)"
				})
				$(this.elements.hpframe[ui]).css({
					width: String(0.2 * 0.7 * maxhp) + "px"
				})
			}
		}

		let shield = $(this.elements.hpis[ui])
			.html()
			.match(/\([+0-9]+\)/)

		let str = $(this.elements.hpis[ui])
			.html()
			.replace(/\s\([+0-9]+\)/, shield ? shield[0] : "")
			.replace(/[0-9]+(?=\/)/, String(Math.floor(hp)))
			.replace(/(?<=\/)[0-9]+/, String(Math.floor(maxhp)))

		$(this.elements.hpis[ui]).html(str)
	}
	updatePlayerItems(turn, items) {
		let text = ""
		for (let i = 0; i < items.length; ++i) {
			let it = items[i]
			// if(i>0 && i%6==0)
			// 	text+='<br>'
			if (it >= 0) {
				text += `<div class='otherplayeritemimg player_item' value='${String(it)}'>
					<img src='res/img/store/items.png' style='margin-left:${-1 * it * 100}px'; > </div>`
			} else {
				text += "<div class=otherplayeritemimg><img src='res/img/store/emptyslot.png'> </div>"
			}
		}
		$(this.elements.iteminfosections[turn]).html(text)
		this.addItemTooltipEvent()
	}
	/**
	 * register item tooltip event
	 */
	addItemTooltipEvent() {
		$(".player_item").off()
		$(".player_item").mouseenter(function (e) {
			$(".item_tooltip")
				.css({
					visibility: "visible"
				})
				.css($(this).offset())
			let item = GAME.strRes.ITEMS.items[Number($(this).attr("value"))]
			$(".item_tooltip h4").html(GAME.chooseLang(item.name, item.kor_name))
			$(".item_tooltip p").html(GAME.ui.getItemDescription(item))
		})
		$(".player_item").mouseleave(function (e) {
			$(".item_tooltip").css("visibility", "hidden")
		})
	}
	/**
	 * get item description for tooltip
	 * @param {*} item
	 * @returns
	 */
	getItemDescription(item) {
		let ability = ""
		for (let a of item.ability) {
			let ab = "<a class=ability_name>" + GAME.chooseLang(a.type, a.type_kor) + "</a> +" + a.value

			if (a.type === "addMdmg" || a.type === "skillDmgReduction" || a.type === "absorb" || a.type === "obsR") {
				ab += "%"
			}
			ability += ab
			ability += "<br>"
		}
		if (item.unique_effect != null) {
			ability += `<b class=unique_effect_name>[${GAME.chooseLang("unique passive", "고유지속효과")}]</b>:
				${GAME.chooseLang(item.unique_effect, item.unique_effect_kor)}`
			if(item.active_cooltime!=null){
				ability+=GAME.chooseLang(`(cooltime ${item.active_cooltime} turns)`,`(쿨타임 ${item.active_cooltime}턴)`)
			}
		}
		ability += "<br><br>" + GAME.chooseLang("price: ", "가격: ") + "<b class=price>" + String(item.price) + "</b>"
		return ability
	}
	showSelection(type, name) {
		GAME.pendingSelection.type = type
		GAME.pendingSelection.name = name
		if (name === "kidnap") {
			$("#selectfalsebutton").html(GAME.chooseLang("2 turn stun", "속박 2턴"))
			$("#selecttruebutton").html("HP -300")
		} else if (name === "threaten") {
			$("#selectfalsebutton").html("-50$")
			$("#selecttruebutton").html("Coin -3")
		} else if (name === "ask_way2") {
			$("#selecttruebutton").html(GAME.chooseLang("Go upper way", "윗길로 가기"))
			$("#selectfalsebutton").html(GAME.chooseLang("Go lower way", "아래길로 가기"))
		}
		$("#select").show()
	}

	showChangeDiceInfo(t) {
		if (!t.stun) {
			let info = ""
			$("#adiceinfo").css("color", "#C1FFD7")

			if (t.adice !== 0) {
				info = (t.adice < 0 ? " " : " +") + t.adice
			}
			if (t.effects.some((e) => e === "doubledice")) {
				info += " (x2)"
			}
			if (t.effects.some((e) => e === "backdice")) {
				info += " (back)"
				$("#adiceinfo").css("color", "red")
			}
			if (t.effects.some((e) => e === "badluck")) {
				info = "cursed!"
				$("#adiceinfo").css("color", "red")
			}
			if (t.effects.some((e) => e === "subway")) {
				info = "Subway"
			}
			if (info !== "") {
				$("#adiceinfo").html(info)
				$("#adicewindow").css("visibility", "visible")
			}
		}
	}

	hideSkillCancel() {
		$("#skillcancel").hide()
		$("#godhandcancel").hide()
		$("#cancel_tileselection").hide()
		$(".storebtn").show()
	}
	disableAllSkillBtn() {
		$(".skillbtns button").attr("disabled", true)
		$("#nextturn").attr("disabled", true)
	}

	onTileReset() {
		$(".storebtn").show()
		$("#cancel_tileselection").hide()
		$("#confirm_tileselection").hide()
		$("#cancel_tileselection").off()
		$("#confirm_tileselection").off()
	}
	addEffect(e) {
		$("#effects").append(
			`<a style="background:url('res/img/status_effect/effects.png') -${String(25 * e)}px 0"
			 class=effect value='${String(e)}' id='e${String(e)}'></a>`
		)

		this.addEffectTooltipEvent()
	}

	addItemSpecialEffect(name, item_id, isgood) {
		$("#effects").append(
			`<div class='specialeffect ${isgood ? "good" : ""}'  value='${String(name)}' id='se_${String(name)}'>
			<img src='res/img/store/items_small.png' style='margin-left: ${-1 * item_id * 25}px'; >
		</div>`
		)

		this.addSpecialEffectTooltipEvent()
	}

	addSpecialEffect(name, src, isgood) {
		$("#effects").append(
			`<img src="./res/img/${src}" class="specialeffect ${isgood ? "good" : ""}" value='${String(
				name
			)}' id='se_${String(name)}'>`
		)
		this.addSpecialEffectTooltipEvent()
	}
	/**
	 * register item tooltip event
	 */
	addSpecialEffectTooltipEvent() {
		$(".specialeffect").off()
		$(".specialeffect").mouseenter(function (e) {
			$(".effect_tooltip").css("visibility", "hidden")

			$(".specialeffect_tooltip")
				.css({
					visibility: "visible"
				})
				.css($(this).offset())

			GAME.ui.setSpecialEffectTooltip($(this).attr("value"))
		})
		$(".specialeffect").mouseleave(function (e) {
			$(".specialeffect_tooltip").css("visibility", "hidden")
		})
		$(".specialeffect").on("touchstart", function (e) {
			$(".effect_tooltip").css("visibility", "hidden")
			$(".specialeffect_tooltip")
				.css({
					visibility: "visible"
				})
				.css($(this).offset())
			GAME.ui.setSpecialEffectTooltip($(this).attr("value"))
		})
	}

	setSpecialEffectTooltip(name) {
		let data = GAME.strRes.SPECIAL_EFFECTS.get(name)
		if(!data) return
		//item
		if (typeof data[1] === "number") {
			$(".specialeffect_tooltip h4").html(
				GAME.chooseLang(GAME.strRes.ITEMS.items[data[1]].name, GAME.strRes.ITEMS.items[data[1]].kor_name)
			)
		} //effect with source player
		else if (data[1] !== "") {
			$(".specialeffect_tooltip h4").html(GAME.chooseLang("Source: ", "시전자: ") + data[1])
		} else {
			$(".specialeffect_tooltip h4").html("")
		}
		$(".specialeffect_tooltip p").html(data[0])
	}

	setEffectTooltip(e) {
		console.log(e)
		e=Number(e)
		let desc = GAME.strRes.EFFECTS[e]
		if (!desc.match(/\[.+\]/)) {
			$(".effect_tooltip h4").addClass("bad")
			$(".effect_tooltip h4").html(desc.match(/\{.+\}/)[0])
		} else {
			$(".effect_tooltip h4").removeClass("bad")
			$(".effect_tooltip h4").html(desc.match(/\[.+\]/)[0])
		}

		$(".effect_tooltip p").html(desc.match(/(?<=[\]\}]).+/)[0])
	}
	/**
	 * register item tooltip event
	 */
	addEffectTooltipEvent() {
		$(".effect, .info_effect").off()
		$(".effect, .info_effect").mouseenter(function (e) {
			$(".specialeffect_tooltip").css("visibility", "hidden")
			$(".effect_tooltip")
				.css({
					visibility: "visible"
				})
				.css($(this).offset())

			GAME.ui.setEffectTooltip(Number($(this).attr("value")))
		})
		$(".effect, .info_effect").mouseleave(function (e) {
			$(".effect_tooltip").css("visibility", "hidden")
		})
		$(".effect, .info_effect").on("touchstart", function (e) {
			$(".specialeffect_tooltip").css("visibility", "hidden")
			$(".effect_tooltip")
				.css({
					visibility: "visible"
				})
				.css($(this).offset())
			GAME.ui.setEffectTooltip(Number($(this).attr("value")))
		})
	}
	indicateActiveItem(ui,item,desc){
		let id=String("item_"+Math.floor(Math.random()*10000))
		let rect = document.getElementsByClassName("otherchar")[ui-1].getBoundingClientRect()
		let str=`
		<div class="item_notification small" id='${id}'>
			<div class=item_noti_text>
				<p>${desc}</p>
			</div>
			<div class=item_noti_img>
				<img src='res/img/store/items.png' style='margin-left: ${-1 * item * 100}px'; >
			</div>
		</div>`
		$("#item_notification_container").append(str)

		$("#"+id).css({top:(rect.top-3)+"px",left:"-300px"})
		$("#"+id).animate({left:rect.right},400)

		setTimeout(()=>$("#"+id).remove(),2000)
	}
	indicateMyActiveItem(item,name,desc){
		
		let id=String("item_"+Math.floor(Math.random()*10000))
		let str=`
		<div class="item_notification" id='${id}'>
			<div class=item_noti_text>
				<b>${name}</b>
				<hr>
				<p>${desc}</p>
			</div>
			<div class=item_noti_img>
				<img src='res/img/store/items.png' style='margin-left: ${-1 * item * 100}px'; >
			</div>
		</div>`

		$("#item_notification_container").append(str)

		if(window.matchMedia("(orientation: landscape)").matches){
			let rect = document.getElementById("skillbtncontainer").getBoundingClientRect()
			//console.log(rect.top, rect.right, rect.bottom, rect.left);

			//console.log("#"+id)
			$("#"+id).css({bottom:"-100px",left:rect.left+"px"})
			$("#"+id).animate({bottom:window.innerHeight- rect.top},400)
		}
		else{
			let rect= document.getElementsByClassName("mydisplay")[0].getBoundingClientRect()
			$("#"+id).css({bottom:(window.innerHeight-rect.bottom)+"px",left:"-300px"})
			$("#"+id).animate({left:rect.right},400)
		}
		$("#"+id+" item_noti_img img")

		setTimeout(()=>$("#"+id).remove(),2000)

	}
	/**
	 * 
	 * @param {*} items {id:number,coolRatio:number in [0,1],cool:number}[]
	 */
	updateActiveItem(items){
		
		let str=""
		for(let i of items){
			let coolratio=i.coolRatio

			str+=` <div class="active_item ${coolratio===1?"active":"inactive"}">
            <img class='active_item_img' src="res/img/store/items.png"  style='margin-left: ${-1 * i.id * 100 }px';>
          `

		  if(coolratio < 1){
			str+=`<div class="cooltime_mask" style="  background: conic-gradient(rgba(0,0,0,0) 0% 
            ,rgba(0,0,0,0) ${coolratio*100}%,rgba(255, 255, 255, 0.6) ${coolratio*100}%,rgba(255, 255, 255, 0.6) 100%);">
            ${i.cool}</div>`
		  }

		  str+='</div>'
		}

		$("#inventory_active_items").html(str)
	}
	updateStatTooltip(mystat){
		const statkeys=["moveSpeed","AD","AP","AR","MR","regen","basicAttackSpeed","attackRange","arP","MP","absorb","obsR","ultHaste"]
		let str=""
		for(let s of statkeys){
											//set tooltip wider if english
			str+=` <div class="stat_row">
			<a class="name ${GAME.chooseLang("wide","")}">${GAME.strRes.STATS[s]}</a><a class="value">${mystat[s]}</a>
			</div>`
		}
		$("#stat_content").html(str)
	}
	showSubwaySelection(prices) {
		GAME.subwayPrices = prices
		$("#subwaywindow").css("visibility", "visible")
		let subwaybtns = $(".subway_select").toArray()
		$(subwaybtns[0]).html(GAME.chooseLang("FREE", "무료"))
		if (prices[1] > 0) {
			$(subwaybtns[1]).html(prices[1] + "$")
		} else {
			$(subwaybtns[1]).html(GAME.chooseLang("FREE", "무료"))
		}
		$(subwaybtns[2]).html(prices[2] + "$")
	}
	selected(result) {
		$("#select").hide()

		GAME.connection.selectionComplete(GAME.pendingSelection.type, {
			type: GAME.pendingSelection.name,
			result: !result,
			complete:true
		})
	}
	showDialog(content,onconfirm,oncancel){
		$("#dialog p").html(content)
		$("#dialog .dialog_cancel").off()
		$("#dialog .dialog_confirm").off()
		$("#dialog .dialog_cancel").click(()=>{
			if(oncancel!=null) oncancel()
			$("#dialog").hide()
		})
		$("#dialog .dialog_confirm").click(()=>{
			if(onconfirm!=null) onconfirm()
			$("#dialog").hide()
		})
		$("#dialog").show()
	}

	getCharImgUrl(champ_id) {
		return "res/img/character/" + GAME.strRes.GLOBAL_SETTING.characters[champ_id].imgdir
	}

	getChampImgofTurn(turn) {
		if (turn === -1) return "res/img/ui/obstacle.png"

		let player=GAME.players[turn]
		if(!player) return ""
		return this.getCharImgUrl(player.champ)
	}
	indicatePlayerDeath(turn, spawnPos,  skillfrom, isShutDown, killerMultiKillCount) {
		console.log("indicatePlayerDeath" + turn)

		$(this.elements.kdasections[turn]).css("background", "rgba(146, 0, 0, 0.5)")
		let good=true
		let str = "<div class='killframe "

		if (skillfrom === GAME.myturn) {
			str += "bluekill"
		} else if (skillfrom >= 0) {
			str += "redkill"
		} else if (skillfrom === -1) {
			str += "whitekill"
		}

		str += "'><div class='charframe' style='background:"
		if (skillfrom === -1) {
			str += "white"
		} else {
			str += COLOR_LIST_BG[skillfrom]
		}

		str += ";'><img src='" + this.getChampImgofTurn(skillfrom) + "'>"

		str += "</div><img src='res/img/ui/kill.png'><div class='charframe2' style='background:"
		str += COLOR_LIST_BG[turn]
		str += ";'><img src='" + this.getChampImgofTurn(turn) + "'></div></div><br>"

		$("#killindicator_container").append(str)

		let text = ""
		let largetext = false
		if (turn === GAME.myturn) {
			good=false
			text = GAME.chooseLang("You Died!", "적에게 당했습니다")

			if (skillfrom == -1) {
				text = GAME.chooseLang("Executed!", "처형되었습니다")
			}
			if (isShutDown) {
				text = GAME.chooseLang("Shut Down!", "제압되었습니다")

				largetext = false
			}
			switch (killerMultiKillCount) {
				case 1:
					break
				case 2:
					text = GAME.chooseLang("ENEMY DOUBLE KILL!", "적 더블킬")

					largetext = false
					break
				case 3:
					text = GAME.chooseLang("ENEMY TRIPLE KILL!", "적 트리플킬")
					largetext = true
					break
				case 4:
					text = GAME.chooseLang("ENEMY QUADRA KILL!", "적 쿼드라킬")
					largetext = true
					break
				case 5:
					text = GAME.chooseLang("ENEMY PENTA KILL!", "적 펜타킬")
					largetext = true
					break
				default:
					text = GAME.chooseLang("ENEMY IS LEGENDARY!", "적은 전설적입니다")

					largetext = true
					break
			}
			// if (largetext) {
			// 	$("#largekilltext").html(text)
			// } else {
			// 	$("#largetext").html(text)
			// }
		} else if (skillfrom === GAME.myturn) {
			
			text = GAME.chooseLang("You Slayed an Enemy", "적을 처치했습니다")

			GAME.android_toast(GAME.chooseLang("You Slayed an Enemy!<br>One more dice!", "적을 처치했습니다<br>주사위 한번더!"))
			if (isShutDown) {
				text = GAME.chooseLang("Shut Down!", "제압되었습니다")
				largetext = false
			}
			switch (killerMultiKillCount) {
				case 1:
					break
				case 2:
					text = GAME.chooseLang("DOUBLE KILL!", "더블킬")
					largetext = false
					break
				case 3:
					text = GAME.chooseLang("TRIPLE KILL!", "트리플킬")
					largetext = true
					break
				case 4:
					text = GAME.chooseLang("QUADRA KILL!", "쿼드라킬")
					largetext = true
					break
				case 5:
					text = GAME.chooseLang("PENTA KILL!", "펜타킬")

					largetext = true
					break
				default:
					text = GAME.chooseLang("LEGENDARY!", "전설의 출현!")

					largetext = true
					break
			}
			// if (largetext) {
			// 	$("#largekilltext").html(text)
			// } else {
			// 	$("#largetext").html(text)
			// }
		} else {
			//팀전이 아님
			text = GAME.chooseLang("Enemy", "적")

			//turn:dead player
			//skillfrom:killer
			//GAME.myturn: me

			//아군이 죽음
			if (GAME.isTeam && GAME.players[turn].team === GAME.players[GAME.myturn].team) {
				good=false
				text = GAME.chooseLang("Ally", "아군")

				if (killerMultiKillCount > 2) {
					text = GAME.chooseLang("Enemy", "적")
				}
			}

			//아군이 죽임
			if (GAME.isTeam && GAME.players[skillfrom].team === GAME.players[GAME.myturn].team) {
				text = GAME.chooseLang("Enemy", "적")

				if (killerMultiKillCount > 2) {
					text = GAME.chooseLang("Ally", "아군")
				}
			}

			if (skillfrom == -1) {
				text += GAME.chooseLang(" Executed!", "이 처형되었습니다")
				killerMultiKillCount = 0
			}

			switch (killerMultiKillCount) {
				case 0:
					break
				case 1:
					if (isShutDown) {
						text += GAME.chooseLang(" Shut Down!", "이 제압되었습니다")
						largetext = false
					} else {
						text += GAME.chooseLang(" died!", "이 사망했습니다")
					}
					break
				case 2:
					text += GAME.chooseLang(" DOUBLE KILL!", " 더블킬")
					largetext = false
					break
				case 3:
					text += GAME.chooseLang(" TRIPLE KILL!", " 트리플킬")
					largetext = true
					break
				case 4:
					text += GAME.chooseLang(" QUADRA KILL!", " 쿼드라킬")
					largetext = true
					break
				case 5:
					text += GAME.chooseLang(" PENTA KILL!", " 펜타킬")

					largetext = true
					break
				default:
					text += GAME.chooseLang(" IS LEGENDARY!", "은 전설적입니다!")

					largetext = true
					break
			}
			
		}
		if (largetext) {
			this.showMultiKillImg(skillfrom,killerMultiKillCount,text)
		} else {
			this.showKillText(skillfrom,turn,text,good)
		}



		// setTimeout(() => {
		// 	$("#largekilltext").html("")
		// 	$("#largetext").html("")
		// }, 2000)
	}
	showMultiKillImg(killer,count,text){
		$(".multikillimg").hide()
		$("#kill_text").hide()
		
		if(count>=5){
			$(this.elements.multikillimg[0]).show()
		}
		if(count>=4){
			$(this.elements.multikillimg[1]).show()
		}
		$(this.elements.multikillimg[2]).show()
		// let charnames = ["reaper", "elephant", "ghost", "dinosaur", "sniper", "magician", "kraken", "bird", "tree"]
		$(".multikillchar").attr("src", this.getChampImgofTurn(killer))
		$("#largekilltext").removeClass('long')
		if(GAME.chooseLang(true,false)){
			$("#largekilltext").addClass('long')
		}
		$("#largekilltext").html(text)
		$("#multikill_indicator").show()
		clearTimeout(this.multikillAlertTimeout)
		this.multikillAlertTimeout=setTimeout(()=>$("#multikill_indicator").hide(),2500)
	}
	showKillText(killer,dead,text,good){
		$("#largetext").html(text)
		$("#kill_text").removeClass('good')
		$("#kill_text").removeClass('bad')
		if(good){
			$("#kill_text").addClass('good')
		}
		else{
			$("#kill_text").addClass('bad')
		}
		$(".killtext_killerimg img").attr("src", this.getChampImgofTurn(killer))
		$(".killtext_deadimg img").attr("src", this.getChampImgofTurn(dead))
		$("#kill_text").show()
		clearTimeout(this.killTextTimeout)
		this.killTextTimeout=setTimeout(()=>$("#kill_text").hide(),2500)
	}
	playerReconnect(turn,name){
		this.showKillText(turn,10,GAME.chooseLang(name+" has reconnected",name+"님이 다시 연결되었습니다"))
	}
	playerDisconnect(turn,name){
		this.showKillText(turn,10,GAME.chooseLang(name+" has left the game",name+"님이 게임을 종료했습니다"))
	}
}

class ObsNotification {
	constructor(name) {
		this.name = name
		this.timeout = null
		this.position = 0 //0 hidden, 1 lower 2 upper
	}

	write(obs, num, text) {
		let obstacle = GAME.strRes.OBSTACLES.obstacles[obs]

		//룰렛전용
		if (text != null) {
			obstacle.desc = text
		}
		$(".obs_notification" + num + " p").html(obstacle.desc)
		$(".obs_notification" + num + " b").html(obstacle.name)
		$(".obs_notification" + num).removeClass("good")
		$(".obs_notification" + num).removeClass("bad")
		if (obstacle.val > 0) {
			$(".obs_notification" + num).addClass("good")
		} else if (obstacle.val < 0) {
			$(".obs_notification" + num).addClass("bad")
		}

		$(".obs_notification" + num + " .obs_img").html(
			"<div class=toast_obsimg><img src='res/img/board/obstacles.png' style='margin-left: " +
				-1 * obs * 50 +
				"px'; > </div>"
		)

		// $(".toast_obsimg").css({
		// 	margin: "-35px",
		// 	width: "50px",
		// 	overflow: "hidden",
		// 	height: "50px",
		// 	display: "inline-block",
		// 	transform: "scale(1.3)"
		// })
	}
}


class SkillInfoParser{
	static parse=function(str){
	
		return str.replace(/\<\/\>/g,'</i>')
		.replace(/\\n/g,"<br>")
		.replace(/\[/g,"<i class='braket'>[")
		.replace(/\]/g,"]</i>")
		.replace(/\{/g,"<i class='skill_name'>[")
		.replace(/\}/g,"]&emsp; </i>")
		.replace(/\<cool\>/g,"<i class='cooltime'><img src='res/img/svg/skillinfo/cooltime.svg'>")
		.replace(/\<skill\>/g,"<i class='skill_name_desc'>")
		.replace(/\<lowerbound\>/g,"<i class='down'><img src='res/img/svg/skillinfo/lower.png'>")
		.replace(/\<upperbound\>/g,"<i class='up'><img src='res/img/svg/skillinfo/upper.png'>")
		.replace(/\<up\>/g,"<i class='up'><img src='res/img/svg/skillinfo/up.png'>")
		.replace(/\<down\>/g,"<i class='down'><img src='res/img/svg/skillinfo/down.png'>")
		.replace(/\<stat\>/g,"<i class='stat'>")
		.replace(/\<range\>/g,"<i class='range'>&ensp;<img src='res/img/svg/skillinfo/range.png'>")
		.replace(/\<currHP\>/g,"<i class='health'><img src='res/img/svg/skillinfo/currhp.svg'>")
		.replace(/\<maxHP\>/g,"<i class='health'><img src='res/img/svg/skillinfo/maxhp.png'>")
		.replace(/\<missingHP\>/g,"<i class='health'><img src='res/img/svg/skillinfo/missinghp.png'>")
		.replace(/\<area\>/g,"<i class='emphasize'><img src='res/img/svg/skillinfo/area.png'>")
		.replace(/\<money\>/g,"<i class='money'><img src='res/img/svg/skillinfo/money.png'>")
		.replace(/\<mdmg\>/g,"<i class='mdmg'><img src='res/img/svg/skillinfo/mdamage.png'>")
		.replace(/\<pdmg\>/g,"<i class='pdmg'><img src='res/img/svg/skillinfo/pdamage.png'>")
		.replace(/\<tdmg\>/g,"<i class='tdmg'><img src='res/img/svg/skillinfo/fdamage.png'>")
		.replace(/\<heal\>/g,"<i class='heal'><img src='res/img/svg/skillinfo/heal.png'>")
		.replace(/\<shield\>/g,"<i class='shield'><img src='res/img/svg/skillinfo/shield.svg'>")
		.replace(/\<proj\>/g,"<i class='emphasize'><img src='res/img/svg/skillinfo/pos.png'>")
		.replace(/\<projsize\>/g,"<i class='emphasize'><img src='res/img/svg/skillinfo/size.png'>")
		.replace(/\<duration\>/g,"<i class='emphasize'><img src='res/img/svg/skillinfo/duration.png'>")
		.replace(/\<radius\>/g,"<i class='emphasize'><img src='res/img/svg/skillinfo/around.svg'>")
		.replace(/\<basicattack\>/g,"<i class='basicattack'><img src='res/img/ui/basicattack.png'>")
		.replace(/\<target\>/g,"<i class='emphasize'><img src='res/img/svg/skillinfo/target.svg'>")
		.replace(/\<emp\>/g,"<i class='emphasize_simple'>")
		.replace(/\<skillimg([0-9]+-[0-9]+)>/g,"<img class='info_skillimg' src='res/img/skill/$1.jpg'>")
		.replace(/<scale(.+?)>/g,"<i class='scaled_value' value=$1>")
		.replace(/\<badeffect([0-9]+)\>/g,"<i class='badeffect info_effect' value='$1'>")
		.replace(/\<goodeffect([0-9]+)\>/g,"<i class='goodeffect info_effect' value='$1'>")
		.replace(/(?![^<>]+>)(\d+)(?!\d)/g,"<b>$1</b>")		//wraps all numbers that is not a tag attribute
	
	}
	
}