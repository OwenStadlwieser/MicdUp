const fs = require("fs").promises;
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const uploadFile = async (fileName, key) => {
  const contents = await fs.readFile(fileName, { encoding: "base64" });
  console.log(key);
  const buff = new Buffer.from(contents, "base64");
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // pass your bucket name
    Key: key,
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
const uploadFileFromBase64 = async (contents, key) => {
  const buff = new Buffer.from(contents, "base64");
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // pass your bucket name
    Key: key,
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
const getFile = async (myKey) => {
  try {
    const url = await getSignedUrl(myKey);
    return url;
  } catch (err) {
    throw err;
  }
};

async function getSignedUrl(key) {
  const signedUrlExpireSeconds = 60 * 30;
  return new Promise((resolve, reject) => {
    let params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: signedUrlExpireSeconds,
    };
    s3.getSignedUrl("getObject", params, (err, url) => {
      if (err) reject(err);
      resolve(url);
    });
  });
}

async function deleteFile(Key) {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key,
    };

    s3.deleteObject(params, function (err, data) {
      if (err) reject(err);
      // an error occurred
      else resolve(data); // successful response
    });
  });
}
module.exports = {
  uploadFile,
  getFile,
  uploadFileFromBase64,
  deleteFile,
  getSignedUrl,
};
