# Belayer

Belayer is a simple CLI tool that allows you to install and manage UI components from a remote GitHub repository.



## 🚀 Installation

> [!IMPORTANT]  
> Belayer is currently in early Alpha. It is not currently published to NPM! To run locally you must use the `npm link`  command.

You can use Belayer directly with `npx`:

```sh
npx belayer
```

Alternatively, you can install it globally:

```sh
npm install -g belayer
```

## 🔧 Setup

Before using Belayer, you need to run the setup process:

```sh
npx belayer
```

This will prompt you to enter configuration details, such as:

- The local path where components should be installed
- Your GitHub repository URL
- Whether the repository is private
- Your GitHub Personal Access Token (if needed)\*(Note, not currently used in MVP!!)
- An alias for your component library
- The remote component folder (e.g., `src/components`)

These settings will be stored in `belayer-config.json` for future use.

## 📜 Commands

### 1️⃣ List Available Components

To view a list of all available components in your GitHub repository, run:

```sh
npx belayer list
```

This will fetch and display the names of all component directories inside the configured remote component folder.

### 2️⃣ Install a Component

To install a specific component from the repository, use:

```sh
npx belayer add <ComponentName>
```

For example, to install a component named `Button`:

```sh
npx belayer add Button
```

This will fetch the component files and place them in your local component directory.

## ⚙️ Configuration

Belayer stores your configuration in a `belayer-config.json` file in your project root. You can manually edit this file if needed:

```json
{
  "componentPath": "src/components/",
  "githubRepo": "https://github.com/yourusername/your-repo.git",
  "isPrivate": true,
  "githubToken": "your-github-token",
  "libraryAlias": "belayer-ui",
  "remoteRoot": "src/components"
}
```

## 🔥 Features

✅ **Easily fetch UI components** from a GitHub repository
✅ **Supports private repositories** with authentication
✅ **Fast and lightweight** using sparse cloning
✅ **Works with any project setup**

## 🛠 Troubleshooting

- **Error: `Component "XYZ" not found`**

  - Ensure the component exists in the configured `src/components/` directory in the repository.
  - Run `npx belayer list` to verify available components.

- **Error: `Failed to fetch components`**
  - Check your GitHub token permissions (for private repos, it needs `read` access to the repo).
  - Ensure the GitHub repo URL is correct.

## 📜 License

MIT License.

---

Enjoy using Belayer! 🎉 Feel free to contribute or suggest improvements.
