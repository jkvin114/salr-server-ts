import { Player } from "../player/player"
import type { Game } from "../Game"

import { SKILL, FORCEMOVE_TYPE, SKILL_INIT_TYPE, EFFECT, CHARACTER } from "../data/enum"
import { ITEM } from "../data/enum"
import { Damage, PercentDamage } from "../core/Damage"

import { Projectile, ProjectileBuilder } from "../Projectile"
import { SkillInfoFactory } from "../data/SkillDescription"
import * as SKILL_SCALES from "../../res/skill_scales.json"
import { AblityChangeEffect, ShieldEffect } from "../StatusEffect"
import { Entity } from "../entity/Entity"
import { SkillTargetSelector, SkillAttack } from "../core/skill"
import { SpecialEffect } from "../data/SpecialEffectRegistry"
import { CALC_TYPE } from "../core/Util"
import HackerAgent from "../AiAgents/HackerAgent"

const ID = 9
class Hacker extends Player {
	readonly hpGrowth: number
	readonly cooltime_list: number[]
	readonly skill_ranges: number[]

	itemtree: {
		level: number
		items: number[]
		final: number
	}
	readonly duration_list: number[]

	static readonly PROJ_W = "reaper_w"
	static readonly Q_SHIELD = "reaper_q"
	static readonly ULT_SHIELD = "reaper_ult"

	static readonly ULT_ABILITY_STEAL_PERCENT = 2.5
	static readonly Q_STACK_DAMAGE = 10
	static readonly SKILL_EFFECT_NAME = ["magician_q", "hit", "hacker_r"]

	static readonly SKILL_SCALES = SKILL_SCALES[ID]
	private virtualCharacter: Player | null
	private copiedCharId: number
	private stacks: number[]

	constructor(turn: number, team: number, game: Game, ai: boolean, name: string) {
		super(turn, team, game, ai, ID, name)
		this.skill_ranges = [12, 40, 25]

		this.cooltime_list = [2, 5, 6]
		this.duration_list = [0, 0, 2]
		this.virtualCharacter = null
		this.copiedCharId = -1
		this.stacks = [0, 0, 0, 0]

		this.AiAgent=new HackerAgent(this)
	}
	/**
	 * create dummy player that shares component with this player
	 * @param charId
	 */
	private createTransformPlayer(charId: number) {
		this.virtualCharacter = this.game.createPlayer(this.team, charId, this.name, this.turn, this.AI)
		this.virtualCharacter.ability = this.ability
		this.virtualCharacter.effects = this.effects

		this.virtualCharacter.changeSkillImage("", SKILL.ULT)
	}
	/**
	 * set dummy player`s data to be same with player
	 * @returns
	 */
	private syncTransformPlayer() {
		if (!this.virtualCharacter) return
		this.virtualCharacter.inven = this.inven
		this.virtualCharacter.pos = this.pos
		this.virtualCharacter.level = this.level
	}
	/**
	 *
	 * @param charId character to copy
	 * @returns
	 */
	copyCharacter(charId: number): boolean {
		if (charId == ID) return false
		this.createTransformPlayer(charId)
		this.copiedCharId = charId
		this.ability.sendToClient()
		return true
	}
	/**
	 * create dummy player of copied character
	 */
	private onBeforeCopiedSkillUse() {
		if (this.copiedCharId !== -1) this.syncTransformPlayer()
	}
	/**
	 * remove dummy player and reset copied character
	 */
	private onAfterCopiedSkill() {
		
		this.copiedCharId = -1
		this.virtualCharacter = null
		this.changeSkillImage("", SKILL.ULT)
		this.ability.sendToClient()
	}
	private getStackList(){
		let str='<br>Vulnerability stacks collected:<br>'
		for(const p of this.mediator.allPlayer()){
			if(p.turn===this.turn) continue
			str+=p.name+":"+this.stacks[p.turn]+", "
		}
		return str
	}
	//override
	getSkillInfoEng(): string[] {
		let info=super.getSkillInfoEng()
		info[0]+=this.getStackList()
		if(this.virtualCharacter && this.copiedCharId!==-1){
			info[2]=this.virtualCharacter.getSkillInfoEng()[2]
		}
		return info
	}
	//override
	getSkillInfoKor(): string[] {
		let info=super.getSkillInfoKor()
		info[0]+=this.getStackList()
		if(this.virtualCharacter && this.copiedCharId!==-1){
			info[2]=this.virtualCharacter.getSkillInfoKor()[2]
		}
		return info
	}
	getSkillAmount(key: string): number {
		if (key === "stack_damage") return Hacker.Q_STACK_DAMAGE
		if (key === "r_steal") return Hacker.ULT_ABILITY_STEAL_PERCENT
		return 0
	}
	getSkillScale() {
		return Hacker.SKILL_SCALES
	}

