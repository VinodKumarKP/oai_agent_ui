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

## Running the Demo Locally

This package includes a demo that showcases the different layouts and features of the `AgentUI` component. To run it locally for development, follow these steps:

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/a2a-com/ui.git
    cd ui
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Start the demo**:

    ```bash
    npm start
    ```

    This will start a development server and open the demo in your browser.
