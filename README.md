# HNews

Fully open source hacker news client for both iOS and Android.

<p align="center">
<img src="readmeAssets/MainScreen.png" alt="drawing" width="350"/>
</p>

## Release Status 🛜

### Apple

Apple did not like this app, claiming it was not different enough from a webpage ([others](https://forums.developer.apple.com/forums/thread/95085) have had similar issues).

But you can download the app via TestFlight [here](https://testflight.apple.com/join/DjtQPqho)

### Google

Use [this](https://play.google.com/apps/internaltest/4700382531060013255)link to download it.

## Build 🧱

Before building, ensure you have the following prerequisites:

1. Update your project dependencies:

```bash
npx expo install --check
```

2. Update EAS CLI:

```bash
npm install -g eas-cli
```

3. In Xcode:

   - Open Xcode
   - Go to Xcode → Settings → Locations → Command Line Tools (ensure latest version is selected)
   - Go to Xcode → Settings → Platforms
   - Download and install iOS 18.2 platform

4. Clear existing Apple authentication:

```bash
rm -rf ~/.app-store/auth/*
```

5. Then run the build command:

```bash
eas build --profile production --platform ios --local
```

_(To build for Android, replace `ios` with `android`)_

Then to publish to App Store Connect, you can run:

```bash
eas submit --platform ios
```

> **Troubleshooting**:
>
> - If you see dependency warnings, run `npx expo install --check` to fix them
> - Make sure your Apple Developer account is properly configured in Xcode
> - Ensure you have the correct iOS platform installed in Xcode for your target build

## Known Bugs 🐛

- Large posts not always rendering upvote/unvote fields

Found a bug? Please report it under `issues`

## Development 💻

To run the app in development mode, you can run:

```bash
npx expo start --dev-client
```

And in another terminal, you can run:

```bash
npx expo run:ios
```

This will run the app on your iOS device.
