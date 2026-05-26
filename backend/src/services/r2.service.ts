{
  const { S3Client } = require("@aws-sdk/client-s3");
  const serviceDotenv = require("dotenv");
  const path = require("path");

  serviceDotenv.config({ path: path.join(__dirname, "../../../.env") });

  const getS3Client = () => {
    return new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });
  };

  const s3ClientProxy = new Proxy({}, {
    get: (target, prop) => {
      const client = getS3Client();
      return (client as any)[prop].bind(client);
    }
  });

  module.exports = { s3Client: s3ClientProxy };
}
