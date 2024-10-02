# ClassQuest
C.L.A.S.S (Campus Location and Schedule Sync)

### Deployment Links

- [Development Environment](https://classquest-dev.vercel.app/)
- [Production Environment](https://classquest-prod.vercel.app/) 

## Also Read

- [Instructions](https://doc.clickup.com/9011239105/d/8cht661-651/readme)

## Project Structure

Our ClassQuest project adheres to a standard Next.js structure with some customizations. Below is an overview of the main directories and their purposes:

**Frontend**

* `src/`: Source code for the application.
	+ `app/`: Main application directory using Next.js 13+ App Router.
		- `api/`: API routes for server-side functionality.
		- `components/`: Reusable React components.
		- `lib/`: Utility functions, custom hooks, and configuration files.
		- `styles/`: Global styles and CSS modules.
		- `[various page directories]/`: Each represents a route in the application.
	+ `public/`: Static files served by Next.js.
	+ `next.config.mjs`: Next.js configuration file.
	+ `package.json`: Project dependencies and scripts.
	+ `tailwind.config.js`: Tailwind CSS configuration.

### Contributing

For more information on Git fork development workflow and best practices, please read [this article](https://medium.com/@abhijit838/git-fork-development-workflow-and-best-practices-fb5b3573ab74).

For instructions on how to contribute, please refer to the [contributing.md](./docs/CONTRIBUTING.md) file.


** IMP ***
use node version *18.17.0* or higher (use `nvm` package manager to manage node versions)

--- 

## Getting Started
 
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Step 1: Clone the Repository

First, clone the ClassQuest repository from GitHub to your local machine:

```bash
git clone https://github.com/*your_github_@*/ClassQuest.git
```

### Step 2: Navigate to the Frontend Directory

Once cloned, change your working directory to the frontend folder, where the source code is located:

```bash
cd ClassQuest/frontend
```

### Step 3: Install Dependencies

Next, install the project dependencies using npm, yarn, pnpm, or bun (whichever you prefer):

```bash
npm install
```

### Step 4: Run the Development Server

After installing the dependencies, start the development server:

```bash
npm run dev
```

### Step 5: Open the Application in Your Browser

Open your browser and go to [http://localhost:3000](http://localhost:3000) to view the app.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

