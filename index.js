#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";
import ora from "ora";
import { Command } from "commander";

const program = new Command();
const CONFIG_FILE = path.join(process.cwd(), "belayer-config.json");

async function setup() {
  console.log("Welcome to Belayer! Let’s get set up.");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "installPath",
      message:
        "Insert the path where you would like to install your components (relative to the project root):",
      default: "/src/components/",
    },
    {
      type: "input",
      name: "githubRepo",
      message:
        "What is the GitHub repository? (e.g., https://github.com/yourusername/your-repo.git)",
    },
    {
      type: "confirm",
      name: "isPrivate",
      message: "Is your GitHub repository private?",
    },
    {
      type: "input",
      name: "githubToken",
      message:
        "Belayer needs a GitHub Personal Access Token to authenticate with your repository. Create one here: https://github.com/settings/tokens and paste it below:",
      when: (answers) => answers.isPrivate,
    },
    {
      type: "input",
      name: "alias",
      message: "Give your library an alias (allows for multiple libraries):",
      default: "belayer-ui",
    },
    {
      type: "input",
      name: "remoteRoot",
      message:
        "Define the remote root component folder (e.g., src/components):",
      default: "src/components",
    },
  ]);

  fs.writeJsonSync(CONFIG_FILE, answers, { spaces: 2 });
  console.log(
    "✅ Setup complete! You can now use `npx belayer list` or `npx belayer add ComponentName`."
  );
}

async function fetchComponentList() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(
      "⚠️ Please run `npx belayer` first to set up the configuration."
    );
    process.exit(1);
  }

  const config = fs.readJsonSync(CONFIG_FILE);
  const repoUrl = config.githubRepo;
  const remoteRoot = config.remoteRoot || "src/components";
  const tempCloneDir = path.join(process.cwd(), "belayer-temp-clone");

  const spinner = ora("Fetching components...").start();

  try {
    // Step 1: Sparse clone only repo metadata (no file content)
    execSync(
      `git clone --depth=1 --filter=blob:none --sparse ${repoUrl} ${tempCloneDir}`,
      { stdio: "ignore" }
    );

    // Step 2: Enable sparse-checkout and fetch only the component directory
    execSync(`git -C ${tempCloneDir} sparse-checkout init --cone`, {
      stdio: "ignore",
    });
    execSync(`git -C ${tempCloneDir} sparse-checkout set ${remoteRoot}`, {
      stdio: "ignore",
    });

    // Step 3: Get the list of component directories
    const componentDir = path.join(tempCloneDir, remoteRoot);
    const components = fs.readdirSync(componentDir).filter((name) => {
      return fs.statSync(path.join(componentDir, name)).isDirectory();
    });

    // Step 4: Cleanup temp clone
    fs.removeSync(tempCloneDir);

    // Step 5: Display the list of components
    if (components.length === 0) {
      spinner.fail("No components found in the repository.");
    } else {
      spinner.succeed("Available components:");
      components.forEach((component) => console.log(`- ${component}`));
    }
  } catch (error) {
    spinner.fail("Failed to fetch components.");
    console.error(error.message);
  }
}

async function installComponent(componentName) {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(
      "⚠️ Please run `npx belayer` first to set up the configuration."
    );
    process.exit(1);
  }

  const config = fs.readJsonSync(CONFIG_FILE);
  const repoUrl = config.githubRepo;
  const installPath = path.join(
    process.cwd(),
    config.installPath,
    componentName
  );

  if (fs.existsSync(installPath)) {
    console.error(
      `⚠️ Component "${componentName}" already exists in ${installPath}.`
    );
    process.exit(1);
  }

  const tempCloneDir = path.join(process.cwd(), "belayer-temp-clone");

  const spinner = ora(`Installing component: ${componentName}`).start();

  try {
    // Step 1: Clone repo sparsely (only metadata, no files)
    execSync(
      `git clone --depth=1 --filter=blob:none --sparse ${repoUrl} ${tempCloneDir}`,
      { stdio: "inherit" }
    );

    // Step 2: Enable sparse checkout
    execSync(`git -C ${tempCloneDir} sparse-checkout init --cone`, {
      stdio: "inherit",
    });

    // Step 3: Add only the requested component directory
    execSync(
      `git -C ${tempCloneDir} sparse-checkout set ${config.remoteRoot}/${componentName}`,
      { stdio: "inherit" }
    );

    // Step 4: Pull just the selected component
    execSync(`git -C ${tempCloneDir} pull`, { stdio: "inherit" });

    // Step 5: Move the component to the project’s install directory
    fs.moveSync(
      path.join(tempCloneDir, config.remoteRoot, componentName),
      installPath,
      { overwrite: true }
    );

    // Step 6: Cleanup
    fs.removeSync(tempCloneDir);

    spinner.succeed(
      `✅ Component "${componentName}" installed successfully at ${installPath}.`
    );
  } catch (error) {
    spinner.fail(`Failed to install component: ${componentName}`);
    console.error(error.message);
  }
}

// CLI Commands
program
  .command("list")
  .description("List available components from the remote repository")
  .action(fetchComponentList);

program
  .command("add <componentName>")
  .description("Install a component from the remote repository")
  .action(installComponent);

// Default command (run `npx belayer` to start setup)
program.action(setup);

program.parse(process.argv);
