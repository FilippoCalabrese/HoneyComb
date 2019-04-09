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
        name: "git",
        message:
          "Are you using any sort of git version control system?",
        default: true
      }
];


class HoneyComb {
  configure() {

    inquirer.prompt(questions).then(function(answers) {
        try {
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
          console.log('Project initialized correctly! Have a good time!');

        } catch (err) {
          console.log(err);
          warnAndExit(`You need to initialize HoneyComb before you configure it.`);
        }

      });

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
        createFile(template, name, __dirname);
      }

      fs.readFile(name+'.html', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result = data.replace('${name}', name);

        fs.writeFile(name+'.html', result, 'utf8', function (err) {
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
      for (let template of templates) createFile(template, name, '/js');
  }

  createCssFile(name){
    const templates = fs
        .readdirSync(__dirname+'/template')
        .filter(
          file =>
            file == "${name}.css"
        );
      for (let template of templates) createFile(template, name, '/css');
  }
}


const main = () => {
  const honeyComb = new HoneyComb();

  program.arguments("<cmd> [name]");

  program.command("help").action(() => honeyComb.help());

  program
    .command("add [name]")
    .option("-p, --path [path]")
    .action((name, opt) => {
      honeyComb.add(name, opt.path);
    });


  program.command("config").action(() => {
    honeyComb.configure();
  });


  program.parse(process.argv);
};

main();
