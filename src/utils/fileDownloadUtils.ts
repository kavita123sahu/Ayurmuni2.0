import {
  Platform,
  PermissionsAndroid,
  NativeModules,
} from 'react-native';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import {
  createPlainTextPdfBytes,
  stripHtmlToPlainText,
} from './pdfPlainTextFallback';

const APP_DOWNLOADS_SUBDIR = 'AyurmuniDownloads';

type DeviceDownloadNative = {
  saveFileToDownloads: (
    sourcePath: string,
    fileName: string,
    mimeType: string,
    showNotification: boolean,
  ) => Promise<string>;
  notifyDownloadComplete?: (fileName: string, filePath: string) => void;
  openLocalPdf?: (filePath: string) => Promise<boolean>;
};

const DeviceDownload = NativeModules.DeviceDownload as
  | DeviceDownloadNative
  | undefined;

const sanitizeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '_');

const ensurePdfFileName = (fileName: string) => {
  const safe = sanitizeFileName(fileName);
  return safe.toLowerCase().endsWith('.pdf') ? safe : `${safe}.pdf`;
};

export const isPdfBytes = (buffer: ArrayBuffer | Uint8Array): boolean => {
  const bytes =
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer.slice(0, 5));
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
};

export const isHtmlBytes = (buffer: ArrayBuffer | Uint8Array): boolean => {
  const slice =
    buffer instanceof Uint8Array
      ? buffer.slice(0, 512)
      : new Uint8Array(buffer.slice(0, 512));
  const head = Buffer.from(slice).toString('utf8').trim().toLowerCase();
  return (
    head.startsWith('<!doctype') ||
    head.startsWith('<html') ||
    head.includes('<html')
  );
};

export async function normalizeDownloadToPdfBytes(
  data: ArrayBuffer | Uint8Array,
): Promise<Uint8Array> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  if (isPdfBytes(bytes)) {
    return bytes;
  }

  const asText = Buffer.from(bytes).toString('utf8');
  if (isHtmlBytes(bytes)) {
    return createPlainTextPdfBytes(stripHtmlToPlainText(asText));
  }

  return createPlainTextPdfBytes(asText);
}

async function ensureAppDownloadsDir(): Promise<string> {
  const dir = `${RNFS.DocumentDirectoryPath}/${APP_DOWNLOADS_SUBDIR}`;
  if (!(await RNFS.exists(dir))) {
    await RNFS.mkdir(dir);
  }
  return dir;
}

async function requestLegacyWritePermission() {
  if (Platform.OS !== 'android' || Number(Platform.Version) >= 29) {
    return;
  }

  try {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
  } catch {
    // ignore
  }
}

async function notifyDownloadComplete(fileName: string, filePath: string) {
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    DeviceDownload?.notifyDownloadComplete?.(fileName, filePath);
  } catch {
    // Notification failure should not block the saved PDF.
  }
}

async function getAppSavedFilePath(fileName: string): Promise<string | null> {
  const safeName = ensurePdfFileName(fileName);
  const filePath = `${RNFS.DocumentDirectoryPath}/${APP_DOWNLOADS_SUBDIR}/${safeName}`;
  if (await RNFS.exists(filePath)) {
    return filePath;
  }
  return null;
}

export async function getSavedFilePath(
  fileName: string,
): Promise<string | null> {
  return getAppSavedFilePath(fileName);
}

async function publishToPublicDownloads(
  localPath: string,
  fileName: string,
  mimeType: string,
  showNotification: boolean,
): Promise<string | null> {
  if (Platform.OS !== 'android') {
    return null;
  }

  await requestLegacyWritePermission();

  if (DeviceDownload?.saveFileToDownloads) {
    return DeviceDownload.saveFileToDownloads(
      localPath,
      fileName,
      mimeType,
      showNotification,
    );
  }
  return null;
}

export type SavedFileResult = {
  filePath: string;
  savedLabel: string;
  alreadyExisted: boolean;
};

async function persistPdfBytes(
  fileName: string,
  pdfBytes: Uint8Array,
): Promise<SavedFileResult> {
  const safeName = ensurePdfFileName(fileName);
  const existing = await getAppSavedFilePath(safeName);
  if (existing) {
    await notifyDownloadComplete(safeName, existing);
    return {
      filePath: existing,
      savedLabel: Platform.OS === 'android' ? 'Downloads' : 'Files',
      alreadyExisted: true,
    };
  }

  const dir = await ensureAppDownloadsDir();
  const filePath = `${dir}/${safeName}`;
  const base64 = Buffer.from(pdfBytes).toString('base64');
  await RNFS.writeFile(filePath, base64, 'base64');

  const exists = await RNFS.exists(filePath);
  if (!exists) {
    throw new Error('Could not save PDF on device');
  }

  const publicUri = await publishToPublicDownloads(
    filePath,
    safeName,
    'application/pdf',
    true,
  );

  if (!publicUri) {
    await notifyDownloadComplete(safeName, filePath);
  }

  return {
    filePath,
    savedLabel: Platform.OS === 'android' ? 'Downloads' : 'Files',
    alreadyExisted: false,
  };
}

export type DownloadPdfInput = {
  fileName: string;
  arrayBuffer?: ArrayBuffer;
  base64?: string;
  plainText?: string;
  pdfBytes?: Uint8Array;
};

/**
 * Save a PDF to device storage (Downloads on Android).
 * Converts HTML/plain-text payloads to PDF. Shows native Android download notification.
 * Does not auto-open the file (standard download behaviour).
 */
export async function downloadPdfToDevice(
  input: DownloadPdfInput,
): Promise<SavedFileResult> {
  const safeName = ensurePdfFileName(input.fileName);
  const existing = await getAppSavedFilePath(safeName);
  if (existing) {
    await notifyDownloadComplete(safeName, existing);
    return {
      filePath: existing,
      savedLabel: Platform.OS === 'android' ? 'Downloads' : 'Files',
      alreadyExisted: true,
    };
  }

  let pdfBytes: Uint8Array;

  if (input.pdfBytes) {
    pdfBytes = input.pdfBytes;
  } else if (input.plainText != null) {
    pdfBytes = await createPlainTextPdfBytes(input.plainText);
  } else if (input.base64) {
    const raw = Buffer.from(input.base64, 'base64');
    pdfBytes = isPdfBytes(raw)
      ? new Uint8Array(raw)
      : await normalizeDownloadToPdfBytes(raw);
  } else if (input.arrayBuffer) {
    pdfBytes = await normalizeDownloadToPdfBytes(input.arrayBuffer);
  } else {
    throw new Error('No download data found');
  }

  return persistPdfBytes(safeName, pdfBytes);
}

/** @deprecated Use downloadPdfToDevice for user-facing downloads */
export async function saveAndOpenPdfFromArrayBuffer(
  arrayBuffer: ArrayBuffer,
  fileName: string,
) {
  return downloadPdfToDevice({ fileName, arrayBuffer });
}

/** @deprecated Use downloadPdfToDevice for user-facing downloads */
export async function saveAndOpenPdfBase64(base64: string, fileName: string) {
  return downloadPdfToDevice({ fileName, base64 });
}

/** @deprecated Use downloadPdfToDevice with plainText */
export async function saveAndOpenTextFile(
  content: string,
  fileName: string,
): Promise<SavedFileResult> {
  return downloadPdfToDevice({ fileName, plainText: content });
}
