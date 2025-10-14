# ARCHITECTURE.md

# Architecture Overview

The Stock AI Analyzer is a web application designed to provide concise financial reports by integrating with the Polygon.io stocks API and OpenAI. The architecture is divided into two main components: the client-side and the server-side.

## Client-Side

The client-side is built using Vanilla JavaScript and Vite, providing a responsive user interface for interacting with the application. The key components include:

- **index.html**: The main HTML document that structures the user interface, including input fields for stock tickers and buttons to trigger API calls.
- **main.js**: The entry point for client-side JavaScript, handling user interactions and API requests.
- **components/**: Contains reusable UI components such as:
  - **StockSearch.js**: Manages the input and submission of stock tickers.
  - **ReportDisplay.js**: Displays the generated financial reports.
  - **LoadingSpinner.js**: Provides feedback during API calls.
- **utils/**: Contains utility functions for API interactions and data processing:
  - **api.js**: Handles API calls to the server.
  - **helpers.js**: Contains helper functions for data manipulation.
- **assets/**: Contains stylesheets and other static assets.

## Server-Side

The server-side is built using Node.js and Express, providing a RESTful API for the client to interact with. The key components include:

- **index.js**: The entry point of the Node.js application, setting up the Express server and defining API routes.
- **routes/**: Contains route definitions for handling API requests:
  - **stocks.js**: Manages requests related to stock data.
  - **reports.js**: Manages requests for generating financial reports.
- **controllers/**: Contains the logic for processing requests and interacting with services:
  - **stockController.js**: Handles stock data retrieval and ticker resolution.
  - **aiController.js**: Handles report generation using OpenAI.
- **middleware/**: Contains middleware for authentication and error handling.
- **services/**: Contains service modules for external API interactions:
  - **polygonService.js**: Interacts with the Polygon.io API to fetch stock data.
  - **openaiService.js**: Interacts with OpenAI to generate financial reports.
- **utils/**: Contains utility functions for configuration and input validation.

## Data Flow

1. The user inputs a stock ticker or company name in the client interface.
2. The client normalizes the input and sends a request to the server's `/api/resolve` endpoint to resolve the ticker.
3. The server calls the Polygon API to fetch the canonical ticker and returns it to the client.
4. The client then requests stock data from the server's `/api/stock` endpoint.
5. The server fetches the last three market days of stock data from the Polygon API and returns it to the client.
6. The client sends the stock data to the server's `/api/report` endpoint to generate a concise financial report using OpenAI.
7. The server processes the request and returns the generated report to the client for display.

## Conclusion

This architecture allows for a modular and scalable application, leveraging the strengths of both client-side and server-side technologies to provide users with valuable financial insights.