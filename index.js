#!/usr/bin/env node

/***
 * HONEYCOMB
 * Your html companion
 */
 const HELP_MSG = `
 NAME
     HoneyComb, your html companion <3

 DESCRIPTION
     HoneyComb speeds up the workflow in managing HTML / CSS / JS projects.

 SYNOPSIS
     honeycomb|hc <command> [name] [options]

 AVAILABLE COMMAND:
     config  change the default settings of HoneyComb. you need to initialize the cli before
   add html|css|js|php [name]     creates a new file from standard template (don't specify the extension in file's name)

 COPYRIGHT
     HoneyComb is available under the MIT license.
     HoneyComb also includes external libraries that are available under MIT license.

 SEE ALSO
     GitHub repository & Issue Tracker: https://github.com/FilippoCalabrese/honeycomb
     Npmjs: https://www.npmjs.com/package/dzhoneycomb
     Website:
     Documentation:

 AUTHORS
     Filippo Calabrese (https://github.com/filippocalabrese)

 `;
const fs = require('fs');
const program = require("commander");
const inquirer = require("inquirer");
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const questions = [

      {
        type: "confirm",
        name: "bootstrap",
        message: "Do you want to enable the support for bootstrap 5?",
        default: true
      },
      {
        type: "confirm",
        name: "fontawesome",
        message:
          "Do you want to enable the support for Font Awesome?",
        default: true
      },
      {
        type: "confirm",
        name: "jquery",
        message:
          "Are you using jQuery?",
        default: true
      },
      {
        type: "confirm",
        name: "git",
        message:
          "Are you using any sort of git version control system?",
        default: true
      },
      {
        type: "input",
        name: "author",
        message:
          "What's your name?",
        default: "John Doe"
      },
      {
        type: "input",
        name: "projectName",
        message:
          "That's the project name?",
        default: "Lorem Ipsum"
      }
];


class HoneyComb {

  help(){
    console.log(HELP_MSG);
  }

  configure() {
    inquirer.prompt(questions).then(function(answers) {
        try {
          HoneyComb.parseConfigurationAnswers(answers);

        } catch (err) {
          console.log(err);
          warnAndExit(`You need to initialize HoneyComb before you configure it.`);
        }

      });
    }

  clearSettings() {
    fs.writeFileSync(
      ".honeycomb.config.json",
      ""
    );
    console.log("HoneyComb settings restored");
  }

  static parseConfigurationAnswers(answers){
    fs.writeFileSync(
      ".honeycomb.config.json",
      JSON.stringify(answers)
    );

    const CONFIG = JSON.parse(fs.readFileSync(".honeycomb.config.json", "utf-8"));
    console.log('Creating HoneyComb configuration file...');
    if(CONFIG.git) {
      console.log('Creating .gitignore file...');
      fs.writeFileSync(
        ".gitignore",
        ".honeycomb.config.json"
      );
      console.log('Creating README.md file...');
      fs.writeFileSync(
        "README.md",
        CONFIG.projectName
      );
    }


    console.log('Initializing project directories...');

    if (!fs.existsSync('./css'))
    fs.mkdirSync('./css');

    if (!fs.existsSync('./js'))
    fs.mkdirSync('./js');

    if (!fs.existsSync('./img'))
    {
      console.log('creating img folder');
      fs.mkdirSync('./img');
    }

    console.log('Creating index.html and style.css files...');

    let honeyComb = new HoneyComb();
    honeyComb.createCssFile('style');
    honeyComb.createJsFile('master');
    honeyComb.createHtmlFile('index');

    console.log('Project initialized correctly! Have a good time!');
  }

  createFile (file, name, path) {
    const fileName = file.replace("${name}", name);

    if (fs.existsSync(`${path}/${name}/${fileName}`)) {
      console.log(`File "${fileName}" already exists, skipping.`);
      return;
    }

    const data = fs
      .readFileSync(`${__dirname}/template/${file}`, "utf-8")
      .split('${name}')
      .join(name);

    fs.writeFileSync(`${path}/${fileName}`, data, err => {
      if (err) {
        console.log(`Cannot create "${fileName}"`);
      } else {
        console.log(`"${fileName}" created`);
      }
    });

  }

