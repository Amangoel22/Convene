// Purpose: inventoryRoutes provides event-scoped inventory persistence and lead authorization.
import express from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership, authorizeOrgLead } from "../middlewares/auth.js";

const router = express.Router();

// Purpose: validate and normalize inventory quantities.
function inventoryData(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const values = ["totalNeeded", "available", "defective"].map((field) => Number(body[field] ?? 0));
  if (!name) return { error: "Inventory item name is required." };
  if (values.some((value) => !Number.isInteger(value) || value < 0)) return { error: "Inventory quantities must be non-negative whole numbers." };
  return { data: { name, totalNeeded: values[0], available: values[1], defective: values[2] } };
}

// Purpose: list inventory for an event.
router.get("/:eventId/inventory", authenticate, authorizeEventMembership(), async (req, res) => {
  try {
    const inventory = await prisma.inventoryItem.findMany({ where: { eventId: req.params.eventId }, orderBy: { createdAt: "asc" } });
    return res.json({ inventory });
  } catch (error) { return res.status(500).json({ error: "Failed to fetch inventory.", details: error.message }); }
});

// Purpose: create an inventory item for an event.
router.post("/:eventId/inventory", authenticate, authorizeEventMembership(["organizer"]), authorizeOrgLead(), async (req, res) => {
  const validated = inventoryData(req.body);
  if (validated.error) return res.status(400).json({ error: validated.error });
  try {
    const item = await prisma.inventoryItem.create({ data: { eventId: req.params.eventId, ...validated.data } });
    return res.status(201).json({ item });
  } catch (error) { return res.status(500).json({ error: "Failed to create inventory item.", details: error.message }); }
});

// Purpose: update an inventory item for an event.
router.patch("/:eventId/inventory/:itemId", authenticate, authorizeEventMembership(["organizer"]), authorizeOrgLead(), async (req, res) => {
  const validated = inventoryData(req.body);
  if (validated.error) return res.status(400).json({ error: validated.error });
  try {
    const existing = await prisma.inventoryItem.findFirst({ where: { id: req.params.itemId, eventId: req.params.eventId } });
    if (!existing) return res.status(404).json({ error: "Inventory item not found." });
    const item = await prisma.inventoryItem.update({ where: { id: existing.id }, data: validated.data });
    return res.json({ item });
  } catch (error) { return res.status(500).json({ error: "Failed to update inventory item.", details: error.message }); }
});

export default router;
