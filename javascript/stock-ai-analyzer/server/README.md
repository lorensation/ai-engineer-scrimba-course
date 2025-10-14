# README.md

# Stock AI Analyzer

## Overview

The Stock AI Analyzer is a web application that integrates with the Polygon.io stocks API and OpenAI to generate concise financial reports. This project allows users to resolve stock tickers, fetch stock data, and generate insightful reports based on the latest market information.

## One-Minute Setup Instructions

1. **Obtain API Keys**:
   - Sign up for a Polygon.io account and obtain your API key.
   - Sign up for OpenAI and obtain your API key.

2. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd stock-ai-analyzer
   ```

3. **Set Up Environment Variables**:
   - Copy the `.env.example` file to `.env` and fill in your API keys:
   ```bash
   cp server/.env.example server/.env
   ```

4. **Install Dependencies**:
   - Navigate to the server directory and install the required packages:
   ```bash
   cd server
   npm install
   ```

5. **Start the Server**:
   ```bash
   npm start
   ```

6. **Access the Application**:
   - Open your browser and go to `http://localhost:8080`.

## Usage

- **Resolve Ticker**: Enter a company name to resolve its stock ticker.
- **Fetch Stock Data**: Retrieve the last three market days of stock data for the resolved ticker.
- **Generate Report**: Send the stock data to OpenAI to generate a concise financial report.

### Environment Variables

Create `server/.env` with:

```
POLYGON_API_KEY=your_polygon_api_key
OPENAI_API_KEY=your_openai_api_key
# Optional tuning
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_RETRIES=3
OPENAI_MAX_TOKENS=800
```

### API Endpoints

- GET `/api/resolve?q=apple`
- GET `/api/stock?tickers=AAPL`
- POST `/api/report` with body `{ stockData }`
- POST `/api/multi-stock-report` with body `{ stocks: [{ ticker, name }] }`

## Mock Mode

For offline testing, you can use Mock Mode. This mode simulates API responses without making actual requests to the Polygon or OpenAI APIs. To enable Mock Mode, set the `MOCK_MODE` environment variable to `true` in your `.env` file.

## Architecture Overview

```
+------------------+          +------------------+
|                  |          |                  |
|   Client (UI)    | <----->  |   Server (API)   |
|                  |          |                  |
+------------------+          +------------------+
```

- The client interacts with the server through API endpoints to resolve tickers, fetch stock data, and generate reports.
- The server communicates with external APIs (Polygon.io and OpenAI) to retrieve and process data.

## License

This project is licensed under the MIT License. See the LICENSE file for details.