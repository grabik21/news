// script.js

import { openDB, saveMessages, loadMessages } from './db.js';

document.addEventListener("DOMContentLoaded", function() {
 const messageInput = document.getElementById("messageInput");
 const addMessageButton = document.getElementById("addMessageButton");
 const saveMessagesButton = document.getElementById("saveMessagesButton");
 const messagesContainer = document.getElementById("messages");
 const contextMenu = document.getElementById("contextMenu");
 const editMessageOption = document.getElementById("editMessage");
 const deleteMessageOption = document.getElementById("deleteMessage");
 const loginButton = document.getElementById("loginButton");
 const loginModal = document.getElementById("loginModal");
 const closeLoginModal = document.getElementById("closeLoginModal");
 const passwordInput = document.getElementById("passwordInput");
 const submitPasswordButton = document.getElementById("submitPasswordButton");
 const inputContainer = document.getElementById("inputContainer");
 const imageInput = document.getElementById("imageInput");
 const addImageButton = document.getElementById("addImageButton");
 const createImageButton = document.getElementById("createImageButton");
 const imageModal = document.getElementById("imageModal");
 const closeImageModal = document.getElementById("closeImageModal");
 const imageCanvas = document.getElementById("imageCanvas");
 const colorPicker = document.getElementById("colorPicker");
 const drawButton = document.getElementById("drawButton");
 const clearButton = document.getElementById("clearButton");
 const saveImageButton = document.getElementById("saveImageButton");

 let currentMessageElement = null;
 let isAdmin = false;
 const encryptedAdminPassword = "YWRtaW4xMjM="; // Зашифрованный пароль "admin123"
 let currentImageUrl = null;
 let isDrawing = false;
 let ctx = imageCanvas.getContext("2d");

 // Открываем базу данных
 openDB().then(() => {
 loadMessages().then(messages => {
 messages.forEach(messageData => {
 const messageElement = document.createElement("div");
 messageElement.className = "message";

 if (messageData.text) {
 messageElement.textContent = messageData.text;
 }

 if (messageData.image) {
 const imageElement = document.createElement("img");
 imageElement.src = messageData.image;
 imageElement.className = "message-image";
 messageElement.appendChild(imageElement);
 }

 // Добавляем обработчик контекстного меню
 messageElement.addEventListener("contextmenu", function(event) {
 event.preventDefault();
 showContextMenu(event, messageElement);
 });

 messagesContainer.appendChild(messageElement);
 });
 });
 });

 // Проверяем, вошел ли пользователь как администратор
 checkAdminStatus();

 // Добавляем обработчик для кнопки добавления сообщения
 addMessageButton.addEventListener("click", function() {
 if (isAdmin) {
 const messageText = messageInput.value.trim();

 if (messageText !== "" || currentImageUrl) {
 // Создаем новый элемент сообщения
 const messageElement = document.createElement("div");
 messageElement.className = "message";

 if (messageText !== "") {
 messageElement.textContent = messageText;
 }

 if (currentImageUrl) {
 const imageElement = document.createElement("img");
 imageElement.src = currentImageUrl;
 imageElement.className = "message-image";
 messageElement.appendChild(imageElement);
 currentImageUrl = null;
 }

 // Добавляем обработчик контекстного меню
 messageElement.addEventListener("contextmenu", function(event) {
 event.preventDefault();
 showContextMenu(event, messageElement);
 });

 // Добавляем сообщение в контейнер
 messagesContainer.appendChild(messageElement);

 // Очищаем поле ввода
 messageInput.value = "";
 } else {
 alert("Пожалуйста, введите сообщение или добавьте изображение");
 }
 } else {
 alert("Вы должны войти как администратор для добавления сообщений");
 }
 });

 // Добавляем возможность добавлять сообщение по нажатию Enter
 messageInput.addEventListener("keydown", function(event) {
 if (event.key === "Enter" && event.shiftKey) {
 // Добавляем новую строку при нажатии Shift + Enter
 event.preventDefault();
 const start = this.selectionStart;
 const end = this.selectionEnd;
 this.value = this.value.substring(0, start) + "\n" + this.value.substring(end);
 this.selectionStart = this.selectionEnd = start + 1;
 } else if (event.key === "Enter" && !event.shiftKey) {
 // Добавляем сообщение при нажатии Enter без Shift
 event.preventDefault();
 addMessageButton.click();
 }
 });

 // Сохраняем сообщения в базу данных
 saveMessagesButton.addEventListener("click", function() {
 if (isAdmin) {
 const messages = Array.from(messagesContainer.children).map(message => {
 const messageData = {
 text: message.textContent,
 image: message.querySelector("img") ? message.querySelector("img").src : null
 };
 return messageData;
 });

 saveMessages(messages).then(() => {
 alert("Сообщения сохранены!");
 });
 } else {
 alert("Вы должны войти как администратор для сохранения сообщений");
 }
 });

 // Открываем диалоговое окно для входа
 loginButton.addEventListener("click", function() {
 if (!isAdmin) {
 loginModal.style.display = "block";
 } else {
 // Выходим из аккаунта администратора
 isAdmin = false;
 loginButton.textContent = "Войти";
 alert("Вы вышли из аккаунта администратора");
 checkAdminStatus();
 }
 });

 // Закрываем диалоговое окно для входа
 closeLoginModal.addEventListener("click", function() {
 loginModal.style.display = "none";
 });

 // Проверяем пароль и входим в аккаунт администратора
 submitPasswordButton.addEventListener("click", function() {
 const password = passwordInput.value.trim();
 if (encryptPassword(password) === encryptedAdminPassword) {
 isAdmin = true;
 loginModal.style.display = "none";
 loginButton.textContent = "Выход";
 alert("Вы вошли как администратор");
 checkAdminStatus();
 } else {
 alert("Неверный пароль");
 }
 });

 // Добавляем обработчик для кнопки добавления изображения
 addImageButton.addEventListener("click", function() {
 if (isAdmin) {
 imageInput.click();
 } else {
 alert("Вы должны войти как администратор для добавления изображений");
 }
 });

 // Обрабатываем загрузку изображения
 imageInput.addEventListener("change", function(event) {
 const file = event.target.files[0];
 if (file) {
 const reader = new FileReader();
 reader.onload = function(e) {
 currentImageUrl = e.target.result;
 alert("Изображение добавлено. Теперь вы можете добавить сообщение.");
 };
 reader.readAsDataURL(file);
 }
 });

 // Добавляем обработчик для кнопки создания изображения
 createImageButton.addEventListener("click", function() {
 if (isAdmin) {
 imageModal.style.display = "block";
 clearCanvas();
 } else {
 alert("Вы должны войти как администратор для создания изображений");
 }
 });

 // Закрываем диалоговое окно для создания изображения
 closeImageModal.addEventListener("click", function() {
 imageModal.style.display = "none";
 });

 // Обрабатываем рисование на холсте
 imageCanvas.addEventListener("mousedown", function(event) {
 if (isDrawing) {
 const rect = imageCanvas.getBoundingClientRect();
 const x = event.clientX - rect.left;
 const y = event.clientY - rect.top;
 ctx.beginPath();
 ctx.moveTo(x, y);
 }
 });

 imageCanvas.addEventListener("mousemove", function(event) {
 if (isDrawing) {
 const rect = imageCanvas.getBoundingClientRect();
 const x = event.clientX - rect.left;
 const y = event.clientY - rect.top;
 ctx.lineTo(x, y);
 ctx.stroke();
 }
 });

 imageCanvas.addEventListener("mouseup", function() {
 ctx.closePath();
 });

 // Включаем/выключаем рисование
 drawButton.addEventListener("click", function() {
 isDrawing = !isDrawing;
 drawButton.textContent = isDrawing ? "Остановить рисование" : "Рисовать";
 ctx.strokeStyle = colorPicker.value;
 ctx.lineWidth = 2;
 });

 // Очищаем холст
 clearButton.addEventListener("click", function() {
 clearCanvas();
 });

 // Сохраняем изображение
 saveImageButton.addEventListener("click", function() {
 currentImageUrl = imageCanvas.toDataURL();
 imageModal.style.display = "none";
 alert("Изображение сохранено. Теперь вы можете добавить сообщение.");
 });

 // Функция для очистки холста
 function clearCanvas() {
 ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
 ctx.fillStyle = "#ffffff";
 ctx.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
 }

 // Функция для проверки статуса администратора
 function checkAdminStatus() {
 if (isAdmin) {
 inputContainer.style.display = "flex";
 } else {
 inputContainer.style.display = "none";
 }
 }

 // Функция для отображения контекстного меню
 function showContextMenu(event, messageElement) {
 if (isAdmin) {
 currentMessageElement = messageElement;

 // Позиционируем контекстное меню
 contextMenu.style.display = "block";
 contextMenu.style.left = event.pageX + "px";
 contextMenu.style.top = event.pageY + "px";

 // Добавляем обработчики для опций меню
 editMessageOption.onclick = function() {
 editMessage(messageElement);
 };

 deleteMessageOption.onclick = function() {
 deleteMessage(messageElement);
 };
 } else {
 alert("Вы должны войти как администратор для редактирования или удаления сообщений");
 }
 }

 // Функция для редактирования сообщения
 function editMessage(messageElement) {
 if (messageElement.querySelector("img")) {
 alert("Редактирование изображений не поддерживается");
 } else {
 const newText = prompt("Редактировать сообщение:", messageElement.textContent);
 if (newText !== null) {
 messageElement.textContent = newText;
 const messages = Array.from(messagesContainer.children).map(message => {
 const messageData = {
 text: message.textContent,
 image: message.querySelector("img") ? message.querySelector("img").src : null
 };
 return messageData;
 });

 saveMessages(messages).then(() => {
 alert("Сообщения сохранены!");
 });
 }
 }
 contextMenu.style.display = "none";
 }

 // Функция для удаления сообщения
 function deleteMessage(messageElement) {
 if (confirm("Вы уверены, что хотите удалить это сообщение?")) {
 messageElement.remove();
 const messages = Array.from(messagesContainer.children).map(message => {
 const messageData = {
 text: message.textContent,
 image: message.querySelector("img") ? message.querySelector("img").src : null
 };
 return messageData;
 });

 saveMessages(messages).then(() => {
 alert("Сообщения сохранены!");
 });
 }
 contextMenu.style.display = "none";
 }

 // Скрываем контекстное меню при клике вне его
 document.addEventListener("click", function() {
 contextMenu.style.display = "none";
 });

 // Функция для шифрования пароля
 function encryptPassword(password) {
 return btoa(password);
 }

 // Функция для расшифровки пароля
 function decryptPassword(encryptedPassword) {
 return atob(encryptedPassword);
 }
});