const express = require("express");

const protectAdmin = require(
  "../middleware/protectAdmin"
);

const {
  getActivities,
  getActivitySummary,
} = require(
  "../controllers/activityController"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| All activity routes require admin login
|--------------------------------------------------------------------------
*/

router.use(protectAdmin);

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getActivities
);

router.get(
  "/summary",
  getActivitySummary
);

module.exports = router;