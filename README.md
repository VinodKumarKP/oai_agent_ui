# A2A React UI

A reusable React component for interacting with A2A agents.

## Installation

You can install this package from its GitHub repository:

```bash
npm install github:a2a-com/ui
```

## Usage

```jsx
import React from 'react';
import { AgentUI } from 'a2a-react-ui';

function App() {
  return (
    <AgentUI
      agentRegistryUrl="http://your-agent-registry.com/info"
      authToken="your-auth-token"
    />
  );
}
```

## Running the Demo

This package includes a demo that showcases the different layouts and features of the `AgentUI` component. To run it locally, follow these steps:

1.  **Navigate to the package directory** within your `node_modules`:

    ```bash
    cd node_modules/a2a-react-ui
    ```

2.  **Install dependencies and build the demo**:

    ```bash
    npm install
    npm run build:demo
    ```

3.  **Start the demo server**:

    Once the demo is built, you can start the demo server from anywhere in your project by running:

    ```bash
    npx a2a-react-ui-demo
    ```

    This will start a server at `http://localhost:3000`.
