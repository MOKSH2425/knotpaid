import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

// Writes a backup object to disk as pretty-printed JSON and opens the
// native share sheet — same pattern as the PDF export, so it can be saved
// to Google Drive, emailed, AirDropped, etc. Returns the file's on-disk
// URI in case the caller wants it for anything else.
export async function exportBackupToFile(
  payload: object,
  fileNameHint: string,
) {
  const safeName = fileNameHint.replace(/[^a-z0-9]/gi, "-");
  const fileName = `KnotPaid-${safeName}-${Date.now()}.json`;
  const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(
    destinationUri,
    JSON.stringify(payload, null, 2),
    { encoding: FileSystem.EncodingType.UTF8 },
  );

  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(destinationUri, {
      mimeType: "application/json",
      dialogTitle: `${fileNameHint} — KnotPaid Backup`,
      UTI: "public.json",
    });
  }

  return destinationUri;
}

// Opens the native file picker and returns the parsed JSON content, or
// null if the user cancelled. Accepts any file type at the picker level
// — some Android file providers (Google Drive, WhatsApp, etc.) don't
// report a proper JSON mime type — and relies on validateBackupPayload
// downstream to reject anything that isn't actually a KnotPaid backup.
export async function pickAndReadBackupFile(): Promise<unknown | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return JSON.parse(content);
}
