export namespace GAME_CYCLE{
	export enum BEFORE_OBS {
		INITIALIZE=0,
		WAITING_DICE,
		THROW_DICE,
		ROOTED,
		AI_THROW_DICE
	}
	export enum BEFORE_SKILL {
		ARRIVE_SQUARE = 10,
		PENDING_OBSTACLE,PENDING_OBSTACLE_PROGRESS,
		PENDING_ACTION,PENDING_ACTION_PROGRESS
	}
	export enum SKILL {
		SILENT = 20,
		AI_SKILL,
		WAITING_SKILL,
		WAITING_TARGET,
		WAITING_LOCATION,
		WAITING_AREA_TARGET
	}
	export const TURN_END=40
	export const BEFORE_START=-999
	export const GAMEOVER=999
}
