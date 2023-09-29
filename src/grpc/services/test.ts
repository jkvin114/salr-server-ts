/**
 * Generated by the protoc-gen-ts.  DO NOT EDIT!
 * compiler version: 3.20.3
 * source: src/grpc/proto/test.proto
 * git: https://github.com/thesayyn/protoc-gen-ts */
import * as pb_1 from "google-protobuf";
import * as grpc_1 from "@grpc/grpc-js";
export namespace test {
    export class Int extends pb_1.Message {
        #one_of_decls: number[][] = [];
        constructor(data?: any[] | {
            val?: number;
        }) {
            super();
            pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [], this.#one_of_decls);
            if (!Array.isArray(data) && typeof data == "object") {
                if ("val" in data && data.val != undefined) {
                    this.val = data.val;
                }
            }
        }
        get val() {
            return pb_1.Message.getFieldWithDefault(this, 1, 0) as number;
        }
        set val(value: number) {
            pb_1.Message.setField(this, 1, value);
        }
        static fromObject(data: {
            val?: number;
        }): Int {
            const message = new Int({});
            if (data.val != null) {
                message.val = data.val;
            }
            return message;
        }
        toObject() {
            const data: {
                val?: number;
            } = {};
            if (this.val != null) {
                data.val = this.val;
            }
            return data;
        }
        serialize(): Uint8Array;
        serialize(w: pb_1.BinaryWriter): void;
        serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
            const writer = w || new pb_1.BinaryWriter();
            if (this.val != 0)
                writer.writeInt32(1, this.val);
            if (!w)
                return writer.getResultBuffer();
        }
        static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Int {
            const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new Int();
            while (reader.nextField()) {
                if (reader.isEndGroup())
                    break;
                switch (reader.getFieldNumber()) {
                    case 1:
                        message.val = reader.readInt32();
                        break;
                    default: reader.skipField();
                }
            }
            return message;
        }
        serializeBinary(): Uint8Array {
            return this.serialize();
        }
        static deserializeBinary(bytes: Uint8Array): Int {
            return Int.deserialize(bytes);
        }
    }
    export class Void extends pb_1.Message {
        #one_of_decls: number[][] = [];
        constructor(data?: any[] | {}) {
            super();
            pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [], this.#one_of_decls);
            if (!Array.isArray(data) && typeof data == "object") { }
        }
        static fromObject(data: {}): Void {
            const message = new Void({});
            return message;
        }
        toObject() {
            const data: {} = {};
            return data;
        }
        serialize(): Uint8Array;
        serialize(w: pb_1.BinaryWriter): void;
        serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
            const writer = w || new pb_1.BinaryWriter();
            if (!w)
                return writer.getResultBuffer();
        }
        static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Void {
            const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new Void();
            while (reader.nextField()) {
                if (reader.isEndGroup())
                    break;
                switch (reader.getFieldNumber()) {
                    default: reader.skipField();
                }
            }
            return message;
        }
        serializeBinary(): Uint8Array {
            return this.serialize();
        }
        static deserializeBinary(bytes: Uint8Array): Void {
            return Void.deserialize(bytes);
        }
    }
    interface GrpcUnaryServiceInterface<P, R> {
        (message: P, metadata: grpc_1.Metadata, options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
        (message: P, metadata: grpc_1.Metadata, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
        (message: P, options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
        (message: P, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
    }
    interface GrpcStreamServiceInterface<P, R> {
        (message: P, metadata: grpc_1.Metadata, options?: grpc_1.CallOptions): grpc_1.ClientReadableStream<R>;
        (message: P, options?: grpc_1.CallOptions): grpc_1.ClientReadableStream<R>;
    }
    interface GrpWritableServiceInterface<P, R> {
        (metadata: grpc_1.Metadata, options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
        (metadata: grpc_1.Metadata, callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
        (options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
        (callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
    }
    interface GrpcChunkServiceInterface<P, R> {
        (metadata: grpc_1.Metadata, options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<P, R>;
        (options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<P, R>;
    }
    interface GrpcPromiseServiceInterface<P, R> {
        (message: P, metadata: grpc_1.Metadata, options?: grpc_1.CallOptions): Promise<R>;
        (message: P, options?: grpc_1.CallOptions): Promise<R>;
    }
    export abstract class UnimplementedTestService {
        static definition = {
            Test: {
                path: "/test.Test/Test",
                requestStream: false,
                responseStream: false,
                requestSerialize: (message: Int) => Buffer.from(message.serialize()),
                requestDeserialize: (bytes: Buffer) => Int.deserialize(new Uint8Array(bytes)),
                responseSerialize: (message: Int) => Buffer.from(message.serialize()),
                responseDeserialize: (bytes: Buffer) => Int.deserialize(new Uint8Array(bytes))
            },
            Test1: {
                path: "/test.Test/Test1",
                requestStream: false,
                responseStream: false,
                requestSerialize: (message: Int) => Buffer.from(message.serialize()),
                requestDeserialize: (bytes: Buffer) => Int.deserialize(new Uint8Array(bytes)),
                responseSerialize: (message: Void) => Buffer.from(message.serialize()),
                responseDeserialize: (bytes: Buffer) => Void.deserialize(new Uint8Array(bytes))
            }
        };
        [method: string]: grpc_1.UntypedHandleCall;
        abstract Test(call: grpc_1.ServerUnaryCall<Int, Int>, callback: grpc_1.sendUnaryData<Int>): void;
        abstract Test1(call: grpc_1.ServerUnaryCall<Int, Void>, callback: grpc_1.sendUnaryData<Void>): void;
    }
    export class TestClient extends grpc_1.makeGenericClientConstructor(UnimplementedTestService.definition, "Test", {}) {
        constructor(address: string, credentials: grpc_1.ChannelCredentials, options?: Partial<grpc_1.ChannelOptions>) {
            super(address, credentials, options);
        }
        Test: GrpcUnaryServiceInterface<Int, Int> = (message: Int, metadata: grpc_1.Metadata | grpc_1.CallOptions | grpc_1.requestCallback<Int>, options?: grpc_1.CallOptions | grpc_1.requestCallback<Int>, callback?: grpc_1.requestCallback<Int>): grpc_1.ClientUnaryCall => {
            return super.Test(message, metadata, options, callback);
        };
        Test1: GrpcUnaryServiceInterface<Int, Void> = (message: Int, metadata: grpc_1.Metadata | grpc_1.CallOptions | grpc_1.requestCallback<Void>, options?: grpc_1.CallOptions | grpc_1.requestCallback<Void>, callback?: grpc_1.requestCallback<Void>): grpc_1.ClientUnaryCall => {
            return super.Test1(message, metadata, options, callback);
        };
    }
}
