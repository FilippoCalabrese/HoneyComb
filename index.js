const fs = require('fs');
const program = require("commander");
const inquirer = require("inquirer");
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
      }
];


class HoneyComb {

  help(){

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

  static parseConfigurationAnswers(answers){
    fs.writeFileSync(
      ".honeycomb.config.json",
      JSON.stringify(answers)
    );

    const CONFIG = JSON.parse(fs.readFileSync(".honeycomb.config.json", "utf-8"));
    console.log('Creating HoneyComb configuration file...');
    if(CONFIG.git)
    fs.writeFileSync(
      ".gitignore",
      ".honeycomb.config.json"
    );
    console.log('Creating .gitignore file...');

    console.log('Initializin project directories');

    if (!fs.existsSync('./css'))
    fs.mkdirSync('./css');

    if (!fs.existsSync('./js'))
    fs.mkdirSync('./js');

    console.log('Creating index.html and style.css files...');

    let honeyComb = new HoneyComb();
    honeyComb.createCssFile('style');
    honeyComb.createJsFile('master');

    console.log('Project initialized correctly! Have a good time!');
  }

  createFile (file, name, path) {
    const fileName = file.replace("${name}", name);

    if (fs.existsSync(`${path}/${name}/${fileName}`)) {
      console.log(`File "${fileName}" already exists, skipping.`);
      return;
    }

    const data = fs
      .readFileSync(`template/${file}`, "utf-8")
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
        console.log('OK!!!', __dirname);
        this.createFile(template, name, __dirname);
      }

      const CONFIG = JSON.parse(fs.readFileSync(".honeycomb.config.json", "utf-8"));
      this.replaceFileContent([name, '.html'], '${name}', name);
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

  add(type, name){

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

  program.command("add [type] [name]").action((type, name) => {
      honeyComb.add(type, name);
    });


  program.command("config").action(() => {
    honeyComb.configure();
  });


  program.parse(process.argv);
};

main();
