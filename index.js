require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', methods: ['GET', 'POST', 'DELETE', 'PATCH'], credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: 'mysql3.webio.pl',
  user: '23241_admin',
  password: 'certar65!',
  database: '23241_test',
});

connection.connect((err) => {
  if (err) console.error('❌ Błąd połączenia z bazą:', err.stack);
  else console.log('✅ Połączono z bazą MySQL');
});

const sendTelegramMessage = async (chatId, message) => {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    const responseData = await response.json();
    if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}, Odpowiedź: ${JSON.stringify(responseData)}`);
    console.log('📩 Wiadomość wysłana do Telegrama (Bot 1)');
  } catch (error) {
    console.error('❌ Błąd przy wysyłaniu wiadomości (Bot 1):', error);
  }
};

const sendTelegramMessage2 = async (chatId, message) => {
  const telegramToken2 = process.env.TELEGRAM_BOT_TOKEN2;
  console.log('Konfiguracja sendTelegramMessage2:', { telegramToken2: telegramToken2 ? 'zdefiniowany' : 'niezdefiniowany', chatId });
  const url = `https://api.telegram.org/bot${telegramToken2}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    const responseData = await response.json();
    if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}, Odpowiedź: ${JSON.stringify(responseData)}`);
    console.log('📩 Wiadomość wysłana do Telegrama (Bot 2)');
  } catch (error) {
    console.error('❌ Błąd przy wysyłaniu wiadomości (Bot 2):', error);
  }
};

const sendTelegramVerification = async (appointmentId, message) => {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  console.log('Konfiguracja sendTelegramVerification:', { telegramToken: telegramToken ? 'zdefiniowany' : 'niezdefiniowany', chatId });
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: '✅ Akceptuj', callback_data: `accept_${appointmentId}` }],
      [{ text: '❌ Odrzuć', callback_data: `reject_${appointmentId}` }],
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, reply_markup: inlineKeyboard }),
    });
    const responseData = await response.json();
    if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}, Odpowiedź: ${JSON.stringify(responseData)}`);
    console.log('📩 Wiadomość weryfikacyjna wysłana do Telegrama (Bot 1)');
  } catch (error) {
    console.error('❌ Błąd przy wysyłaniu wiadomości (Bot 1):', error);
  }
};

