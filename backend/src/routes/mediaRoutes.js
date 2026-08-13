const express = require("express");

const protectAdmin = require(
  "../middleware/protectAdmin"
);

const {
  getMedia,
  getMediaItem,
  createMedia,
  updateMedia,
  deleteMedia,
} = require(
  "../controllers/mediaController"
);

const {
  handleBlobUpload,
} = require(
  "../controllers/blobUploadController"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Blob upload authorization/callback
|--------------------------------------------------------------------------
|
| Do NOT put protectAdmin directly on this route.
| The controller itself verifies the admin when generating
| an upload token, while still allowing Vercel's callback.
|
*/

router.post(
  "/upload",
  handleBlobUpload
);

/*
|--------------------------------------------------------------------------
| All Media Library API routes below require admin login
|--------------------------------------------------------------------------
*/

router.use(protectAdmin);

router.get(
  "/",
  getMedia
);

router.get(
  "/:mediaId",
  getMediaItem
);

router.post(
  "/",
  createMedia
);

router.put(
  "/:mediaId",
  updateMedia
);

router.delete(
  "/:mediaId",
  deleteMedia
);

module.exports = router;