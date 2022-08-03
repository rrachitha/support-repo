// write.js
const fs = require('fs');
const yaml = require('js-yaml');
const octokit = require('@octokit/rest');

// Simple-git without promise 
const simpleGit = require('simple-git');


// Github Info
const userName = 'rrachitha'
const password = process.env.PAC_TOKEN
const repo = 'support-repo'

// Create the Github Action Yaml to generate
let data = {
    name: "Deploy DotNet project to function app with a Linux environment",
    'on': { 
        push: {
          branches: ['dev'],
        }
    },
    env: {AZURE_FUNCTIONAPP_NAME: 'function-app-adp-v2-dev', AZURE_FUNCTIONAPP_PACKAGE_PATH: './ImageResizeFunction', DOTNET_VERSION: '3.1.x'},
    jobs: {
        'build-deploy': {
           'runs-on': 'ubuntu-latest',
            steps: [{
                name: 'Checkout GitHub Action',
                uses:  'action/checkout@v2'
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
                    package: '${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}/output',
                    'publish-profile': '${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}'
                }
            }
        ]
            
        },
    }
};

let yamlStr = yaml.dump(data);
fs.writeFileSync('.github/workflows/deploy.yaml', yamlStr, 'utf8');

// $%%%
// TODO: Authenticate to Github


// Programmatically commit code
const gitHubURL = `https://github.com/${userName}/${repo}.git`;


// Add commit and push files
simpleGit()
    .add('./*')
    .commit('Another commit')
    .push(['-u', 'origin', 'customer-2'], () => console.log('done'));



simpleGit().listRemote(['--get-url'], (err, data) => {
    if (!err) {
        console.log('Remote url for repository at ' + __dirname + ':');
        console.log(data);
    }
}); 


