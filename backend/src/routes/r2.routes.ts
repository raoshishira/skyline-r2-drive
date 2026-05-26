{
  const { Router } = require("express");
  const r2Controller = require("../controllers/r2.controller");
  const { isAuthenticated } = require("../middleware/auth");
  const multer = require("multer");
  const os = require("os");
  const router = Router();
  const upload = multer({ dest: os.tmpdir() });
  router.get("/buckets", isAuthenticated, r2Controller.listBuckets);
  router.get("/config", isAuthenticated, r2Controller.getConfig);
  router.post("/config", isAuthenticated, r2Controller.updateConfig);
  router.get("/objects", isAuthenticated, r2Controller.listObjects);
  router.delete("/object", isAuthenticated, r2Controller.deleteObject);
  router.patch("/move", isAuthenticated, r2Controller.moveObject);
  router.post("/upload", isAuthenticated, upload.single("file"), r2Controller.uploadFile);
  router.get("/download", isAuthenticated, r2Controller.downloadFile);
  router.get("/signed-url", isAuthenticated, r2Controller.generateSignedUrl);
  router.get("/thumbnail", isAuthenticated, r2Controller.getThumbnail);
  router.get("/download/folder", isAuthenticated, r2Controller.downloadFolder);
  module.exports = router;
}
