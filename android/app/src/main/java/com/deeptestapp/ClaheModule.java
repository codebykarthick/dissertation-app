package com.deeptestapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.*;
import org.opencv.android.Utils;
import org.opencv.core.*;
import org.opencv.core.Size;
import org.opencv.imgproc.CLAHE;
import org.opencv.imgproc.Imgproc;

import java.io.File;
import java.io.FileOutputStream;
import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import android.graphics.Color;
import android.util.Base64;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

public class ClaheModule extends ReactContextBaseJavaModule {

    public ClaheModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "CLAHEBridge";
    }

    @ReactMethod
    public void applyClahe(String imagePath, Promise promise) {
        try {
            Bitmap bitmap = BitmapFactory.decodeFile(imagePath);
            if (bitmap == null) {
                promise.reject("CLAHE_ERROR", "Could not decode image");
                return;
            }

            Mat mat = new Mat();
            Utils.bitmapToMat(bitmap, mat);
            // Drop alpha channel, convert BGRA→BGR
            Imgproc.cvtColor(mat, mat, Imgproc.COLOR_BGRA2BGR);

            Imgproc.cvtColor(mat, mat, Imgproc.COLOR_BGR2Lab);
            java.util.List<Mat> lab = new java.util.ArrayList<>(3);
            Core.split(mat, lab);

            CLAHE clahe = Imgproc.createCLAHE(1.5, new Size(16, 16));
            clahe.apply(lab.get(0), lab.get(0));

            // Apply Gaussian blur to reduce artifacts
            Imgproc.GaussianBlur(lab.get(0), lab.get(0), new Size(3, 3), 0);

            Core.merge(lab, mat);
            Imgproc.cvtColor(mat, mat, Imgproc.COLOR_Lab2BGR);

            Bitmap output = Bitmap.createBitmap(mat.cols(), mat.rows(), Bitmap.Config.ARGB_8888);
            Utils.matToBitmap(mat, output);

            String outputPath = imagePath.replace(".png", "_clahe.png");
            File outFile = new File(outputPath);
            FileOutputStream out = new FileOutputStream(outFile);
            output.compress(Bitmap.CompressFormat.PNG, 100, out);
            out.close();

            promise.resolve("file://" + outputPath);
        } catch (Exception e) {
            Log.e("CLAHE", "Error processing image", e);
            promise.reject("CLAHE_EXCEPTION", e.getMessage());
        }
    }
    @ReactMethod
    public void makeLetterBox(String imagePath, int targetWidth, int targetHeight, Promise promise) {
        try {
            Bitmap bitmap = BitmapFactory.decodeFile(imagePath);
            if (bitmap == null) {
                promise.reject("LETTERBOX_ERROR", "Could not decode image");
                return;
            }

            int srcWidth = bitmap.getWidth();
            int srcHeight = bitmap.getHeight();

            float scale = Math.min((float) targetWidth / srcWidth, (float) targetHeight / srcHeight);
            int newWidth = Math.round(srcWidth * scale);
            int newHeight = Math.round(srcHeight * scale);

            // High-quality Lanczos resize using OpenCV
            Mat mat = new Mat();
            Utils.bitmapToMat(bitmap, mat);
            // Drop alpha channel
            Imgproc.cvtColor(mat, mat, Imgproc.COLOR_BGRA2BGR);
            Mat resizedMat = new Mat();
            Imgproc.resize(mat, resizedMat, new Size(newWidth, newHeight), 0, 0, Imgproc.INTER_LANCZOS4);
            Bitmap resized = Bitmap.createBitmap(newWidth, newHeight, Bitmap.Config.ARGB_8888);
            Utils.matToBitmap(resizedMat, resized);

            Bitmap canvas = Bitmap.createBitmap(targetWidth, targetHeight, Bitmap.Config.ARGB_8888);

            // Fill canvas with black
            canvas.eraseColor(android.graphics.Color.BLACK);

            // Draw resized bitmap centered on canvas
            android.graphics.Canvas drawingCanvas = new android.graphics.Canvas(canvas);
            int left = (targetWidth - newWidth) / 2;
            int top = (targetHeight - newHeight) / 2;
            drawingCanvas.drawBitmap(resized, left, top, null);

            // Save result
            String outputPath = imagePath.replace(".png", "_letterbox.png");
            File outFile = new File(outputPath);
            FileOutputStream out = new FileOutputStream(outFile);
            canvas.compress(Bitmap.CompressFormat.PNG, 100, out);
            out.close();

            promise.resolve("file://" + outputPath);
        } catch (Exception e) {
            Log.e("LETTERBOX", "Error creating letterbox image", e);
            promise.reject("LETTERBOX_EXCEPTION", e.getMessage());
        }
    }

    @ReactMethod
    public void isImageBlurred(String imagePath, @Nullable Double blurThresholdValue, @Nullable Double blockThresholdValue, Promise promise) {
        try {
            Bitmap bitmap = BitmapFactory.decodeFile(imagePath);
            if (bitmap == null) {
                promise.reject("BLUR_CHECK_IMAGE_ERROR", "Could not decode image");
                return;
            }

            Mat mat = new Mat();
            Utils.bitmapToMat(bitmap, mat);
            // Drop alpha channel and convert to BGR
            Imgproc.cvtColor(mat, mat, Imgproc.COLOR_BGRA2BGR);

            // Apply default thresholds if arguments are null
            double blurThresh = blurThresholdValue != null ? blurThresholdValue : 50.0;
            double blockThresh = blockThresholdValue != null ? blockThresholdValue : 10.0;

            // Convert to grayscale
            Mat gray = new Mat();
            Imgproc.cvtColor(mat, gray, Imgproc.COLOR_BGR2GRAY);

            // Compute Laplacian variance for blur detection
            Mat laplacian = new Mat();
            Imgproc.Laplacian(gray, laplacian, CvType.CV_64F);
            MatOfDouble mean = new MatOfDouble();
            MatOfDouble stddev = new MatOfDouble();
            Core.meanStdDev(laplacian, mean, stddev);
            double variance = stddev.get(0,0)[0] * stddev.get(0,0)[0];

            // Compute blockiness by measuring differences at 8×8 block boundaries
            int rows = gray.rows();
            int cols = gray.cols();
            int blockSize = 8;
            double blockiness = 0.0;
            int count = 0;
            // Horizontal boundaries
            for (int y = blockSize; y < rows; y += blockSize) {
                for (int x = 0; x < cols; x++) {
                    double curr = gray.get(y, x)[0];
                    double prev = gray.get(y - 1, x)[0];
                    blockiness += Math.abs(curr - prev);
                    count++;
                }
            }
            // Vertical boundaries
            for (int x = blockSize; x < cols; x += blockSize) {
                for (int y = 0; y < rows; y++) {
                    double curr = gray.get(y, x)[0];
                    double prev = gray.get(y, x - 1)[0];
                    blockiness += Math.abs(curr - prev);
                    count++;
                }
            }
            blockiness = count > 0 ? blockiness / count : 0.0;

            // Determine if image quality is poor
            boolean isPoor = (variance < blurThresh) || (blockiness > blockThresh);

            WritableMap result = Arguments.createMap();
            result.putBoolean("isPoor", isPoor);
            result.putDouble("blurVariance", variance);
            result.putDouble("blockiness", blockiness);
            promise.resolve(result);
        } catch (Exception e) {
            Log.e("BLUR_CHECK", "Error checking image blur", e);
            promise.reject("BLUR_CHECK_EXCEPTION", e.getMessage());
        }
    }

    @ReactMethod
    public void readPNGFromFile(String imagePath, Promise promise) {
        try {
            Bitmap bitmap = BitmapFactory.decodeFile(imagePath);
            if (bitmap == null) {
                promise.reject("READ_PNG_ERROR", "Failed to decode image");
                return;
            }
            int width = bitmap.getWidth();
            int height = bitmap.getHeight();
            int[] pixels = new int[width * height];
            bitmap.getPixels(pixels, 0, width, 0, 0, width, height);
            ByteBuffer buffer = ByteBuffer.allocate(width * height * 4);
            for (int i = 0; i < pixels.length; i++) {
                int pixel = pixels[i];
                buffer.put((byte) Color.red(pixel));
                buffer.put((byte) Color.green(pixel));
                buffer.put((byte) Color.blue(pixel));
                buffer.put((byte) Color.alpha(pixel));
            }
            byte[] byteArray = buffer.array();
            String base64 = Base64.encodeToString(byteArray, Base64.NO_WRAP);
            WritableMap result = Arguments.createMap();
            result.putInt("width", width);
            result.putInt("height", height);
            result.putString("rgbaBuffer", base64);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("READ_PNG_EXCEPTION", e.getMessage());
        }
    }
}