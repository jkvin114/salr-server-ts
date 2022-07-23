import { ActionSource } from "./action/ActionSource"
import type { MarbleGame } from "./Game"
import { MarbleClientInterface } from "./MarbleClientInterface"
import type { MarblePlayer } from "./Player"
import { BuildableTile } from "./tile/BuildableTile"
import { LandTile } from "./tile/LandTile"
import { SightTile } from "./tile/SightTile"
import { BUILDING, Tile, TILE_TYPE } from "./tile/Tile"
import { TileFilter } from "./TileFilter"
import { arrayOf, countIterator, countList, distance, range } from "./util"

const GOD_HAND_MAP = require("./../../res/marble/godhand_map.json")
const MAP_SIZE=32
const SAME_LINE_TILES:Set<number>[]=[0,8,16,24].map((i)=>new Set(range((i+8),i).map((i)=>i%MAP_SIZE)))
const pos2Line=function(pos:number){
    return Math.floor((pos%MAP_SIZE)/8)
}
export enum MONOPOLY{
    NONE,TRIPLE,LINE,SIGHT
}

class MarbleGameMap{
    readonly tiles:Tile[]
    readonly corners:Set<Tile>
    readonly specials:Set<Tile>
    readonly buildableTiles:Map<number,BuildableTile>
    readonly start:number
    readonly island:number
    readonly olympic:number
    readonly travel:number
    sights:number[]
    readonly sameColors:Map<number,LandTile[]>  //color,landtile[]
    name:string
    olympicPos:number
    festival:Set<number>
    blackholeTile:number
    whiteholeTile:number
    colorMonopolys:Map<number,number> //color,owner
    tileOwners:number[]
    multipliers:Map<number,number> //position,multiplier
    clientInterface:MarbleClientInterface
    olympicStage:number
    constructor(map:string){ 
        this.buildableTiles=new Map<number,BuildableTile>()
        this.tiles=[]
        this.corners=new Set<Tile>()
        this.sameColors=new Map<number,LandTile[]>()
        this.specials=new Set<Tile>()
        this.sights=[]
        this.name=map
        if(map==='god_hand'){
            
            this.setMap(GOD_HAND_MAP)

            this.start=GOD_HAND_MAP.start
            this.island=GOD_HAND_MAP.island
            this.olympic=GOD_HAND_MAP.olympic
            this.travel=GOD_HAND_MAP.travel
        }
        this.olympicPos=-1
        this.festival=new Set<number>()
        this.blackholeTile=-1
        this.whiteholeTile=-1
        this.tileOwners=arrayOf(MAP_SIZE,-1)
        this.colorMonopolys=new Map<number,number>()
        this.multipliers=new Map<number,number>()
        this.clientInterface = new MarbleClientInterface("")
        this.olympicStage=1
    }
    setClientInterface(ci: MarbleClientInterface) {
		this.clientInterface = ci
	}
    setMap(map:any){
        for(let i=0;i<MAP_SIZE;++i){
            this.tiles.push(new Tile(i,TILE_TYPE.OTHER))
        }
        for(const land of map.lands){
            let tile=new LandTile(land.pos,TILE_TYPE.LAND,land.name,land.color,land.toll.map((t:number)=>10000*t),land.price.map((t:number)=>10000*t))
            this.tiles[land.pos]=tile
            this.buildableTiles.set(land.pos,tile)

            if(!this.sameColors.has(land.color)){
                this.sameColors.set(land.color,[])
            }
            
            let t=this.sameColors.get(land.color)
            if(t) t.push(tile)
            
        }
        
        for(const sight of map.sights){
            let tile=new SightTile(sight.pos,TILE_TYPE.SIGHT,sight.name,sight.type,sight.toll*10000,sight.price*10000)
            this.tiles[sight.pos]=tile
            this.buildableTiles.set(sight.pos,tile)
            this.sights.push(sight.pos)
        }
        for(const special of map.specials){
            let tile=new Tile(special,TILE_TYPE.SPECIAL,'특수 지역')
            this.tiles[special]=tile
            this.specials.add(tile)
        }
        for(const card of map.cards){
            this.tiles[card]=new Tile(card,TILE_TYPE.CARD,'포춘 카드')
        }
        this.tiles[map.start]=new Tile(map.start,TILE_TYPE.START,'시작')
        this.tiles[map.island]=new Tile(map.island,TILE_TYPE.ISLAND,map.corner_names.island)
        this.tiles[map.olympic]=new Tile(map.olympic,TILE_TYPE.OLYMPIC,map.corner_names.olympic)
        this.tiles[map.travel]=new Tile(map.travel,TILE_TYPE.TRAVEL,map.corner_names.travel)

        this.corners.add(this.tiles[map.start]).add(this.tiles[map.island]).add(this.tiles[map.olympic]).add(this.tiles[map.travel])
    }
    onTurnStart(turn:number){
        for(const tile of this.buildableTiles.values()){
            if(tile.owner!==turn) continue
            if(tile.cooldownStatusEffect()) 
                this.clientInterface.setStatusEffect(tile.position,"",0)
        }
    }
    buildableTileAt(pos:number){
        return this.buildableTiles.get(pos)
    }
    tileAt(index:number):Tile{
        return this.tiles[index%MAP_SIZE]
    }

