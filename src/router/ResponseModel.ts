import type mongoose from "mongoose"

export interface IFriend{
    _id:mongoose.Types.ObjectId
    profileImgDir:string
    username:string
    email:string
    status?:string
}
export interface IFollow{
    _id:mongoose.Types.ObjectId
    profileImgDir:string
    username:string
    email:string
    isMyFollowing?:boolean
}
export interface ChatMessageModel{
    username?:string
    content?:string
    serial:number
    createdAt?:string
    unread:number
}
export interface IFriendStatus{
    _id:string
    profileImgDir:string
    username:string
    status:string
    lastActive:number //last active UTC milisecond. -1 if unavaliable.
}