const express = require('express');
const { Firestore } = require('@google-cloud/firestore');
const app = express();
const db = new Firestore();

app.get('/flags/:flagName', async (req, res) => {
  res.json({
    flag: req.params.flagName,
    enabled: true,
    value: "Hello",
    lastModified: new Date().toISOString(),
    approvedBy: "Mock Architecture Review Board",
    changeRequestId: "CR-MOCK-123",
    rolloutPercentage: 100,
    note: "Mock feature flag for testing - always returns Hello"
  });
});

app.listen(8084);