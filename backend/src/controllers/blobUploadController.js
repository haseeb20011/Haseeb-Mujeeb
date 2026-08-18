const jwt = require("jsonwebtoken");

/*
|--------------------------------------------------------------------------
| Upload ticket
|--------------------------------------------------------------------------
|
| The admin session cookie lives on the API domain. Vercel Blob's client
| token exchange can be initiated from a different frontend domain, so the
| browser first requests a short-lived upload ticket through an authenticated
| API call. The ticket is then validated when Vercel asks this route to
| generate a Blob client token.
|
*/

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is missing from the environment."
    );
  }

  return process.env.JWT_SECRET;
};

const createUploadTicket = async (req, res, next) => {
  try {
    if (!req.admin?._id) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication required.",
      });
    }

    const ticket = jwt.sign(
      {
        purpose: "media-upload",
      },
      getJwtSecret(),
      {
        algorithm: "HS256",
        subject: String(req.admin._id),
        issuer: "portfolio-cms-api",
        audience: "portfolio-media-upload",
        expiresIn: "5m",
      }
    );

    return res.status(200).json({
      success: true,
      ticket,
      expiresInSeconds: 300,
    });
  } catch (error) {
    next(error);
  }
};

const verifyUploadTicket = (ticket) => {
  if (!ticket || typeof ticket !== "string") {
    throw new Error(
      "A valid media upload ticket is required."
    );
  }

  const decoded = jwt.verify(
    ticket,
    getJwtSecret(),
    {
      algorithms: ["HS256"],
      issuer: "portfolio-cms-api",
      audience: "portfolio-media-upload",
    }
  );

  if (
    !decoded ||
    decoded.purpose !== "media-upload" ||
    !decoded.sub
  ) {
    throw new Error(
      "The media upload ticket is invalid."
    );
  }

  return decoded;
};

/*
|--------------------------------------------------------------------------
| POST /api/media/upload
|--------------------------------------------------------------------------
*/

const handleBlobUpload = async (req, res) => {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN is missing from the backend environment."
      );
    }

    const {
      handleUpload,
    } = await import("@vercel/blob/client");

    const result = await handleUpload({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      body: req.body,
      request: req,

      onBeforeGenerateToken: async (
        pathname,
        clientPayload
      ) => {
        const decoded =
          verifyUploadTicket(clientPayload);

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/svg+xml",
            "image/avif",
            "video/mp4",
            "video/webm",
            "video/quicktime",
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
          maximumSizeInBytes:
            100 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            adminId: String(decoded.sub),
            pathname: String(pathname || ""),
            createdAt: new Date().toISOString(),
          }),
        };
      },

      onUploadCompleted: async ({
        blob,
        tokenPayload,
      }) => {
        console.log(
          "Blob upload completed:",
          blob.url
        );

        if (tokenPayload) {
          try {
            JSON.parse(tokenPayload);
          } catch {
            console.warn(
              "Invalid Blob token payload."
            );
          }
        }
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "Blob upload error:",
      error
    );

    const expired =
      error?.name === "TokenExpiredError";

    return res
      .status(expired ? 401 : 400)
      .json({
        success: false,
        message: expired
          ? "Your media upload authorization expired. Please try the upload again."
          : error instanceof Error
            ? error.message
            : "Unable to authorize media upload.",
      });
  }
};

module.exports = {
  createUploadTicket,
  handleBlobUpload,
};
