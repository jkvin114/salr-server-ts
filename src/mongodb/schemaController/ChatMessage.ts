
import { IChatMessage,ChatMessage } from "../ChattingSchema"
import type { Types } from "mongoose"

export namespace ChatMessageSchema{
    
    export const create = function (room:Types.ObjectId|string,sender:Types.ObjectId|string,content:string,serial:number) {
        return new ChatMessage({
            room:room,
            sender:sender,
            content:content,
            serial:serial
        }).save()
    }
    export const findAllInRoom = function (room:Types.ObjectId|string) {
        return ChatMessage.find({room:room})
    }
    export const findById = function (id:Types.ObjectId|string) {
        return ChatMessage.findById(id)
    }
    export const findAllFromSerial = function (room:Types.ObjectId|string,serialStart:number) {
        return ChatMessage.find({serial: { $ge: serialStart},room:room}).sort({ createdAt: "asc" })
    }
    export const findOneFromSerial = function (room:Types.ObjectId|string,serial:number) {
        return ChatMessage.find({serial: serial,room:room})
    }
}