    isSameLine(pos1:number,pos2:number){
        return SAME_LINE_TILES.some((line)=>line.has(pos1) && line.has(pos2))
    }

    getTiles(source:MarblePlayer,...filters:TileFilter[]):number[]{
        let result=new Set<number>()
        for(const f of filters){
            let tiles:Set<number>
            if(f.buildableOnly){
                tiles=this.filterFromBuildable(f,source)
            }
            else{
                tiles=this.filterFromAll(f,source)
            }
            tiles.forEach((t)=>result.add(t))
        }
        return Array.from(result)
    }
    onTilePass(game:MarbleGame,tile:number,player:MarblePlayer,source:ActionSource):boolean{
        if(this.start===tile){
            game.receiveMoney(player,game.SALARY)
        }
        return false
    }


    private filterFromBuildable(filter:TileFilter,source:MarblePlayer):Set<number>{
        let tiles=new Set<number>()
        for(const t of this.buildableTiles.values()){
            if(filter.excludeMyPos && t.position===source.pos) continue
            if(filter.exclude.has(t.position)) continue
            if(filter.cornerOnly && !t.isCorner) continue
            if(filter.specialOnly && !t.isSpecial) continue
            if(filter.ownedOnly && !t.land) continue
            if(filter.emptyOnly && t.land) continue
            if(filter.enemyLandOnly && (t.owner === source.turn || !t.owned())) continue
            if(filter.moreBuildable && !t.isMoreBuildable()) continue
            if(filter.landTileOnly && !(t instanceof LandTile)) continue
            if(filter.landmarkOnly && (!(t instanceof LandTile) || (t instanceof LandTile && !t.landMark))) continue
            if(filter.excludeLandMark && (t instanceof LandTile && t.landMark)) continue
            if(filter.canBuyOut && !t.canBuyOut()) continue
            if(filter.owners.length>0 && !filter.owners.includes(t.owner)) continue
            if(filter.myLandOnly && t.owner!==source.turn) continue
            if(filter.ownedOnly && !t.owned()) continue
            if(distance(t.position,source.pos) > filter.radius) continue
            if(filter.sameLine && !this.isSameLine(t.position,source.pos)) continue
            tiles.add(t.position)
        }
        return tiles
    }
    private filterFromAll(filter:TileFilter,source:MarblePlayer):Set<number>{
        let tiles=new Set<number>()
        for(const t of this.tiles){
            if(filter.excludeMyPos && t.position===source.pos) continue
            if(distance(t.position,source.pos) > filter.radius) continue
            if(filter.exclude.has(t.position)) continue
            if(filter.cornerOnly && !t.isCorner) continue
            if(filter.specialOnly && !t.isSpecial) continue
            if(filter.sameLine && !this.isSameLine(t.position,source.pos)) continue
            tiles.add(t.position)
        }
        return tiles

    }

    

    setLandOwner(tile:BuildableTile,owner:number){
        let prevOwner=tile.owner
        this.tileOwners[tile.position]=owner
        tile.owner=owner
        if(tile instanceof LandTile)
            this.updateColorMonopoly(tile,owner,prevOwner)
        
        this.updateMultiplier()
    }

    buildAt(tile:BuildableTile,builds:BUILDING[],player:number){
        let price=tile.build(builds)

        this.clientInterface.build(tile.position,builds,player)
        this.clientInterface.updateToll(tile.position,tile.getToll(),tile.getMultiplier())

        return price
    }
    updateColorMonopoly(tile:LandTile,newOwner:number,prevOwner:number){
        let color=tile.color
        let change=[-1,-1]  //add,remove

        //remove color monopoly
        if(this.colorMonopolys.get(color)===prevOwner){
            let t=this.sameColors.get(color)
            if(t) t.forEach((land)=>land.removeColorMonopoly())
            this.colorMonopolys.delete(color)
            change[1]=color
        }

        let colors=this.sameColors.get(color)
        //add color monopoly
        if( colors!==undefined && newOwner!==-1 && colors.every((tile)=>tile.owner===newOwner)){
            this.colorMonopolys.set(color,newOwner)
            let tiles=this.sameColors.get(color)
            if(tiles)
                tiles.forEach((land)=>land.setColorMonopoly())
            change[0]=color
        }
    }
    updateMultiplier()
    {
        let change:{pos:number,toll:number,mul:number}[]=[]
        for(const [pos,land] of this.buildableTiles.entries()){
            if(land.owner === -1) continue
            
            let mul=land.getMultiplier()
            if(this.multipliers.get(pos)!== mul){
                change.push({
                    pos:pos,mul:mul,toll:land.getToll()
                })
                this.multipliers.set(pos,mul)
            }
        }
        this.clientInterface.updateMultipliers(change)
    }
    setOlympic(pos:number){
        if(!this.buildableTiles.has(pos)){
            console.error("invalid olympic position")
            return 
        }
        if(this.olympicPos!==-1){
            let o=this.buildableTiles.get(this.olympicPos)
            if(o) o.setOlympic(0)
        }
        let o=this.buildableTiles.get(pos)
        if(o) o.setOlympic(this.olympicStage)
        this.olympicPos=pos
        this.olympicStage+=1
        this.updateMultiplier()
    }
    setFestival(pos:number,takeFrom?:number){
        if(!this.buildableTiles.has(pos)){
            console.error("invalid festival position")
            return
        }
        if(takeFrom!=null && this.festival.has(takeFrom) && this.buildableTiles.has(takeFrom)){
            let f=this.buildableTiles.get(takeFrom)
            if(f) f.setFestival(false)
            this.festival.delete(takeFrom)
        }
        this.festival.add(pos)
        
        let f=this.buildableTiles.get(pos)
        if(f) f.setFestival(true)
        else console.error("invalid festival position")
        this.updateMultiplier()
    }

