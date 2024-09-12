Instructions for Contributing to the C.L.A.S.S Repository
## Fork the Repository:

1. Go to the ClassQuest GitHub repository: [Link](https://github.com/bishal0922/ClassQuest).
2. In the upper-right corner, click the "Fork" button.
3. This will create a copy of the repository under your personal GitHub account.

## Clone Your Fork to Your Local Machine:

1. Open a terminal or command prompt on your computer.
2. Clone the forked repository by running the following command (replace your-username with your GitHub username):

```bash
git clone https://github.com/your-username/ClassQuest.git
```

3. Navigate into the cloned repository directory:

```bash
cd ClassQuest
```

## Create a New Branch:

1. Create a new branch to make your changes. This keeps your work organized and separate from the main branch.

```bash
git checkout -b update-readme
```

## Make Changes:

1. Open the README.md file in any text editor.
2. Add anything you want to the file. For example, you could just add your name
3. Save the file.

## Commit Your Changes:

1. Add the changes you made to the staging area:

```bash
git add README.md
```

2. Commit the changes with a message:

```bash
git commit -m "Added project overview to README"
```

## Push Your Changes to Your Fork:

1. Push the branch with your changes back to your GitHub fork:

```bash
git push origin update-readme
```

## Create a Pull Request (PR):

1. Go back to your fork on GitHub.
2. You'll see a message offering to compare and create a pull request. Click the "Compare & pull request" button.
3. Add a title and description for your PR, such as:
    - Title: "Added project overview to README"
    - Description: "This PR adds a brief project overview to the README for clarity."
4. Click "Create pull request."
