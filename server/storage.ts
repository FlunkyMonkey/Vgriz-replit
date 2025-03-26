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
    // Create a new subscription with ID and timestamp
    const id = this.emailSubId++;
    const now = new Date();
    const newSubscription: EmailSubscription = {
      ...subscription,
      id,
      createdAt: now
    };

    // Generate a filename with date and time
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const timeStr = now.toISOString().split('T')[1].split('.')[0].replace(/:/g, ''); // HHMMSS
    const filePath = path.join(__dirname, '..', `login_${dateStr}${timeStr}.txt`);
    
    // Save the email to the file
    try {
      fs.writeFileSync(filePath, subscription.email, 'utf-8');
      console.log(`Email saved to ${filePath}`);
    } catch (error) {
      console.error("Error saving email to file:", error);
      throw new Error("Failed to save email subscription");
    }

    // Store in memory for backward compatibility
    this.emailSubscriptions.set(subscription.email, newSubscription);
    
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
