#import <opencv2/opencv.hpp>
#import <opencv2/imgcodecs/ios.h>
#import "CLAHEBridge.h"

@implementation CLAHEBridge

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return NO;
}



RCT_EXPORT_METHOD(applyClahe:(NSString *)imagePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    UIImage *inputImage = [UIImage imageWithContentsOfFile:imagePath];
    if (!inputImage) {
      reject(@"CLAHE_IMAGE_ERROR", @"Failed to load image from path", nil);
      return;
    }
    
    // Convert UIImage to cv::Mat
    cv::Mat mat;
    UIImageToMat(inputImage, mat);
    // Ensure correct color channels: drop alpha
    cv::cvtColor(mat, mat, cv::COLOR_BGRA2BGR);
    
    // Convert to Lab color space
    cv::Mat lab;
    cv::cvtColor(mat, lab, cv::COLOR_BGR2Lab);
    
    // Split channels
    std::vector<cv::Mat> channels;
    cv::split(lab, channels);
    
    // Create CLAHE with adjusted parameters to reduce artifacts
    double clipLimit = 1.5; // lower to reduce contrast amplification artifacts
    cv::Size tileGridSize(16, 16); // larger tiles for smoother transitions
    cv::Ptr<cv::CLAHE> clahe = cv::createCLAHE(clipLimit, tileGridSize);
    clahe->apply(channels[0], channels[0]);
    // Optional: smooth the L-channel to reduce block artifacts
    cv::GaussianBlur(channels[0], channels[0], cv::Size(3, 3), 0);
    
    // Merge back
    cv::merge(channels, lab);
    cv::cvtColor(lab, mat, cv::COLOR_Lab2BGR);
    
    // Convert back to UIImage
    UIImage *outputImage = MatToUIImage(mat);
    
    // Create a new file path
    NSString *outputPath = [imagePath stringByReplacingOccurrencesOfString:@".png" withString:@"_clahe.png"];
    NSData *imageData = UIImagePNGRepresentation(outputImage);
    [imageData writeToFile:outputPath atomically:YES];
    
    resolve([@"file://" stringByAppendingString:outputPath]);
  } @catch (NSException *exception) {
    reject(@"CLAHE_EXCEPTION", exception.reason, nil);
  }
}


RCT_EXPORT_METHOD(makeLetterBox:(NSString *)imagePath
                  targetWidth:(nonnull NSNumber *)targetWidth
                  targetHeight:(nonnull NSNumber *)targetHeight
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    UIImage *inputImage = [UIImage imageWithContentsOfFile:imagePath];
    if (!inputImage) {
      reject(@"LETTERBOX_IMAGE_ERROR", @"Failed to load image from path", nil);
      return;
    }
    
    // Convert UIImage to cv::Mat
    cv::Mat mat;
    UIImageToMat(inputImage, mat);
    // Ensure correct color channels: drop alpha
    cv::cvtColor(mat, mat, cv::COLOR_BGRA2BGR);
    
    int srcWidth = mat.cols;
    int srcHeight = mat.rows;
    int dstWidth = [targetWidth intValue];
    int dstHeight = [targetHeight intValue];
    
    // Compute scale ratio
    double scale = std::min((double)dstWidth / srcWidth, (double)dstHeight / srcHeight);
    int newWidth = std::round(srcWidth * scale);
    int newHeight = std::round(srcHeight * scale);
    
    // Resize image if necessary
    cv::Mat resized;
    // High-quality Lanczos resize to match Python’s behavior
    cv::resize(mat, resized, cv::Size(newWidth, newHeight), 0, 0, cv::INTER_LANCZOS4);
    
    // Create black canvas
    cv::Mat canvas(dstHeight, dstWidth, mat.type(), cv::Scalar(0, 0, 0));
    
    // Compute top-left corner for placing resized image
    int x = (dstWidth - newWidth) / 2;
    int y = (dstHeight - newHeight) / 2;
    
    // Copy resized image onto black canvas
    resized.copyTo(canvas(cv::Rect(x, y, resized.cols, resized.rows)));
    
    // Convert back to UIImage
    UIImage *outputImage = MatToUIImage(canvas);
    
    // Save image
    NSString *outputPath = [imagePath stringByReplacingOccurrencesOfString:@".png" withString:@"_letterbox.png"];
    NSData *imageData = UIImagePNGRepresentation(outputImage);
    [imageData writeToFile:outputPath atomically:YES];
    
    resolve([@"file://" stringByAppendingString:outputPath]);
  } @catch (NSException *exception) {
    reject(@"LETTERBOX_EXCEPTION", exception.reason, nil);
  }
}