const sendTelegramVerification2 = async (orderId, message) => {
  const telegramToken2 = process.env.TELEGRAM_BOT_TOKEN2;
  const chatId = process.env.TELEGRAM_CHAT_ID2;
  console.log('Konfiguracja sendTelegramVerification2:', { telegramToken2: telegramToken2 ? 'zdefiniowany' : 'niezdefiniowany', chatId, orderId });
  const url = `https://api.telegram.org/bot${telegramToken2}/sendMessage`;

  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: '✅ Akceptuj', callback_data: `accept_${orderId}` }],
      [{ text: '❌ Odrzuć', callback_data: `reject_${orderId}` }],
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, reply_markup: inlineKeyboard }),
    });
    const responseData = await response.json();
    if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}, Odpowiedź: ${JSON.stringify(responseData)}`);
    console.log('📩 Wiadomość weryfikacyjna wysłana do Telegrama (Bot 2)');
  } catch (error) {
    console.error('❌ Błąd przy wysyłaniu wiadomości (Bot 2):', error);
  }
};

app.get('/api/dni-nieczynne', (req, res) => {
  const query = 'SELECT id, date, reason FROM dni_nieczynne ORDER BY date ASC';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('❌ Błąd pobierania dni nieczynnych:', err);
      return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania dni nieczynnych', details: err.message });
    }

    console.log('✅ Pobranie dni nieczynnych zakończone sukcesem');
    res.json(results);
  });
});

app.post('/api/dni-nieczynne', (req, res) => {
  const { date, reason } = req.body;

  console.log('Otrzymano żądanie dodania dnia nieczynnego:', { date, reason });

  if (!date || !reason) {
    console.error('Brak wymaganych pól: date i reason');
    return res.status(400).json({ error: 'Data i powód są wymagane' });
  }

  const query = 'INSERT INTO dni_nieczynne (date, reason) VALUES (?, ?)';
  connection.query(query, [date, reason], (err, result) => {
    if (err) {
      console.error('Błąd dodawania dnia nieczynnego:', err);
      return res.status(500).json({ error: 'Błąd przy dodawaniu dnia nieczynnego', details: err.message });
    }

    console.log('Wynik zapytania SQL:', result);

    if (result.affectedRows === 0) {
      console.error('Dzień nieczynny nie został dodany');
      return res.status(500).json({ error: 'Nie udało się dodać dnia nieczynnego' });
    }

    res.json({ message: 'Dzień nieczynny dodano pomyślnie' });
  });
});

app.post('/api/warsztat', (req, res) => {
  const { dane, numer_telefonu, model_auta, rodzaj_naprawy, date } = req.body;

  console.log('Otrzymano żądanie do /api/warsztat:', { dane, numer_telefonu, model_auta, rodzaj_naprawy, date });

  if (!dane || !numer_telefonu || !model_auta || !rodzaj_naprawy || !date) {
    console.error('Brak wymaganych pól');
    return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
  }

  const currentYear = new Date().getFullYear();
  const parsedDate = new Date(date);
  parsedDate.setFullYear(currentYear);
  const formattedDate = parsedDate.toISOString().split('T')[0];

  const query = 'INSERT INTO warsztat (dane, numer_telefonu, model_auta, rodzaj_naprawy, date, status) VALUES (?, ?, ?, ?, ?, "oczekujące")';
  connection.query(query, [dane, numer_telefonu, model_auta, rodzaj_naprawy, formattedDate], (err, result) => {
    if (err) {
      console.error('Błąd zapisu do bazy:', err);
      return res.status(500).json({ error: 'Błąd przy zapisywaniu wizyty', details: err.message });
    }

    const appointmentId = result.insertId;
    const telegramDate = parsedDate.toLocaleString('default', { day: 'numeric', month: 'long' });
    const message = `
      🔧 Nowa wizyta 🔧
      👤 Dane: ${dane}
      📞 Telefon: ${numer_telefonu}
      🚗 Model: ${model_auta}
      🔍 Opis: ${rodzaj_naprawy}
      📅 Data: ${telegramDate}
      📌 Numer wizyty: #${appointmentId}
      \n📌 Wybierz opcję:
    `;

    console.log('Wysyłanie wiadomości weryfikacyjnej do Telegrama (Bot 1):', { chatId: process.env.TELEGRAM_CHAT_ID, appointmentId });
    sendTelegramVerification(appointmentId, message);
    res.json({ message: 'Wizyta umówiona!', appointmentId });
  });
});

app.get('/api/warsztat', (req, res) => {
  const query = 'SELECT * FROM warsztat';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Błąd pobierania wizyt:', err);
      return res.status(500).json({ error: 'Błąd przy pobieraniu wizyt', details: err.message });
    }
    res.json(results);
  });
});

app.post('/api/telegram-callback', (req, res) => {
  const callbackQuery = req.body.callback_query;
  console.log('Otrzymano callback dla warsztatu:', callbackQuery);

  if (!callbackQuery) {
    console.error('Brak callback_query w żądaniu');
    return res.status(400).json({ error: 'Brak danych callbacku' });
  }

  const { id, data } = callbackQuery;
  console.log('Przetwarzanie callbacku:', { id, data });

  const [action, appointmentId] = data.split('_');
  const newStatus = action === 'accept' ? 'zaakceptowane' : 'odrzucone';

  const updateQuery = 'UPDATE warsztat SET status = ? WHERE id = ?';
  connection.query(updateQuery, [newStatus, appointmentId], (err) => {
    if (err) {
      console.error('Błąd aktualizacji statusu:', err);
      return res.status(500).json({ error: 'Błąd aktualizacji statusu wizyty', details: err.message });
    }
    console.log(`✅ Status wizyty ID ${appointmentId} zmieniony na: ${newStatus}`);

    const chatId = process.env.TELEGRAM_CHAT_ID;
    const confirmationMessage = action === 'accept'
      ? `✅ Zgłoszenie wizyty #${appointmentId} zostało zaakceptowane!`
      : `❌ Zgłoszenie wizyty #${appointmentId} zostało odrzucone!`;

    sendTelegramMessage(chatId, confirmationMessage);

    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const answerUrl = `https://api.telegram.org/bot${telegramToken}/answerCallbackQuery`;
    fetch(answerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: id, text: `Zmieniono status na: ${newStatus}` }),
    })
      .then((response) => response.json())
      .then((data) => console.log('📩 Odpowiedź Telegrama (Bot 1):', data))
      .catch((error) => console.error('❌ Błąd przy wysyłaniu odpowiedzi (Bot 1):', error));

    res.json({ message: 'Status zaktualizowany' });
  });
});

