// // scripts/generateModule.js
// const fs = require("fs");
// const path = require("path");

// const moduleName = process.argv[2];
// if (!moduleName) {
//     console.error("❌ Please provide a module name. Example: npm run generate User");
//     process.exit(1);
// }

// const moduleDir = path.join(__dirname, "..", "src/app/modules", moduleName);
// const lower = moduleName.toLowerCase();

// // Template content
// const files = {
//     [`${lower}.route.ts`]: `// ${moduleName} Route\nexport {};`,
//     [`${lower}.controller.ts`]: `// ${moduleName} Controller\nexport {};`,
//     [`${lower}.service.ts`]: `// ${moduleName} Service\nexport {};`,
//     [`${lower}.model.ts`]: `// ${moduleName} Model\nexport {};`,
// };

// // Create folder and files
// if (!fs.existsSync(moduleDir)) {
//     fs.mkdirSync(moduleDir, { recursive: true });
//     console.log(`📁 Created folder: ${moduleDir}`);
// }

// for (const [fileName, content] of Object.entries(files)) {
//     const filePath = path.join(moduleDir, fileName);
//     if (!fs.existsSync(filePath)) {
//         fs.writeFileSync(filePath, content, "utf8");
//         console.log(`📄 Created file: ${filePath}`);
//     } else {
//         console.log(`⚠️ File already exists: ${filePath}`);
//     }
// }



const path = require("path");

const toPascal = str => str.charAt(0).toUpperCase() + str.slice(1);
const toCamel = str => str.charAt(0).toLowerCase() + str.slice(1);

const getModulePaths = moduleName => {
	const pascal = toPascal(moduleName);
	return {
		baseDir: path.join(__dirname, "..","..", "src/app/modules", pascal),
		pascal,
		camel: toCamel(moduleName),
		lower: moduleName.toLowerCase(),
		upper: moduleName.toUpperCase(),
	};
};

module.exports = {
	toPascal,
	toCamel,
	getModulePaths,
};
