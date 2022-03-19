import { Player } from "../player"
import * as ENUM from "../enum"
import { ITEM } from "../enum"
import { Damage, SkillDamage, SkillTargetSelector } from "../Util"
import { ShieldEffect } from "../PlayerStatusEffect"
import { Game } from "../Game"
import { Projectile, ProjectileBuilder } from "../Projectile"
// import SETTINGS = require("../../res/globalsettings.json")

import { SkillInfoFactory } from "../helpers"
import * as SKILL_SCALES from "../../res/skill_scales.json"
const ID = 4
class Jean extends Player {
	//	onoff: boolean[]
	readonly hpGrowth: number
	readonly cooltime_list: number[]
	skill_ranges: number[]

	itemtree: {
		level: number
		items: number[]
		final: number
	}
	private readonly skill_name: string[]
	private u_target: number
	readonly duration_list: number[]
	
	skillInfo:SkillInfoFactory
	skillInfoKor:SkillInfoFactory

	static PROJ_W="sniper_w"
	static EFFECT_ULT="sniper_r"
	static SKILL_SCALES=SKILL_SCALES[ID]
	static SKILL_EFFECT_NAME=["gun", "sniper_w", "sniper_r"]

	constructor(turn: number, team: boolean | string, game: Game, ai: boolean, name: string) {
		//hp, ad:40, ar, mr, attackrange,ap
		const basic_stats: number[] = [190, 40, 7, 7, 0, 0]
		super(turn, team, game, ai, ID, name, basic_stats)
		//	this.onoff = [false, false, false]
		this.hpGrowth = 90
		this.cooltime_list = [3, 4, 9]
		this.duration_list=[0,0,2]
		this.skill_ranges=[20,40,40]
		this.u_target = -1
		this.itemtree = {
			level: 0,
			items: [
				ITEM.EPIC_SWORD,
				ITEM.SWORD_OF_BLOOD,
				ITEM.EPIC_WHIP,
				ITEM.BOOTS_OF_HASTE,
				ITEM.CROSSBOW_OF_PIERCING,
				ITEM.WARRIORS_SHIELDSWORD
			],
			final: ITEM.EPIC_SWORD
		}
		
		this.skillInfo=new SkillInfoFactory(ID,this,SkillInfoFactory.LANG_ENG)
		this.skillInfoKor=new SkillInfoFactory(ID,this,SkillInfoFactory.LANG_KOR)

	}


	getSkillScale(){
		return Jean.SKILL_SCALES
	}

	getSkillTrajectorySpeed(skilltype: string): number {
		if (skilltype === Jean.SKILL_EFFECT_NAME[ENUM.SKILL.ULT]) return 170

		return 0
	}

	private buildProjectile() {
		return new ProjectileBuilder(this.game,Jean.PROJ_W,Projectile.TYPE_RANGE)
			.setSkillRange(30)
			.setAction(function (target: Player) {
				target.effects.apply(ENUM.EFFECT.STUN, 1, ENUM.EFFECT_TIMING.BEFORE_SKILL)
			})
			.setSize(3)
			.setSource(this.turn)
			.setDuration(2)
			.build()
	}

	getSkillTargetSelector(s: number): SkillTargetSelector {
		let skillTargetSelector: SkillTargetSelector = new SkillTargetSelector(ENUM.SKILL_INIT_TYPE.CANNOT_USE).setSkill(s) //-1 when can`t use skill, 0 when it`s not attack skill
		//console.log("getSkillAttr" + s)
		switch (s) {
			case ENUM.SKILL.Q:
				skillTargetSelector.setType(ENUM.SKILL_INIT_TYPE.TARGETING).setRange(this.skill_ranges[s])

				break
			case ENUM.SKILL.W:
				skillTargetSelector.setType(ENUM.SKILL_INIT_TYPE.PROJECTILE).setRange(this.skill_ranges[s]).setProjectileSize(3)

				break
			case ENUM.SKILL.ULT:
				if (this.duration[ENUM.SKILL.ULT] === 0) {
					skillTargetSelector.setType(ENUM.SKILL_INIT_TYPE.TARGETING).setRange(this.skill_ranges[s])
				}
				break
		}
		return skillTargetSelector
	}
	getSkillName(skill: number): string {
		return Jean.SKILL_EFFECT_NAME[skill]
	}

	getBasicAttackName(): string {
		return super.getBasicAttackName()
	}

	getSkillProjectile(pos:number): Projectile {
		let s: number = this.pendingSkill
		this.pendingSkill = -1
		if (s === ENUM.SKILL.W) {
			let proj = this.buildProjectile()
			this.startCooltime(ENUM.SKILL.W)

			return proj
		}
	}
	getSkillBaseDamage(skill: number): number {
		if (skill === ENUM.SKILL.Q) {
			return this.calculateScale(Jean.SKILL_SCALES.Q)
		}
		if (skill === ENUM.SKILL.ULT) {
			return this.calculateScale(Jean.SKILL_SCALES.R)
		}
	}
	getSkillAmount(key: string): number {
		if(key==="rshield") return 80

		return 0
	}

