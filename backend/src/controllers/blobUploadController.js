const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

/*
|--------------------------------------------------------------------------
| Verify administrator for token generation
|--------------------------------------------------------------------------
*/

const verifyAdmin = async (req) => {
  const token =
    req.cookies?.admin_token;

  if (!token) {
    throw new Error(
      "Administrator authentication required."
    );
  }

  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is missing from the environment."
    );
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET,
    {
      algorithms: ["HS256"],
      issuer:
        "portfolio-cms-api",
      audience:
        "portfolio-cms-admin",
    }
  );

  const admin =
    await Admin.findById(
      decoded.sub
    );

  if (!admin) {
    throw new Error(
      "Administrator account not found."
    );
  }

  return admin;
};

/*
|--------------------------------------------------------------------------
| POST /api/media/upload
|--------------------------------------------------------------------------
*/

const handleBlobUpload = async (
  req,
  res
) => {
  try {
    const {
      handleUpload,
    } = await import(
      "@vercel/blob/client"
    );

    const result =
      await handleUpload({
        body: req.body,

        request: req,

        /*
        |--------------------------------------------------------------------------
        | Generate upload token
        |--------------------------------------------------------------------------
        */

        onBeforeGenerateToken:
          async (
            pathname
          ) => {
            /*
             * This runs when the browser
             * requests permission to upload.
             */
            const admin =
              await verifyAdmin(
                req
              );

            return {
              allowedContentTypes: [
                /*
                 * Images
                 */
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif",
                "image/svg+xml",
                "image/avif",

                /*
                 * Videos
                 */
                "video/mp4",
                "video/webm",
                "video/quicktime",

                /*
                 * Documents
                 */
                "application/pdf",
                "text/plain",
                "text/csv",

                "application/msword",

                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

                "application/vnd.ms-excel",

                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

                "application/vnd.ms-powerpoint",

                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              ],

              /*
               * Maximum upload:
               * 100 MB
               */
              maximumSizeInBytes:
                100 *
                1024 *
                1024,

              /*
               * Avoid filename conflicts.
               */
              addRandomSuffix:
                true,

              tokenPayload:
                JSON.stringify({
                  adminId:
                    String(
                      admin._id
                    ),

                  pathname:
                    String(
                      pathname ||
                        ""
                    ),

                  createdAt:
                    new Date()
                      .toISOString(),
                }),
            };
          },

        /*
        |--------------------------------------------------------------------------
        | Upload completed callback
        |--------------------------------------------------------------------------
        */

        onUploadCompleted:
          async ({
            blob,
            tokenPayload,
          }) => {
            console.log(
              "Blob upload completed:",
              blob.url
            );

            /*
             * The Media Library frontend
             * creates the MongoDB media
             * record after upload succeeds.
             */
            if (
              tokenPayload
            ) {
              try {
                JSON.parse(
                  tokenPayload
                );
              } catch {
                console.warn(
                  "Invalid Blob token payload."
                );
              }
            }
          },
      });

    return res
      .status(200)
      .json(result);
  } catch (error) {
    console.error(
      "Blob upload error:",
      error
    );

    return res
      .status(400)
      .json({
        success: false,

        message:
          error instanceof
          Error
            ? error.message
            : "Unable to authorize media upload.",
      });
  }
};

module.exports = {
  handleBlobUpload,
};