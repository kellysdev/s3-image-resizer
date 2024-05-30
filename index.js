const AWS = require("aws-sdk"),
  sharp = require("sharp");

exports.handler = async (event) => {
  // Read data from event object
  const region = event.Records[0].awsRegion;
  const bucket = event.Records[0].s3.bucket.name;
  const imageKey = decodeURIComponent(event.Records[0].s3.object.key);
  console.log(event.Records[0].eventName);
  console.log(imageKey);

  // Instantiate a new s3 client
  const s3 = new AWS.S3({
    region: region
  });

  // Return if image has already been resized
  if (imageKey.includes("_resized")) {
    console.log("The image has already been resized.");
    return;
  };

  // Get the original image
  s3.getObject({Bucket: bucket, Key: imageKey}).promise()
    // Resize the image
    .then(data => sharp(data.Body)
      .resize(300)
      .toFormat("png")
      .toBuffer()
    )
    // Reupload the image
    .then(buffer => s3.putObject({
        Body: buffer,
        Bucket: bucket,
        Key: imageKey.replace(".", "_resized"),
        ContentType: "image/png"
      }).promise()
    )
    .catch(err => console.log(err));
};