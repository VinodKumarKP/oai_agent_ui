# A2A React UI

A reusable React component for interacting with A2A agents.

## Installation

You can install this package from its GitHub repository:

```bash
npm install github:a2a-com/ui
```

## Basic Usage

The `AgentUI` component provides a complete, out-of-the-box user interface for interacting with A2A agents. You can use it with one of the built-in layouts: `sidebar`, `tabcard`, or `cardchat`.

```jsx
import React from 'react';
import { AgentUI } from 'a2a-react-ui';

function App() {
  return (
    <AgentUI
      agentRegistryUrl="http://your-agent-registry.com/info"
      authToken="your-auth-token"
      layout="sidebar" // or "tabcard", "cardchat"
    />
  );
}
```

## Advanced Usage: Building a Custom UI

If you need more control over the user interface, you can use the `useAgentCore` hook to build your own custom components. This hook provides all the state and logic for interacting with A2A agents, allowing you to create a completely custom UI.

### `useAgentCore` Hook

The `useAgentCore` hook returns an object with all the necessary state and handlers for building your own UI.

**Example:**

```jsx
import React from 'react';
import { useAgentCore } from 'a2a-react-ui';

function CustomAgentUI() {
  const {
    agents,
    selectedAgent,
    handleSelectAgent,
    message,
    handleMessageChange,
    handleSendMessage,
    // ... and many other properties
  } = useAgentCore({
    agentRegistryUrl: "http://your-agent-registry.com/info",
    authToken: "your-auth-token",
  });

  return (
    <div>
      <h1>My Custom Agent UI</h1>
      <div className="agent-list">
        {agents.map(agent => (
          <button key={agent.id} onClick={() => handleSelectAgent(agent.id)}>
            {agent.name}
          </button>
        ))}
      </div>
      {selectedAgent && (
        <div className="chat-window">
          <h2>Chat with {selectedAgent.name}</h2>
          {/* Your custom chat message display */}
          <textarea value={message} onChange={handleMessageChange} />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}
```

### Available Properties

The `useAgentCore` hook returns a rich set of properties and handlers, including:

*   **State**: `agents`, `selectedAgent`, `message`, `chatHistory`, `isLoading`, etc.
*   **Handlers**: `handleSelectAgent`, `handleSendMessage`, `handleClearSession`, etc.

For a complete list of all available properties, please refer to the source code of the `useAgentCore` hook.

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
