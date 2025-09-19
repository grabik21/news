// server.js - Простой сервер для хранения сообщений

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = 'messages.json';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Раздаем статические файлы

// Функция для чтения сообщений из файла
async function readMessages() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Если файл не существует, создаем пустой массив
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Функция для записи сообщений в файл
async function writeMessages(messages) {
  await fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2));
}

// GET /api/messages - получить все сообщения
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await readMessages();
    res.json(messages);
  } catch (error) {
    console.error('Ошибка при чтении сообщений:', error);
    res.status(500).json({ error: 'Ошибка сервера при чтении сообщений' });
  }
});

// POST /api/messages - сохранить сообщения
app.post('/api/messages', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Сообщения должны быть массивом' });
    }

    // Добавляем ID и timestamp к каждому сообщению
    const messagesWithId = messages.map((msg, index) => ({
      id: index + 1,
      text: msg.text || null,
      image: msg.image || null,
      createdAt: new Date().toISOString()
    }));

    await writeMessages(messagesWithId);
    res.json({ success: true, count: messagesWithId.length });
  } catch (error) {
    console.error('Ошибка при сохранении сообщений:', error);
    res.status(500).json({ error: 'Ошибка сервера при сохранении сообщений' });
  }
});

// POST /api/messages/add - добавить одно сообщение
app.post('/api/messages/add', async (req, res) => {
  try {
    const { text, image } = req.body;
    
    const messages = await readMessages();
    const newMessage = {
      id: messages.length + 1,
      text: text || null,
      image: image || null,
      createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    await writeMessages(messages);
    
    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Ошибка при добавлении сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера при добавлении сообщения' });
  }
});

// PUT /api/messages/:id - обновить сообщение
app.put('/api/messages/:id', async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const { text, image } = req.body;
    
    const messages = await readMessages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }

    messages[messageIndex] = {
      ...messages[messageIndex],
      text: text || messages[messageIndex].text,
      image: image || messages[messageIndex].image,
      updatedAt: new Date().toISOString()
    };

    await writeMessages(messages);
    res.json({ success: true, message: messages[messageIndex] });
  } catch (error) {
    console.error('Ошибка при обновлении сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении сообщения' });
  }
});

// DELETE /api/messages/:id - удалить сообщение
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    
    const messages = await readMessages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }

    const deletedMessage = messages.splice(messageIndex, 1)[0];
    await writeMessages(messages);
    
    res.json({ success: true, message: deletedMessage });
  } catch (error) {
    console.error('Ошибка при удалении сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении сообщения' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`API доступно по адресу http://localhost:${PORT}/api/messages`);
});
