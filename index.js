const AWS = require("@aws-sdk");

exports.handler = async (event) => {
  // Read data from event object
  const sourceRegion = event.Records[0].awsRegion;
  const sourceBucket = event.Records[0].s3.bucket.name;
  const sourceKey = event.Records[0].s3.object.sourceKey;

  // Instantiate a new s3 client
  const s3 = new AWS.S3({
    region: sourceRegion
  });

  try {
    const originalImage = await s3.getObject({Bucket: sourceBucket, Key: sourceKey}, (err, data) => {
      if (err) console.log(err);
      else 
    })
  } catch (error) {

  }

  const copyObjectParams = {
    Bucket: process.env.DEST_BUCKET,
    Key: sourceKey,
    CopySource: `${sourceBucket}/${sourceKey}`
  };

  return s3Client.send(new CopyObjectCommand(copyObjectParams));
};