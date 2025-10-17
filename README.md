# MailSense
# 📧 EmailINsights

**EmailINsights** is a Google Chrome extension designed to automatically detect spam and categorize your incoming emails into meaningful groups — such as **Internships**, **Work**, **School**, and more.  
Our goal is to make email management effortless using modern AI and machine learning techniques.

---

## 🚀 Project Overview

**Project Name:** EmailINsights  
**Scope:** Email spam detection and intelligent email categorization  
**Platforms:** Gmail and Outlook  
**Audience:** Students, Developers, Professionals — anyone who uses email  

### 🎯 In One Sentence
A Chrome extension that detects spam and categorizes emails into relevant groups using AI.

---

## ✨ Dream Features

- 🚫 Spam detection using a custom ML model  
- 🧠 Smart email categorization (e.g., Work, School, Internship)  
- 🌐 Support for both Gmail and Outlook  
- 🔒 Privacy-focused — all processing done securely via our API  
- ⚙️ Fast integration between Chrome Extension and API backend  
- 🪄 (Future) LLM integration for deeper semantic understanding of emails  

---

## 🧩 Minimum Viable Product (MVP)

### ✅ MVP Description
The simplest version of the product detects spam and categorizes incoming emails using a trained ML model.

### 🔹 Input
Email text and metadata (subject, body, sender)

### 🔹 Output
Categorized emails under labels like:
- `Spam`
- `Internship`
- `Work`
- `School`
- `Personal`

### 🔹 Core Function
Categorizing and filtering emails intelligently.

---

## 🧠 Frameworks, Libraries & Tools

| Component | Technology |
|------------|-------------|
| **Browser Extension** | JavaScript, HTML, CSS |
| **Backend API** | Python (Flask or FastAPI) |
| **ML / AI Models** | PyTorch, NumPy |
| **LLM Integration** | LLaMA (open-source LLM, fine-tuned for categorization) |
| **Cloud Infrastructure** | Google Cloud (for API hosting and storage) |
| **Design Tools** | Figma (for UI), Lucidchart / draw.io (for system design diagrams) |

---

## 🗂️ Project Workflow

### 🧱 System Design
1. Chrome Extension captures email data (securely via API).
2. Data sent to FastAPI backend.
3. Backend runs ML model for:
   - Spam detection
   - Email categorization
4. Categorization results returned to extension.
5. Chrome extension displays categorized emails in the Gmail/Outlook interface.

### 🎨 Figma Design
The Figma prototype includes:
- Email dashboard layout
- Category filtering UI
- Highlighting for spam vs. safe emails

*(Design file link will be added once available.)*

---

## 🧾 Implementation Plan

### 🪜 List of Tasks
1. **Create GitHub Repository**  
2. **Learn & Setup Browser Extension Development (JavaScript)**  
3. **Develop FastAPI Backend**  
4. **Build Spam Detection Model** (from scratch using PyTorch & NumPy)  
5. **Develop Email Categorization Model** (fine-tune LLaMA or build neural net)  
6. **Integrate Models into FastAPI Backend**  
7. **Connect Chrome Extension to API (send/receive requests)**  
8. **Testing & Debugging**  
9. **Publish Extension on Chrome Web Store**

---

## 🧍‍♀️ Team & Task Assignment

| Task | Assigned To |
|------|--------------|
| Frontend (Chrome Extension) | *To be assigned via GitHub* |
| Backend (FastAPI / Flask) | *To be assigned via GitHub* |
| ML Model Development | *To be assigned via GitHub* |
| Integration & Deployment | *To be assigned via GitHub* |

*(All collaboration and task division will be managed through GitHub Projects.)*

---

## ⏰ Project Timeline (High-Level)

| Phase | Duration | Description |
|-------|-----------|-------------|
| Phase 1 | Week 1–2 | Research and setup |
| Phase 2 | Week 3–4 | Build spam detection model |
| Phase 3 | Week 5–6 | Build email categorization model |
| Phase 4 | Week 7–8 | Backend + Chrome extension integration |
| Phase 5 | Week 9 | Testing and deployment |

---

## 📊 Datasets

| Purpose | Dataset | Link |
|----------|----------|------|
| Spam Detection | Enron Spam Dataset | [https://www.kaggle.com/datasets/wcukierski/enron-email-dataset](https://www.kaggle.com/datasets/wcukierski/enron-email-dataset) |
| Email Categorization | Custom dataset (collected and labeled manually) | *To be added* |
| LLM Fine-tuning | Open-source email datasets | *To be added* |

---

## 🎥 Helpful Tutorials

- [How to Create a Google Chrome Extension](https://www.youtube.com/watch?v=wHZCYi1K664)
- [FastAPI Crash Course](https://www.youtube.com/watch?v=0sOvCWFmrtA)
- [PyTorch Neural Network Tutorial](https://www.youtube.com/watch?v=EMXfZB8FVUA)
- [Fine-tuning LLaMA Models](https://www.youtube.com/watch?v=G3AWEGkXxyo)

---

## 💡 Why EmailINsights?

Unlike ChatGPT or general AI assistants, **EmailINsights** is designed **specifically for your inbox** —  
to help you organize, understand, and manage your emails efficiently.  

We’re **built for email categorization first**, not just conversation.

---

## 🧾 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome!  
Please open an issue or pull request to discuss proposed changes.

---

## 🛠️ Authors & Maintainers

Project by **Team EmailINsights**  
- GitHub Organization: *To be added*  
- Contact: *emailinsights.project@gmail.com*

---

⭐ **If you like this project, give it a star on GitHub!**
