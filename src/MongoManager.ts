import { EnvManager } from "../EnvManager.js";
import { Logger } from "../logging/Logger.js";
import MongoDB from "mongodb";
import { Schema_AuthenticatedUser, Schema_AwaitingAuthenticationUser, Schema_IPBans, Schema_IPConfirmation } from "./Schemas.js";

export default class MongoManager {
    public static instance: MongoManager;

    public static collections: {
        authenticatedUsers: MongoDB.Collection<Schema_AuthenticatedUser>;
        awaitingAuthenticationUsers: MongoDB.Collection<Schema_AwaitingAuthenticationUser>;
        awaitingIPConfirms: MongoDB.Collection<Schema_IPConfirmation>;
        bannedIPs: MongoDB.Collection<Schema_IPBans>;
    };

    private client!: MongoDB.MongoClient;
    private db!: MongoDB.Db;

    constructor() {
        MongoManager.instance = this;
    }

    public async initialize() {
        Logger.detail("Starting Mongo Client...");
        this.client = new MongoDB.MongoClient(EnvManager.env.mongoConnectionString);
        await this.client.connect();
        this.db = this.client.db(EnvManager.env.mongoDatabaseName);
        MongoManager.collections = {
            authenticatedUsers: this.db.collection<Schema_AuthenticatedUser>(EnvManager.env.coll_allowedMembers),
            awaitingAuthenticationUsers: this.db.collection<Schema_AwaitingAuthenticationUser>(EnvManager.env.coll_awaitingMembers),
            awaitingIPConfirms: this.db.collection<Schema_IPConfirmation>(EnvManager.env.coll_confirmingIps),
            bannedIPs: this.db.collection<Schema_IPBans>(EnvManager.env.coll_bannedIps)
        };
        Logger.detail("Mongo client ready!");
    }
}
