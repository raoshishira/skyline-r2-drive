{
  const { S3Client } = require("@aws-sdk/client-s3");
  const serviceDotenv = require("dotenv");
  const path = require("path");

  serviceDotenv.config({ path: path.join(__dirname, "../../../.env") });

  let cachedClient: any = null;
  let cachedConfigStr = "";

  const getS3Client = () => {
    const currentConfigStr = JSON.stringify({
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    });

    if (!cachedClient || cachedConfigStr !== currentConfigStr) {
      cachedClient = new S3Client({
        region: "auto",
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
      });
      cachedConfigStr = currentConfigStr;
    }
    return cachedClient;
  };

  const s3ClientProxy = new Proxy({}, {
    get: (target, prop) => {
      const client = getS3Client();
      const value = (client as any)[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    }
  });

  module.exports = { s3Client: s3ClientProxy, getS3Client };
}