    setBlackHole(black:number,white:number){
        this.blackholeTile=black
        this.whiteholeTile=white
    }
    removeBlackHole(){
        if(this.blackholeTile!==-1 && this.whiteholeTile!==-1){
            this.blackholeTile=-1
            this.whiteholeTile=-1
        }
    }
    clearTile(tile:BuildableTile)
    {
        if(tile.olympic) this.olympicPos=-1
        tile.removeAll()
        this.setLandOwner(tile,-1)
        this.clientInterface.clearBuildings([tile.position])
    }
    removeOneBuild(tile:BuildableTile){
        if(tile.type===TILE_TYPE.SIGHT || !(tile instanceof LandTile) ) return
        
        let removed=tile.removeOneHouse()
        this.clientInterface.removeBuilding([removed],tile.position)
    }
    applyStatusEffect(tile:BuildableTile,name:string,dur:number){
        if(tile.setStatusEffect(name,dur))
            this.clientInterface.setStatusEffect(tile.position,name,dur)

    }
    onAfterClaimToll(tile:Tile){
        this.removeStatusEffect(tile.position)
    }
    removeStatusEffect(pos:number){
        let tile=this.buildableTiles.get(pos)
        if(!tile) return
        tile.removeStatusEffect()
        this.clientInterface.setStatusEffect(pos,"",0)
    }

    onPlayerRetire(player:MarblePlayer):number[]{
        let toremove=this.getTiles(player,TileFilter.MY_LAND())
        for(let t of toremove){
            let tile=this.tileAt(t)
            if(tile instanceof BuildableTile) {
                this.clearTile(tile)
            }
        }
        return toremove
        
    }
    checkMonopoly(changedTile:BuildableTile,invoker:number):MONOPOLY{
        //관독
        if(changedTile.type===TILE_TYPE.SIGHT){
            if(this.sights.map((t)=>this.tileOwners[t]).every((owner)=>owner===invoker)){
                return MONOPOLY.SIGHT
            }
        }//트독
        else if(changedTile.type===TILE_TYPE.LAND){
            if(countIterator(this.colorMonopolys.values(),(m:number)=>m===invoker)>=3)
                return MONOPOLY.TRIPLE
        }
        //라독
        let m=true
        for(const tile of SAME_LINE_TILES[pos2Line(changedTile.position)]){
            if(this.tileAt(tile) instanceof BuildableTile && this.tileOwners[tile]!==invoker) m=false
        }

        if(m) return MONOPOLY.LINE

        return MONOPOLY.NONE
    }
    checkMonopolyAlert(changedTile:BuildableTile,invoker:number):{type:MONOPOLY,pos:number[]}{
        
        let pos:number[]=[]
        //관독
        if(changedTile.type===TILE_TYPE.SIGHT){
            let count=0

            for(const m of this.sights){
                if(this.tileOwners[m]===invoker) count+=1
                else pos.push(m)
            }
            if(count===this.sights.length-1) return {type:MONOPOLY.SIGHT,pos:pos}
        }//트독
        else if(changedTile.type===TILE_TYPE.LAND){
            let count=0
            for(const [color,lands] of this.sameColors.entries()){
                //이미 플레이어 컬러독점인 땅
                if(this.colorMonopolys.has(color) && this.colorMonopolys.get(color)===invoker){
                    count+=1
                }
                else{
                    let landsLeft=lands.filter((land)=>land.owner!==invoker)
                    if(landsLeft.length===1) pos.push(landsLeft[0].position)
                }
            }
            if(count===2 && pos.length>0) return {type:MONOPOLY.TRIPLE,pos:pos}
        }
        //라독
        pos=[]
        for(const tile of SAME_LINE_TILES[pos2Line(changedTile.position)]){
            if(this.tileAt(tile) instanceof BuildableTile && this.tileOwners[tile]!==invoker){
                pos.push(tile)
            }
        }
        if(pos.length===1) return {type:MONOPOLY.LINE,pos:pos}


        return {type:MONOPOLY.NONE,pos:[]}
    }
    toString(){
        for(const t of this.tiles){
            
            console.log(t.toString())
            console.log("------------------------")
        }
        console.log("컬러독점")
        console.log(this.colorMonopolys)
        console.log("땅 주인")
        console.log(this.tileOwners)
    }
    

}
export {MarbleGameMap}