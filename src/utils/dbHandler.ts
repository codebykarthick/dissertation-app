import SQLite from 'react-native-sqlite-storage';
import { Record } from '../types/DBTypes';

SQLite.enablePromise(true);

export class DatabaseHandler {
    private static instance: DatabaseHandler;
    private db: SQLite.SQLiteDatabase | null = null;
    private isInitialised = false

    private constructor() {
        this.init();
    }

    public static getInstance(): DatabaseHandler {
        if (!DatabaseHandler.instance) {
            DatabaseHandler.instance = new DatabaseHandler();
        }
        return DatabaseHandler.instance;
    }

    private async ensureInitialised(): Promise<void> {
        if (!this.isInitialised) {
            await this.init();
        }
    }

    private async init(): Promise<void> {
        try {
            this.db = await SQLite.openDatabase({ name: 'DeepTest.db', location: 'default' });
            await this.createTable();
            this.isInitialised = true;
        } catch (error) {
            console.error("Failed to open DB", error);
        }
    }

    private async createTable(): Promise<void> {
        if (!this.db) return;
        const query = `
      CREATE TABLE IF NOT EXISTS PipelineResults (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileUri TEXT,
        name TEXT,
        selectedType TEXT,
        selectedModel TEXT,
        probability REAL,
        uncertainity REAL,
        timestamp TEXT
      );`;
        await this.db.executeSql(query);
    }

    async insertRecord(record: Record): Promise<number | null> {
        await this.ensureInitialised();
        if (!this.db) return null;
        const now = new Date();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const timestamp = `${now.getDate().toString().padStart(2, '0')}/` +
            `${(now.getMonth() + 1).toString().padStart(2, '0')}/` +
            `${now.getFullYear().toString().slice(-2)} ` +
            `${now.getHours().toString().padStart(2, '0')}:` +
            `${now.getMinutes().toString().padStart(2, '0')}:` +
            `${now.getSeconds().toString().padStart(2, '0')} ` +
            `(${timezone})`;
        const query = `
      INSERT INTO PipelineResults 
      (fileUri, name, selectedType, selectedModel, probability, uncertainity, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            record.fileUri,
            record.name,
            record.selectedType,
            record.selectedModel,
            record.probability,
            record.uncertainity,
            timestamp
        ];

        try {
            const [result] = await this.db.executeSql(query, params);
            return result.insertId ?? null;
        } catch (error) {
            console.error("Insert failed:", error);
            return null;
        }
    }

    async getRecordById(id: number): Promise<Record | null> {
        await this.ensureInitialised();

        if (!this.db) return null;

        const query = `SELECT * FROM PipelineResults WHERE id = ?`;
        try {
            const [results] = await this.db.executeSql(query, [id]);
            if (results.rows.length > 0) {
                const item = results.rows.item(0);
                return {
                    id: item.id,
                    fileUri: item.fileUri,
                    name: item.name,
                    selectedType: item.selectedType,
                    selectedModel: item.selectedModel,
                    probability: item.probability,
                    uncertainity: item.uncertainity,
                    timestamp: item.timestamp
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Failed to fetch record:", error);
            return null;
        }
    }

    async getAllRecords(): Promise<Record[] | null> {
        await this.ensureInitialised();

        if (!this.db) return null;

        const query = `SELECT * FROM PipelineResults`;

        try {
            const [results] = await this.db.executeSql(query);
            const items: Record[] = [];
            for (let i = 0; i < results.rows.length; i++) {
                const item = results.rows.item(i);
                items.push({
                    id: item.id,
                    fileUri: item.fileUri,
                    name: item.name,
                    selectedType: item.selectedType,
                    selectedModel: item.selectedModel,
                    probability: item.probability,
                    uncertainity: item.uncertainity,
                    timestamp: item.timestamp
                });
            }
            return items;
        } catch (error) {
            console.error("Failed to fetch records:", error);
            return null;
        }
    }

    async updateRecord(id: number, updatedFields: Partial<Record>): Promise<void> {
        await this.ensureInitialised();

        if (!this.db) return;
        const fields = Object.entries(updatedFields);
        if (fields.length === 0) return;

        const setClause = fields.map(([key]) => `${key} = ?`).join(", ");
        const values = fields.map(([_, value]) => value);
        values.push(id);

        const query = `UPDATE PipelineResults SET ${setClause} WHERE id = ?`;
        await this.db.executeSql(query, values);
    }

    async deleteRecord(id: number): Promise<void> {
        await this.ensureInitialised();

        if (!this.db) return;
        const query = `DELETE FROM PipelineResults WHERE id = ?`;
        await this.db.executeSql(query, [id]);
    }
}