  createHtmlFile(name) {
    const templates = fs
        .readdirSync(__dirname+'/template')
        .filter(
          file =>
            file == "${name}.html"
        );
      for (let template of templates) {
        this.createFile(template, name, './');
      }

      const CONFIG = JSON.parse(fs.readFileSync(".honeycomb.config.json", "utf-8"));
      let title = CONFIG.projectName+' | '+name;
      this.replaceFileContent([name, '.html'], '${name}', title);
      this.replaceFileContent([name, '.html'], '${author}', CONFIG.author);

      //TODO: parsare le risposte ed inserire le dipendenze giuste in ogni file

  }

  replaceFileContent(file, find, replace){
    let fileName = file[0]+file[1];
    fs.readFile(fileName, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      let result = data.replace(find, replace);

      fs.writeFile(fileName, result, 'utf8', function (err) {
         if (err) return console.log(err);
      });
    });
  }

  createJsFile(name) {
    const templates = fs
        .readdirSync(__dirname+'/template')
        .filter(
          file =>
            file == "${name}.js"
        );
      for (let template of templates) this.createFile(template, name, 'js');
  }

  createCssFile(name){
    const templates = fs
        .readdirSync(__dirname+'/template')
        .filter(
          file =>
            file == "${name}.css"
        );
      for (let template of templates) this.createFile(template, name, 'css');
  }

  createPhpFile(name){
    const templates = fs
        .readdirSync(__dirname+'/template')
        .filter(
          file =>
            file == "${name}.php"
        );
      for (let template of templates) this.createFile(template, name, __dirname);
  }

  static verifySettings() {
    const CONFIG = fs.readFileSync(".honeycomb.config.json", "utf-8");
    if(CONFIG==''){
      throw 'HoneyComb need to know your project structure. Please, run $honeycomb configure';
    }
  }

  async compressImg(){
    console.log("Compressing project images in /img directory:");
    (async () => {
        const files = await imagemin(['img/*.{jpg,png}'], 'img/', {
            plugins: [
                imageminJpegtran(),
                imageminPngquant({quality: '30-35'})
            ]
        });

        for (let file  in files) {
          console.log(file);
        }
        console.log("image compression completed!");
        //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
    })();
  }

  add(type, name){

    try {
      this.verifySettings();
    } catch (e) {
      console.log(e);
      return;
    }

    switch (type) {
      case 'css':
        console.log('creating '+name+'.css');
        this.createCssFile(name);
        break;
      case 'html':
        console.log('creating '+name+'.html');
        this.createHtmlFile(name);
        break;
      case 'js':
        console.log('creating '+name+'.js');
        this.createJsFile(name);
        break;
      case 'php':
        console.log('creating '+name+'.php');
        this.createPhpFile(name);
        break;
      default:
        console.log('Wrong parameter. Please, use HoneyComb create html/css/js ...');

    }
  }
}


const main = () => {
  const honeyComb = new HoneyComb();

  program.arguments("<cmd> [name]");

  program.command("help").action(() => honeyComb.help());

  program.command("add [type] [name]").option('html|css|js|php [name]', 'Create a new file of the given extension with the given name').action((type, name) => {
      honeyComb.add(type, name);
    });

  program.command("config").action(() => {
    honeyComb.configure();
  });

  program.command("configure").action(() => {
    honeyComb.configure();
  });

  program.command("clear-settings").option('Clear HoneyComb settings for this project').action(() => {
    honeyComb.clearSettings();
  });

  program.command("compress [type]").option('img', 'Compress all images in /img folder').action((type) => {

    HoneyComb.verifySettings();

    try {
      if(type=='img')
      honeyComb.compressImg();
      else
      console.log("Error with parameters, please use $honeycomb compress img");
    } catch (e) {
      console.log("There was an error with your command: "+e);
    }

  });


  program.parse(process.argv);
};

main();
