import { fs, path, os } from "@tauri-apps/api";
import uuid from "uuid";
import storage from "tauri-json-storage";

// Get items from file storage
export async function getItems(prefix: string): Promise<Array<{}>> {
  const allKeys = await storage.keys();
  console.log("keys", allKeys);
  const matchingKeys = allKeys.filter((k) => k.startsWith(prefix));
  console.log("MATCHING", matchingKeys);
  const data = await storage.getMany(matchingKeys);
  console.log("data", data);
  return Object.values(data);
}

// Write an item to file storage
export async function saveItem(prefix: string, data: any): Promise<void> {
  // create a unique id for this server
  if (!data.id) data.id = uuid.v4();

  // Write file
  await storage.set(prefix + data.id, data);
}

// Remove item from file storage
export async function deleteItem(prefix: string, id: string): Promise<void> {
  await storage.remove(prefix + id);
}

// Set up storage dir
export async function initStorage(userData: string): Promise<void> {
  // Deal with persisting server data
  console.log("APP DIR", userData);
  const storageDir = await path.join(userData, "storage");
  await storage.setDataPath(storageDir);
}