RCT_EXPORT_METHOD(isImageBlurred:(NSString *)imagePath
                  blurThresholdValue:(nullable NSNumber *)blurThresholdValue
                  blockThresholdValue:(nullable NSNumber *)blockThresholdValue
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    UIImage *inputImage = [UIImage imageWithContentsOfFile:imagePath];
    if (!inputImage) {
      reject(@"BLUR_CHECK_IMAGE_ERROR", @"Failed to load image from path", nil);
      return;
    }

    // Convert UIImage to cv::Mat
    cv::Mat mat;
    UIImageToMat(inputImage, mat);
    cv::cvtColor(mat, mat, cv::COLOR_BGRA2BGR);

    // Apply default thresholds if arguments are nil
    double blurThresh = blurThresholdValue ? [blurThresholdValue doubleValue] : 50.0;
    double blockThresh = blockThresholdValue ? [blockThresholdValue doubleValue] : 10.0;

    // Convert to grayscale
    cv::Mat gray;
    cv::cvtColor(mat, gray, cv::COLOR_BGR2GRAY);

    // Compute Laplacian variance for blur detection
    cv::Mat lap;
    cv::Laplacian(gray, lap, CV_64F);
    cv::Scalar mean, stddev;
    cv::meanStdDev(lap, mean, stddev);
    double variance = stddev.val[0] * stddev.val[0];

    // Compute blockiness by measuring differences at 8×8 block boundaries
    int rows = gray.rows;
    int cols = gray.cols;
    const int blockSize = 8;
    double blockiness = 0.0;
    int count = 0;
    // Horizontal boundaries
    for (int y = blockSize; y < rows; y += blockSize) {
      for (int x = 0; x < cols; x++) {
        blockiness += fabs((double)gray.at<uchar>(y, x) - gray.at<uchar>(y - 1, x));
        count++;
      }
    }
    // Vertical boundaries
    for (int x = blockSize; x < cols; x += blockSize) {
      for (int y = 0; y < rows; y++) {
        blockiness += fabs((double)gray.at<uchar>(y, x) - gray.at<uchar>(y, x - 1));
        count++;
      }
    }
    blockiness = (count > 0) ? (blockiness / count) : 0.0;

    // Determine if image quality is poor
    BOOL isPoor = (variance < blurThresh) || (blockiness > blockThresh);

    // Prepare result dictionary
    NSDictionary *result = @{
      @"isPoor": @(isPoor),
      @"blurVariance": @(variance),
      @"blockiness": @(blockiness)
    };
    resolve(result);
  } @catch (NSException *exception) {
    reject(@"BLUR_CHECK_EXCEPTION", exception.reason, nil);
  }
}

RCT_EXPORT_METHOD(readPNGFromFile:(NSString *)imagePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    UIImage *image = [UIImage imageWithContentsOfFile:imagePath];
    if (!image) {
      reject(@"READ_PNG_ERROR", @"Failed to load image from path", nil);
      return;
    }

    CGImageRef cgImage = image.CGImage;
    size_t width = CGImageGetWidth(cgImage);
    size_t height = CGImageGetHeight(cgImage);
    size_t bytesPerPixel = 4;
    size_t bytesPerRow = bytesPerPixel * width;
    size_t bitsPerComponent = 8;

    UInt8 *rawData = (UInt8 *)malloc(height * bytesPerRow);
    if (!rawData) {
      reject(@"READ_PNG_ERROR", @"Failed to allocate memory", nil);
      return;
    }

    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(rawData, width, height,
                                                 bitsPerComponent, bytesPerRow, colorSpace,
                                                 kCGImageAlphaNoneSkipLast | kCGBitmapByteOrder32Big);

    if (!context) {
      free(rawData);
      reject(@"READ_PNG_ERROR", @"Failed to create context", nil);
      return;
    }

    CGContextDrawImage(context, CGRectMake(0, 0, width, height), cgImage);
    CGContextRelease(context);
    CGColorSpaceRelease(colorSpace);

    NSMutableData *rgbaData = [NSMutableData dataWithCapacity:width * height * 4];
    for (size_t i = 0; i < width * height; i++) {
      [rgbaData appendBytes:&rawData[i * 4] length:1];     // R
      [rgbaData appendBytes:&rawData[i * 4 + 1] length:1]; // G
      [rgbaData appendBytes:&rawData[i * 4 + 2] length:1]; // B
      [rgbaData appendBytes:&rawData[i * 4 + 3] length:1]; // A
    }

    free(rawData);

    NSDictionary *result = @{
      @"width": @(width),
      @"height": @(height),
      @"rgbaBuffer": [rgbaData base64EncodedStringWithOptions:0]
    };
    resolve(result);
  } @catch (NSException *exception) {
    reject(@"READ_PNG_EXCEPTION", exception.reason, nil);
  }
}

@end
