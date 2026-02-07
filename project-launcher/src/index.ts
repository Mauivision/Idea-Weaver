import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

interface Project {
    name: string;
    path: string;
    port: number;
    type: 'react' | 'next' | 'other';
    lastAccessed: string;
}

class ProjectLauncher {
    private projects: Project[] = [];
    private readonly configPath: string;

    constructor() {
        this.configPath = path.join(__dirname, '../projects.json');
        this.loadProjects();
        this.showProjectOfTheDay();
    }

    private loadProjects() {
        try {
            if (fs.existsSync(this.configPath)) {
                this.projects = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    private saveProjects() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.projects, null, 2));
        } catch (error) {
            console.error('Error saving projects:', error);
        }
    }

    private showProjectOfTheDay() {
        if (this.projects.length === 0) return;
        const project = this.projects[Math.floor(Math.random() * this.projects.length)];
        const messages = [
            "Keep building! 🚀",
            "Your creativity knows no bounds! ✨",
            "Every line of code is progress! 💡",
            "Today is a great day to make something amazing! 🌟",
            "Push your limits and see what happens! 🔥"
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        console.log(chalk.magenta.bold('\n🌈 Project of the Day 🌈'));
        console.log(chalk.cyan.bold(`"${project.name}"`));
        console.log(chalk.white(`Path: ${project.path}`));
        console.log(chalk.white(`Type: ${project.type}`));
        console.log(chalk.green.bold(`
${message}
`));
    }

    async addProject() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Project name:',
            },
            {
                type: 'input',
                name: 'path',
                message: 'Project path:',
            },
            {
                type: 'number',
                name: 'port',
                message: 'Port number:',
                default: 3000,
            },
            {
                type: 'list',
                name: 'type',
                message: 'Project type:',
                choices: ['react', 'next', 'other'],
            },
        ]);

        const project: Project = {
            ...answers,
            lastAccessed: new Date().toISOString(),
        };

        this.projects.push(project);
        this.saveProjects();
        console.log(chalk.green('Project added successfully!'));
    }

    async listProjects() {
        if (this.projects.length === 0) {
            console.log(chalk.yellow('No projects found.'));
            return;
        }

        console.log(chalk.blue('\nYour Projects:'));
        this.projects.forEach((project, index) => {
            console.log(chalk.white(`\n${index + 1}. ${project.name}`));
            console.log(`   Path: ${project.path}`);
            console.log(`   Port: ${project.port}`);
            console.log(`   Type: ${project.type}`);
            console.log(`   Last Accessed: ${new Date(project.lastAccessed).toLocaleString()}`);
        });
    }

    async searchProjects() {
        const { searchTerm } = await inquirer.prompt([
            {
                type: 'input',
                name: 'searchTerm',
                message: 'Enter search term:',
            },
        ]);

        const results = this.projects.filter(project =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.path.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (results.length === 0) {
            console.log(chalk.yellow('No projects found matching your search.'));
            return;
        }

        console.log(chalk.blue('\nSearch Results:'));
        results.forEach((project, index) => {
            console.log(chalk.white(`\n${index + 1}. ${project.name}`));
            console.log(`   Path: ${project.path}`);
            console.log(`   Port: ${project.port}`);
        });
    }

    async startProject() {
        if (this.projects.length === 0) {
            console.log(chalk.yellow('No projects available.'));
            return;
        }

        const { projectIndex } = await inquirer.prompt([
            {
                type: 'list',
                name: 'projectIndex',
                message: 'Select a project to start:',
                choices: this.projects.map((p, i) => ({
                    name: `${p.name} (${p.type})`,
                    value: i,
                })),
            },
        ]);

        const project = this.projects[projectIndex];
        console.log(chalk.blue(`Starting ${project.name}...`));
        
        // Update last accessed
        project.lastAccessed = new Date().toISOString();
        this.saveProjects();

        // Start the project based on its type
        const startCommand = project.type === 'next' ? 'npm run dev' : 'npm start';
        console.log(chalk.green(`Run this command in your project directory:`));
        console.log(chalk.white(`cd ${project.path}`));
        console.log(chalk.white(`${startCommand}`));
    }

    async showMenu() {
        while (true) {
            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: [
                        'Add Project',
                        'List Projects',
                        'Search Projects',
                        'Start Project',
                        'Exit',
                    ],
                },
            ]);

            switch (action) {
                case 'Add Project':
                    await this.addProject();
                    break;
                case 'List Projects':
                    await this.listProjects();
                    break;
                case 'Search Projects':
                    await this.searchProjects();
                    break;
                case 'Start Project':
                    await this.startProject();
                    break;
                case 'Exit':
                    console.log(chalk.blue('Goodbye!'));
                    return;
            }
        }
    }
}

// Start the application
const launcher = new ProjectLauncher();
launcher.showMenu(); 