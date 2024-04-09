## Introduction

This project is a Google Translate inspired application that allows users to translate text from one language (English, Dutch or German) to another, either by typing in the text or by speaking into the microphone. The application also allows users to save translations to a database.

## Tech

- Next.js w/ server actions
- TypeScript
- Tailwind CSS for styling
- Clerk for authentication
- Azure Speech to text REST API for speech to text
- Azure Text Translation REST API for text translation
- Azure Cosmos DB Table w/ Azure Functions for rate limiting
- MongoDB (using Azure Cosmos DB) for storing translations

## Functionality

- Translate text from one language to another. The application supports English, Dutch and German
- Automatically detect the language of the input text
- Speech to text translation
- Speak out translations using Web Speech API
- Storing and deleting translations
- Rate limiting for translation requests
- Authentication via Clerk (Github)

