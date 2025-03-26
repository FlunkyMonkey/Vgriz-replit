import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validatedEmailSubscriptionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Endpoint for email subscription
  app.post("/api/subscribe", async (req, res) => {
    try {
      // Validate the email from the request body using Zod schema
      const result = validatedEmailSubscriptionSchema.safeParse(req.body);
      
      if (!result.success) {
        // Convert Zod error to friendly error message
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      // Store the validated email 
      const subscription = await storage.saveEmailSubscription(result.data);
      
      // Return success response
      return res.status(200).json({ 
        success: true, 
        message: "Thank you for subscribing!",
        subscription
      });
    } catch (error) {
      console.error("Error saving subscription:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to save your subscription. Please try again later." 
      });
    }
  });

  // Get all email subscriptions (could be secured in production)
  app.get("/api/subscriptions", async (_req, res) => {
    try {
      const subscriptions = await storage.getAllEmailSubscriptions();
      return res.status(200).json({ subscriptions });
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to fetch subscriptions."
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