	private getUltShield(){
		return new ShieldEffect(ENUM.EFFECT.SNIPER_ULT_SHIELD,4,this.getSkillAmount("rshield"))
	}

	getSkillDamage(target: number): SkillDamage {
	//	console.log(target + "getSkillDamage" + this.pendingSkill)
		let skillattr: SkillDamage = null
		let s: number = this.pendingSkill
		this.pendingSkill = -1
		switch (s) {
			case ENUM.SKILL.Q:
				this.startCooltime(ENUM.SKILL.Q)
				let _this = this
				let onhit = function (target: Player) {
					if (target.effects.has(ENUM.EFFECT.STUN)) {
						_this.setCooltime(ENUM.SKILL.Q, 1)
					}
				}

				skillattr = new SkillDamage(new Damage(this.getSkillBaseDamage(s), 0, 0),ENUM.SKILL.Q).setOnHit(onhit)

				break
			case ENUM.SKILL.ULT:
				this.effects.applySpecial(this.getUltShield(),Jean.EFFECT_ULT)
				if (this.duration[ENUM.SKILL.ULT] === 0) {
					let onhit = function (target: Player) {
						target.effects.apply(ENUM.EFFECT.SLOW, 1, ENUM.EFFECT_TIMING.TURN_END)
					}

					skillattr = new SkillDamage(new Damage(this.getSkillBaseDamage(s), 0, 0),ENUM.SKILL.ULT).setOnHit(onhit)
					this.startDuration(ENUM.SKILL.ULT)

					this.effects.apply(ENUM.EFFECT.STUN, 1, ENUM.EFFECT_TIMING.BEFORE_SKILL)
					this.u_target = target
					this.startCooltime(ENUM.SKILL.ULT)
				}
				break
		}

		return skillattr
	}

	passive() {}
	getBaseBasicAttackDamage(): Damage {
		return super.getBaseBasicAttackDamage()
	}

	onSkillDurationCount() {
		if (this.duration[ENUM.SKILL.ULT] === 2) {
			this.effects.apply(ENUM.EFFECT.STUN, 1, ENUM.EFFECT_TIMING.BEFORE_SKILL)
			let onhit = function (target: Player) {
				target.effects.apply(ENUM.EFFECT.SLOW, 1, ENUM.EFFECT_TIMING.TURN_END)
			}
			let skillattr = new SkillDamage(new Damage(this.getSkillBaseDamage(ENUM.SKILL.ULT), 0, 0),ENUM.SKILL.ULT).setOnHit(onhit)
			this.hitOneTarget(this.u_target, skillattr)
		}
		//궁 세번째 공격
		if (this.duration[ENUM.SKILL.ULT] === 1) {
			let onhit = function (target: Player) {
				target.effects.apply(ENUM.EFFECT.SLOW, 1, ENUM.EFFECT_TIMING.TURN_END)
			}
			let skillattr = new SkillDamage(new Damage(0,0,this.getSkillBaseDamage(ENUM.SKILL.ULT)),ENUM.SKILL.ULT).setOnHit(onhit)

			this.hitOneTarget(this.u_target, skillattr)

			this.u_target = -1
		}
	}
	onSkillDurationEnd(skill: number) {
		if (skill === ENUM.SKILL.ULT) {
			this.u_target = -1
			this.effects.apply(ENUM.EFFECT.DOUBLEDICE, 1, ENUM.EFFECT_TIMING.TURN_END)
			this.effects.reset(ENUM.EFFECT.STUN)
		}
	}
	/**
	 *
	 * @param {*} skilldata
	 * @param {*} skill 0~
	 */
	aiSkillFinalSelection(skilldata: any, skill: number): { type: number; data: number } {
		if (
			skilldata === ENUM.INIT_SKILL_RESULT.NOT_LEARNED ||
			skilldata === ENUM.INIT_SKILL_RESULT.NO_COOL ||
			skilldata === ENUM.INIT_SKILL_RESULT.NO_TARGET
		) {
			return null
		}
		switch (skill) {
			case ENUM.SKILL.Q:
				return {
					type: ENUM.AI_SKILL_RESULT_TYPE.TARGET,
					data: this.getAiTarget(skilldata.targets)
				}
			case ENUM.SKILL.W:
				return {
					type: ENUM.AI_SKILL_RESULT_TYPE.LOCATION,
					data: this.getAiProjPos(skilldata, skill)
				}
			case ENUM.SKILL.ULT:
				if (this.duration[ENUM.SKILL.ULT] > 0) return { type: ENUM.AI_SKILL_RESULT_TYPE.NON_TARGET, data: null }

				return {
					type: ENUM.AI_SKILL_RESULT_TYPE.TARGET,
					data: this.getAiTarget(skilldata.targets)
				}
		}
	}
}

export { Jean }