	getSkillTrajectorySpeed(skilltype: string): number {
		if(this.virtualCharacter) return this.virtualCharacter.getSkillTrajectorySpeed(skilltype)

		return 0
	}

	getSkillTargetSelector(skill: number): SkillTargetSelector {
		let skillTargetSelector: SkillTargetSelector = new SkillTargetSelector(skill) //-1 when can`t use skill, 0 when it`s not attack skill
		this.pendingSkill = skill
		//	console.log("getSkillAttr" + skill)
		switch (skill) {
			case SKILL.Q:
				skillTargetSelector.setType(SKILL_INIT_TYPE.TARGETING).setRange(this.skill_ranges[skill])

				break
			case SKILL.W:
				skillTargetSelector.setType(SKILL_INIT_TYPE.TARGETING).setRange(this.skill_ranges[skill])

				break
			case SKILL.ULT:
				if (this.copiedCharId === -1)
					skillTargetSelector.setType(SKILL_INIT_TYPE.TARGETING).setConditionedRange(function (this: Entity) {
						return !(this instanceof Player && this.champ == CHARACTER.HACKER)
					}, this.skill_ranges[skill])
				else if (this.virtualCharacter) skillTargetSelector = this.virtualCharacter.getSkillTargetSelector(skill)
				break
		}
		return skillTargetSelector
	}
	getSkillName(skill: number): string {
		if(skill===SKILL.ULT && this.virtualCharacter && this.copiedCharId!==-1) 
			return this.virtualCharacter.getSkillName(skill)

		return Hacker.SKILL_EFFECT_NAME[skill]
	}

	getBasicAttackName(): string {
		if (this.copiedCharId !== -1 && this.virtualCharacter) {
			return this.virtualCharacter.getBasicAttackName()
		}
		return super.getBasicAttackName()
	}

