const express = require("express");

const protectAdmin = require("../middleware/protectAdmin");

const {
  getPublicSiteConfig,
  getSiteConfig,
  updatePages,
  updatePage,
  updateSiteStyles,
  updateNavigation,
  updateSeo,
  updateSettings,
  initializeSiteConfig,
} = require("../controllers/siteConfigController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC WEBSITE CONFIG
|--------------------------------------------------------------------------
| No admin authentication required.
|
| GET /api/site-config/public
|
*/

router.get(
  "/public",
  getPublicSiteConfig
);

/*
|--------------------------------------------------------------------------
| ADMIN AUTHENTICATION
|--------------------------------------------------------------------------
| Everything below this line requires admin login.
|
*/

router.use(protectAdmin);

/*
|--------------------------------------------------------------------------
| GET COMPLETE SITE CONFIG
|--------------------------------------------------------------------------
|
| GET /api/site-config
|
*/

router.get(
  "/",
  getSiteConfig
);

/*
|--------------------------------------------------------------------------
| INITIALIZE CONFIG
|--------------------------------------------------------------------------
|
| POST /api/site-config/initialize
|
*/

router.post(
  "/initialize",
  initializeSiteConfig
);

/*
|--------------------------------------------------------------------------
| PAGES
|--------------------------------------------------------------------------
|
| PUT /api/site-config/pages
| PUT /api/site-config/pages/:pageKey
|
*/

router.put(
  "/pages",
  updatePages
);

router.put(
  "/pages/:pageKey",
  updatePage
);

/*
|--------------------------------------------------------------------------
| SITE STYLES
|--------------------------------------------------------------------------
|
| PUT /api/site-config/styles
|
*/

router.put(
  "/styles",
  updateSiteStyles
);

/*
|--------------------------------------------------------------------------
| NAVIGATION
|--------------------------------------------------------------------------
|
| PUT /api/site-config/navigation
|
*/

router.put(
  "/navigation",
  updateNavigation
);

/*
|--------------------------------------------------------------------------
| SEO
|--------------------------------------------------------------------------
|
| PUT /api/site-config/seo
|
*/

router.put(
  "/seo",
  updateSeo
);

/*
|--------------------------------------------------------------------------
| GENERAL SETTINGS
|--------------------------------------------------------------------------
|
| PUT /api/site-config/settings
|
*/

router.put(
  "/settings",
  updateSettings
);

module.exports = router;