
<img width="1903" height="1079" alt="Screenshot 2026-01-19 173408" src="https://github.com/user-attachments/assets/542eb26e-9dce-46cc-b7e2-09d856a87190" />
<img width="1919" height="1079" alt="Screenshot 2026-01-19 173444" src="https://github.com/user-attachments/assets/1913c6fa-70eb-4cb4-a881-c1f48d7ff824" />
<img width="1919" height="1079" alt="Screenshot 2026-01-19 173436" src="https://github.com/user-attachments/assets/e48a1c86-fc97-4464-8c96-73b2d95e5cca" />
<img width="1919" height="1079" alt="Screenshot 2026-01-19 173426" src="https://github.com/user-attachments/assets/b656df9a-1b5d-48b3-a5b6-8ea6ec046eb3" />
<img width="1919" height="1079" alt="Screenshot 2026-01-19 173415" src="https://github.com/user-attachments/assets/3c87faff-a242-4430-a010-09b5dc7a5367" />

# ChatPulse

https://github.com/100ASSASSIN/ChatPulse.git

# ChatPulse – Project Documentation

## 1. Project Overview

ChatPulse is a full-stack analytics application designed to analyze exported WhatsApp group chat files (.txt) and visualize user engagement insights such as active users, new users, and highly active members over a 7‑day window.

The system consists of:

* **Backend**: Django REST API for file upload and chat parsing
* **Frontend**: React + TypeScript (Vite) dashboard for visualization

---

## 2. System Architecture

### High-Level Flow

1. User uploads WhatsApp chat file from the frontend UI
2. File is sent to Django REST API via POST request
3. Backend parses chat text dynamically
4. Aggregated analytics JSON is returned
5. Frontend renders charts and insights

### Technology Stack

**Backend**

* Python 3.12
* Django
* Django REST Framework
* Regex-based chat parser

**Frontend**

* React 18
* TypeScript
* Vite
* Chart.js + react-chartjs-2

---

## 3. Backend Project Structure

```
chatpulse_backend/
├── pulse_backend/
│   ├── analyzer/
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── utils.py
│   │   └── serializers.py
│   ├── pulse_backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── manage.py
├── requirements.txt
└── venv/
```

### Key Components

* **views.py**: Handles file upload endpoint
* **utils.py**: Contains WhatsApp chat parsing logic
* **urls.py**: API routing
* **settings.py**: Installed apps, CORS, middleware

---

## 4. Backend API Documentation

### Endpoint: Upload Chat File

**URL**

```
POST /api/upload/
```

**Request Type**

* Multipart form-data

**Payload**

* `file`: WhatsApp exported `.txt` file

**Success Response (200)**

```json
{
  "dates": ["2021-04-01", "2021-04-02"],
  "active_users_count": [18, 6],
  "new_users_count": [5, 1],
  "active_users_4days": ["+91 95 31948"]
}
```

**Error Responses**

* `400`: No file provided
* `415`: Unsupported media type
* `500`: Parsing or server error

---

## 5. Error and Exception Handling (Backend)

### Validation Errors

* Missing file → `400 Bad Request`
* Unsupported file format → `415 Unsupported Media Type`

### Runtime Exceptions

* File read errors handled with try/except
* Regex parsing failures safely ignored

### Best Practices Used

* Defensive parsing
* No hardcoded file paths
* Graceful fallback for empty datasets

---

## 6. Frontend Project Structure

```
chatpulse_frontend/
├── src/
│   ├── components/
│   │   └── ChatChart.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── .env
├── package.json
└── vite.config.ts
```

---

## 7. Frontend Environment Configuration

### .env File

```
VITE_API_URL=http://127.0.0.1:8000/api/upload/
```

### Notes

* Uses `import.meta.env` (Vite standard)
* No Node `process.env` usage

---

## 8. Frontend Data Flow

1. User selects `.txt` file
2. File uploaded via Fetch API
3. Loading state shown
4. API response parsed
5. Chart and KPI components rendered

---

## 9. UI & Component Design

### App.tsx

* File upload handling
* API communication
* Error & loading state management
* KPI calculations

### ChatChart.tsx

* Bar chart visualization
* Clean axis and tooltip styling
* Responsive design

---

## 10. Error Handling (Frontend)

### Network Errors

* Fetch failures caught and displayed

### API Errors

* Non-200 responses shown as UI alerts

### UX Feedback

* Loading indicator
* Empty state messaging

---

## 11. Security Considerations

* No file persistence on server
* No execution of uploaded content
* CORS restricted to frontend origin
* No sensitive data storage

---

## 12. Performance Considerations

* Streaming file read
* Lightweight regex parsing
* Minimal frontend re-renders
* Optimized chart rendering

---

## 13. Future Enhancements

* Authentication
* Multi-file comparison
* Monthly / yearly analytics
* Export reports (PDF / CSV)
* Real-time dashboards

---

## 14. Summary

ChatPulse is a scalable, cleanly structured analytics platform designed for clarity, maintainability, and professional-grade visualization. The architecture separates concerns cleanly and supports future growth with minimal refactoring.

---

End of Documentation
