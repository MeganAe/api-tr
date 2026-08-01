module.exports = (req, res) => {
  res.status(200).json({ status: "ok", service: "shared-ai-api" });
};
