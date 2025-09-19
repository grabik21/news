// db.js - Работа с серверной базой данных

const API_BASE_URL = 'http://localhost:3000/api';

// Инициализация подключения к серверу
export async function openDB() {
 try {
 // Проверяем доступность сервера
 const response = await fetch(`${API_BASE_URL}/messages`);
 if (!response.ok) {
 throw new Error(`Сервер недоступен: ${response.status}`);
 }
 
 console.log("Подключение к серверной базе данных установлено");
 return true;
 } catch (error) {
 console.error("Ошибка при подключении к серверу:", error);
 
 // Fallback на localStorage если сервер недоступен
 console.log("Переключение на локальное хранилище...");
 return await initLocalStorage();
 }
}

// Fallback функция для работы с localStorage
async function initLocalStorage() {
 const DB_NAME = "messages_db_local";
 
 try {
 // Проверяем, есть ли локальные данные
 const stored = localStorage.getItem(DB_NAME);
 if (stored) {
 console.log("Найдены локальные данные");
 }
 
 console.log("Локальное хранилище инициализировано");
 return true;
 } catch (error) {
 console.error("Ошибка при инициализации локального хранилища:", error);
 throw error;
 }
}

// Сохранение сообщений на сервер
export async function saveMessages(messages) {
 try {
 const response = await fetch(`${API_BASE_URL}/messages`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ messages })
 });

 if (!response.ok) {
 throw new Error(`Ошибка сервера: ${response.status}`);
 }

 const result = await response.json();
 console.log(`Сохранено ${result.count} сообщений на сервер`);
 return result;
 } catch (error) {
 console.error("Ошибка при сохранении на сервер:", error);
 
 // Fallback на localStorage
 console.log("Сохранение в локальное хранилище...");
 return await saveToLocalStorage(messages);
 }
}

// Загрузка сообщений с сервера
export async function loadMessages() {
 try {
 const response = await fetch(`${API_BASE_URL}/messages`);
 
 if (!response.ok) {
 throw new Error(`Ошибка сервера: ${response.status}`);
 }

 const messages = await response.json();
 console.log(`Загружено ${messages.length} сообщений с сервера`);
 return messages;
 } catch (error) {
 console.error("Ошибка при загрузке с сервера:", error);
 
 // Fallback на localStorage
 console.log("Загрузка из локального хранилища...");
 return await loadFromLocalStorage();
 }
}

// Добавление одного сообщения
export async function addMessage(messageData) {
 try {
 const response = await fetch(`${API_BASE_URL}/messages/add`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(messageData)
 });

 if (!response.ok) {
 throw new Error(`Ошибка сервера: ${response.status}`);
 }

 const result = await response.json();
 console.log("Сообщение добавлено на сервер");
 return result.message;
 } catch (error) {
 console.error("Ошибка при добавлении сообщения на сервер:", error);
 throw error;
 }
}

// Обновление сообщения
export async function updateMessage(messageId, messageData) {
 try {
 const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(messageData)
 });

 if (!response.ok) {
 throw new Error(`Ошибка сервера: ${response.status}`);
 }

 const result = await response.json();
 console.log("Сообщение обновлено на сервере");
 return result.message;
 } catch (error) {
 console.error("Ошибка при обновлении сообщения на сервере:", error);
 throw error;
 }
}

// Удаление сообщения
export async function deleteMessage(messageId) {
 try {
 const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
 method: 'DELETE'
 });

 if (!response.ok) {
 throw new Error(`Ошибка сервера: ${response.status}`);
 }

 const result = await response.json();
 console.log("Сообщение удалено с сервера");
 return result.message;
 } catch (error) {
 console.error("Ошибка при удалении сообщения с сервера:", error);
 throw error;
 }
}

// Fallback функции для localStorage
async function saveToLocalStorage(messages) {
 try {
 const DB_NAME = "messages_db_local";
 localStorage.setItem(DB_NAME, JSON.stringify(messages));
 console.log(`Сохранено ${messages.length} сообщений в localStorage`);
 return { success: true, count: messages.length };
 } catch (error) {
 console.error("Ошибка при сохранении в localStorage:", error);
 throw error;
 }
}

async function loadFromLocalStorage() {
 try {
 const DB_NAME = "messages_db_local";
 const stored = localStorage.getItem(DB_NAME);
 const messages = stored ? JSON.parse(stored) : [];
 console.log(`Загружено ${messages.length} сообщений из localStorage`);
 return messages;
 } catch (error) {
 console.error("Ошибка при загрузке из localStorage:", error);
 return [];
 }
}
