const S3Client = require("@aws-sdk/client-s3"),
  sharp = require("sharp"),
  mime = require("mime-types");

exports.handler = async (event, context) => {
  // Read data from event object
  const region = event.Records[0].awsRegion;
  const bucket = event.Records[0].s3.bucket.name;
  const imageKey = event.Records[0].s3.object.sourceKey;
  console.log(imageKey);

  // Determine file type
  const fileType = mime.lookup(imageKey);
  console.log(fileType);

  // Instantiate a new s3 client
  const s3 = new S3Client({
    region: region
  });

  try {
    // Return if image has already been resized
    if (imageKey.includes("_resized")) {
      console.log("The image has already been resized.");
      return;
    }

    // Get the original image
    const originalImage = await s3.send(GetObjectCommand({
      Bucket: bucket,
      Key: imageKey,
      ResponseContentType: fileType
    }));
    console.log(originalImage);
    res.setHeader("Content-Type", fileType);
    originalImage.Body.pipe(res);

    // Resize the image
    const resizedImage = await sharp(originalImage)
      .resize(300)
      .toBuffer();

    // Upload resized image 
    return await s3.send(new PutObjectCommand({
      Body: resizedImage,
      Bucket: bucket,
      Key: imageKey.replace(".", "_resized")
    }));

  } catch (error) {
    console.log("There was an error:" + error);
    res.status(500).send("There was an error: " + error);
  }
};