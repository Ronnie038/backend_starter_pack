const fs = require("fs");
const { getModulePaths } = require("./utils/helpers");
const routeTemplate = require("./templates/route.template");
const controllerTemplate = require("./templates/controller.template");
const serviceTemplate = require("./templates/service.template");
const constantsTemplate = require('./templates/constants.template');
const validationsTemplate = require ('./templates/validation.template')


const moduleName = process.argv[2];
if (!moduleName) {
	console.error("❌ Please provide a module name. Example: npm run cModule Investor");
	process.exit(1);
}

const { baseDir, pascal, camel, lower } = getModulePaths(moduleName);

if (!fs.existsSync(baseDir)) {
	fs.mkdirSync(baseDir, { recursive: true });
	console.log(`📁 Created: ${baseDir}`);
}

const files = [
	{ name: `${camel}.route.ts`, content: routeTemplate({ pascal, camel, lower }) },
	{ name: `${camel}.controller.ts`, content: controllerTemplate({ pascal, camel }) },
	{ name: `${camel}.service.ts`, content: serviceTemplate({ pascal, camel, lower }) },
	{ name: `${camel}.constant.ts`, content: constantsTemplate({ pascal, camel, lower }) },
	{ name: `${camel}.validation.ts`, content: validationsTemplate({ pascal, camel, lower }) },
];

files.forEach(({ name, content }) => {
	const filePath = `${baseDir}/${name}`;
	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, content, "utf8");
		console.log(`✅ Created: ${filePath}`);
	} else {
		console.log(`⚠️ Skipped (already exists): ${filePath}`);
	}
});
