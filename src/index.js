import chalk from "chalk";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
const access = promisify(fs.access);
const writeFile = promisify(fs.writeFile);
const copy = promisify(ncp);

// Copy files from template
async function copyTemplateFiles(options) {
	const ignoredPaths = new RegExp("templates/" + options.template + `/(${
		[
			"node_modules",
			"dist"
		].join("|")
	})`);

	return copy(options.templateDirectory, options.targetDirectory, {
		clobber: false,
		filter: fileDir => {
			return !ignoredPaths.test(fileDir.replace(/\\/g, "/"));
		}
	});
}

// Edit package.json
async function editPackage(options) {
	const filepath = path.resolve(options.targetDirectory, "./package.json");
	fs.readFile(filepath, 'utf-8', function(err, data) {
		if (err) throw err;

		data = JSON.parse(data);
		data.name = options.projectName;
		data.version = options.version;
		data.description = options.description;
		data.author = options.author;

		fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf-8", function writeJSON(err) {
			if (err) throw err;
		});
	});
}

export async function createProject(options) {
	// Add target directory to options
	options = {
		...options,
		targetDirectory: path.resolve(process.cwd(), options.projectName)
	};

	// Check if template exists
	const templateDir = path.resolve(
		__dirname,
		"../templates/" + options.template
	);

	try {
		await access(templateDir, fs.constants.R_OK);
		options.templateDirectory = templateDir;
	} catch (err) {
		console.error("%s Invalid template", chalk.red.bold("ERROR!"));
		process.exit(1);
	}

	// Create project
	await copyTemplateFiles(options)
	await editPackage(options)

	// Run
	const readyMsg =
		`
%s Now Run:
  cd ${options.projectName}
  npm install
  npm run dev
  `;
	console.log(readyMsg, chalk.green.bold("DONE!"));
	return true;
}
