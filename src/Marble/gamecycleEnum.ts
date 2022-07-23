export enum GAME_CYCLE{
    START_TURN,//0
    WAITING_DICE,
    THROWING_DICE,
    PLAYER_WALKING,//3
    PLAYER_TELEPORTING,
    WAITING_BUILD,
    WAITING_LANDMARK,//6
    WAITING_BUYOUT,
    WAITING_CARD_OBTAIN,
    WAITING_CARD_USE,//9
    WAITING_TILE_SELECTION,
    WAINTING_PLAYER_SELECTION,
    ARRIVE_TILE,//12
    WAITING_LOAN,
    WAITING_LAND_CHANGE

}
export const GAME_CYCLE_NAME=[
    "START_TURN",
    "WAITING_DICE",
    "THROWING_DICE",
    "PLAYER_WALKING",
    "PLAYER_TELEPORTING",
    "WAITING_BUILD",
    "WAITING_LANDMARK",
    "WAITING_BUYOUT",
    "WAITING_CARD_OBTAIN",
    "WAITING_CARD_USE",
    "WAITING_TILE_SELECTION",
    "WAINTING_PLAYER_SELECTION",
    "ARRIVE_TILE",
    "WAITING_LOAN"
]

