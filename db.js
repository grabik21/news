// db.js

const DB_NAME = "MessagesDB";
const DB_PASSWORD = "MessagesDB";
const DB_VERSION = 1;
const STORE_NAME = "messages";

let db;

export function openDB() {
 return new Promise((resolve, reject) => {
 const request = indexedDB.open(DB_NAME, DB_VERSION);

 request.onerror = function(event) {
 console.log("Ошибка при открытии базы данных:", event.target.errorCode);
 reject(event.target.errorCode);
 };

 request.onsuccess = function(event) {
 db = event.target.result;
 resolve(db);
 };

 request.onupgradeneeded = function(event) {
 db = event.target.result;
 const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
 objectStore.createIndex("text", "text", { unique: false });
 objectStore.createIndex("image", "image", { unique: false });
 };
 });
}

export function saveMessages(messages) {
 return new Promise((resolve, reject) => {
 const transaction = db.transaction([STORE_NAME], "readwrite");
 const objectStore = transaction.objectStore(STORE_NAME);

 // Очищаем хранилище перед сохранением новых сообщений
 const clearRequest = objectStore.clear();
 clearRequest.onsuccess = function() {
 messages.forEach(messageData => {
 objectStore.add(messageData);
 });
 resolve();
 };
 clearRequest.onerror = function(event) {
 reject(event.target.errorCode);
 };
 });
}

export function loadMessages() {
 return new Promise((resolve, reject) => {
 const transaction = db.transaction([STORE_NAME], "readonly");
 const objectStore = transaction.objectStore(STORE_NAME);
 const request = objectStore.getAll();

 request.onsuccess = function(event) {
 resolve(event.target.result);
 };

 request.onerror = function(event) {
 reject(event.target.errorCode);
 };
 });
}