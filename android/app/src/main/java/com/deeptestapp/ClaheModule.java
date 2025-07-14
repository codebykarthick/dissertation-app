package com.deeptestapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.*;
import org.opencv.android.Utils;
import org.opencv.core.*;
import org.opencv.imgproc.CLAHE;
import org.opencv.imgproc.Imgproc;

import java.io.File;
import java.io.FileOutputStream;

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

            Imgproc.cvtColor(mat, mat, Imgproc.COLOR_BGR2Lab);
            java.util.List<Mat> lab = new java.util.ArrayList<>(3);
            Core.split(mat, lab);

            CLAHE clahe = Imgproc.createCLAHE();
            clahe.setClipLimit(2.0);
            clahe.apply(lab.get(0), lab.get(0));

            Core.merge(lab, mat);
            Imgproc.cvtColor(mat, mat, Imgproc.COLOR_Lab2BGR);

            Bitmap output = Bitmap.createBitmap(mat.cols(), mat.rows(), Bitmap.Config.ARGB_8888);
            Utils.matToBitmap(mat, output);

            String outputPath = imagePath.replace(".jpg", "_clahe.jpg");
            File outFile = new File(outputPath);
            FileOutputStream out = new FileOutputStream(outFile);
            output.compress(Bitmap.CompressFormat.JPEG, 100, out);
            out.close();

            promise.resolve("file://" + outputPath);
        } catch (Exception e) {
            Log.e("CLAHE", "Error processing image", e);
            promise.reject("CLAHE_EXCEPTION", e.getMessage());
        }
    }
}