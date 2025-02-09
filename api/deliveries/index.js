const express = require("express");
const { Delivery } = require("../lib/models");
const { verifyToken } = require("../lib/auth");

const router = express.Router();

// Create Delivery
router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "customer")
    return res
      .status(403)
      .json({ error: "Only customers can create deliveries" });

  const { pickupLocation, dropoffLocation } = req.body;
  const delivery = await Delivery.create({
    customerId: req.user.id,
    pickupLocation,
    dropoffLocation,
  });

  res.json(delivery);
});

// Accept Delivery
router.put("/accept", verifyToken, async (req, res) => {
  if (req.user.role !== "driver")
    return res
      .status(403)
      .json({ error: "Only drivers can accept deliveries" });

  const { id } = req.body;
  const delivery = await Delivery.findByPk(id);
  if (!delivery || delivery.status !== "pending")
    return res.status(400).json({ error: "Delivery not available" });

  delivery.driverId = req.user.id;
  delivery.status = "accepted";
  await delivery.save();

  res.json(delivery);
});

module.exports = router;
