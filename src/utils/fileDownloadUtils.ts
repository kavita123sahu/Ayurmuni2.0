import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Share from 'react-native-share';

const sanitizeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '_');

async function resolveSaveDirectory() {
  if (Platform.OS === 'ios') {
    return RNFS.DocumentDirectoryPath;
  }

  if (Platform.Version < 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED && RNFS.DownloadDirectoryPath) {
        return RNFS.DownloadDirectoryPath;
      }
    } catch {
      // fall through
    }
  }

  return RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath;
}

export async function saveTextFileLocally(
  content: string,
  fileName: string,
): Promise<string> {
  const dir = await resolveSaveDirectory();
  const safeName = sanitizeFileName(fileName);
  const filePath = `${dir}/${safeName}`;

  await RNFS.writeFile(filePath, content, 'utf8');

  const exists = await RNFS.exists(filePath);
  if (!exists) {
    throw new Error('Could not save file on device');
  }

  return filePath;
}

export async function openLocalFile(filePath: string, displayName?: string) {
  try {
    await FileViewer.open(filePath, {
      showOpenWithDialog: true,
      displayName: displayName ?? 'Receipt',
    });
  } catch {
    await Share.open({
      url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
      type: 'text/plain',
      failOnCancel: false,
    });
  }
}

export async function saveAndOpenTextFile(content: string, fileName: string) {
  const filePath = await saveTextFileLocally(content, fileName);
  await openLocalFile(filePath, fileName);
  return filePath;
}
