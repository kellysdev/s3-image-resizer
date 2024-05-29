const AWS = require("@aws-sdk");
const sharp = require("sharp");

exports.handler = async (event) => {
  // Read data from event object
  const region = event.Records[0].awsRegion;
  const bucket = event.Records[0].s3.bucket.name;
  const imageKey = event.Records[0].s3.object.sourceKey;

  // Instantiate a new s3 client
  const s3 = new AWS.S3({
    region: region
  });

  try {
    // Return if image has already been resized
    if (imageKey.includes("_resized")) {
      console.log("The image has already been resized.");
      return;
    }

    // Get the original image
    const originalImage = await s3.getObject({Bucket: bucket, Key: imageKey}).promise();

    // Resize the image
    const resizedImage = await sharp(originalImage.data)
      .resize(300)
      .toBuffer();

    // Upload resized image  
    return s3.send(new putObject({
      Body: resizedImage,
      Bucket: bucket,
      Key: imageKey.replace(".", "_resized")
    }));

  } catch (error) {
    console.log("There was an error:" + error);
    res.send("There was an error: " + error);
  }
};