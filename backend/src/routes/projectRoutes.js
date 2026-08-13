const express = require("express");

const protectAdmin = require("../middleware/protectAdmin");
const {
  getPublicProjects,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  duplicateProject,
  setProjectFeatured,
  syncDefaultProjects,
} = require("../controllers/projectController");

const router = express.Router();

// Public website route: returns published projects only.
router.get("/public", getPublicProjects);

// Everything below this line requires an admin login.
router.use(protectAdmin);

router.get("/", getProjects);
router.post("/", createProject);
router.post(
  "/sync-defaults",
  syncDefaultProjects
);
router.post(
  "/:projectId/duplicate",
  duplicateProject
);
router.patch(
  "/:projectId/featured",
  setProjectFeatured
);
router.put("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

module.exports = router;
