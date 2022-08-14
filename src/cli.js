const inquirer = require("inquirer");
const createProject = require("./index.js").createProject;

const defaults = {
	projectName: "@kylehue/my-app",
	template: "vue",
	version: "1.0.0",
	description: "",
	author: ""
}

async function promptOptions() {
	const questions = [];
	questions.push({
		type: "input",
		name: "projectName",
		message: "Project Name:",
		default: defaults.projectName || undefined
	});

	questions.push({
		type: "list",
		name: "template",
		message: "Choose your template:",
		choices: ["vue"],
		default: defaults.template || undefined
	});

	questions.push({
		type: "input",
		name: "version",
		message: "Version:",
		default: defaults.version || undefined
	});

	questions.push({
		type: "input",
		name: "description",
		message: "Description:",
		default: defaults.description || undefined
	});

	questions.push({
		type: "input",
		name: "author",
		message: "Author:",
		default: defaults.author || undefined
	});

	const answers = await inquirer.prompt(questions);
	console.log("");

	return {
		projectName: answers.projectName || defaults.projectName,
		template: answers.template || defaults.template,
		version: answers.version || defaults.version,
		description: answers.description || defaults.description,
		author: answers.author || defaults.author
	}
}

module.exports.cli = async function cli() {
	let options = await promptOptions();
	await createProject(options);
}