app.post('/api/telegram-callback-oleje', (req, res) => {
  console.log('Otrzymano żądanie do /api/telegram-callback-oleje:', req.body);

  const callbackQuery = req.body.callback_query;
  if (!callbackQuery) {
    console.error('Brak callback_query w żądaniu');
    return res.status(400).json({ error: 'Brak danych callbacku' });
  }

  const { id, data } = callbackQuery;
  console.log('Przetwarzanie callbacku:', { id, data });

  if (!data) {
    console.error('Brak callback_data w callback_query');
    return res.status(400).json({ error: 'Nieprawidłowe dane callbacku' });
  }

  const [action, orderId] = data.split('_');
  if (!action || !orderId) {
    console.error('Nieprawidłowy format callback_data:', data);
    return res.status(400).json({ error: 'Nieprawidłowy format callback_data' });
  }

  const newStatus = action === 'accept' ? 'zaakceptowane' : 'odrzucone';
  console.log('Aktualizacja statusu:', { orderId, newStatus });

  const updateQuery = 'UPDATE oleje SET status = ? WHERE id = ?';
  connection.query(updateQuery, [newStatus, orderId], (err, result) => {
    if (err) {
      console.error('Błąd aktualizacji statusu zamówienia oleju:', err);
      return res.status(500).json({ error: 'Błąd aktualizacji statusu zamówienia', details: err.message });
    }

    if (result.affectedRows === 0) {
      console.error('Zamówienie nie znalezione, ID:', orderId);
      return res.status(404).json({ error: 'Zamówienie nie znalezione' });
    }

    console.log(`✅ Status zamówienia oleju ID ${orderId} zmieniony na: ${newStatus}`);

    const chatId = process.env.TELEGRAM_CHAT_ID2;
    const confirmationMessage = action === 'accept'
      ? `✅ Zamówienie oleju #${orderId} zostało zaakceptowane!`
      : `❌ Zamówienie oleju #${orderId} zostało odrzucone!`;

    console.log('Wysyłanie potwierdzenia do Telegrama (Bot 2):', { chatId, confirmationMessage });
    sendTelegramMessage2(chatId, confirmationMessage);

    const telegramToken2 = process.env.TELEGRAM_BOT_TOKEN2;
    console.log('Wysyłanie odpowiedzi callbacku:', { telegramToken2: telegramToken2 ? 'zdefiniowany' : 'niezdefiniowany', callback_query_id: id });
    const answerUrl = `https://api.telegram.org/bot${telegramToken2}/answerCallbackQuery`;
    fetch(answerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: id, text: `Zmieniono status na: ${newStatus}` }),
    })
      .then((response) => response.json())
      .then((data) => console.log('📩 Odpowiedź Telegrama (Bot 2):', data))
      .catch((error) => console.error('❌ Błąd przy wysyłaniu odpowiedzi (Bot 2):', error));

    res.json({ message: 'Status zaktualizowany' });
  });
});

app.patch('/api/warsztat/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Logowanie przychodzącego żądania
  console.log('PATCH /api/warsztat/:id - Otrzymano:', { id, status });

  // Walidacja statusu
  if (!['zaakceptowane', 'odrzucone'].includes(status)) {
    console.error('Nieprawidłowy status:', status);
    return res.status(400).json({ error: 'Nieprawidłowy status' });
  }

  // Aktualizacja statusu w bazie
  const query = 'UPDATE warsztat SET status = ? WHERE id = ?';
  connection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Błąd aktualizacji statusu wizyty:', err);
      return res.status(500).json({ error: 'Błąd aktualizacji statusu', details: err.message });
    }

    if (result.affectedRows === 0) {
      console.error('Wizyta nie znaleziona, ID:', id);
      return res.status(404).json({ error: 'Wizyta nie znaleziona' });
    }

    // Weryfikacja statusu w bazie po aktualizacji
    connection.query('SELECT status FROM warsztat WHERE id = ?', [id], (err, rows) => {
      if (err) {
        console.error('Błąd weryfikacji statusu:', err);
      } else {
        console.log('Status w bazie po aktualizacji:', rows[0].status);
      }

      // Formatowanie wiadomości Telegram
      const message = `Wizyta o ID ${id} została ${status === 'zaakceptowane' ? 'zaakceptowana' : 'odrzucona'}.`;
      console.log('Przygotowana wiadomość Telegram:', message);

      // Wysłanie wiadomości Telegram
      sendTelegramMessage(process.env.TELEGRAM_CHAT_ID, message)
        .then(() => {
          console.log('Wysłano powiadomienie Telegram:', { id, status, message });
          res.json({ message: 'Status wizyty zaktualizowany' });
        })
        .catch(err => {
          console.error('Błąd wysyłania powiadomienia Telegram:', err);
          res.status(500).json({ error: 'Status zaktualizowany, ale błąd wysyłania powiadomienia', details: err.message });
        });
    });
  });
});

