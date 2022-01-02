const fs = require("fs").promises;
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const uploadFile = async (fileName, key) => {
  const contents = await fs.readFile(fileName, { encoding: "base64" });
  const buff = new Buffer.from(contents, "base64");
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // pass your bucket name
    Key: key, // file will be saved as testBucket/contacts.csv
    ContentEncoding: "base64",
    Body: buff,
  };
  await s3
    .upload(params, function (s3Err, data) {
      if (s3Err) throw s3Err;
      console.log(`File uploaded successfully at ${data.Location}`);
    })
    .promise();
  return true;
};
module.exports = { uploadFile };
