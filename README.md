# 📱 Mobile Note App

A feature-rich React Native note-taking application built with Expo SDK 54, showcasing advanced mobile development capabilities including camera integration, location services, and push notifications.

## 🌟 Features

### 📝 Core Note Management

- **Create & Edit Notes**: Rich text editing with title, content, categories, and tags
- **Smart Organization**: Category-based organization with tag support
- **Real-time Search**: Instant search across note titles, content, and tags
- **Auto-save**: Automatic saving to prevent data loss
- **Data Persistence**: Local storage using AsyncStorage

### 📷 Camera Integration

- **Photo Attachments**: Capture photos directly or select from gallery
- **Multiple Photos**: Attach multiple images to each note
- **Image Management**: View, delete, and organize photo attachments
- **Permission Handling**: Seamless camera and photo library permission requests
- **Image Optimization**: Automatic compression and validation

### 📍 Location Services

- **Location Reminders**: Set location-based reminders for notes
- **Geofencing**: Get notified when you're near important locations
- **GPS Integration**: Automatic location capture with address lookup
- **Custom Radius**: Adjustable reminder radius (10-1000 meters)
- **Background Monitoring**: Location tracking for proximity alerts

### 🔔 Push Notifications

- **Time-based Reminders**: Schedule notifications for specific times
- **Location Alerts**: Instant notifications when entering geofenced areas
- **Smart Scheduling**: Flexible reminder options (1 hour, 1 day, 1 week)
- **Interactive Notifications**: Tap to open relevant notes
- **Test Functionality**: Built-in notification testing

### 🎨 Mobile-Optimized UI

- **Touch-friendly Interface**: Large buttons and intuitive gestures
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Smooth Animations**: Native-feeling transitions and interactions
- **Keyboard Handling**: Smart keyboard avoidance and input management
- **Pull-to-refresh**: Native refresh controls for data updates

## 🛠 Technical Stack

- **Framework**: React Native 0.81 with Expo SDK 54
- **Language**: TypeScript for type safety
- **Navigation**: React Navigation 6 with stack navigation
- **State Management**: React Context with useReducer pattern
- **Storage**: AsyncStorage for local data persistence
- **Camera**: Expo ImagePicker with permission handling
- **Location**: Expo Location with geofencing capabilities
- **Notifications**: Expo Notifications with local scheduling
- **Development**: Expo CLI with hot reloading

## 📁 Project Structure

```
MobileNoteApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── NoteCard.tsx     # Note display card
│   │   ├── PhotoAttachment.tsx  # Photo display component
│   │   └── LocationPicker.tsx   # Location selection UI
│   ├── screens/             # Main application screens
│   │   ├── NoteListScreen.tsx   # Notes list and search
│   │   ├── NoteEditorScreen.tsx # Note creation/editing
│   │   └── NoteViewScreen.tsx   # Note detail view
│   ├── services/            # Business logic and API services
│   │   ├── NotesService.ts      # Note CRUD operations
│   │   ├── CameraService.ts     # Camera and photo handling
│   │   ├── LocationService.ts   # GPS and geofencing
│   │   ├── NotificationService.ts # Push notification management
│   │   └── GeofencingService.ts # Location monitoring
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Core data models
│   ├── utils/               # Utility functions
│   │   ├── validation.ts    # Input validation
│   │   ├── dataTransform.ts # Data formatting
│   │   └── ErrorHandler.ts  # Error management
│   └── navigation/          # Navigation configuration
│       └── AppNavigator.tsx # Stack navigator setup
├── app.json                 # Expo configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd MobileNoteApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - **Expo Go**: Scan QR code with Expo Go app
   - **Android**: Press `a` or run `npx expo start --android`
   - **iOS**: Press `i` or run `npx expo start --ios`
   - **Web**: Press `w` or run `npx expo start --web`

## 📱 Usage Guide

### Creating Notes

1. Tap the "Add Note" button on the main screen
2. Enter a title and content for your note
3. Optionally add a category and tags (comma-separated)
4. Attach photos using the camera button
5. Set location reminders by tapping "Get Current Location"
6. Schedule time-based reminders with the reminder button
7. Save your note

### Managing Notes

- **View**: Tap any note card to view details
- **Edit**: Use the edit button in note view or note card
- **Delete**: Swipe left on note cards or use the delete button
- **Search**: Use the search bar to find notes by content
- **Organize**: Filter by categories and sort by date/title

### Mobile Features

- **Camera**: Grant camera permissions when prompted
- **Location**: Enable location services for geofencing
- **Notifications**: Allow notification permissions for reminders
- **Background**: For full functionality, consider using a development build

## 🔧 Configuration

### Permissions

The app requires the following permissions:

- **Camera**: For photo attachments
- **Photo Library**: For selecting existing images
- **Location**: For location-based reminders
- **Notifications**: For time and location alerts

### Customization

- Modify `app.json` for app configuration
- Update colors and styles in component StyleSheets
- Adjust notification settings in `NotificationService.ts`
- Configure geofencing radius in `LocationService.ts`

## 🧪 Testing

### Manual Testing

1. **Basic Functionality**: Create, edit, and delete notes
2. **Camera Integration**: Test photo capture and gallery selection
3. **Location Services**: Set location reminders and test proximity
4. **Notifications**: Use the test button and schedule reminders
5. **Search & Filter**: Test search functionality with various queries

### Device Testing

- Test on both iOS and Android devices
- Verify permissions work correctly
- Test background location and notifications
- Validate responsive design on different screen sizes

## 🚀 Deployment

### Development Build

For full functionality (background location, advanced notifications):

```bash
npx eas build --profile development --platform android
npx eas build --profile development --platform ios
```

### Production Build

```bash
npx eas build --profile production --platform android
npx eas build --profile production --platform ios
```

## 🐛 Troubleshooting

### Common Issues

**Notifications not working**

- Ensure notification permissions are granted
- Check device notification settings
- Use development build for advanced features

**Location services failing**

- Verify location permissions are enabled
- Check device location settings
- Ensure GPS is enabled

**Camera not accessible**

- Grant camera permissions in device settings
- Restart the app after permission changes
- Check for camera hardware availability

**App crashes on startup**

- Clear Expo cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

## 📈 Performance Considerations

- **Image Optimization**: Photos are compressed automatically
- **Efficient Rendering**: FlatList used for large note collections
- **Memory Management**: Proper cleanup of listeners and resources
- **Background Processing**: Optimized location monitoring intervals
- **Storage Efficiency**: Compressed data storage with AsyncStorage

## 🔮 Future Enhancements

- **Cloud Sync**: Firebase or AWS integration
- **Collaboration**: Shared notes and real-time editing
- **Voice Notes**: Audio recording and playback
- **Rich Text**: Advanced formatting options
- **Export Options**: PDF and text export functionality
- **Themes**: Dark mode and custom color schemes

## 📄 License

This project is created for educational purposes as part of a mobile development assignment.

## 👨‍💻 Developer

Created with ❤️ using React Native, Expo, and modern mobile development practices.

---

**Note**: This app demonstrates advanced mobile development concepts including native device integration, background processing, and cross-platform compatibility. For production use, consider implementing additional security measures, error tracking, and performance monitoring.
