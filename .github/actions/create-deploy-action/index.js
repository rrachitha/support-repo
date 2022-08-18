/* Custom Workflow
- Custom Action Repo - Nodejs action --> Generate the github action yaml -> commit --> push to customer branch
*/

// actions toolkit core and github packages
const core = require('@actions/core');
const github = require('@actions/github');
const { readYamlEnvSync, readYamlEnv } = require('yaml-env-defaults');
const updateYamlDocuments = require("@atomist/yaml-updater");


// setup required libraries
const fs = require('fs');
const yaml = require('js-yaml');
const { Octokit } = require("@octokit/rest");
const { Base64 } = require("js-base64");
const { execSync } = require("child_process");
const simpleGit = require('simple-git');
const process = require('process');

require("dotenv").config();


// Github Info
const userName = core.getInput('userName');
const pacToken = core.getInput('pacToken');
const repoName = core.getInput('repoName');
const branchName   = core.getInput('branchName');
const dirpath  = '.github/workflows'



// Azure Function parameters
const azureFunctionAppName = core.getInput('AZURE_FUNCTIONAPP_NAME');
const azureFunctionAppPackagePath = core.getInput('AZURE_FUNCTIONAPP_PACKAGE_PATH');
const dotNetVersion = core.getInput('DOTNET_VERSION');


// Debug logs
core.info(azureFunctionAppName);
core.info(azureFunctionAppPackagePath);
core.info(dotNetVersion);


// Create the Github Action Yaml to generate
let data = {
    name: "Deploy DotNet project to function app with a Linux environment---------",
    on: 'create',
    env: {AZURE_FUNCTIONAPP_NAME: 'function-app', AZURE_FUNCTIONAPP_PACKAGE_PATH: '${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}/output', DOTNET_VERSION: '${{ env.DOTNET_VERSION}}'},
    jobs: {
        'build-deploy': {
           'runs-on': 'ubuntu-latest',
            steps: [{
                name: 'Checkout GitHub Action',
                uses: 'actions/checkout@v3',
            },
            {
                name: 'Setup DotNet ${{ env.DOTNET_VERSION }} Environment',
                uses: 'actions/setup-dotnet@v1',
                with: {
                    'dotnet-version': '${{ env.DOTNET_VERSION}}'
                }
            },
            {
                name: 'Resolve Project Dependencies using Dotnet',
                shell: 'bash',
                run: "pushd ./${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}\ndotnet build --configuration Release --output ./output\npopd"
            },
            {
                name: 'Deploy to Azure Functions',
                uses: 'Azure/functions-action@v1',
                id: 'fa',
                with: {
                   'app-name': '${{ env.AZURE_FUNCTIONAPP_NAME }}',
                   'package': '${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}/output',
                   'publish-profile': '${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}'
                }
            }
        ]
            
        },
    }
};

// Write the yaml file to support-repo
const yamlStr = yaml.dump(data);
fs.mkdirSync(dirpath, { recursive: true })
fs.writeFileSync('.github/workflows/deploy.yml', yamlStr, 'utf8');
core.info("Before changing directory: " + process.cwd());



// Commit and push the deploy github action
fs.writeFileSync('.github/workflows/deploy.yml', yamlStr, 'utf8');


const octokit = new Octokit({
  auth: `${pacToken}`,
});


const main = async () => {
  try {
    console.log("Before reading the file:" + process.cwd());
    const content = fs.readFileSync(".github/workflows/deploy.yml", "utf-8");
    const contentEncoded = Base64.encode(content);

    const { data } = await octokit.repos.createOrUpdateFileContents({
      // replace the owner and email with your own details
      owner: `${userName}`,
      repo: `${repoName}`,
      path: ".github/workflows/deploy.yml",
      message: "feat: Added workflow programatically",
      content: contentEncoded,
      branch: branchName,
      committer: {
        name: `bot`,
        email: "rrajagopal-3pc@manh.com",
      },
      author: {
        name: "bot",
        email: "rrajagopal-3pc@manh.com",
      },
    });
    console.log(data);
  } catch (err) {
    console.error(err);
  }
};

main();