app.get('/api/dostepne-terminy', (req, res) => {
  const today = new Date();
  const currentYear = new Date().getFullYear();

  const startDate = today.toISOString().split('T')[0];
  const endDate = new Date(today);
  endDate.setFullYear(currentYear, 11, 31);
  const endDateStr = endDate.toISOString().split('T')[0];

  const query = 'SELECT DATE(date) as date FROM warsztat WHERE status = ? AND DATE(date) BETWEEN ? AND ?';
  connection.query(query, ['zaakceptowane', startDate, endDateStr], (err, results) => {
    if (err) {
      console.error('Błąd pobierania wizyt:', err);
      return res.status(500).json({ error: 'Błąd przy pobieraniu terminów', details: err.message });
    }

    const bookedAppointments = results.map(row => {
      const date = new Date(row.date);
      return date.toISOString().split('T')[0];
    });
    console.log('Zajęte dni z tabeli warsztat:', bookedAppointments);

    const queryInactive = 'SELECT date FROM dni_nieczynne WHERE date BETWEEN ? AND ?';
    connection.query(queryInactive, [startDate, endDateStr], (err, inactiveResults) => {
      if (err) {
        console.error('Błąd pobierania dni nieczynnych:', err);
        return res.status(500).json({ error: 'Błąd przy pobieraniu dni nieczynnych', details: err.message });
      }

      const inactiveDays = inactiveResults.map(row => {
        const date = new Date(row.date);
        if (isNaN(date)) {
          console.error('Nieprawidłowa data w dni_nieczynne:', row.date);
          return null;
        }
        return date.toISOString().split('T')[0];
      }).filter(date => date !== null);

      console.log('Dni nieczynne z tabeli dni_nieczynne:', inactiveDays);

      const bookedDays = [...new Set([...bookedAppointments, ...inactiveDays])];
      console.log('Finalne bookedDays:', bookedDays);

      res.json({ bookedDays });
    });
  });
});

app.delete('/api/dni-nieczynne/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM dni_nieczynne WHERE id = ?';

  console.log('Otrzymano żądanie DELETE /api/dni-nieczynne/:id:', { id });

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Błąd usuwania dnia nieczynnego:', err);
      return res.status(500).json({ error: 'Błąd przy usuwaniu dnia nieczynnego', details: err.message });
    }

    if (result.affectedRows === 0) {
      console.error('Dzień nieczynny nie znaleziony, ID:', id);
      return res.status(404).json({ error: 'Dzień nieczynny nie znaleziony' });
    }

    res.json({ message: 'Dzień nieczynny usunięty' });
  });
});

app.delete('/api/warsztat/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM warsztat WHERE id = ?';

  console.log('Otrzymano żądanie DELETE /api/warsztat/:id:', { id });

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Błąd usuwania wizyty:', err);
      return res.status(500).json({ error: 'Błąd przy usuwaniu wizyty', details: err.message });
    }

    if (result.affectedRows === 0) {
      console.error('Wizyta nie znaleziona, ID:', id);
      return res.status(404).json({ error: 'Wizyta nie znaleziona' });
    }

    res.json({ message: 'Wizyta usunięta' });
  });
});
app.patch('/api/oleje/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log('Otrzymano żądanie PATCH /api/oleje/:id:', { id, status });

  if (!['zaakceptowane', 'odrzucone'].includes(status)) {
    console.error('Nieprawidłowy status:', status);
    return res.status(400).json({ error: 'Nieprawidłowy status' });
  }

  const query = 'UPDATE oleje SET status = ? WHERE id = ?';
  connection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Błąd aktualizacji statusu zamówienia:', err);
      return res.status(500).json({ error: 'Błąd aktualizacji statusu zamówienia', details: err.message });
    }

    if (result.affectedRows === 0) {
      console.error('Zamówienie nie znalezione, ID:', id);
      return res.status(404).json({ error: 'Zamówienie nie znalezione' });
    }

    const message = `Zamówienie oleju o ID ${id} zostało ${status === 'zaakceptowane' ? 'zaakceptowane' : 'odrzucone'}.`;
    sendTelegramMessage2(process.env.TELEGRAM_CHAT_ID2, message)
      .then(() => {
        res.json({ message: 'Status zaktualizowany' });
      })
      .catch(err => {
        console.error('Błąd wysyłania wiadomości na Telegram:', err);
        res.status(500).json({ error: 'Status zaktualizowany, ale błąd wysyłania powiadomienia', details: err.message });
      });
  });
});

