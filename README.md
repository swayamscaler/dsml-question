# Interview Questions Search

A semantic search system for interview questions that uses AI to format questions and vector embeddings for similarity search.

## Features

- **Semantic Search**: Find similar questions using natural language queries
- **AI Question Formatting**: Uses GPT-4 to extract core concepts from questions
- **Vector Embeddings**: Generates embeddings using TensorFlow Universal Sentence Encoder
- **Hybrid Search**: Combines semantic similarity with company/role filtering
- **Batched Processing**: Efficiently processes questions with rate limiting
- **Persistent Storage**: Stores formatted questions and embeddings in CSV

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
OPENAI_API_KEY=your_openai_api_key
```

3. Run the development server:
```bash
npm run dev
```

## Usage

1. Process Questions (Required First Time):
   - Visit `/process`
   - Click "Start Processing" to format questions and generate embeddings
   - Wait for processing to complete

2. Search Questions:
   - Enter company and role (required)
   - Optionally enter a search query for semantic search
   - Results will show both exact matches and semantically similar questions
   - Each result includes a similarity score when using semantic search

## Implementation Details

### Question Processing
- Questions are formatted using GPT-4 to extract core concepts
- Embeddings are generated using Universal Sentence Encoder
- Results are stored in the CSV file with new columns:
  - `Formatted Question`: The AI-processed question
  - `Embedding`: Vector representation as JSON string

### Search Implementation
- Without query: Uses traditional company/role filtering
- With query: 
  - Generates embedding for search query
  - Finds similar questions using cosine similarity
  - Filters results by company/role
  - Sorts by match type and similarity score

### Optimization
- Batched processing to handle API rate limits
- Caches processed questions in CSV
- Efficient tensor cleanup
- Server-side vector operations

## Architecture

```mermaid
graph TD
    A[CSV File] --> B[Question Processing]
    B --> C[GPT-4 Formatting]
    B --> D[Embedding Generation]
    B --> E[Store Results]
    F[Search Query] --> G[Vector Search]
    H[Company/Role] --> I[Filter Results]
    G --> I
    I --> J[Display Results]
