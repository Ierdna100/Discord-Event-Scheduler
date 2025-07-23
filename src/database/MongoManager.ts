import MongoDB from "mongodb";
import { Logger } from "../Logger.js";
import { EnvManager } from "../EnvManager.js";

export default class MongoManager {
    public static instance: MongoManager;

    public static collections: {};

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
        MongoManager.collections = {};
        Logger.detail("Mongo client ready!");
    }
}
