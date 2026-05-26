{
  const { 
    ListBucketsCommand, 
    ListObjectsV2Command, 
    DeleteObjectCommand,
    CopyObjectCommand,
    GetObjectCommand
  } = require("@aws-sdk/client-s3");
  const { Upload } = require("@aws-sdk/lib-storage");
  const { s3Client } = require("../services/r2.service");
  const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
  const archiver = require("archiver");
  const sharp = require("sharp");
  const { Readable } = require("stream");
  const path = require("path");

  const listBuckets = async (req: any, res: any) => {
    try {
      const command = new ListBucketsCommand({});
      const { Buckets } = await s3Client.send(command);
      res.json(Buckets || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  const listObjects = async (req: any, res: any) => {
    const { bucket, prefix } = req.query;
    if (!bucket) return res.status(400).json({ error: "Bucket name is required" });

    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix || "",
        Delimiter: "/",
      });
      const response = await s3Client.send(command);
      const folders = (response.CommonPrefixes || []).map((cp: any) => ({ key: cp.Prefix, type: "folder" }));
      const files = (response.Contents || [])
        .filter((item: any) => item.Key !== prefix)
        .map((item: any) => ({ key: item.Key, size: item.Size, lastModified: item.LastModified, type: "file" }));
      res.json([...folders, ...files]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  const deleteObject = async (req: any, res: any) => {
    const { bucket, key } = req.query;
    if (!bucket || !key) return res.status(400).json({ error: "Bucket and Key are required" });
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  const moveObject = async (req: any, res: any) => {
    const { bucket, sourceKey, destinationKey } = req.body;
    if (!bucket || !sourceKey || !destinationKey) return res.status(400).json({ error: "Bucket, SourceKey, and DestinationKey are required" });
    try {
      await s3Client.send(new CopyObjectCommand({ Bucket: bucket, CopySource: `${bucket}/${sourceKey}`, Key: destinationKey }));
      await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: sourceKey }));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  const uploadFile = async (req: any, res: any) => {
    const { bucket, prefix, key: customKey } = req.body;
    const file = req.file;

    if (!bucket || !file) return res.status(400).json({ error: "Bucket and File are required" });

    const key = customKey || (prefix ? `${prefix}${file.originalname}` : file.originalname);

    try {
      const parallelUploads3 = new Upload({
        client: s3Client,
        params: {
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });

      await parallelUploads3.done();
      res.json({ success: true, key });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  const downloadFile = async (req: any, res: any) => {
    const { bucket, key } = req.query;
    if (!bucket || !key) return res.status(400).json({ error: "Bucket and Key are required" });

    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await s3Client.send(command);
      
      res.setHeader("Content-Disposition", `attachment; filename="${path.basename(key)}"`);
      res.setHeader("Content-Type", response.ContentType || "application/octet-stream");

      if (response.Body instanceof Readable) {
        response.Body.pipe(res);
      } else {
        res.status(500).json({ error: "Failed to get file stream" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  const downloadFolder = async (req: any, res: any) => {
    const { bucket, prefix } = req.query;
    if (!bucket || !prefix) return res.status(400).json({ error: "Bucket and Prefix are required" });

    try {
      const listCommand = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix });
      const response = await s3Client.send(listCommand);
      const objects = response.Contents || [];

      const archive = archiver("zip", { zlib: { level: 9 } });
      res.setHeader("Content-Disposition", `attachment; filename="${path.basename(prefix)}.zip"`);
      res.setHeader("Content-Type", "application/zip");
      archive.pipe(res);

      for (const obj of objects) {
        if (!obj.Key) continue;
        const getCommand = new GetObjectCommand({ Bucket: bucket, Key: obj.Key });
        const getResponse = await s3Client.send(getCommand);
        if (getResponse.Body instanceof Readable) {
          const internalPath = obj.Key.substring(prefix.length);
          if (internalPath) {
            archive.append(getResponse.Body, { name: internalPath });
          }
        }
      }

      await archive.finalize();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  const fs = require("fs");
  const dotenv = require("dotenv");

  const getConfig = async (req: any, res: any) => {
    res.json({
      endpoint: process.env.R2_ENDPOINT || "",
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ? "****" : "",
      bucket: process.env.R2_BUCKET || "",
    });
  };

  const updateConfig = async (req: any, res: any) => {
    const { endpoint, accessKeyId, secretAccessKey, bucket } = req.body;
    const envPath = path.join(__dirname, "../../../.env");
    
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    const envVars = dotenv.parse(envContent);
    
    if (endpoint) envVars.R2_ENDPOINT = endpoint;
    if (accessKeyId) envVars.R2_ACCESS_KEY_ID = accessKeyId;
    if (secretAccessKey && secretAccessKey !== "****") envVars.R2_SECRET_ACCESS_KEY = secretAccessKey;
    if (bucket) envVars.R2_BUCKET = bucket;

    const newContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    fs.writeFileSync(envPath, newContent);
    
    // Reload env vars for current process
    dotenv.config({ path: envPath, override: true });
    
    res.json({ success: true });
  };

  const generateSignedUrl = async (req: any, res: any) => {
    const { bucket, key, expires } = req.query;
    if (!bucket || !key) return res.status(400).json({ error: "Bucket and Key are required" });

    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const url = await getSignedUrl(s3Client, command, { expiresIn: parseInt(expires) || 3600 });
      res.json({ url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  const getThumbnail = async (req: any, res: any) => {
    const { bucket, key } = req.query;
    if (!bucket || !key) return res.status(400).json({ error: "Bucket and Key are required" });

    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await s3Client.send(command);

      if (response.Body instanceof Readable) {
        res.setHeader("Content-Type", "image/jpeg");
        response.Body
          .pipe(sharp().resize(100, 100, { fit: "cover" }).jpeg())
          .pipe(res);
      } else {
        res.status(500).json({ error: "Failed to get image stream" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  module.exports = { getThumbnail, generateSignedUrl, getConfig, updateConfig, listBuckets, listObjects, deleteObject, moveObject, uploadFile, downloadFile, downloadFolder };
}
