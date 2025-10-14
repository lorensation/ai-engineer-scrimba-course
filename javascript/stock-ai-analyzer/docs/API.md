# API Documentation for Stock AI Analyzer

## Overview

The Stock AI Analyzer is a web application that integrates with the Polygon.io stocks API and OpenAI to generate concise financial reports. This document outlines the API endpoints available in the application, including their methods, request parameters, and responses.

## Base URL

```
http://localhost:8080/api
```

## Endpoints

### 1. Resolve Ticker

- **Endpoint:** `/resolve`
- **Method:** `GET`
- **Description:** Resolves a company name or ticker symbol to its canonical ticker.
- **Query Parameters:**
  - `query` (string, required): The company name or ticker symbol to resolve.
  
- **Response:**
  - **200 OK**
    ```json
    {
      "ticker": "AAPL",
      "companyName": "Apple Inc."
    }
    ```
  - **404 Not Found**
    ```json
    {
      "error": "Ticker not found"
    }
    ```

### 2. Fetch Stock Data

- **Endpoint:** `/stock`
- **Method:** `GET`
- **Description:** Fetches the last 3 market days of stock data for the provided tickers.
- **Query Parameters:**
  - `tickers` (string, required): Comma-separated list of ticker symbols.
  
- **Response:**
  - **200 OK**
    ```json
    {
      "data": [
        {
          "ticker": "AAPL",
          "dates": ["2023-10-01", "2023-10-02", "2023-10-03"],
          "prices": [150.00, 152.00, 151.50]
        }
      ]
    }
    ```
  - **400 Bad Request**
    ```json
    {
      "error": "Invalid ticker format"
    }
    ```

### 3. Generate Report

- **Endpoint:** `/report`
- **Method:** `POST`
- **Description:** Sends stock data to OpenAI and returns a concise financial report.
- **Request Body:**
  ```json
  {
    "tickers": ["AAPL", "GOOGL"],
    "data": {
      "AAPL": {
        "dates": ["2023-10-01", "2023-10-02", "2023-10-03"],
        "prices": [150.00, 152.00, 151.50]
      },
      "GOOGL": {
        "dates": ["2023-10-01", "2023-10-02", "2023-10-03"],
        "prices": [2800.00, 2820.00, 2810.00]
      }
    }
  }
  ```

- **Response:**
  - **200 OK**
    ```json
    {
      "report": "Apple Inc. has shown a slight increase in stock price over the last three days..."
    }
    ```
  - **500 Internal Server Error**
    ```json
    {
      "error": "Failed to generate report"
    }
    ```

## Error Handling

All endpoints will return appropriate HTTP status codes and error messages for invalid requests or server errors. Ensure to handle these errors gracefully in the client application.

## Conclusion

This API allows users to resolve tickers, fetch stock data, and generate financial reports using the Polygon.io and OpenAI services. For further details on usage and setup, refer to the README.md file.