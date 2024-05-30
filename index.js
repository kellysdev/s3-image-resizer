const AWS = require("aws-sdk"),
  sharp = require("sharp");

exports.handler = async (event) => {
  // Read data from event object
  const region = event.Records[0].awsRegion;
  const bucket = event.Records[0].s3.bucket.name;
  const imageKey = decodeURIComponent(event.Records[0].s3.object.key);

  // Instantiate a new s3 client
  const s3 = new AWS.S3({
    region: region
  });

  // Return if image has already been resized
  if (imageKey.includes("_resized")) {
    console.log("The image has already been resized.");
    return;
  };

  try {
    // Get the original image
    const originalImage = await s3.getObject({Bucket: bucket, Key: imageKey}).promise();

    // Resize the image
    const resizedImageBuffer = await sharp(originalImage.Body)
      .resize(300)
      .toFormat("png")
      .toBuffer();

    // Upload image
    await s3.putObject({
      Body: resizedImageBuffer,
      Bucket: bucket,
      Key: imageKey.replace(".", "_resized."),
      ContentType: "image/png"
    }).promise();
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong.");
  };

};