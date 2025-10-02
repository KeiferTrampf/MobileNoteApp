# 🛠 Development Notes

## Quick Start Commands

```bash
# Start development server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web

# Clear cache if issues
npx expo start --clear

# Type checking
npx tsc --noEmit

# Install new dependencies
npx expo install <package-name>
```

## Architecture Overview

### Data Flow

1. **UI Components** → trigger actions
2. **Services** → handle business logic
3. **AsyncStorage** → persist data
4. **Native APIs** → provide device features

### Key Services

- **NotesService**: CRUD operations for notes
- **CameraService**: Photo capture and management
- **LocationService**: GPS and geofencing
- **NotificationService**: Push notification scheduling
- **GeofencingService**: Background location monitoring

## Mobile Features Implementation

### Camera Integration

- Uses `expo-image-picker` for camera access
- Handles permissions automatically
- Supports both camera capture and gallery selection
- Image compression and validation built-in

### Location Services

- Uses `expo-location` for GPS access
- Implements geofencing with proximity detection
- Background location monitoring (requires dev build)
- Address lookup with reverse geocoding

### Push Notifications

- Uses `expo-notifications` for local notifications
- Time-based scheduling with flexible options
- Location-triggered immediate notifications
- Interactive notification handling

## Development Tips

### Testing Mobile Features

1. **Use Real Device**: Camera, location, and notifications work best on physical devices
2. **Expo Go Limitations**: Some features require development build
3. **Permission Testing**: Test permission flows thoroughly
4. **Background Testing**: Use development build for background features

### Common Development Issues

- **TypeScript Errors**: Run `npx tsc --noEmit` regularly
- **Cache Issues**: Use `--clear` flag when starting
- **Permission Problems**: Check device settings if features don't work
- **Build Errors**: Ensure all dependencies are properly installed

### Performance Optimization

- **FlatList**: Used for efficient note rendering
- **Image Compression**: Automatic photo optimization
- **Memory Management**: Proper cleanup of listeners
- **Background Efficiency**: Optimized location monitoring intervals

## Deployment Considerations

### Development Build

Required for:

- Background location monitoring
- Advanced notification features
- Full native performance

### Production Checklist

- [ ] Test on multiple devices
- [ ] Verify all permissions work
- [ ] Test offline functionality
- [ ] Validate data persistence
- [ ] Check performance with large datasets
- [ ] Test notification delivery
- [ ] Verify location accuracy

## Code Quality

### TypeScript

- Strict type checking enabled
- All components properly typed
- Service interfaces well-defined
- Error handling with typed exceptions

### Code Organization

- Clear separation of concerns
- Reusable components
- Service-based architecture
- Utility functions for common operations

### Best Practices

- Consistent naming conventions
- Proper error handling
- User-friendly error messages
- Responsive design patterns
- Accessibility considerations

## Troubleshooting Guide

### App Won't Start

1. Clear cache: `npx expo start --clear`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript: `npx tsc --noEmit`
4. Verify Expo CLI version: `npx expo --version`

### Features Not Working

1. Check device permissions
2. Verify Expo Go vs development build requirements
3. Test on different devices
4. Check console logs for errors

### Performance Issues

1. Check for memory leaks in listeners
2. Optimize image sizes
3. Implement proper list virtualization
4. Monitor background processes

## Future Development

### Recommended Enhancements

1. **Cloud Integration**: Firebase or Supabase
2. **Offline Support**: Better offline-first architecture
3. **Testing**: Comprehensive test suite
4. **CI/CD**: Automated build and deployment
5. **Monitoring**: Error tracking and analytics

### Technical Debt

- Implement comprehensive error boundaries
- Add more robust offline handling
- Enhance accessibility features
- Improve test coverage
- Add performance monitoring
