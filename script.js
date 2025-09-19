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

 let currentMessageElement = null;
 let isAdmin = false;
 const adminPassword = "admin123"; // Задаем пароль администратора

 // Загружаем сохраненные сообщения при загрузке страницы
 loadMessages();

 // Проверяем, вошел ли пользователь как администратор
 checkAdminStatus();

 // Добавляем обработчик для кнопки добавления сообщения
 addMessageButton.addEventListener("click", function() {
 if (isAdmin) {
 const messageText = messageInput.value.trim();

 if (messageText !== "") {
 // Создаем новый элемент сообщения
 const messageElement = document.createElement("div");
 messageElement.className = "message";
 messageElement.textContent = messageText;

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
 alert("Пожалуйста, введите сообщение");
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

 // Сохраняем сообщения в локальное хранилище
 saveMessagesButton.addEventListener("click", function() {
 if (isAdmin) {
 saveMessages();
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
 if (password === adminPassword) {
 isAdmin = true;
 loginModal.style.display = "none";
 loginButton.textContent = "Выход";
 alert("Вы вошли как администратор");
 checkAdminStatus();
 } else {
 alert("Неверный пароль");
 }
 });

 // Функция для проверки статуса администратора
 function checkAdminStatus() {
 if (isAdmin) {
 inputContainer.style.display = "flex";
 } else {
 inputContainer.style.display = "none";
 }
 }

 // Функция для сохранения сообщений в локальное хранилище
 function saveMessages() {
 const messages = Array.from(messagesContainer.children).map(message => message.textContent);
 localStorage.setItem("messages", JSON.stringify(messages));
 alert("Сообщения сохранены!");
 }

 // Функция для загрузки сообщений из локального хранилища
 function loadMessages() {
 const savedMessages = localStorage.getItem("messages");
 if (savedMessages) {
 const messages = JSON.parse(savedMessages);
 messages.forEach(message => {
 const messageElement = document.createElement("div");
 messageElement.className = "message";
 messageElement.textContent = message;

 // Добавляем обработчик контекстного меню
 messageElement.addEventListener("contextmenu", function(event) {
 event.preventDefault();
 showContextMenu(event, messageElement);
 });

 messagesContainer.appendChild(messageElement);
 });
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
 const newText = prompt("Редактировать сообщение:", messageElement.textContent);
 if (newText !== null) {
 messageElement.textContent = newText;
 saveMessages();
 }
 contextMenu.style.display = "none";
 }

 // Функция для удаления сообщения
 function deleteMessage(messageElement) {
 if (confirm("Вы уверены, что хотите удалить это сообщение?")) {
 messageElement.remove();
 saveMessages();
 }
 contextMenu.style.display = "none";
 }

 // Скрываем контекстное меню при клике вне его
 document.addEventListener("click", function() {
 contextMenu.style.display = "none";
 });
});