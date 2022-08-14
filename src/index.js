const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;
const unpack = require("tar-pack").unpack;
const editJSON = require("edit-json-file");
const Listr = require("listr");
const hyperquest = require("hyperquest");
const https = require("https");

function extractFiles(options) {
	return new Promise((resolve, reject) => {
		hyperquest(options.tgzURL).pipe(unpack(options.targetDirectory, err => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		}));
	});
}

// Get template
function getTemplate(options) {
	return new Promise((resolve, reject) => {
		var url = "https://registry.npmjs.org/@kylehue/";
		var template = `create-app-${options.template}`;
		https.get(path.join(url, template), res => {
			if (res.statusCode === 200) {
				var body = "";
				res.on("data", data => {
					body += data;
				});

				res.on("end", async () => {
					body = JSON.parse(body);
					let latestVersion = body["dist-tags"].latest;
					let tgzURL = body.versions[latestVersion].dist.tarball;
					options.tgzURL = tgzURL;
					resolve();
				});
			} else {
				reject(res);
			}
		}).on("error", (err) => {
			reject(err);
		})
	});
}

// Edit package.json
function editPackage(options) {
	const filepath = path.resolve(options.targetDirectory, "./package.json");
	const package = editJSON(filepath, {
		autosave: true
	});

	package.set("name", options.projectName);
	package.set("version", options.version);
	package.set("description", options.description || "");
	package.set("author", options.author || "");
	package.save();
}

module.exports.createProject = async function createProject(options) {
	// Add target directory to options
	options = {
		...options,
		targetDirectory: path.resolve(process.cwd(), options.projectName)
	};

	const tasks = new Listr([{
			title: "Fetching template",
			task: async () => await getTemplate(options)
		},
		{
			title: "Extracting files",
			task: async () => await extractFiles(options).then(() => {
				setTimeout(() => {
					editPackage(options);
				}, 1000);
			})
		}
	])

	// Run
	await tasks.run();
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
