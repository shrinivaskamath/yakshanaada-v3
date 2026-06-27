import {NativeModules, Platform, PermissionsAndroid} from 'react-native';

const {PlaybackService} = NativeModules;

// Ask for the Android 13+ notification permission so the foreground-service
// notification can be shown. Older versions grant it implicitly.
async function ensureNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android') return;
  if (Platform.Version < 33) return;
  try {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  } catch {
    // If the user denies, playback still works; only the notification is hidden.
  }
}

// Starts the Android foreground service + wake lock so looping audio keeps
// playing while the screen is off. No-op on other platforms.
export async function startPlaybackService(): Promise<void> {
  if (Platform.OS !== 'android' || !PlaybackService) return;
  await ensureNotificationPermission();
  try {
    PlaybackService.start();
  } catch {
    // Ignore: playback can still proceed without the keep-alive service.
  }
}

export function stopPlaybackService(): void {
  if (Platform.OS !== 'android' || !PlaybackService) return;
  try {
    PlaybackService.stop();
  } catch {
    // Ignore.
  }
}
