const { s3, S3_BUCKET } = require('../config/aws-config');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Upload file buffer to S3
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Original filename
 * @param {string} userId - User ID for folder organization
 * @param {string} fileType - File type (resume/job)
 * @returns {Object} - S3 upload result with key and location
 */
const uploadToS3 = async (fileBuffer, fileName, userId, fileType) => {
  try {
    // Generate unique key for S3
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `${fileType}/${userId}/${timestamp}-${sanitizedFileName}`;

    const uploadParams = {
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: getContentType(fileName),
      ServerSideEncryption: 'AES256',
      Metadata: {
        originalName: fileName,
        userId: userId,
        fileType: fileType,
        uploadDate: new Date().toISOString()
      }
    };

    console.log(`[S3 Utils] Uploading file to S3: ${s3Key}`);
    const result = await s3.upload(uploadParams).promise();
    
    console.log(`[S3 Utils] ✅ File uploaded successfully:
    - S3 Key: ${s3Key}
    - Location: ${result.Location}
    - Size: ${fileBuffer.length} bytes
    - File: ${fileName}`);
    return {
      key: s3Key,
      location: result.Location,
      bucket: S3_BUCKET
    };
  } catch (error) {
    console.error('[S3 Utils] Error uploading to S3:', error);
    throw error;
  }
};

/**
 * Download file from S3 and extract text
 * @param {string} s3Key - S3 object key
 * @param {string} fileExtension - File extension (.pdf, .docx, .txt)
 * @returns {string} - Extracted text
 */
const downloadAndExtractText = async (s3Key, fileExtension) => {
  try {
    console.log(`[S3 Utils] Downloading file from S3: ${s3Key}`);
    
    const downloadParams = {
      Bucket: S3_BUCKET,
      Key: s3Key
    };

    const s3Object = await s3.getObject(downloadParams).promise();
    const fileBuffer = s3Object.Body;
    
    console.log(`[S3 Utils] File downloaded, size: ${fileBuffer.length} bytes`);

    // Extract text based on file type
    let text = '';
    
    if (fileExtension === '.pdf') {
      console.log('[S3 Utils] Processing PDF file');
      const pdfData = await pdfParse(fileBuffer);
      text = pdfData.text;
    } else if (fileExtension === '.docx') {
      console.log('[S3 Utils] Processing DOCX file');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } else if (fileExtension === '.txt') {
      console.log('[S3 Utils] Processing TXT file');
      text = fileBuffer.toString('utf8');
    } else {
      throw new Error(`Unsupported file format: ${fileExtension}`);
    }

    console.log(`[S3 Utils] Text extracted successfully, length: ${text.length} characters`);
    return text;
  } catch (error) {
    console.error('[S3 Utils] Error downloading/extracting from S3:', error);
    throw error;
  }
};

/**
 * Generate presigned URL for file download
 * @param {string} s3Key - S3 object key
 * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns {string} - Presigned URL
 */
const generatePresignedUrl = async (s3Key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: S3_BUCKET,
      Key: s3Key,
      Expires: expiresIn,
      ResponseContentDisposition: 'attachment'
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    console.log(`[S3 Utils] Generated presigned URL for: ${s3Key}`);
    return url;
  } catch (error) {
    console.error('[S3 Utils] Error generating presigned URL:', error);
    throw error;
  }
};

/**
 * Delete file from S3
 * @param {string} s3Key - S3 object key
 * @returns {boolean} - Success status
 */
const deleteFromS3 = async (s3Key) => {
  try {
    const deleteParams = {
      Bucket: S3_BUCKET,
      Key: s3Key
    };

    await s3.deleteObject(deleteParams).promise();
    console.log(`[S3 Utils] File deleted from S3: ${s3Key}`);
    return true;
  } catch (error) {
    console.error('[S3 Utils] Error deleting from S3:', error);
    throw error;
  }
};

/**
 * Get content type based on file extension
 * @param {string} fileName - Original filename
 * @returns {string} - MIME type
 */
const getContentType = (fileName) => {
  const extension = fileName.toLowerCase().split('.').pop();
  const contentTypes = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain'
  };
  return contentTypes[extension] || 'application/octet-stream';
};

/**
 * Check if S3 bucket is accessible and log detailed connection info
 * @returns {boolean} - Accessibility status
 */
const checkS3Connection = async () => {
  console.log('[S3 Utils] Checking S3 connection...');
  
  // Log configuration details (without sensitive info)
  console.log(`[S3 Utils] S3 Configuration:
    - Bucket: ${S3_BUCKET}
    - Region: ${process.env.AWS_REGION || 'us-east-1'}
    - Access Key ID: ${process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 4) + '****' : 'NOT SET'}
    - Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? '****' : 'NOT SET'}`);

  try {
    // Check if bucket exists and is accessible
    const bucketInfo = await s3.headBucket({ Bucket: S3_BUCKET }).promise();
    console.log(`[S3 Utils] ✅ S3 bucket '${S3_BUCKET}' is accessible and ready for file uploads`);
    
    // Test write permissions by creating a small test object
    const testKey = 'test/connection-test.txt';
    const testParams = {
      Bucket: S3_BUCKET,
      Key: testKey,
      Body: 'Connection test - ' + new Date().toISOString(),
      ContentType: 'text/plain'
    };
    
    await s3.upload(testParams).promise();
    console.log(`[S3 Utils] ✅ S3 write permissions verified`);
    
    // Clean up test file
    await s3.deleteObject({ Bucket: S3_BUCKET, Key: testKey }).promise();
    console.log(`[S3 Utils] ✅ S3 delete permissions verified`);
    
    return true;
  } catch (error) {
    console.error(`[S3 Utils] ❌ S3 Connection Failed:
    - Error Code: ${error.code}
    - Error Message: ${error.message}
    - Bucket: ${S3_BUCKET}
    - Please check:
      1. AWS credentials are correct
      2. Bucket name exists and is accessible
      3. IAM permissions include s3:GetObject, s3:PutObject, s3:DeleteObject
      4. Region setting matches your bucket region`);
    return false;
  }
};

module.exports = {
  uploadToS3,
  downloadAndExtractText,
  generatePresignedUrl,
  deleteFromS3,
  checkS3Connection
};