	getSkillProjectile(pos: number): Projectile | null {
		let s: number = this.pendingSkill
		this.pendingSkill = -1

		if (s == SKILL.ULT && this.copiedCharId !== -1 && this.virtualCharacter) {
			this.onBeforeCopiedSkillUse()
			this.startCooltime(s)
			let proj = this.virtualCharacter.getSkillProjectile(pos)
			this.onAfterCopiedSkill()
			proj.sourcePlayer=this
			return proj
		}
		return null
	}
	getSkillBaseDamage(skill: number): number {
		switch (skill) {
		}
		if (skill === SKILL.Q) {
			return this.calculateScale(Hacker.SKILL_SCALES.Q!)
		}
		if (skill === SKILL.W) {
			return this.calculateScale(Hacker.SKILL_SCALES.W!)
		}
		return 0
	}
	addStack(turn: number) {
		this.stacks[turn] += 1
		this.ability.sendToClient()
	}
	getSkillDamage(target: Entity): SkillAttack | null {
        console.log(this.stacks)
		//	console.log(target + "getSkillDamage" + this.pendingSkill)
		let damage = null
		let s: number = this.pendingSkill
		this.pendingSkill = -1
		switch (s) {
			case SKILL.Q:
				let pdmg = this.getSkillBaseDamage(s)
                let moneytake=0
				if (target instanceof Player){
                    pdmg += this.stacks[target.turn] * Hacker.Q_STACK_DAMAGE
                    moneytake=3*this.stacks[target.turn]
                } 
                
				damage = new SkillAttack(new Damage(pdmg, 0, 0), this.getSkillName(s),s,this)
					.setOnHit(function (this: Player, source: Player) {
						if (source instanceof Hacker) {
                            this.inven.takeMoney(moneytake)
					        source.inven.giveMoney(moneytake)
							source.addStack(this.turn)
						}
					})
				this.startCooltime(s)
				break
			case SKILL.W:
				damage = new SkillAttack(Damage.zero(), this.getSkillName(s),s,this)
				if (target instanceof Player) {
					let distance = 2 + Math.floor(0.33334 * this.stacks[target.turn])
					damage.setOnHit(function (this: Player, source: Player) {
						this.effects.apply(EFFECT.CURSE, 1)
						this.game.playerForceMove(this, this.pos - distance, true, FORCEMOVE_TYPE.WALK)
					})
				}
				this.startCooltime(s)
				break
			case SKILL.ULT:
				
				if (this.copiedCharId !== -1 && this.virtualCharacter) {
					this.onBeforeCopiedSkillUse()
					damage = this.virtualCharacter.getSkillDamage(target)
					damage.source=this
					this.startCooltime(s)
					this.onAfterCopiedSkill()
				} else if (target instanceof Player) {
					let stealRatio = (Hacker.ULT_ABILITY_STEAL_PERCENT / 100) * (this.stacks[target.turn]+5)
					let dur=this.duration_list[2]
                    damage = new SkillAttack(Damage.zero(), this.getSkillName(s),s,this)
						.setOnHit(function (this: Player, source: Player) {
							if (source instanceof Hacker) {
								let AP = Math.floor(this.ability.AP.get() * stealRatio)
								let AD = Math.floor(this.ability.AD.get() * stealRatio)
								this.effects.applySpecial(
									new AblityChangeEffect(
										EFFECT.HACKER_ULT_ENEMY,
										dur,
										new Map().set("AP", -AP).set("AD", -AD)
									).setSourceId(source.UEID),
									SpecialEffect.SKILL.HACKER_ULT_ENEMY.name
								)
								source.effects.applySpecial(
									new AblityChangeEffect(
										EFFECT.HACKER_ULT,
										dur,
										new Map().set("AP", AP).set("AD", AD)
									),
									SpecialEffect.SKILL.HACKER_ULT.name
								)
								if (source.copyCharacter(target.champ))
									this.sendConsoleMessage("Hacker extracted " + target.champ_name + "`s ultimate!")
							}
						})
				}
				break
		}

		return damage
	}

	useActivationSkill(skill: number): void {
		if (skill == SKILL.ULT && this.copiedCharId !== -1 && this.virtualCharacter) {
			this.onBeforeCopiedSkillUse()
			this.virtualCharacter.useActivationSkill(skill)
			this.setSingleSkillDuration(skill, this.virtualCharacter.duration_list[skill])
			this.startCooltime(skill)
			if (this.copiedCharId === CHARACTER.BIRD) this.changeSkillImage("", SKILL.Q)
		}
	}

	getBaseBasicAttackDamage(): Damage {
		let damage= super.getBaseBasicAttackDamage()
        if(this.isSkillLearned(SKILL.W)){
            damage.updateMagicDamage(CALC_TYPE.plus,this.getSkillBaseDamage(SKILL.W))
        }
        return damage
	}
	onSkillDurationCount() {
		if (this.virtualCharacter && this.copiedCharId !== -1 && this.virtualCharacter)
			this.virtualCharacter.onSkillDurationCount()
	}
	onSkillDurationEnd(skill: number) {
		if (skill == SKILL.ULT && this.copiedCharId !== -1 && this.virtualCharacter) {
			this.virtualCharacter.onSkillDurationEnd(skill)
			if (this.copiedCharId === CHARACTER.BIRD) this.changeSkillImage("", SKILL.Q)
			this.onAfterCopiedSkill()
		}
	}
}

export { Hacker }
