# Idea Weaver

A modern application for organizing and managing your ideas with both list and mind map visualization.

## Features

- Create and manage ideas with titles, descriptions, and tags
- Organize ideas into different categories/collections
- Search and filter ideas
- Mark ideas as favorites
- Add notes and updates to existing ideas
- Modern, responsive UI
- Interactive mind map visualization to connect related ideas
- Local storage persistence
- Offline functionality

## Mind Map Visualization

The mind map view allows you to:

- Visualize ideas as connected nodes
- Drag nodes to organize your thoughts spatially
- Create connections between related ideas
- See relationships at a glance
- Add new ideas by clicking anywhere on the canvas
- Zoom and pan for easy navigation

To switch between list and mind map views, use the toggle buttons in the header.

## Setup Instructions

1. Install Node.js (if not already installed)
   - Download from https://nodejs.org/ (LTS version recommended)
   - Follow the installation instructions

2. Install project dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Open your browser to http://localhost:3000

## Usage Tips

### List View
- Use filters and search to quickly find ideas
- Add tags to categorize your ideas
- Mark important ideas as favorites

### Mind Map View
- Click and drag ideas to position them
- Select an idea and click the link icon to connect to another idea
- Click on the connection line to remove a connection
- Use scroll wheel to zoom in/out
- Click and drag on empty space to pan around
- Click on any empty area to add a new idea at that location

## Technology Stack

- React with TypeScript
- Material UI for components
- Local storage for data persistence
- Service Worker for offline functionality

## Repository & Test Versions

Test builds and release candidates are stored at:

**https://github.com/Mauivision/Idea-Weaver**

Use that repo to push branches, tags, or test deployments. See `GIT-SETUP.md` for initial git setup and pushing instructions.