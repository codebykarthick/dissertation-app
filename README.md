# Dissertation App: App built for React Native

Cross-platform mobile application built using [React Native](https://reactnative.dev/).  
This project supports both **iOS** and **Android**, with fully offline functionality.

> ⚠️ Compiled APKs (Android) and test builds (iOS) are available under the [Releases](https://github.com/yourusername/your-repo/releases) tab.

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### 2. Install Dependencies
Make sure you have Node.js and Yarn or npm installed.

```bash
yarn install
# or
npm install
```

### iOS Setup (Mac Only)
Make sure you have Xcode and CocoaPods installed.

```bash
cd ios
pod install
cd ..
```

To run the app on iOS simulator:

```bash
npx react-native run-ios
```

### 🤖 Android Setup
Make sure you have Android Studio, Java 11, and Android SDK properly configured in your PATH.
To run the app on Android:

```bash
npx react-native run-android
```

### 🚀 Compiled Builds
✅ Android APKs are available under Releases.
🚧 iOS builds require manual signing and Xcode configuration due to Apple restrictions.

### 🧪 Troubleshooting
If you encounter build issues:
Delete node_modules, ios/Pods, and run a clean reinstall:

```bash
rm -rf node_modules ios/Pods ios/Podfile.lock android/app/build
yarn install
cd ios && pod install && cd ..
```

### 📄 License
This project is licensed under the MIT License. See LICENSE for details.
