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
    public void isImageBlurred(String imagePath, @Nullable Double threshold, Promise promise) {
        try {
            Bitmap bitmap = BitmapFactory.decodeFile(imagePath);
            if (bitmap == null) {
                promise.reject("BLUR_CHECK_IMAGE_ERROR", "Could not decode image");
                return;
            }

            Mat mat = new Mat();
            Utils.bitmapToMat(bitmap, mat);
            Imgproc.cvtColor(mat, mat, Imgproc.COLOR_BGRA2GRAY);
            // Normalize image size for consistent blur detection
            Mat resized = new Mat();
            Imgproc.resize(mat, resized, new Size(300, 300));
            mat = resized;

            Mat laplacian = new Mat();
            Imgproc.Laplacian(mat, laplacian, CvType.CV_64F);

            MatOfDouble mean = new MatOfDouble();
            MatOfDouble stddev = new MatOfDouble();
            Core.meanStdDev(laplacian, mean, stddev);
            double variance = Math.pow(stddev.get(0, 0)[0], 2);

            // Empirically tuned threshold for sharp images
            double actualThreshold = (threshold != null) ? threshold : 20.0;
            boolean isBlurred = variance < actualThreshold;

            WritableMap result = Arguments.createMap();
            result.putBoolean("isBlurred", isBlurred);
            result.putDouble("variance", variance);
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