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
  createUploadTicket,
  handleBlobUpload,
} = require(
  "../controllers/blobUploadController"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Blob client upload authorization
|--------------------------------------------------------------------------
|
| The ticket endpoint is authenticated normally. The Blob exchange route
| validates the short-lived ticket passed as clientPayload, while still
| allowing Vercel's upload-completed callback to reach the same endpoint.
|
*/

router.get(
  "/upload-ticket",
  protectAdmin,
  createUploadTicket
);

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