app.delete('/api/oleje/:id', (req, res) => {
  const { id } = req.params;

  console.log('Otrzymano żądanie DELETE /api/oleje/:id:', { id });

  const query = 'DELETE FROM oleje WHERE id = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Błąd usuwania zamówienia:', err);
      return res.status(500).json({ error: 'Błąd przy usuwaniu zamówienia', details: err.message });
    }

    if (result.affectedRows === 0) {
      console.error('Zamówienie nie znalezione, ID:', id);
      return res.status(404).json({ error: 'Zamówienie nie znalezione' });
    }

    res.json({ message: 'Zamówienie usunięte' });
  });
});
app.post('/api/oleje', (req, res) => {
  const { imie_nazwisko, numer_telefonu, rodzaj_oleju, ilosc } = req.body;

  console.log('Otrzymano żądanie do /api/oleje:', { imie_nazwisko, numer_telefonu, rodzaj_oleju, ilosc });

  if (!imie_nazwisko || !numer_telefonu || !rodzaj_oleju || !ilosc) {
    console.error('Brak wymaganych pól');
    return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
  }

  const query = 'INSERT INTO oleje (imie_nazwisko, numer_telefonu, rodzaj_oleju, ilosc, status) VALUES (?, ?, ?, ?, "oczekujące")';
  connection.query(query, [imie_nazwisko, numer_telefonu, rodzaj_oleju, ilosc], (err, result) => {
    if (err) {
      console.error('Błąd zapisywania zamówienia:', err);
      return res.status(500).json({ error: 'Błąd przy zapisywaniu zamówienia', details: err.message });
    }

    const orderId = result.insertId;
    console.log('Zamówienie zapisane, ID:', orderId);

    const message = `
      🛢️ Nowe zamówienie na olej 🛢️
      👤 Imię i nazwisko: ${imie_nazwisko}
      📞 Numer telefonu: ${numer_telefonu}
      🛢️ Rodzaj oleju: ${rodzaj_oleju}
      🔢 Ilość: ${ilosc} litrów
      📌 Numer zamówienia: #${orderId}
      \n📌 Wybierz opcję:
    `;

    console.log('Wysyłanie wiadomości weryfikacyjnej do Telegrama (Bot 2):', { chatId: process.env.TELEGRAM_CHAT_ID2, orderId });
    sendTelegramVerification2(orderId, message);

    res.json({ message: 'Zamówienie przyjęte! Dziękujemy za zakupy!', orderId });
  });
});

app.get('/api/admin-data', (req, res) => {
  const queryAppointments = 'SELECT id, dane, numer_telefonu, model_auta, rodzaj_naprawy, date, status FROM warsztat';
  const queryInactive = 'SELECT date, reason FROM dni_nieczynne';
  const queryOrders = 'SELECT id, imie_nazwisko, numer_telefonu, rodzaj_oleju, ilosc, status FROM oleje';

  connection.query(queryAppointments, (err, appointments) => {
    if (err) {
      console.error('Błąd pobierania wizyt:', err);
      return res.status(500).json({ error: 'Błąd przy pobieraniu wizyt', details: err.message });
    }

    connection.query(queryInactive, (err2, inactiveDays) => {
      if (err2) {
        console.error('Błąd pobierania dni nieczynnych:', err2);
        return res.json({ appointments, inactiveDays: [], orders: [] });
      }

      connection.query(queryOrders, (err3, orders) => {
        if (err3) {
          console.error('Błąd pobierania zamówień oleju:', err3);
          return res.json({ appointments, inactiveDays, orders: [] });
        }

        res.json({ appointments, inactiveDays, orders });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`🚀 Serwer działa na porcie ${port}`);
});