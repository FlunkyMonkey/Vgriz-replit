import { users, type User, type InsertUser, type EmailSubscription, type InsertEmailSubscription } from "@shared/schema";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Email subscription methods
  saveEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription>;
  getEmailSubscription(email: string): Promise<EmailSubscription | undefined>;
  getAllEmailSubscriptions(): Promise<EmailSubscription[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emailSubscriptions: Map<string, EmailSubscription>;
  private emailStoragePath: string;
  currentId: number;
  emailSubId: number;

  constructor() {
    this.users = new Map();
    this.emailSubscriptions = new Map();
    this.currentId = 1;
    this.emailSubId = 1;
    
    // Set up the path for storing email subscriptions
    this.emailStoragePath = path.join(__dirname, "..", "email_subscriptions.json");
    
    // Initialize the email subscriptions file if it doesn't exist
    this.initEmailStorage();
    
    // Load existing email subscriptions if any
    this.loadEmailSubscriptions();
  }

  private initEmailStorage() {
    try {
      if (!fs.existsSync(this.emailStoragePath)) {
        fs.writeFileSync(this.emailStoragePath, JSON.stringify([], null, 2));
      }
    } catch (error) {
      console.error("Error initializing email storage:", error);
    }
  }

  private loadEmailSubscriptions() {
    try {
      if (fs.existsSync(this.emailStoragePath)) {
        const data = fs.readFileSync(this.emailStoragePath, 'utf-8');
        const subscriptions: EmailSubscription[] = JSON.parse(data);
        
        // Find the highest ID to ensure we don't duplicate IDs
        let maxId = 0;
        
        subscriptions.forEach(sub => {
          // Store in memory map
          this.emailSubscriptions.set(sub.email, sub);
          
          // Track highest ID
          if (sub.id > maxId) {
            maxId = sub.id;
          }
        });
        
        // Update the ID counter
        this.emailSubId = maxId + 1;
      }
    } catch (error) {
      console.error("Error loading email subscriptions:", error);
    }
  }

  private saveEmailSubscriptionsToFile() {
    try {
      const subscriptions = Array.from(this.emailSubscriptions.values());
      fs.writeFileSync(this.emailStoragePath, JSON.stringify(subscriptions, null, 2));
    } catch (error) {
      console.error("Error saving email subscriptions to file:", error);
      throw new Error("Failed to save email subscription");
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription> {
    // Check if the email already exists
    const existingSubscription = await this.getEmailSubscription(subscription.email);
    if (existingSubscription) {
      return existingSubscription;
    }

    // Create a new subscription with ID and timestamp
    const id = this.emailSubId++;
    const now = new Date();
    const newSubscription: EmailSubscription = {
      ...subscription,
      id,
      createdAt: now
    };

    // Store in memory
    this.emailSubscriptions.set(subscription.email, newSubscription);
    
    // Persist to file
    this.saveEmailSubscriptionsToFile();

    return newSubscription;
  }

  async getEmailSubscription(email: string): Promise<EmailSubscription | undefined> {
    return this.emailSubscriptions.get(email);
  }

  async getAllEmailSubscriptions(): Promise<EmailSubscription[]> {
    return Array.from(this.emailSubscriptions.values());
  }
}

export const storage = new MemStorage();
