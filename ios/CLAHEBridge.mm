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

    // Convert to Lab color space
    cv::Mat lab;
    cv::cvtColor(mat, lab, cv::COLOR_BGR2Lab);

    // Split channels
    std::vector<cv::Mat> channels;
    cv::split(lab, channels);

    // Apply CLAHE to L channel
    cv::Ptr<cv::CLAHE> clahe = cv::createCLAHE();
    clahe->setClipLimit(2.0);
    clahe->apply(channels[0], channels[0]);

    // Merge back
    cv::merge(channels, lab);
    cv::cvtColor(lab, mat, cv::COLOR_Lab2BGR);

    // Convert back to UIImage
    UIImage *outputImage = MatToUIImage(mat);

    // Create a new file path
    NSString *outputPath = [imagePath stringByReplacingOccurrencesOfString:@".jpg" withString:@"_clahe.jpg"];
    NSData *imageData = UIImageJPEGRepresentation(outputImage, 1.0);
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
    cv::resize(mat, resized, cv::Size(newWidth, newHeight));

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
    NSString *outputPath = [imagePath stringByReplacingOccurrencesOfString:@".jpg" withString:@"_letterbox.jpg"];
    NSData *imageData = UIImageJPEGRepresentation(outputImage, 1.0);
    [imageData writeToFile:outputPath atomically:YES];

    resolve([@"file://" stringByAppendingString:outputPath]);
  } @catch (NSException *exception) {
    reject(@"LETTERBOX_EXCEPTION", exception.reason, nil);
  }
}

@end
